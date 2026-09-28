import type { StorageAdapter } from '@/lib/storage/types';
import type { BackupFile } from './types';

export interface RestoreOptions {
  /** Replace all existing records (default) instead of merging. */
  replace?: boolean;
}

/** Writes a parsed backup into local storage. */
export async function restoreBackup(
  adapter: StorageAdapter,
  file: BackupFile,
  options: RestoreOptions = {},
): Promise<void> {
  const replace = options.replace ?? true;
  if (replace) {
    await adapter.clear('progress');
    await adapter.clear('drafts');
    await adapter.clear('playground');
  }
  for (const { lessonId, progress } of file.data.progress) {
    await adapter.set('progress', lessonId, progress);
  }
  for (const { key, draft } of file.data.drafts) {
    await adapter.set('drafts', key, draft);
  }
  for (const { key, value } of file.data.playground) {
    await adapter.set('playground', key, value);
  }
}

/** Collects all stores for export (settings handled separately by callers). */
export async function collectBackupStores(adapter: StorageAdapter): Promise<{
  progress: Array<{ key: string; value: unknown }>;
  drafts: Array<{ key: string; value: unknown }>;
  playground: Array<{ key: string; value: unknown }>;
}> {
  const [progress, drafts, playground] = await Promise.all([
    adapter.list<unknown>('progress'),
    adapter.list<unknown>('drafts'),
    adapter.list<unknown>('playground'),
  ]);
  return { progress, drafts, playground };
}
