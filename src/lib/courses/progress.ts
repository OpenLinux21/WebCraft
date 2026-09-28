import type { LessonProgress, ProgressAction } from './types';

/**
 * Pure lesson-progress state machine.
 * Transitions: anything -> inProgress ("start"), anything -> completed
 * ("complete"), anything -> notStarted ("reset").
 */
export function transitionProgress(action: ProgressAction, now: Date = new Date()): LessonProgress {
  const updatedAt = now.toISOString();
  switch (action) {
    case 'start':
      return { status: 'inProgress', updatedAt, completedAt: null };
    case 'complete':
      return { status: 'completed', updatedAt, completedAt: updatedAt };
    case 'reset':
      return { status: 'notStarted', updatedAt, completedAt: null };
  }
}
