import es from './es.json'
import en from './en.json'

export type Locale = 'es' | 'en'

export const locales = ['es', 'en'] as const
export const defaultLocale: Locale = 'es'

export const translations = {
  es,
  en,
} as const

export type TranslationKeys = typeof es

/**
 * Get translations for a given locale
 */
export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale] || translations[defaultLocale]
}

/**
 * Get a nested translation value by dot notation path
 * Example: t('nav.home') => 'Inicio'
 */
export function t(
  locale: Locale,
  key: string,
): string {
  const keys = key.split('.')
  const translations = getTranslations(locale)

  let value: any = translations
  for (const k of keys) {
    value = value?.[k]
  }

  return value || key
}

/**
 * Get locale from URL using Astro's native function
 * This is a wrapper around Astro's getLocale() for type safety
 */
export function getLocaleFromUrl(url: URL): Locale {
  // Note: In Astro components, prefer using getLocale() directly from 'astro:i18n'
  // This helper exists for compatibility and type safety
  const segments = url.pathname.split('/')
  const firstSegment = segments[1]

  if (locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale
  }

  return defaultLocale
}
