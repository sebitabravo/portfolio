/**
 * Format a date to a readable string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Calculate reading time from content
 */
export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} min read`
}

/**
 * Sort items by date (newest first)
 */
export function sortByDate<T extends { data: { publishDate?: Date; startDate?: Date } }>(
  items: T[]
): T[] {
  return items.sort((a, b) => {
    const dateA = a.data.publishDate || a.data.startDate
    const dateB = b.data.publishDate || b.data.startDate
    if (!dateA || !dateB) return 0
    return dateB.getTime() - dateA.getTime()
  })
}

/**
 * Filter draft posts in production
 */
export function filterDrafts<T extends { data: { draft?: boolean } }>(items: T[]): T[] {
  if (import.meta.env.PROD) {
    return items.filter(item => !item.data.draft)
  }
  return items
}

/**
 * Generate slug from string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Class name utility with tailwind-merge (shadcn/ui version)
 */
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
