import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.string(),
    platform: z.string(),
    summary: z.string(),
    objective: z.string(),
    image: z.string(),
    gallery: z.array(z.string()).default([]),
    features: z.array(z.string()),
    benefits: z.array(z.string()),
    note: z.string().optional(),
  }),
});

export const collections = { projects };
