import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string(),
    category: z.string(),
    year: z.coerce.string(),
    image: z.string().url(),
    accent: z.string().default('lime'),
    summary: z.string(),
  }),
});

export const collections = { projects };
