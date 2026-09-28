import type { CodeDraft } from '@/lib/courses/types';
import { parseCodeDraft } from '../guards';
import type { StorageAdapter } from '../types';

/** Reserved draft key for the playground workbench. */
export const PLAYGROUND_DRAFT_KEY = 'playground';

export interface DraftRepo {
  get(key: string): Promise<CodeDraft | undefined>;
  set(key: string, draft: Omit<CodeDraft, 'updatedAt'>): Promise<CodeDraft>;
  delete(key: string): Promise<void>;
}

export function createDraftRepo(adapter: StorageAdapter): DraftRepo {
  return {
    async get(key: string): Promise<CodeDraft | undefined> {
      const raw = await adapter.get<unknown>('drafts', key);
      return raw === undefined ? undefined : (parseCodeDraft(raw) ?? undefined);
    },
    async set(key: string, draft: Omit<CodeDraft, 'updatedAt'>): Promise<CodeDraft> {
      const value: CodeDraft = { ...draft, updatedAt: new Date().toISOString() };
      await adapter.set('drafts', key, value);
      return value;
    },
    async delete(key: string): Promise<void> {
      await adapter.delete('drafts', key);
    },
  };
}
