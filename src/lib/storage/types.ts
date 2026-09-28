/** Logical object stores of the app's local database. */
export const STORE_NAMES = ['progress', 'drafts', 'playground'] as const;
export type StoreName = (typeof STORE_NAMES)[number];

/**
 * Storage abstraction: the app talks to logical stores, never to IndexedDB or
 * localStorage directly. This keeps cloud-sync adapters (user-provided) or
 * in-memory fallbacks interchangeable.
 */
export interface StorageAdapter {
  get<T>(store: StoreName, key: string): Promise<T | undefined>;
  set<T>(store: StoreName, key: string, value: T): Promise<void>;
  delete(store: StoreName, key: string): Promise<void>;
  list<T>(store: StoreName): Promise<Array<{ key: string; value: T }>>;
  clear(store: StoreName): Promise<void>;
  /** Clears every logical store (used by "delete all local data"). */
  clearAll(): Promise<void>;
}
