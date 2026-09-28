import { generateToken } from '@/lib/utils/id';
import type { StorageAdapter } from '@/lib/storage/types';
import { parsePlaygroundTask, type PlaygroundTask } from '@/lib/playground/tasks';

export interface PlaygroundRepo {
  list(): Promise<Array<{ id: string; task: PlaygroundTask }>>;
  add(
    task: Omit<PlaygroundTask, 'createdAt' | 'updatedAt' | 'status'>,
  ): Promise<{ id: string; task: PlaygroundTask }>;
  setStatus(id: string, status: PlaygroundTask['status']): Promise<void>;
  remove(id: string): Promise<void>;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createPlaygroundRepo(adapter: StorageAdapter): PlaygroundRepo {
  return {
    async list(): Promise<Array<{ id: string; task: PlaygroundTask }>> {
      const all = await adapter.list<unknown>('playground');
      const valid: Array<{ id: string; task: PlaygroundTask }> = [];
      for (const entry of all) {
        const parsed = parsePlaygroundTask(entry.value);
        if (parsed) valid.push({ id: entry.key, task: parsed });
      }
      return valid.sort((a, b) => b.task.createdAt.localeCompare(a.task.createdAt));
    },
    async add(task) {
      const timestamp = nowIso();
      const value: PlaygroundTask = {
        ...task,
        status: 'active',
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      const id = generateToken(8);
      await adapter.set('playground', id, value);
      return { id, task: value };
    },
    async setStatus(id: string, status: PlaygroundTask['status']): Promise<void> {
      const raw = await adapter.get<unknown>('playground', id);
      const parsed = parsePlaygroundTask(raw);
      if (!parsed) return;
      await adapter.set('playground', id, { ...parsed, status, updatedAt: nowIso() });
    },
    async remove(id: string): Promise<void> {
      await adapter.delete('playground', id);
    },
  };
}
