// IndexedDB storage for big things: drawings (PNG blobs) and voice recordings (audio blobs).

const DB_NAME = 'jia-games';
const DB_VERSION = 1;
export const STORES = ['drawings', 'recordings'];

let dbPromise;

function openDb() {
  dbPromise ||= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      for (const name of STORES) {
        if (!request.result.objectStoreNames.contains(name)) {
          request.result.createObjectStore(name, { keyPath: 'id' });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function run(storeName, mode, action) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const result = action(tx.objectStore(storeName));
    tx.oncomplete = () => resolve(result?.result);
    tx.onerror = () => reject(tx.error);
  });
}

export async function putItem(storeName, item) {
  await run(storeName, 'readwrite', (store) => store.put(item));
  return item;
}

export async function getItem(storeName, id) {
  return run(storeName, 'readonly', (store) => store.get(id));
}

/** A kid's items, newest first (items carry userId and a createdAt ISO string). */
export async function listItems(storeName, userId) {
  const items = ((await run(storeName, 'readonly', (store) => store.getAll())) || [])
    .filter((item) => item.userId === userId);
  return items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export async function deleteItem(storeName, id) {
  await run(storeName, 'readwrite', (store) => store.delete(id));
}
