import { STORE_NAMES, type StorageAdapter, type StoreName } from './types';

/** In-memory adapter: used in tests and as a transparent runtime fallback. */
export class MemoryAdapter implements StorageAdapter {
  private readonly stores = new Map<StoreName, Map<string, unknown>>();

  private store(name: StoreName): Map<string, unknown> {
    let store = this.stores.get(name);
    if (!store) {
      store = new Map();
      this.stores.set(name, store);
    }
    return store;
  }

  async get<T>(store: StoreName, key: string): Promise<T | undefined> {
    return this.store(store).get(key) as T | undefined;
  }

  async set<T>(store: StoreName, key: string, value: T): Promise<void> {
    this.store(store).set(key, value);
  }

  async delete(store: StoreName, key: string): Promise<void> {
    this.store(store).delete(key);
  }

  async list<T>(store: StoreName): Promise<Array<{ key: string; value: T }>> {
    return [...this.store(store).entries()].map(([key, value]) => ({ key, value: value as T }));
  }

  async clear(store: StoreName): Promise<void> {
    this.stores.delete(store);
  }

  async clearAll(): Promise<void> {
    for (const name of STORE_NAMES) await this.clear(name);
  }
}
