import { parseAIConfig } from '@/lib/ai/settings';
import { parseCodeDraft, parseLessonProgress } from '@/lib/storage/guards';
import { parsePreviewSettings } from '@/lib/storage/settings';
import {
  BACKUP_APP,
  BACKUP_FORMAT,
  CURRENT_SCHEMA_VERSION,
  type BackupFile,
  type BackupSettings,
} from './types';

export interface ExportInput {
  progress: Array<{ key: string; value: unknown }>;
  drafts: Array<{ key: string; value: unknown }>;
  playground: Array<{ key: string; value: unknown }>;
  settings: {
    theme?: string;
    locale?: string;
    preview?: unknown;
    ai?: unknown;
  };
  includeSensitive: boolean;
}

/** `webcraft-backup-20260928-140301.json` */
export function backupFileName(now: Date = new Date()): string {
  const pad = (value: number): string => String(value).padStart(2, '0');
  const stamp =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `webcraft-backup-${stamp}.json`;
}

function buildSettings(input: ExportInput): BackupSettings {
  const settings: BackupSettings = {};
  if (input.settings.theme !== undefined) settings.theme = input.settings.theme;
  if (input.settings.locale !== undefined) settings.locale = input.settings.locale;
  const preview = parsePreviewSettings(input.settings.preview);
  if (preview) settings.preview = preview;
  // The API key is excluded unless the user explicitly opted in.
  if (input.includeSensitive) {
    const ai = parseAIConfig(input.settings.ai);
    if (ai) settings.ai = ai;
  }
  return settings;
}

/** Builds a versioned backup file from storage snapshots. */
export function buildBackupFile(input: ExportInput): BackupFile {
  return {
    format: BACKUP_FORMAT,
    app: BACKUP_APP,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    includesSensitive: input.includeSensitive,
    data: {
      progress: input.progress.flatMap(({ key, value }) => {
        const progress = parseLessonProgress(value);
        return progress ? [{ lessonId: key, progress }] : [];
      }),
      drafts: input.drafts.flatMap(({ key, value }) => {
        const draft = parseCodeDraft(value);
        return draft ? [{ key, draft }] : [];
      }),
      playground: input.playground.map(({ key, value }) => ({ key, value })),
      settings: buildSettings(input),
    },
  };
}

export function serializeBackup(file: BackupFile): string {
  return JSON.stringify(file, null, 2);
}
