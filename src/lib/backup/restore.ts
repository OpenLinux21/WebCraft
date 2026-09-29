import type { StorageAdapter } from '@/lib/storage/types';
import { parseCodeDraft, parseLessonProgress } from '@/lib/storage/guards';
import type { BackupFile } from './types';

export interface RestoreOptions {
  /** Replace all existing records (default) instead of merging. */
  replace?: boolean;
}

/**
 * A pre-validated backup never contains malformed entries, but
 * restoreBackup can also be handed hand-built files — validate before the
 * destructive clear so a malformed payload cannot wipe storage and then
 * throw halfway through.
 */
function assertRestorable(file: BackupFile): void {
  if (
    !Array.isArray(file.data.progress) ||
    !Array.isArray(file.data.drafts) ||
    !Array.isArray(file.data.playground)
  ) {
    throw new Error('Backup data sections are missing or malformed');
  }
  for (const entry of file.data.progress) {
    if (typeof entry?.lessonId !== 'string' || entry.progress == null) {
      throw new Error('Backup contains a malformed progress entry');
    }
  }
  for (const entry of file.data.drafts) {
    if (typeof entry?.key !== 'string' || entry.draft == null) {
      throw new Error('Backup contains a malformed draft entry');
    }
  }
  for (const entry of file.data.playground) {
    if (typeof entry?.key !== 'string') {
      throw new Error('Backup contains a malformed playground entry');
    }
  }
}

/** Writes a parsed backup into local storage. */
export async function restoreBackup(
  adapter: StorageAdapter,
  file: BackupFile,
  options: RestoreOptions = {},
): Promise<void> {
  assertRestorable(file);
  const replace = options.replace ?? true;

  if (replace) {
    // Snapshot first: if any write below fails, the previous state is
    // restored instead of leaving the user with partially wiped data.
    const [progressSnapshot, draftsSnapshot, playgroundSnapshot] = await Promise.all([
      adapter.list<unknown>('progress'),
      adapter.list<unknown>('drafts'),
      adapter.list<unknown>('playground'),
    ]);
    try {
      await adapter.clear('progress');
      await adapter.clear('drafts');
      await adapter.clear('playground');
      for (const { lessonId, progress } of file.data.progress) {
        await adapter.set('progress', lessonId, progress);
      }
      for (const { key, draft } of file.data.drafts) {
        await adapter.set('drafts', key, draft);
      }
      for (const { key, value } of file.data.playground) {
        await adapter.set('playground', key, value);
      }
    } catch (error) {
      // Roll back to the snapshot best-effort so a failed restore does not
      // destroy the user's existing data.
      await adapter.clear('progress').catch(() => undefined);
      await adapter.clear('drafts').catch(() => undefined);
      await adapter.clear('playground').catch(() => undefined);
      for (const { key, value } of progressSnapshot) {
        await adapter.set('progress', key, value).catch(() => undefined);
      }
      for (const { key, value } of draftsSnapshot) {
        await adapter.set('drafts', key, value).catch(() => undefined);
      }
      for (const { key, value } of playgroundSnapshot) {
        await adapter.set('playground', key, value).catch(() => undefined);
      }
      throw error;
    }
    return;
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

/** Counts entries that the export guards would drop, for the completeness warning. */
export function countDroppedEntries(input: {
  progress: Array<{ key: string; value: unknown }>;
  drafts: Array<{ key: string; value: unknown }>;
}): number {
  const droppedProgress = input.progress.filter(
    (entry) => parseLessonProgress(entry.value) === null,
  ).length;
  const droppedDrafts = input.drafts.filter((entry) => parseCodeDraft(entry.value) === null).length;
  return droppedProgress + droppedDrafts;
}
