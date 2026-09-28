import { transitionProgress } from '@/lib/courses/progress';
import type { LessonProgress, ProgressAction } from '@/lib/courses/types';
import { parseLessonProgress } from '../guards';
import type { StorageAdapter } from '../types';

export interface ProgressRepo {
  get(lessonId: string): Promise<LessonProgress | undefined>;
  list(): Promise<Array<{ key: string; value: LessonProgress }>>;
  /** Applies a state transition and persists it. */
  apply(lessonId: string, action: ProgressAction): Promise<LessonProgress>;
}

export function createProgressRepo(adapter: StorageAdapter): ProgressRepo {
  return {
    async get(lessonId: string): Promise<LessonProgress | undefined> {
      const raw = await adapter.get<unknown>('progress', lessonId);
      return raw === undefined ? undefined : (parseLessonProgress(raw) ?? undefined);
    },
    async list(): Promise<Array<{ key: string; value: LessonProgress }>> {
      const all = await adapter.list<unknown>('progress');
      const valid: Array<{ key: string; value: LessonProgress }> = [];
      for (const entry of all) {
        const parsed = parseLessonProgress(entry.value);
        if (parsed) valid.push({ key: entry.key, value: parsed });
      }
      return valid;
    },
    async apply(lessonId: string, action: ProgressAction): Promise<LessonProgress> {
      const next = transitionProgress(action);
      await adapter.set('progress', lessonId, next);
      return next;
    },
  };
}
