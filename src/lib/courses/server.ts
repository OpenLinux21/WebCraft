import { getCollection, type CollectionEntry } from 'astro:content';
import type { AppLocale } from '@/lib/i18n/types';

export type LessonEntry = CollectionEntry<'courses'>;

export interface LessonNeighbours {
  prev: LessonEntry | undefined;
  next: LessonEntry | undefined;
}

/** Entry id has the shape `<locale>/<lessonId>`. */
export function lessonIdOf(entry: LessonEntry): string {
  const id = entry.id.split('/')[1];
  return id ?? entry.id;
}

/** All lessons of one locale, ordered by their global `order`. */
export async function getLessons(locale: AppLocale): Promise<LessonEntry[]> {
  const entries = await getCollection('courses', (entry) => entry.id.startsWith(`${locale}/`));
  return entries.sort((a, b) => a.data.order - b.data.order);
}

export function lessonNeighbours(lessons: readonly LessonEntry[], index: number): LessonNeighbours {
  return {
    prev: index > 0 ? lessons[index - 1] : undefined,
    next: index < lessons.length - 1 ? lessons[index + 1] : undefined,
  };
}
