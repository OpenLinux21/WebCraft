import type { AIConfig } from '@/lib/ai/types';
import type { LessonProgress, CodeDraft } from '@/lib/courses/types';
import type { PreviewSettings } from '@/lib/storage/settings';

/** Backup file format: versioned, human-readable, no secrets by default. */
export const BACKUP_FORMAT = 'webcraft-backup';
export const BACKUP_APP = 'webcraft';
export const CURRENT_SCHEMA_VERSION = 1;

export interface BackupSettings {
  theme?: string;
  locale?: string;
  preview?: PreviewSettings;
  /** Only present when the user explicitly opted into sensitive export. */
  ai?: AIConfig | null;
}

export interface BackupData {
  progress: Array<{ lessonId: string; progress: LessonProgress }>;
  drafts: Array<{ key: string; draft: CodeDraft }>;
  playground: Array<{ key: string; value: unknown }>;
  settings: BackupSettings;
}

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  app: typeof BACKUP_APP;
  schemaVersion: number;
  exportedAt: string;
  includesSensitive: boolean;
  data: BackupData;
}
