import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    slug: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    lang: z.string().optional(),
  }),
});

export const collections = { blog };
