import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Frontmatter mirrors what the Hugo front matter will carry, 1:1.

const writeups = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/writeups' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    platform: z.enum(['Hack The Box', 'TryHackMe', 'VulnLab', 'Lab']).default('Hack The Box'),
    os: z.enum(['Windows', 'Linux', 'Other']),
    difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Insane']),
    /** optional cover art (machine artwork); optimized via the asset pipeline */
    cover: image().optional(),
    coverAlt: z.string().default(''),
    tags: z.array(z.string()).default([]),
    /** one-line steps: foothold → user → root, rendered as the attack-chain summary */
    chain: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    retired: z.boolean().default(true),
    draft: z.boolean().default(false),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/notes' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    /** optional cover art, shown as a thumbnail in the note list */
    cover: image().optional(),
    coverAlt: z.string().default(''),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { writeups, notes };
