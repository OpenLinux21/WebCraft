import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { IndexedDbAdapter } from './indexeddb';
import { MemoryAdapter } from './memory';
import { createProgressRepo } from './repos/progress';
import { parseCodeDraft, parseLessonProgress } from './guards';
import type { StorageAdapter } from './types';

function adapters(): Array<[string, StorageAdapter]> {
  return [
    ['memory', new MemoryAdapter()],
    ['indexeddb', new IndexedDbAdapter()],
  ];
}

describe.each(adapters())('StorageAdapter (%s)', (_name, adapter) => {
  it('stores, lists and deletes records', async () => {
    await adapter.set('progress', 'l1', {
      status: 'inProgress',
      updatedAt: 't',
      completedAt: null,
    });
    await adapter.set('progress', 'l2', {
      status: 'completed',
      updatedAt: 't2',
      completedAt: 't2',
    });
    expect(await adapter.get('progress', 'l1')).toMatchObject({ status: 'inProgress' });
    const listed = await adapter.list('progress');
    expect(listed).toHaveLength(2);
    await adapter.delete('progress', 'l1');
    expect(await adapter.get('progress', 'l1')).toBeUndefined();
  });

  it('clears one store and can clear everything', async () => {
    await adapter.set('progress', 'l1', { status: 'completed', updatedAt: 't', completedAt: 't' });
    await adapter.set('drafts', 'd1', { html: '', css: '', js: '', updatedAt: 't' });
    await adapter.clear('progress');
    expect(await adapter.get('progress', 'l1')).toBeUndefined();
    expect(await adapter.get('drafts', 'd1')).toBeDefined();
    await adapter.clearAll();
    expect(await adapter.get('drafts', 'd1')).toBeUndefined();
  });
});

describe('progressRepo', () => {
  it('applies transitions through the state machine', async () => {
    const repo = createProgressRepo(new MemoryAdapter());
    expect(await repo.get('lesson')).toBeUndefined();
    const started = await repo.apply('lesson', 'start');
    expect(started.status).toBe('inProgress');
    const completed = await repo.apply('lesson', 'complete');
    expect(completed.status).toBe('completed');
    expect((await repo.get('lesson'))?.completedAt).not.toBeNull();
    const listed = await repo.list();
    expect(listed).toHaveLength(1);
  });
});

describe('parse guards', () => {
  it('parseLessonProgress drops malformed records', () => {
    const valid = { status: 'completed', updatedAt: 't', completedAt: 'c' };
    expect(parseLessonProgress(valid)).toEqual(valid);
    expect(parseLessonProgress({ status: 'nope', updatedAt: 't' })).toBeNull();
    expect(parseLessonProgress({ status: 'completed' })).toBeNull();
    expect(parseLessonProgress({ status: 'completed', updatedAt: 5 })).toBeNull();
    expect(parseLessonProgress('x')).toBeNull();
  });

  it('parseCodeDraft drops malformed drafts', () => {
    const valid = { html: '<p></p>', css: '', js: '', updatedAt: 't' };
    expect(parseCodeDraft(valid)).toEqual(valid);
    expect(parseCodeDraft({ ...valid, html: 3 })).toBeNull();
    expect(parseCodeDraft({})).toBeNull();
  });
});
