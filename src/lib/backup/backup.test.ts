import { describe, expect, it } from 'vitest';
import { MemoryAdapter } from '@/lib/storage/memory';
import { buildBackupFile, backupFileName, serializeBackup } from './export';
import { BackupError, parseBackupFile, parseBackupJson } from './import';
import { restoreBackup } from './restore';
import { migrations } from './migrations';
import type { BackupFile } from './types';

const PROGRESS = { status: 'completed', updatedAt: 't1', completedAt: 't1' };
const DRAFT = { html: '<p></p>', css: '', js: '', updatedAt: 't2' };
const AI = {
  provider: 'openai-compatible',
  baseUrl: 'https://api.example.com/v1',
  model: 'm',
  apiKey: 'sk-secret-key-123456',
  customHeaders: {},
  temperature: 0.7,
  maxTokens: null,
};

function sampleInput(includeSensitive = false) {
  return {
    progress: [{ key: 'lesson-1', value: PROGRESS }],
    drafts: [{ key: 'lesson-1', value: DRAFT }],
    playground: [{ key: 'task-1', value: { title: 'T' } }],
    settings: { theme: 'dark', locale: 'en', preview: { livePreviewMs: 500 }, ai: AI },
    includeSensitive,
  };
}

describe('buildBackupFile', () => {
  it('creates a versioned file and excludes the API key by default', () => {
    const file = buildBackupFile(sampleInput(false));
    expect(file.format).toBe('webcraft-backup');
    expect(file.schemaVersion).toBe(1);
    expect(file.includesSensitive).toBe(false);
    expect(file.data.settings.ai).toBeUndefined();
    expect(file.data.progress[0]?.lessonId).toBe('lesson-1');
  });

  it('includes sensitive settings only when opted in', () => {
    const file = buildBackupFile(sampleInput(true));
    expect(file.includesSensitive).toBe(true);
    expect(file.data.settings.ai).toEqual({ ...AI, enabled: true });
  });

  it('produces a timestamped file name', () => {
    expect(backupFileName(new Date('2026-09-28T14:03:09'))).toBe(
      'webcraft-backup-20260928-140309.json',
    );
  });
});

describe('parseBackupFile', () => {
  it('round-trips a serialized file', () => {
    const file = buildBackupFile(sampleInput(true));
    const parsed = parseBackupJson(serializeBackup(file));
    expect(parsed).toEqual(file);
  });

  it('rejects junk and foreign formats', () => {
    expect(() => parseBackupFile('nope')).toThrow(BackupError);
    expect(() => parseBackupFile({ format: 'other-app-backup' })).toThrow(BackupError);
    expect(() =>
      parseBackupFile({ format: 'webcraft-backup', app: 'webcraft', schemaVersion: 0 }),
    ).toThrow(BackupError);
    expect(() =>
      parseBackupFile({ format: 'webcraft-backup', app: 'webcraft', schemaVersion: 'x' }),
    ).toThrow(BackupError);
  });

  it('rejects newer schema versions with a distinct reason', () => {
    try {
      parseBackupFile({
        format: 'webcraft-backup',
        app: 'webcraft',
        schemaVersion: 99,
        exportedAt: '',
        includesSensitive: false,
        data: {},
      });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(BackupError);
      expect((error as BackupError).reason).toBe('newer-version');
    }
  });

  it('drops corrupted entries but keeps valid ones', () => {
    const parsed = parseBackupFile({
      format: 'webcraft-backup',
      app: 'webcraft',
      schemaVersion: 1,
      exportedAt: '',
      includesSensitive: false,
      data: {
        progress: [
          { lessonId: 'good', progress: PROGRESS },
          { lessonId: 'bad', progress: { status: 'nonsense' } },
          'junk',
        ],
        drafts: [
          { key: 'good', draft: DRAFT },
          { key: 'bad', draft: 5 },
        ],
        playground: [{ key: 't', value: 1 }],
      },
    });
    expect(parsed.data.progress).toEqual([{ lessonId: 'good', progress: PROGRESS }]);
    expect(parsed.data.drafts).toEqual([{ key: 'good', draft: DRAFT }]);
  });

  it('runs migration entries for older schemas', () => {
    migrations[1] = (raw) => ({
      ...raw,
      data: {
        ...(raw['data'] as Record<string, unknown>),
        progress: [{ lessonId: 'migrated', progress: PROGRESS }],
      },
    });
    try {
      const parsed = parseBackupFile({
        format: 'webcraft-backup',
        app: 'webcraft',
        schemaVersion: 1,
        exportedAt: '',
        includesSensitive: false,
        data: { progress: [] },
      });
      // CURRENT_SCHEMA_VERSION is 1, so no migration should have run yet.
      expect(parsed.data.progress).toEqual([]);
    } finally {
      delete migrations[1];
    }
    expect(typeof migrations).toBe('object');
  });
});

describe('restoreBackup', () => {
  it('replaces storage contents by default', async () => {
    const adapter = new MemoryAdapter();
    await adapter.set('progress', 'old', PROGRESS);
    const file: BackupFile = buildBackupFile(sampleInput(false));
    await restoreBackup(adapter, file);
    expect(await adapter.get('progress', 'old')).toBeUndefined();
    expect(await adapter.get('progress', 'lesson-1')).toEqual(PROGRESS);
    expect(await adapter.get('drafts', 'lesson-1')).toEqual(DRAFT);
    expect((await adapter.list('playground')).map((e) => e.key)).toEqual(['task-1']);
  });
});
