import type { CodeDraft, LessonProgress, LessonStatus } from '@/lib/courses/types';
import { LESSON_STATUSES } from '@/lib/courses/types';

/**
 * Structural guards for records read back from storage. Corrupted or stale
 * values are dropped (treated as absent) instead of crashing the UI.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseLessonStatus(value: unknown): value is LessonStatus {
  return typeof value === 'string' && (LESSON_STATUSES as readonly string[]).includes(value);
}

export function parseLessonProgress(value: unknown): LessonProgress | null {
  if (!isRecord(value)) return null;
  if (!parseLessonStatus(value['status'])) return null;
  if (typeof value['updatedAt'] !== 'string') return null;
  const completedAt = value['completedAt'];
  if (completedAt !== null && typeof completedAt !== 'string') return null;
  return {
    status: value['status'],
    updatedAt: value['updatedAt'],
    completedAt: completedAt ?? null,
  };
}

export function parseCodeDraft(value: unknown): CodeDraft | null {
  if (!isRecord(value)) return null;
  const html = value['html'];
  const css = value['css'];
  const js = value['js'];
  const updatedAt = value['updatedAt'];
  if (
    typeof html !== 'string' ||
    typeof css !== 'string' ||
    typeof js !== 'string' ||
    typeof updatedAt !== 'string'
  ) {
    return null;
  }
  return { html, css, js, updatedAt };
}
