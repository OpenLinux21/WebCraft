import { STORE_NAMES, type StorageAdapter, type StoreName } from './types';

const DB_NAME = 'webcraft';
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of STORE_NAMES) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name);
      }
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open IndexedDB'));
    };
    request.onblocked = () => {
      reject(new Error('IndexedDB open blocked by another connection'));
    };
  });
}

/**
 * IndexedDB adapter. Values must be structured-cloneable; all app records
 * are plain JSON-like objects.
 */
export class IndexedDbAdapter implements StorageAdapter {
  private readonly db: Promise<IDBDatabase>;

  constructor() {
    this.db = openDatabase();
  }

  /** Resolves once the database connection is usable. */
  async ping(): Promise<void> {
    await this.db;
  }

  async get<T>(store: StoreName, key: string): Promise<T | undefined> {
    const db = await this.db;
    return new Promise((resolve, reject) => {
      const request = db.transaction(store, 'readonly').objectStore(store).get(key);
      request.onsuccess = () => {
        resolve(request.result as T | undefined);
      };
      request.onerror = () => {
        reject(request.error ?? new Error(`Failed to read ${store}/${key}`));
      };
    });
  }

  async set<T>(store: StoreName, key: string, value: T): Promise<void> {
    const db = await this.db;
    return new Promise((resolve, reject) => {
      const request = db.transaction(store, 'readwrite').objectStore(store).put(value, key);
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        reject(request.error ?? new Error(`Failed to write ${store}/${key}`));
      };
    });
  }

  async delete(store: StoreName, key: string): Promise<void> {
    const db = await this.db;
    return new Promise((resolve, reject) => {
      const request = db.transaction(store, 'readwrite').objectStore(store).delete(key);
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        reject(request.error ?? new Error(`Failed to delete ${store}/${key}`));
      };
    });
  }

  async list<T>(store: StoreName): Promise<Array<{ key: string; value: T }>> {
    const db = await this.db;
    return new Promise((resolve, reject) => {
      const objectStore = db.transaction(store, 'readonly').objectStore(store);
      const keysRequest = objectStore.getAllKeys();
      const valuesRequest = objectStore.getAll();
      let finished = 0;
      let keys: IDBValidKey[] = [];
      let values: T[] = [];
      const done = (): void => {
        finished += 1;
        if (finished < 2) return;
        resolve(
          keys.map((key, index) => ({
            key: String(key),
            value: values[index] as T,
          })),
        );
      };
      keysRequest.onsuccess = () => {
        keys = keysRequest.result;
        done();
      };
      valuesRequest.onsuccess = () => {
        values = valuesRequest.result as T[];
        done();
      };
      const fail = (): void => {
        reject(valuesRequest.error ?? keysRequest.error ?? new Error(`Failed to list ${store}`));
      };
      keysRequest.onerror = fail;
      valuesRequest.onerror = fail;
    });
  }

  async clear(store: StoreName): Promise<void> {
    const db = await this.db;
    return new Promise((resolve, reject) => {
      const request = db.transaction(store, 'readwrite').objectStore(store).clear();
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        reject(request.error ?? new Error(`Failed to clear ${store}`));
      };
    });
  }

  async clearAll(): Promise<void> {
    const db = await this.db;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAMES, 'readwrite');
      for (const name of STORE_NAMES) {
        transaction.objectStore(name).clear();
      }
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = () => {
        reject(transaction.error ?? new Error('Failed to clear database'));
      };
    });
  }
}
