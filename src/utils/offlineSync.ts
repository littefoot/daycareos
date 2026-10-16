import { HomeInspectionRecord, AttendanceEntry } from '../types';

const DB_NAME = 'accs_offline_db';
const DB_VERSION = 1;

export const STORES = {
  QUEUED_INSPECTIONS: 'queued_inspections',
  QUEUED_ATTENDANCE: 'queued_attendance',
  CACHED_INSPECTIONS: 'cached_inspections'
} as const;

/**
 * Open or upgrade the ACCS IndexedDB database
 */
function openAccsDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.QUEUED_INSPECTIONS)) {
        const inspStore = db.createObjectStore(STORES.QUEUED_INSPECTIONS, { keyPath: 'id' });
        inspStore.createIndex('visitorId', 'visitorId', { unique: false });
        inspStore.createIndex('queuedAt', 'queuedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.QUEUED_ATTENDANCE)) {
        const attStore = db.createObjectStore(STORES.QUEUED_ATTENDANCE, { keyPath: 'id' });
        attStore.createIndex('childId', 'childId', { unique: false });
        attStore.createIndex('queuedAt', 'queuedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.CACHED_INSPECTIONS)) {
        const cacheStore = db.createObjectStore(STORES.CACHED_INSPECTIONS, { keyPath: 'id' });
        cacheStore.createIndex('visitorId', 'visitorId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Notify subscribers across tabs and components that the queue status changed
 */
function notifyQueueChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('accs_offline_queue_changed'));
  }
}

/**
 * Save an unannounced inspection record locally when conducting audits in dead zones
 */
export async function queueInspectionOffline(record: HomeInspectionRecord): Promise<void> {
  try {
    const db = await openAccsDb();
    const queuedItem = {
      ...record,
      offlineQueued: true,
      queuedAt: new Date().toISOString()
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORES.QUEUED_INSPECTIONS, STORES.CACHED_INSPECTIONS], 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);

      tx.objectStore(STORES.QUEUED_INSPECTIONS).put(queuedItem);
      tx.objectStore(STORES.CACHED_INSPECTIONS).put(queuedItem);
    });

    notifyQueueChanged();
    console.log('[ACCS Offline Engine] Inspection queued locally in dead zone storage:', record.id);
  } catch (err) {
    console.warn('[ACCS Offline Engine] Error queueing inspection offline:', err);
    // LocalStorage fallback in case of strict browser quota limits
    try {
      const existing = JSON.parse(localStorage.getItem('accs_offline_inspections_fallback') || '[]');
      existing.push({ ...record, offlineQueued: true, queuedAt: new Date().toISOString() });
      localStorage.setItem('accs_offline_inspections_fallback', JSON.stringify(existing));
      notifyQueueChanged();
    } catch (e) {
      console.error('[ACCS Offline Engine] LocalStorage fallback also failed:', e);
    }
  }
}

/**
 * Retrieve all inspection records waiting in the offline dead-zone queue
 */
export async function getQueuedInspections(): Promise<HomeInspectionRecord[]> {
  try {
    const db = await openAccsDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.QUEUED_INSPECTIONS, 'readonly');
      const store = tx.objectStore(STORES.QUEUED_INSPECTIONS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[ACCS Offline Engine] Error reading queued inspections from IndexedDB, trying fallback:', err);
    try {
      return JSON.parse(localStorage.getItem('accs_offline_inspections_fallback') || '[]');
    } catch {
      return [];
    }
  }
}

/**
 * Remove an inspection from the queue once successfully uploaded to Cloud Firestore
 */
export async function removeQueuedInspection(id: string): Promise<void> {
  try {
    const db = await openAccsDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORES.QUEUED_INSPECTIONS, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(STORES.QUEUED_INSPECTIONS).delete(id);
    });

    // Also remove from fallback if present
    try {
      const existing = JSON.parse(localStorage.getItem('accs_offline_inspections_fallback') || '[]');
      const filtered = existing.filter((item: any) => item.id !== id);
      localStorage.setItem('accs_offline_inspections_fallback', JSON.stringify(filtered));
    } catch {}

    notifyQueueChanged();
    console.log('[ACCS Offline Engine] Successfully dequeued synced inspection:', id);
  } catch (err) {
    console.warn('[ACCS Offline Engine] Error removing queued inspection:', err);
  }
}

/**
 * Cache inspections for offline viewing in the field
 */
export async function cacheInspectionsLocally(inspections: HomeInspectionRecord[]): Promise<void> {
  try {
    const db = await openAccsDb();
    const tx = db.transaction(STORES.CACHED_INSPECTIONS, 'readwrite');
    const store = tx.objectStore(STORES.CACHED_INSPECTIONS);
    for (const insp of inspections) {
      store.put(insp);
    }
  } catch (err) {
    console.warn('[ACCS Offline Engine] Error caching inspections:', err);
  }
}

/**
 * Get cached inspections for offline field audits
 */
export async function getCachedInspections(): Promise<HomeInspectionRecord[]> {
  try {
    const db = await openAccsDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.CACHED_INSPECTIONS, 'readonly');
      const store = tx.objectStore(STORES.CACHED_INSPECTIONS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

/**
 * Flush and synchronize all queued inspections to Cloud Firestore
 */
export async function syncQueuedInspections(
  saveToFirestore: (record: HomeInspectionRecord) => Promise<void>
): Promise<{ successCount: number; failedCount: number }> {
  const queued = await getQueuedInspections();
  if (queued.length === 0) {
    return { successCount: 0, failedCount: 0 };
  }

  console.log(`[ACCS Offline Engine] Commencing sync of ${queued.length} queued field inspection(s)...`);
  let successCount = 0;
  let failedCount = 0;

  for (const record of queued) {
    try {
      // Strip offline metadata tags before pushing to Firestore
      const cleanRecord = { ...record };
      delete (cleanRecord as any).offlineQueued;
      delete (cleanRecord as any).queuedAt;

      await saveToFirestore(cleanRecord);
      await removeQueuedInspection(record.id);
      successCount++;
    } catch (err) {
      console.error(`[ACCS Offline Engine] Failed to sync inspection ${record.id}:`, err);
      failedCount++;
    }
  }

  notifyQueueChanged();
  return { successCount, failedCount };
}

/**
 * Helper to check current connectivity status
 */
export function isOnline(): boolean {
  if (typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  return true;
}

/**
 * Subscribe to online/offline network status transitions
 */
export function subscribeToNetworkStatus(callback: (online: boolean) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Request modern browser Background Sync registration
 */
export async function registerBackgroundSync(tag: 'sync-inspections' | 'sync-attendance'): Promise<boolean> {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await (reg as any).sync.register(tag);
      console.log(`[ACCS Offline Engine] Background sync registered for tag: ${tag}`);
      return true;
    } catch (err) {
      console.warn('[ACCS Offline Engine] Background sync registration failed, will rely on online event:', err);
      return false;
    }
  }
  return false;
}
