import { IndexedDbAdapter } from './indexeddb';
import { MemoryAdapter } from './memory';
import type { StorageAdapter } from './types';

let instance: Promise<StorageAdapter> | null = null;

function memoryWithWarning(): StorageAdapter {
  console.warn(
    '[webcraft] IndexedDB is unavailable; falling back to in-memory storage. Data will not persist across reloads.',
  );
  return new MemoryAdapter();
}

async function openStorage(): Promise<StorageAdapter> {
  if (typeof indexedDB === 'undefined') return memoryWithWarning();
  try {
    const adapter = new IndexedDbAdapter();
    await adapter.ping();
    return adapter;
  } catch {
    return memoryWithWarning();
  }
}

/** Shared storage instance: IndexedDB with a transparent in-memory fallback. */
export function getStorage(): Promise<StorageAdapter> {
  instance ??= openStorage();
  return instance;
}

const APP_LOCAL_PREFIX = 'webcraft.';

/** Removes every `webcraft.*` key from localStorage (settings and secrets). */
export function clearAppLocalStorage(): void {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return;
    const keys: string[] = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key?.startsWith(APP_LOCAL_PREFIX)) keys.push(key);
    }
    for (const key of keys) storage.removeItem(key);
  } catch {
    // Storage unavailable: nothing to clear.
  }
}
