import { parseCodeDraft, parseLessonProgress } from '@/lib/storage/guards';
import type { LessonProgress, CodeDraft } from '@/lib/courses/types';

export type Migration = (raw: Record<string, unknown>) => Record<string, unknown>;

export interface ParsedEntries {
  progress: Array<{ lessonId: string; progress: LessonProgress }>;
  drafts: Array<{ key: string; draft: CodeDraft }>;
  playground: Array<{ key: string; value: unknown }>;
}

/** Structural guards for backup entries; invalid entries are dropped. */
export function parseProgressEntries(
  value: unknown,
): Array<{ lessonId: string; progress: LessonProgress }> {
  if (!Array.isArray(value)) return [];
  const entries: Array<{ lessonId: string; progress: LessonProgress }> = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue;
    const record = item as Record<string, unknown>;
    if (typeof record['lessonId'] !== 'string') continue;
    const progress = parseLessonProgress(record['progress']);
    if (progress) entries.push({ lessonId: record['lessonId'], progress });
  }
  return entries;
}

export function parseDraftEntries(value: unknown): Array<{ key: string; draft: CodeDraft }> {
  if (!Array.isArray(value)) return [];
  const entries: Array<{ key: string; draft: CodeDraft }> = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue;
    const record = item as Record<string, unknown>;
    if (typeof record['key'] !== 'string') continue;
    const draft = parseCodeDraft(record['draft']);
    if (draft) entries.push({ key: record['key'], draft });
  }
  return entries;
}

export function parsePlaygroundEntries(value: unknown): Array<{ key: string; value: unknown }> {
  if (!Array.isArray(value)) return [];
  const entries: Array<{ key: string; value: unknown }> = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue;
    const record = item as Record<string, unknown>;
    if (typeof record['key'] !== 'string') continue;
    entries.push({ key: record['key'], value: record['value'] });
  }
  return entries;
}
