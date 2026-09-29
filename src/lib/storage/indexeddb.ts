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
      const db = request.result;
      // Step aside for schema upgrades triggered by other tabs; holding the
      // connection open here would deadlock their versionchange.
      db.onversionchange = () => {
        db.close();
      };
      resolve(db);
    };
    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open IndexedDB'));
    };
    // 'blocked' is transient, not fatal: the open can still succeed once the
    // other connection closes. Rejecting here would poison the promise for
    // good while the later onsuccess would leak an unclosed connection.
    request.onblocked = () => {
      console.warn('[webcraft] IndexedDB open is blocked by another connection; waiting…');
    };
  });
}

/**
 * Wraps a single-request operation and rejects from `transaction.onabort`
 * as well: a transaction can abort without any request error event (quota
 * exceeded, connection closed mid-transaction), which would otherwise leave
 * the promise unsettled forever.
 */
function requestViaTransaction<T>(
  store: StoreName,
  start: (objectStore: IDBObjectStore) => IDBRequest<T>,
  mode: IDBTransactionMode,
  db: IDBDatabase,
  describe: (action: string) => Error,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, mode);
    const settle = () => {
      const request = start(transaction.objectStore(store));
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error ?? describe('failed'));
      };
    };
    transaction.onabort = () => {
      reject(transaction.error ?? describe('aborted'));
    };
    settle();
  });
}

/** IndexedDB adapter. Values must be structured-cloneable. */
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
    return requestViaTransaction<T>(
      store,
      (objectStore) => objectStore.get(key),
      'readonly',
      db,
      (action) => new Error(`Failed to read ${store}/${key}: transaction ${action}`),
    );
  }

  async set<T>(store: StoreName, key: string, value: T): Promise<void> {
    const db = await this.db;
    await requestViaTransaction<IDBValidKey>(
      store,
      (objectStore) => objectStore.put(value, key),
      'readwrite',
      db,
      (action) => new Error(`Failed to write ${store}/${key}: transaction ${action}`),
    );
  }

  async delete(store: StoreName, key: string): Promise<void> {
    const db = await this.db;
    await requestViaTransaction<undefined>(
      store,
      (objectStore) => objectStore.delete(key),
      'readwrite',
      db,
      (action) => new Error(`Failed to delete ${store}/${key}: transaction ${action}`),
    );
  }

  async list<T>(store: StoreName): Promise<Array<{ key: string; value: T }>> {
    const db = await this.db;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(store, 'readonly');
      const objectStore = transaction.objectStore(store);
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
      transaction.onabort = () => {
        reject(transaction.error ?? new Error(`Failed to list ${store}: transaction aborted`));
      };
    });
  }

  async clear(store: StoreName): Promise<void> {
    const db = await this.db;
    await requestViaTransaction<undefined>(
      store,
      (objectStore) => objectStore.clear(),
      'readwrite',
      db,
      (action) => new Error(`Failed to clear ${store}: transaction ${action}`),
    );
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
      transaction.onabort = () => {
        reject(transaction.error ?? new Error('Failed to clear database: transaction aborted'));
      };
    });
  }
}
