/**
 * Content Collections — Astro 6 Content Layer
 *
 * Two collections:
 *   - blog/   : marketing & insight posts
 *   - guides/ : step-by-step tutorials (Bitfinex setup, strategy guides, etc.)
 *
 * Both use the glob loader (Astro 6 default) — drops .md/.mdx files into the
 * collection folder and they appear automatically.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('wen control Team'),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    /** Difficulty level — affects ordering and badge display */
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    /** Estimated reading time in minutes */
    readTime: z.number().int().positive().optional(),
    /** Sequence order within a guide series (e.g., 1, 2, 3 for setup steps) */
    order: z.number().int().optional(),
    /** Topic group — e.g., 'setup', 'strategy', 'security' */
    topic: z.string().optional(),
    heroImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, guides };
