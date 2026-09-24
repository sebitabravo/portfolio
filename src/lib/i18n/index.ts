import es from './es.json'
import en from './en.json'

export type Locale = 'es' | 'en'

export const locales = ['es', 'en'] as const
export const defaultLocale: Locale = 'es'

const translations = {
  es,
  en,
} as const

type TranslationKeys = typeof es

/**
 * Get translations for a given locale
 */
export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale] || translations[defaultLocale]
}

