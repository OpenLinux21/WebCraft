import { createTranslator, type AppLocale, type MessageKey } from '@/lib/i18n/core';
import type { CodeFiles } from '@/lib/courses/code-files';
import type { ChatMessage } from './types';

/** Interaction modes of the AI tutor. */
export type AssistantMode = 'hint' | 'explain' | 'review' | 'debug' | 'challenge' | 'free';

export interface ConsoleLine {
  level: string;
  text: string;
}

export interface AssistantContext {
  mode: AssistantMode;
  locale: AppLocale;
  level: string;
  lesson?: { title: string; objectives: readonly string[]; task: string };
  code?: CodeFiles;
  consoleLines?: readonly ConsoleLine[];
  /** Free-form question or extra note from the student. */
  question?: string;
}

const MAX_CONSOLE_LINES = 20;

function buildSystemPrompt(context: AssistantContext): string {
  const t = createTranslator(context.locale);
  const language = t.t('common.languageNativeName');
  const parts: string[] = [
    t.t('aiPrompts.base', { language }),
    t.t('aiPrompts.levelNote', { level: context.level }),
  ];
  if (context.lesson) {
    parts.push(
      t.t('aiPrompts.lessonContext', {
        title: context.lesson.title,
        objectives: context.lesson.objectives.map((objective) => `- ${objective}`).join('\n'),
        task: context.lesson.task,
      }),
    );
  }
  if (context.code) {
    // Delimiters mark student-authored content as untrusted data: the model
    // is told (in aiPrompts.base) never to treat them as instructions.
    parts.push(
      `<student_code>\n${t.t('aiPrompts.codeContext', {
        html: context.code.html || '(empty)',
        css: context.code.css || '(empty)',
        js: context.code.js || '(empty)',
      })}\n</student_code>`,
    );
  }
  const lines = (context.consoleLines ?? []).filter((line) => line.text.trim() !== '');
  if (lines.length > 0) {
    parts.push(
      t.t('aiPrompts.consoleContext', {
        count: Math.min(lines.length, MAX_CONSOLE_LINES),
        lines: lines
          .slice(-MAX_CONSOLE_LINES)
          .map((line) => `[${line.level}] ${line.text}`)
          .join('\n'),
      }),
    );
  }
  return parts.join('\n\n');
}

function buildUserPrompt(context: AssistantContext): string {
  const t = createTranslator(context.locale);
  const modeKeys: Record<Exclude<AssistantMode, 'free'>, MessageKey> = {
    hint: 'aiPrompts.hint',
    explain: 'aiPrompts.explain',
    review: 'aiPrompts.review',
    debug: 'aiPrompts.debug',
    challenge: 'aiPrompts.challenge',
  };
  const parts: string[] = [];
  if (context.mode !== 'free') {
    parts.push(t.t(modeKeys[context.mode]));
  }
  if (context.question !== undefined && context.question.trim() !== '') {
    parts.push(context.question.trim());
  }
  return parts.join('\n\n') || t.t('aiPrompts.explain');
}

/** Builds the full message list for one assistant request. */
export function buildAssistantMessages(context: AssistantContext): ChatMessage[] {
  return [
    { role: 'system', content: buildSystemPrompt(context) },
    { role: 'user', content: buildUserPrompt(context) },
  ];
}

/**
 * Leniently extracts the challenge JSON from a model reply (models like to
 * wrap JSON in prose or code fences).
 */
export interface ChallengeDraft {
  title: string;
  task: string;
  difficulty: 'beginner' | 'intermediate';
}

export function parseChallengeReply(text: string): ChallengeDraft | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
    const title = parsed['title'];
    const task = parsed['task'];
    const difficulty = parsed['difficulty'];
    if (typeof title !== 'string' || typeof task !== 'string') return null;
    return {
      title: title.trim().slice(0, 120),
      task: task.trim().slice(0, 2000),
      difficulty: difficulty === 'intermediate' ? 'intermediate' : 'beginner',
    };
  } catch {
    return null;
  }
}
