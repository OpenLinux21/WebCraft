import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { lessonFrontmatterSchema } from '@/lib/courses/schema';

const courses = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/courses' }),
  schema: lessonFrontmatterSchema,
});

export const collections = { courses };
