import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Content integrity: frontmatter validity, locale pairing and exercise file
 * pairing. Runs on the raw files so it needs no Astro runtime.
 */

const CONTENT_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../content');
const COURSES_ROOT = join(CONTENT_ROOT, 'courses');
const EXERCISES_ROOT = join(CONTENT_ROOT, 'exercises');

const MODULES = new Set(['html', 'css', 'layout', 'javascript', 'dom', 'advanced']);
const DIFFICULTIES = new Set(['beginner', 'intermediate']);

interface LessonMeta {
  lessonId: string;
  order: number;
  module: string;
  difficulty: string;
  minutes: number;
  title: string;
  summary: string;
  objectives: string[];
  task: string;
  hints: string[];
  bodyLines: number;
}

function unquote(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/** Minimal YAML subset parser for the course frontmatter. */
function parseFrontmatter(raw: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let currentKey = '';
  let currentList: string[] | null = null;
  let nestedList: string[] | null = null;

  for (const line of raw.split('\n')) {
    if (line.trim() === '') continue;
    const indented = line.startsWith('  ') || line.startsWith('\t');
    const listMatch = line.trim().startsWith('- ');
    const keyMatch = /^(\s*)([A-Za-z]+):\s*(.*)$/.exec(line);

    if (!indented && keyMatch) {
      const key = keyMatch[2] ?? '';
      const value = keyMatch[3] ?? '';
      currentList = null;
      nestedList = null;
      if (value === '') {
        currentKey = key;
        currentList = [];
        result[key] = currentList;
      } else {
        result[key] = unquote(value);
      }
      continue;
    }
    if (indented && keyMatch && !listMatch) {
      const key = keyMatch[2] ?? '';
      const value = keyMatch[3] ?? '';
      if (value === '') {
        nestedList = [];
        result[currentKey] = { ...(result[currentKey] as object), [key]: nestedList };
      } else {
        nestedList = null;
        result[currentKey] = { ...(result[currentKey] as object), [key]: unquote(value) };
      }
      continue;
    }
    if (listMatch) {
      const item = unquote(line.trim().slice(2));
      if (nestedList) {
        nestedList.push(item);
      } else if (currentList) {
        currentList.push(item);
      }
      continue;
    }
  }
  return result;
}

function readLesson(locale: string, file: string): LessonMeta {
  const text = readFileSync(join(COURSES_ROOT, locale, file), 'utf-8');
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!match) throw new Error(`${locale}/${file}: frontmatter missing`);
  const data = parseFrontmatter(match[1] ?? '');
  const body = text.slice((match[0] ?? '').length);
  return {
    lessonId: String(data['lessonId'] ?? ''),
    order: Number(data['order'] ?? 0),
    module: String(data['module'] ?? ''),
    difficulty: String(data['difficulty'] ?? ''),
    minutes: Number(data['minutes'] ?? 0),
    title: String(data['title'] ?? ''),
    summary: String(data['summary'] ?? ''),
    objectives: (data['objectives'] as string[]) ?? [],
    task: String((data['exercise'] as Record<string, unknown>)?.['task'] ?? ''),
    hints: ((data['exercise'] as Record<string, unknown>)?.['hints'] as string[]) ?? [],
    bodyLines: body.split('\n').length,
  };
}

function lessonFiles(locale: string): string[] {
  return readdirSync(join(COURSES_ROOT, locale)).filter((file) => file.endsWith('.mdx'));
}

const EN_FILES = lessonFiles('en');
const ZH_FILES = lessonFiles('zh-CN');

const EN_LESSONS = EN_FILES.map((file) => readLesson('en', file));
const ZH_LESSONS = ZH_FILES.map((file) => readLesson('zh-CN', file));

describe('course content', () => {
  it('has the same lesson files in both locales', () => {
    expect([...ZH_FILES].sort()).toEqual([...EN_FILES].sort());
  });

  it('uses valid, unique frontmatter', () => {
    const orders = new Set<number>();
    const ids = new Set<string>();
    for (const lesson of EN_LESSONS) {
      expect(lesson.lessonId).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(lesson.lessonId).toBe(
        EN_FILES.find((f) => f.startsWith(lesson.lessonId))?.replace('.mdx', ''),
      );
      expect(lesson.order).toBeGreaterThanOrEqual(1);
      expect(lesson.order).toBeLessThanOrEqual(24);
      expect(orders.has(lesson.order)).toBe(false);
      orders.add(lesson.order);
      expect(ids.has(lesson.lessonId)).toBe(false);
      ids.add(lesson.lessonId);
      expect(MODULES.has(lesson.module)).toBe(true);
      expect(DIFFICULTIES.has(lesson.difficulty)).toBe(true);
      expect(lesson.minutes).toBeGreaterThanOrEqual(5);
      expect(lesson.minutes).toBeLessThanOrEqual(180);
      expect(lesson.title.length).toBeGreaterThan(0);
      expect(lesson.summary.length).toBeGreaterThan(0);
    }
  });

  it('has objectives and progressive hints in both locales', () => {
    for (const locale of ['en', 'zh-CN'] as const) {
      const lessons = locale === 'en' ? EN_LESSONS : ZH_LESSONS;
      for (const lesson of lessons) {
        expect(
          lesson.objectives.length,
          `${locale}/${lesson.lessonId}: objectives`,
        ).toBeGreaterThanOrEqual(1);
        expect(lesson.objectives.length).toBeLessThanOrEqual(6);
        expect(lesson.hints.length, `${locale}/${lesson.lessonId}: hints`).toBeGreaterThanOrEqual(
          1,
        );
        expect(lesson.hints.length).toBeLessThanOrEqual(3);
        expect(lesson.task.length, `${locale}/${lesson.lessonId}: task`).toBeGreaterThan(0);
      }
    }
  });

  it('pairs en and zh metadata for the same lesson', () => {
    const zhById = new Map(ZH_LESSONS.map((lesson) => [lesson.lessonId, lesson]));
    for (const en of EN_LESSONS) {
      const zh = zhById.get(en.lessonId);
      expect(zh, `missing zh lesson ${en.lessonId}`).toBeDefined();
      expect(zh?.order).toBe(en.order);
      expect(zh?.module).toBe(en.module);
      expect(zh?.difficulty).toBe(en.difficulty);
      expect(zh?.minutes).toBe(en.minutes);
      expect(zh?.title).not.toBe(en.title);
    }
  });

  it('has substantive lesson bodies (detailed edition)', () => {
    // The capstone trades some prose for the largest exercise in the course,
    // hence the slightly lower bar.
    for (const lesson of [...EN_LESSONS, ...ZH_LESSONS]) {
      expect(
        lesson.bodyLines,
        `${lesson.lessonId} body too short (${lesson.bodyLines} lines)`,
      ).toBeGreaterThanOrEqual(175);
    }
  });

  it('pairs every lesson with a complete exercise directory', () => {
    for (const lesson of EN_LESSONS) {
      const dir = join(EXERCISES_ROOT, lesson.lessonId);
      expect(existsSync(dir), `missing exercise dir for ${lesson.lessonId}`).toBe(true);
      for (const file of [
        'starter.html',
        'starter.css',
        'starter.js',
        'solution.html',
        'solution.css',
        'solution.js',
      ]) {
        expect(existsSync(join(dir, file)), `${lesson.lessonId}/${file}`).toBe(true);
      }
      const differs = (['html', 'css', 'js'] as const).some((ext) => {
        const starter = readFileSync(join(dir, `starter.${ext}`), 'utf-8').trim();
        const solution = readFileSync(join(dir, `solution.${ext}`), 'utf-8').trim();
        return starter !== solution;
      });
      expect(differs, `${lesson.lessonId}: solution must differ from starter`).toBe(true);
    }
  });

  it('keeps exercise directories free of orphans', () => {
    const dirs = readdirSync(EXERCISES_ROOT).filter((name) =>
      statSync(join(EXERCISES_ROOT, name)).isDirectory(),
    );
    const ids = new Set(EN_LESSONS.map((lesson) => lesson.lessonId));
    for (const dir of dirs) {
      expect(ids.has(dir), `orphan exercise dir: ${dir}`).toBe(true);
    }
  });
});
