/** Playground challenge tasks (AI-generated or built-in). */

export const TASK_SOURCES = ['ai', 'builtin'] as const;
export type TaskSource = (typeof TASK_SOURCES)[number];

export const TASK_STATUSES = ['active', 'completed'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_DIFFICULTIES = ['beginner', 'intermediate'] as const;
export type TaskDifficulty = (typeof TASK_DIFFICULTIES)[number];

export interface PlaygroundTask {
  title: string;
  task: string;
  difficulty: TaskDifficulty;
  source: TaskSource;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export function parseTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === 'string' && (TASK_STATUSES as readonly string[]).includes(value);
}

export function parseTaskSource(value: unknown): value is TaskSource {
  return typeof value === 'string' && (TASK_SOURCES as readonly string[]).includes(value);
}

export function parseTaskDifficulty(value: unknown): value is TaskDifficulty {
  return typeof value === 'string' && (TASK_DIFFICULTIES as readonly string[]).includes(value);
}

export function parsePlaygroundTask(value: unknown): PlaygroundTask | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  if (typeof record['title'] !== 'string' || typeof record['task'] !== 'string') return null;
  if (!parseTaskSource(record['source']) || !parseTaskStatus(record['status'])) return null;
  const difficulty = parseTaskDifficulty(record['difficulty']) ? record['difficulty'] : 'beginner';
  if (typeof record['createdAt'] !== 'string' || typeof record['updatedAt'] !== 'string') {
    return null;
  }
  return {
    title: record['title'],
    task: record['task'],
    difficulty,
    source: record['source'],
    status: record['status'],
    createdAt: record['createdAt'],
    updatedAt: record['updatedAt'],
  };
}
