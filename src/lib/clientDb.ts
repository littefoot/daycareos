/**
 * DaycareOS Reactive Client-Side Database & Storage Engine
 * ----------------------------------------------------------------------------
 * 100% in-browser, zero-backend, zero-network-latency local database.
 * Emulates the Cloud Firestore, Firebase Storage, and Firebase Auth APIs using
 * IndexedDB with synchronous LocalStorage caching and BroadcastChannel multi-tab sync.
 *
 * Designed for standalone portfolio demonstrations on cloudj.ca.
 */

import {
  INITIAL_PROVIDERS,
  INITIAL_CHILDREN,
  INITIAL_PARENTS,
  INITIAL_HOME_VISITORS,
  INITIAL_INSPECTIONS
} from '../data/mockData';
import { ALL_INITIAL_FORMS } from '../data/allFormsData';
import { DEFAULT_AGENCY_SETTINGS } from '../data/agencySettingsData';
import { INITIAL_CURATED_NOTES } from '../lib/curatedNotesEngine';

// Database Keys
const DB_NAME = 'DaycareOS_DB';
const DB_VERSION = 1;
const STORAGE_STORE_NAME = 'files';
const COLLECTIONS_STORE_NAME = 'collections';
const LOCAL_STORAGE_CACHE_KEY = 'daycare_os_collections_cache_v1';
const INITIALIZED_FLAG_KEY = 'daycare_os_is_initialized_v1';
const BROADCAST_CHANNEL_NAME = 'daycare_os_sync_bus';

export type DocumentData = Record<string, any>;

export interface DocumentReference {
  id: string;
  path: string;
  collection: string;
  _isDocRef: true;
}

export interface CollectionReference {
  id: string;
  path: string;
  _isCollectionRef: true;
}

export interface DocumentSnapshot<T = DocumentData> {
  id: string;
  ref: DocumentReference;
  exists: () => boolean;
  data: () => T;
}

export interface QuerySnapshot<T = DocumentData> {
  docs: DocumentSnapshot<T>[];
  empty: boolean;
  size: number;
  forEach: (callback: (doc: DocumentSnapshot<T>) => void) => void;
}

type DocListener = (snapshot: DocumentSnapshot<any>) => void;
type CollectionListener = (snapshot: QuerySnapshot<any>) => void;

class ReactiveClientDatabase {
  private cache: Map<string, Map<string, any>> = new Map();
  private docListeners: Map<string, Set<DocListener>> = new Map();
  private collectionListeners: Map<string, Set<CollectionListener>> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.initSynchronousCache();
    this.initBroadcastChannel();
    this.initIndexedDb();
  }

  /**
   * Synchronously hydrate from LocalStorage on startup for zero-latency initial UI render
   */
  private initSynchronousCache() {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
      const isInitialized = localStorage.getItem(INITIALIZED_FLAG_KEY);

      if (raw) {
        const parsed: Record<string, Record<string, any>> = JSON.parse(raw);
        for (const [colName, docs] of Object.entries(parsed)) {
          const colMap = new Map<string, any>();
          for (const [docId, docData] of Object.entries(docs)) {
            colMap.set(docId, docData);
          }
          this.cache.set(colName, colMap);
        }
      }

      // If never initialized or empty, seed standard starter data
      if (!isInitialized || this.cache.size === 0) {
        this.seedInitialData();
      }
    } catch (e) {
      console.warn('[DaycareOS DB] LocalStorage cache init warning, seeding defaults:', e);
      this.seedInitialData();
    }
  }

  /**
   * Populate initial demo data
   */
  public seedInitialData() {
    console.log('[DaycareOS DB] Seeding initial mock dataset into in-browser database...');

    // 1. Providers
    const provMap = new Map<string, any>();
    INITIAL_PROVIDERS.forEach((p) => provMap.set(p.id, p));
    this.cache.set('providers', provMap);

    // 2. Children
    const childMap = new Map<string, any>();
    INITIAL_CHILDREN.forEach((c) => childMap.set(c.id, c));
    this.cache.set('children', childMap);

    // 3. Parents
    const parentMap = new Map<string, any>();
    INITIAL_PARENTS.forEach((p) => parentMap.set(p.id, p));
    this.cache.set('parents', parentMap);

    // 4. Home Visitors
    const visitorMap = new Map<string, any>();
    INITIAL_HOME_VISITORS.forEach((v) => visitorMap.set(v.id, v));
    this.cache.set('home_visitors', visitorMap);

    // 5. Inspections
    const inspMap = new Map<string, any>();
    INITIAL_INSPECTIONS.forEach((i) => inspMap.set(i.id, i));
    this.cache.set('home_inspections', inspMap);

    // 6. Form Templates
    const formMap = new Map<string, any>();
    ALL_INITIAL_FORMS.forEach((f) => formMap.set(f.id, f));
    this.cache.set('form_templates', formMap);

    // 7. Daily Attendance
    const attMap = new Map<string, any>();
    attMap.set('attendance_today', {
      'child-1': { status: 'present', checkIn: '8:15 AM' },
      'child-2': { status: 'departed', checkIn: '8:15 AM', checkOut: '4:45 PM', pickedUpBy: 'Sarah Connor (Mother)', netHours: 8.5 },
      'child-3': { status: 'present', checkIn: '8:45 AM' },
      'child-4': { status: 'absent' }
    });
    this.cache.set('daily_attendance', attMap);

    // 8. Agency Settings
    const settingsMap = new Map<string, any>();
    settingsMap.set('agency_settings_doc', DEFAULT_AGENCY_SETTINGS);
    this.cache.set('agency_settings', settingsMap);

    // 9. Curated Notes
    const notesMap = new Map<string, any>();
    INITIAL_CURATED_NOTES.forEach((n) => notesMap.set(n.id, n));
    this.cache.set('curated_client_notes', notesMap);

    // Persist synchronously
    this.persistCacheSync();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(INITIALIZED_FLAG_KEY, 'true');
      } catch (e) {}
    }
  }

  /**
   * Persist in-memory state to LocalStorage
   */
  private persistCacheSync() {
    if (typeof window === 'undefined') return;
    try {
      const serialized: Record<string, Record<string, any>> = {};
      for (const [colName, colMap] of this.cache.entries()) {
        serialized[colName] = {};
        for (const [docId, docData] of colMap.entries()) {
          serialized[colName][docId] = docData;
        }
      }
      localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(serialized));
    } catch (e) {
      console.warn('[DaycareOS DB] LocalStorage quota exceeded or error:', e);
    }
  }

  /**
   * Initialize IndexedDB for large storage & binary blobs
   */
  private initIndexedDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return Promise.reject(new Error('IndexedDB not supported in this environment'));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const idb = (event.target as IDBOpenDBRequest).result;
        if (!idb.objectStoreNames.contains(COLLECTIONS_STORE_NAME)) {
          idb.createObjectStore(COLLECTIONS_STORE_NAME, { keyPath: '_key' });
        }
        if (!idb.objectStoreNames.contains(STORAGE_STORE_NAME)) {
          idb.createObjectStore(STORAGE_STORE_NAME, { keyPath: 'path' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('[DaycareOS DB] IndexedDB open error:', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Multi-tab real-time event bus
   */
  private initBroadcastChannel() {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    try {
      this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      this.broadcastChannel.onmessage = (event) => {
        const { type, collection, docId, data } = event.data || {};
        if (type === 'SET' || type === 'UPDATE') {
          let colMap = this.cache.get(collection);
          if (!colMap) {
            colMap = new Map();
            this.cache.set(collection, colMap);
          }
          colMap.set(docId, data);
          this.notifyListeners(collection, docId);
        } else if (type === 'DELETE') {
          const colMap = this.cache.get(collection);
          if (colMap) {
            colMap.delete(docId);
            this.notifyListeners(collection, docId);
          }
        }
      };
    } catch (e) {
      console.warn('[DaycareOS DB] BroadcastChannel init warning:', e);
    }
  }

  /**
   * Notify subscribers of mutations
   */
  private notifyListeners(collection: string, docId: string) {
    // 1. Notify specific doc listeners
    const docKey = `${collection}/${docId}`;
    const dListeners = this.docListeners.get(docKey);
    if (dListeners && dListeners.size > 0) {
      const colMap = this.cache.get(collection);
      const data = colMap?.get(docId);
      const docRef: DocumentReference = {
        id: docId,
        path: `${collection}/${docId}`,
        collection,
        _isDocRef: true
      };
      const snap: DocumentSnapshot = {
        id: docId,
        ref: docRef,
        exists: () => data !== undefined,
        data: () => (data !== undefined ? JSON.parse(JSON.stringify(data)) : {})
      };
      dListeners.forEach((listener) => {
        try {
          listener(snap);
        } catch (err) {
          console.error('[DaycareOS DB] Doc listener error:', err);
        }
      });
    }

    // 2. Notify collection listeners
    const cListeners = this.collectionListeners.get(collection);
    if (cListeners && cListeners.size > 0) {
      const snap = this.buildCollectionSnapshot(collection);
      cListeners.forEach((listener) => {
        try {
          listener(snap);
        } catch (err) {
          console.error('[DaycareOS DB] Collection listener error:', err);
        }
      });
    }
  }

  private buildCollectionSnapshot(collection: string): QuerySnapshot {
    const colMap = this.cache.get(collection) || new Map<string, any>();
    const docs: DocumentSnapshot[] = [];

    colMap.forEach((val, id) => {
      const dataCopy = JSON.parse(JSON.stringify(val));
      const docRef: DocumentReference = {
        id,
        path: `${collection}/${id}`,
        collection,
        _isDocRef: true
      };
      docs.push({
        id,
        ref: docRef,
        exists: () => true,
        data: () => dataCopy
      });
    });

    return {
      docs,
      empty: docs.length === 0,
      size: docs.length,
      forEach: (callback: (d: DocumentSnapshot) => void) => docs.forEach(callback)
    };
  }

  // =========================================================================
  // Document Operations
  // =========================================================================

  public async setDoc(docRef: DocumentReference, data: any, options?: { merge?: boolean }): Promise<void> {
    const { collection, id } = docRef;
    let colMap = this.cache.get(collection);
    if (!colMap) {
      colMap = new Map();
      this.cache.set(collection, colMap);
    }

    let finalData = data;
    if (options?.merge) {
      const existing = colMap.get(id) || {};
      finalData = { ...existing, ...data };
    }

    colMap.set(id, finalData);
    this.persistCacheSync();
    this.notifyListeners(collection, id);

    // Asynchronously write to IndexedDB
    this.writeToIndexedDb(collection, id, finalData).catch(() => {});

    // Broadcast to other open browser tabs
    try {
      this.broadcastChannel?.postMessage({
        type: 'SET',
        collection,
        docId: id,
        data: finalData
      });
    } catch (e) {}
  }

  public async updateDoc(docRef: DocumentReference, data: any): Promise<void> {
    return this.setDoc(docRef, data, { merge: true });
  }

  public async deleteDoc(docRef: DocumentReference): Promise<void> {
    const { collection, id } = docRef;
    const colMap = this.cache.get(collection);
    if (colMap) {
      colMap.delete(id);
      this.persistCacheSync();
      this.notifyListeners(collection, id);

      this.deleteFromIndexedDb(collection, id).catch(() => {});

      try {
        this.broadcastChannel?.postMessage({
          type: 'DELETE',
          collection,
          docId: id
        });
      } catch (e) {}
    }
  }

  public async getDoc(docRef: DocumentReference): Promise<DocumentSnapshot> {
    const { collection, id } = docRef;
    const colMap = this.cache.get(collection);
    const data = colMap?.get(id);

    return {
      id,
      ref: docRef,
      exists: () => data !== undefined,
      data: () => (data !== undefined ? JSON.parse(JSON.stringify(data)) : {})
    };
  }

  public async getDocs(collectionRef: CollectionReference): Promise<QuerySnapshot> {
    return this.buildCollectionSnapshot(collectionRef.id);
  }

  public async addDoc(collectionRef: CollectionReference, data: any): Promise<DocumentReference> {
    const id = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const docRef: DocumentReference = {
      id,
      path: `${collectionRef.id}/${id}`,
      collection: collectionRef.id,
      _isDocRef: true
    };
    await this.setDoc(docRef, data);
    return docRef;
  }

  // =========================================================================
  // Real-time Subscriptions (onSnapshot)
  // =========================================================================

  public onSnapshot(
    ref: DocumentReference | CollectionReference,
    onNext: (snapshot: any) => void,
    onError?: (error: any) => void
  ): () => void {
    if ('_isDocRef' in ref) {
      // Document listener
      const docRef = ref as DocumentReference;
      const key = `${docRef.collection}/${docRef.id}`;
      if (!this.docListeners.has(key)) {
        this.docListeners.set(key, new Set());
      }
      this.docListeners.get(key)!.add(onNext);

      // Trigger immediate initial snapshot synchronously
      this.getDoc(docRef).then(onNext).catch(onError || console.error);

      // Return unsubscribe handler
      return () => {
        const set = this.docListeners.get(key);
        if (set) {
          set.delete(onNext);
          if (set.size === 0) this.docListeners.delete(key);
        }
      };
    } else {
      // Collection listener
      const colRef = ref as CollectionReference;
      const colName = colRef.id;
      if (!this.collectionListeners.has(colName)) {
        this.collectionListeners.set(colName, new Set());
      }
      this.collectionListeners.get(colName)!.add(onNext);

      // Trigger immediate initial snapshot synchronously
      const snap = this.buildCollectionSnapshot(colName);
      try {
        onNext(snap);
      } catch (err) {
        if (onError) onError(err);
      }

      // Return unsubscribe handler
      return () => {
        const set = this.collectionListeners.get(colName);
        if (set) {
          set.delete(onNext);
          if (set.size === 0) this.collectionListeners.delete(colName);
        }
      };
    }
  }

  // =========================================================================
  // IndexedDB Storage Helpers
  // =========================================================================

  private async writeToIndexedDb(collection: string, docId: string, data: any) {
    try {
      const idb = await this.initIndexedDb();
      const tx = idb.transaction(COLLECTIONS_STORE_NAME, 'readwrite');
      const store = tx.objectStore(COLLECTIONS_STORE_NAME);
      store.put({ _key: `${collection}/${docId}`, collection, docId, data });
    } catch (e) {}
  }

  private async deleteFromIndexedDb(collection: string, docId: string) {
    try {
      const idb = await this.initIndexedDb();
      const tx = idb.transaction(COLLECTIONS_STORE_NAME, 'readwrite');
      const store = tx.objectStore(COLLECTIONS_STORE_NAME);
      store.delete(`${collection}/${docId}`);
    } catch (e) {}
  }

  // =========================================================================
  // Database Backup / Export / Reset Utilities for cloudj.ca portfolio
  // =========================================================================

  public exportDatabaseToJson(): string {
    const exported: Record<string, Record<string, any>> = {};
    for (const [colName, colMap] of this.cache.entries()) {
      exported[colName] = {};
      for (const [docId, docData] of colMap.entries()) {
        exported[colName][docId] = docData;
      }
    }
    return JSON.stringify(exported, null, 2);
  }

  public downloadDatabaseJsonFile(filename = 'daycare-os-database-backup.json') {
    if (typeof window === 'undefined') return;
    const jsonStr = this.exportDatabaseToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public resetToFactoryDefaults() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(LOCAL_STORAGE_CACHE_KEY);
        localStorage.removeItem(INITIALIZED_FLAG_KEY);
      } catch (e) {}
    }
    this.cache.clear();
    this.seedInitialData();

    // Notify all active listeners across all collections
    this.collectionListeners.forEach((listeners, colName) => {
      const snap = this.buildCollectionSnapshot(colName);
      listeners.forEach((l) => l(snap));
    });

    console.log('[DaycareOS DB] Database reset to clean factory defaults successfully.');
  }
}

// Global Singleton Database Instance
export const clientDatabase = new ReactiveClientDatabase();

// ===========================================================================
// Firestore API Compatible Surface
// ===========================================================================

export const db = {
  _isDaycareOsClientDb: true
};

export function doc(database: any, collectionOrPath: string, ...pathSegments: string[]): DocumentReference {
  let fullPath = collectionOrPath;
  if (pathSegments.length > 0) {
    fullPath = [collectionOrPath, ...pathSegments].join('/');
  }

  const parts = fullPath.split('/').filter(Boolean);
  const collection = parts[0] || 'default';
  const id = parts[1] || 'root';

  return {
    id,
    path: `${collection}/${id}`,
    collection,
    _isDocRef: true
  };
}

export function collection(database: any, collectionPath: string, ...pathSegments: string[]): CollectionReference {
  const parts = [collectionPath, ...pathSegments].join('/').split('/').filter(Boolean);
  const id = parts.join('/') || 'default';

  return {
    id,
    path: id,
    _isCollectionRef: true
  };
}

export function setDoc(docRef: DocumentReference, data: any, options?: { merge?: boolean }): Promise<void> {
  return clientDatabase.setDoc(docRef, data, options);
}

export function updateDoc(docRef: DocumentReference, data: any): Promise<void> {
  return clientDatabase.updateDoc(docRef, data);
}

export function deleteDoc(docRef: DocumentReference): Promise<void> {
  return clientDatabase.deleteDoc(docRef);
}

export function getDoc(docRef: DocumentReference): Promise<DocumentSnapshot> {
  return clientDatabase.getDoc(docRef);
}

export function getDocs(collectionRef: CollectionReference): Promise<QuerySnapshot> {
  return clientDatabase.getDocs(collectionRef);
}

export function addDoc(collectionRef: CollectionReference, data: any): Promise<DocumentReference> {
  return clientDatabase.addDoc(collectionRef, data);
}

export type SnapshotErrorHandler = (error: { message: string; [key: string]: any }) => void;

export function onSnapshot(
  collectionRef: CollectionReference,
  onNext: (snapshot: QuerySnapshot) => void,
  onError?: SnapshotErrorHandler
): () => void;
export function onSnapshot(
  collectionRef: CollectionReference,
  options: any,
  onNext: (snapshot: QuerySnapshot) => void,
  onError?: SnapshotErrorHandler
): () => void;
export function onSnapshot(
  docRef: DocumentReference,
  onNext: (snapshot: DocumentSnapshot) => void,
  onError?: SnapshotErrorHandler
): () => void;
export function onSnapshot(
  docRef: DocumentReference,
  options: any,
  onNext: (snapshot: DocumentSnapshot) => void,
  onError?: SnapshotErrorHandler
): () => void;
export function onSnapshot(
  ref: any,
  ...args: any[]
): () => void {
  let onNext: (snap: any) => void;
  let onError: SnapshotErrorHandler | undefined;
  if (typeof args[0] === 'function') {
    onNext = args[0];
    onError = typeof args[1] === 'function' ? args[1] : undefined;
  } else {
    onNext = args[1];
    onError = typeof args[2] === 'function' ? args[2] : undefined;
  }
  return clientDatabase.onSnapshot(ref, onNext, onError);
}

export function writeBatch(database?: any) {
  const operations: Array<() => Promise<void>> = [];

  const batch = {
    set: (docRef: DocumentReference, data: any, options?: { merge?: boolean }) => {
      operations.push(() => clientDatabase.setDoc(docRef, data, options));
      return batch;
    },
    update: (docRef: DocumentReference, data: any) => {
      operations.push(() => clientDatabase.updateDoc(docRef, data));
      return batch;
    },
    delete: (docRef: DocumentReference) => {
      operations.push(() => clientDatabase.deleteDoc(docRef));
      return batch;
    },
    commit: async () => {
      for (const op of operations) {
        await op();
      }
    }
  };
  return batch;
}

// ===========================================================================
// Firebase Storage API Compatible Surface
// ===========================================================================

export const storage = {
  _isDaycareOsStorage: true
};

export interface StorageReference {
  fullPath: string;
  name: string;
}

export interface UploadTaskSnapshot {
  bytesTransferred: number;
  totalBytes: number;
  state: string;
  ref: StorageReference;
}

export function ref(storageInstance: any, path: string): StorageReference {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return {
    fullPath: cleanPath,
    name: cleanPath.split('/').pop() || 'file'
  };
}

export async function uploadBytes(
  storageRef: StorageReference,
  fileOrBlob: File | Blob,
  metadata?: any
): Promise<{ ref: StorageReference }> {
  return new Promise((resolve, reject) => {
    if (typeof FileReader === 'undefined') {
      resolve({ ref: storageRef });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      try {
        localStorage.setItem(`daycare_os_blob_${storageRef.fullPath}`, dataUrl);
      } catch (e) {
        console.warn('[DaycareOS Storage] LocalStorage blob cache quota warning');
      }
      resolve({ ref: storageRef });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(fileOrBlob);
  });
}

export function uploadBytesResumable(
  storageRef: StorageReference,
  fileOrBlob: File | Blob,
  metadata?: any
) {
  let progressCallback: ((snapshot: UploadTaskSnapshot) => void) | null = null;
  let completeCallback: (() => void) | null = null;

  const promise = uploadBytes(storageRef, fileOrBlob, metadata).then((result) => {
    if (completeCallback) completeCallback();
    return result;
  });

  return {
    on: (
      event: string,
      onProgress?: (snap: UploadTaskSnapshot) => void,
      onError?: (err: any) => void,
      onComplete?: () => void
    ) => {
      progressCallback = onProgress || null;
      completeCallback = onComplete || null;
      if (progressCallback) {
        progressCallback({
          bytesTransferred: 100,
          totalBytes: 100,
          state: 'running',
          ref: storageRef
        });
      }
    },
    snapshot: { ref: storageRef },
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise)
  };
}

export async function getDownloadURL(storageRef: StorageReference): Promise<string> {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(`daycare_os_blob_${storageRef.fullPath}`);
    if (cached) return cached;
  }
  return `/logos/daycare_os.png`;
}

// ===========================================================================
// Firebase Auth API Compatible Surface
// ===========================================================================

export const auth = {
  currentUser: {
    uid: 'admin-local',
    email: 'director@daycare-os.ca',
    displayName: 'DaycareOS Agency Director'
  }
};

export function getAuth() {
  return auth;
}

export function onAuthStateChanged(authInstance: any, callback: (user: any) => void): () => void {
  setTimeout(() => {
    callback(auth.currentUser);
  }, 0);
  return () => {};
}

export const app = {
  name: 'DaycareOS',
  options: {}
};
