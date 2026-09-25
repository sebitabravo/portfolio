import type { Locale } from './i18n'

export function formatDate(date: Date, locale: Locale = 'es'): string {
  const localeCode = locale === 'es' ? 'es-ES' : 'en-US'
  return date.toLocaleDateString(localeCode, { year: "numeric", month: "long" })
}

// Class-merge helper following the shadcn/ui cn() convention (clsx + tailwind-merge).
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
