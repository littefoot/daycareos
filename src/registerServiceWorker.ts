// Registers the ACCS Progressive Web App (PWA) Service Worker
// Enables offline dead-zone resilience for Home Visitors & Providers

export function registerServiceWorker(onSyncRequested?: (tag: string) => void) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[ACCS PWA] Service Worker registered with scope:', registration.scope);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[ACCS PWA] New update available. Reloading or activating in background.');
          }
        });
      });

      // Listen for background sync messages forwarded from Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'ACCS_BACKGROUND_SYNC') {
          console.log('[ACCS PWA] Received background sync trigger:', event.data.tag);
          if (onSyncRequested) {
            onSyncRequested(event.data.tag);
          }
        }
      });
    } catch (error) {
      console.warn('[ACCS PWA] Service Worker registration failed:', error);
    }
  });
}
