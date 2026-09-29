import type { CodeFiles } from '@/lib/courses/code-files';

/**
 * Tiny in-page registry: the workbench publishes its current files so other
 * components on the same page (AI assistant) can read them without DOM
 * coupling. Both sides import this module, so they share one instance per
 * browser page.
 */

const entries = new Map<string, CodeFiles>();

export function setSharedFiles(key: string, files: CodeFiles): void {
  entries.set(key, files);
}

export function getSharedFiles(key: string): CodeFiles | undefined {
  return entries.get(key);
}

/** First published files on the page (global AI has no specific key). */
export function getAnySharedFiles(): CodeFiles | undefined {
  return entries.values().next().value;
}

export function removeSharedFiles(key: string): void {
  entries.delete(key);
}
