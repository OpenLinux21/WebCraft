import { z } from 'astro/zod';

/** Top-level course groups, displayed in this order on the courses page. */
export const COURSE_MODULES = ['html', 'css', 'layout', 'javascript', 'dom', 'advanced'] as const;
export type CourseModule = (typeof COURSE_MODULES)[number];

export const LESSON_DIFFICULTIES = ['beginner', 'intermediate'] as const;
export type LessonDifficulty = (typeof LESSON_DIFFICULTIES)[number];

/**
 * Frontmatter schema for course files under src/content/courses/<locale>/.
 * Course prose lives in the MDX body; everything the app needs to render
 * metadata, the exercise panel and (later) AI context lives here.
 */
export const lessonFrontmatterSchema = z.object({
  /** Stable URL slug, identical across locales, e.g. `01-html-doc-structure`. */
  lessonId: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'lessonId must be a lowercase kebab-case slug'),
  /** Global 1-based position across all modules. */
  order: z.number().int().min(1).max(24),
  module: z.enum(COURSE_MODULES),
  difficulty: z.enum(LESSON_DIFFICULTIES),
  minutes: z.number().int().min(5).max(180),
  title: z.string().min(1),
  summary: z.string().min(1),
  objectives: z.array(z.string().min(1)).min(1).max(6),
  exercise: z.object({
    task: z.string().min(1),
    hints: z.array(z.string().min(1)).min(1).max(3),
  }),
});

export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;
