import { defineCollection, z } from 'astro:content'

// Projects collection
const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    image: z.string().optional(),
    githubUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    order: z.number().optional(),
  }),
})

// Work experience collection
const work = defineCollection({
  type: 'content',
  schema: z.object({
    company: z.string(),
    position: z.string(),
    description: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
    current: z.boolean().default(false),
    location: z.string().optional(),
    skills: z.array(z.string()),
    logo: z.string().optional(),
    url: z.string().url().optional(),
    order: z.number().optional(),
  }),
})

export const collections = {
  projects,
  work,
}
