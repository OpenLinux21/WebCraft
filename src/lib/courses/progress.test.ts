import { describe, expect, it } from 'vitest';
import { transitionProgress } from './progress';

describe('transitionProgress', () => {
  it('starts a lesson from nothing', () => {
    const next = transitionProgress('start', new Date('2026-01-01T00:00:00Z'));
    expect(next.status).toBe('inProgress');
    expect(next.completedAt).toBeNull();
    expect(next.updatedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('completes a lesson and records the completion time', () => {
    const next = transitionProgress('complete', new Date('2026-01-02T00:00:00Z'));
    expect(next.status).toBe('completed');
    expect(next.completedAt).toBe('2026-01-02T00:00:00.000Z');
  });

  it('resets a completed lesson', () => {
    const completed = transitionProgress('complete');
    const reset = transitionProgress('reset');
    expect(completed.status).toBe('completed');
    expect(reset.status).toBe('notStarted');
    expect(reset.completedAt).toBeNull();
  });
});
