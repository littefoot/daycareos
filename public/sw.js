// All Child Care Solutions (ACCS) — Offline PWA Service Worker
// Enables Home Visitors and Providers to work seamlessly in rural/basement dead zones

const CACHE_NAME = 'accs-hub-cache-v1';

// Static Shell Assets pre-cached on installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/logos/all_child_care_solutions.png',
  '/logos/circles_in_the_sun.png'
];

// Installation: Cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ACCS SW] Pre-caching offline app shell');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activation: Clean up legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[ACCS SW] Purging old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Handler
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Bypass non-GET requests and Firestore / Cloud API streams
  if (request.method !== 'GET') {
    return;
  }

  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('firebaseio.com') ||
    url.pathname.startsWith('/api/')
  ) {
    // Let Firestore SDK manage its own local caching / offline sync
    return;
  }

  // 2. Navigation requests (HTML pages): Network-first with Cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          console.log('[ACCS SW] Dead zone detected. Serving cached application shell for navigation:', request.url);
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const shellResponse = await caches.match('/index.html') || await caches.match('/');
          return shellResponse || new Response('Offline Dead Zone Mode — Please reload when connected.', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // 3. Static Assets (JS, CSS, Web Fonts, Images): Stale-While-Revalidate
  const isStaticAsset = (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  );

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. Default: Try network first, then cache
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});

// Background Sync (Chromium / Android / Modern Browsers)
self.addEventListener('sync', (event) => {
  console.log('[ACCS SW] Background Sync triggered:', event.tag);
  if (event.tag === 'sync-inspections' || event.tag === 'sync-attendance') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'ACCS_BACKGROUND_SYNC',
            tag: event.tag
          });
        });
      })
    );
  }
});

// Manual Skip Waiting trigger
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
