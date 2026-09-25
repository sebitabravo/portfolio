import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'
import { LOCALES } from '@/lib/i18n'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: 'src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    locale: z.enum([LOCALES.ES, LOCALES.EN]).default(LOCALES.ES),
    translationKey: z.string().optional(),
  }),
})

export const collections = { blog }
