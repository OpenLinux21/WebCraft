/**
 * Build-time access to exercise starter/solution files under
 * src/content/exercises/<lessonId>/. Files are shared between locales (code
 * is universal) and inlined at build time — no runtime fetches.
 */
import type { CodeFiles, ExerciseFiles } from './code-files';

export type { CodeFiles, ExerciseFiles };

const EMPTY_FILES: CodeFiles = { html: '', css: '', js: '' };

const rawModules = import.meta.glob<string>(
  [
    '@/content/exercises/*/starter.html',
    '@/content/exercises/*/starter.css',
    '@/content/exercises/*/starter.js',
    '@/content/exercises/*/solution.html',
    '@/content/exercises/*/solution.css',
    '@/content/exercises/*/solution.js',
  ],
  { query: '?raw', import: 'default', eager: true },
);

function codeFilesFor(lessonId: string, prefix: 'starter' | 'solution'): CodeFiles {
  const read = (ext: 'html' | 'css' | 'js'): string => {
    const key = `/src/content/exercises/${lessonId}/${prefix}.${ext}`;
    return rawModules[key] ?? '';
  };
  return { html: read('html'), css: read('css'), js: read('js') };
}

export function getExerciseFiles(lessonId: string): ExerciseFiles {
  return {
    starter: codeFilesFor(lessonId, 'starter'),
    solution: codeFilesFor(lessonId, 'solution'),
  };
}

export { EMPTY_FILES };
