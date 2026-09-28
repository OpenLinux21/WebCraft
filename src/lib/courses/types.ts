/** Status of a single lesson, tracked in local storage. */
export const LESSON_STATUSES = ['notStarted', 'inProgress', 'completed'] as const;
export type LessonStatus = (typeof LESSON_STATUSES)[number];

export interface LessonProgress {
  status: LessonStatus;
  /** ISO timestamp of the last change. */
  updatedAt: string;
  /** ISO timestamp set when the lesson is marked completed; null otherwise. */
  completedAt: string | null;
}

export type ProgressAction = 'start' | 'complete' | 'reset';

/** Code state of the editor for one lesson or the playground. */
export interface CodeDraft {
  html: string;
  css: string;
  js: string;
  updatedAt: string;
}
