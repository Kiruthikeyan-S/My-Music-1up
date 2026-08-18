// Persistent Browser IndexedDB storage for local audio tracks (Preserved across page reloads & offline)

const DB_NAME = 'OneUpMusicDB';
const DB_VERSION = 1;
const STORE_NAME = 'songs';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Save a song and its audio binary blob to IndexedDB
export async function saveLocalSong(songMeta, fileBlob = null) {
  try {
    const db = await openDB();
    const blobToStore = fileBlob || songMeta.fileBlob || songMeta.blob;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record = {
        ...songMeta,
        fileBlob: blobToStore,
        savedAt: Date.now()
      };

      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Error saving song to IndexedDB:', err);
    return false;
  }
}

// Retrieve all persistent local songs from IndexedDB with fresh playable Blob URLs
export async function getLocalSongs() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const records = req.result || [];
        const loadedSongs = records.map(r => {
          let blobUrl = '';
          if (r.fileBlob) {
            blobUrl = URL.createObjectURL(r.fileBlob);
          }
          return {
            ...r,
            blobUrl: blobUrl,
            audioUrl: blobUrl,
            is_local: true,
            fileBlob: r.fileBlob // retain blob reference for offline reuse
          };
        });
        resolve(loadedSongs);
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Error reading songs from IndexedDB:', err);
    return [];
  }
}

// Delete a song from IndexedDB
export async function deleteLocalSong(songId) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(songId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Error deleting song from IndexedDB:', err);
    return false;
  }
}
