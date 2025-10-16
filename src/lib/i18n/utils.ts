import type { CollectionEntry } from 'astro:content'
import type { Locale } from './i18n'

/**
 * Filter collection entries by locale
 */
export function filterByLocale<T extends 'projects' | 'work'>(
  entries: CollectionEntry<T>[],
  locale: Locale
): CollectionEntry<T>[] {
  return entries.filter(entry => {
    // Check if the entry id starts with the locale
    return entry.id.startsWith(`${locale}/`)
  })
}

/**
 * Get slug without locale prefix
 */
export function getSlugWithoutLocale(id: string): string {
  // Remove locale prefix (es/ or en/)
  return id.split('/').slice(1).join('/')
}
