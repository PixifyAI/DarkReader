import { GalleryItem, Highlight } from '../types';

const DB_NAME = 'DarkReaderDB';
const DB_VERSION = 1;
const GALLERY_STORE = 'gallery';
const HIGHLIGHTS_STORE = 'highlights';

let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) return resolve(true);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', request.error);
      reject(false);
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(GALLERY_STORE)) {
        db.createObjectStore(GALLERY_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(HIGHLIGHTS_STORE)) {
        // Use fileId as the key for highlights
        db.createObjectStore(HIGHLIGHTS_STORE, { keyPath: 'fileId' });
      }
    };
  });
};

export const getGallery = (): Promise<GalleryItem[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(GALLERY_STORE, 'readonly');
    const store = transaction.objectStore(GALLERY_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      console.error('Error fetching gallery:', request.error);
      reject(request.error);
    };
  });
};

export const addOrUpdateGalleryItem = (item: GalleryItem): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(GALLERY_STORE, 'readwrite');
    const store = transaction.objectStore(GALLERY_STORE);
    const request = store.put(item);
    
    request.onsuccess = () => resolve();
    request.onerror = () => {
        console.error('Error saving gallery item:', request.error);
        reject(request.error);
    };
  });
};

export const deleteGalleryItem = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([GALLERY_STORE, HIGHLIGHTS_STORE], 'readwrite');
        const galleryStore = transaction.objectStore(GALLERY_STORE);
        const highlightsStore = transaction.objectStore(HIGHLIGHTS_STORE);
        
        const galleryDeleteRequest = galleryStore.delete(id);
        const highlightsDeleteRequest = highlightsStore.delete(id);

        transaction.oncomplete = () => {
            resolve();
        };
        transaction.onerror = () => {
            console.error("Error deleting item from DB:", transaction.error);
            reject(transaction.error);
        }
    });
};

export const getHighlights = (): Promise<Record<string, Highlight[]>> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(HIGHLIGHTS_STORE, 'readonly');
        const store = transaction.objectStore(HIGHLIGHTS_STORE);
        const request = store.getAll();

        request.onsuccess = () => {
            const map: Record<string, Highlight[]> = {};
            request.result.forEach((item: { fileId: string; highlights: Highlight[] }) => {
                map[item.fileId] = item.highlights;
            });
            resolve(map);
        };

        request.onerror = () => {
            console.error('Error fetching highlights:', request.error);
            reject(request.error);
        };
    });
};

export const saveHighlights = (fileId: string, highlights: Highlight[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(HIGHLIGHTS_STORE, 'readwrite');
        const store = transaction.objectStore(HIGHLIGHTS_STORE);
        const request = store.put({ fileId, highlights });

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error saving highlights:', request.error);
            reject(request.error);
        };
    });
};
