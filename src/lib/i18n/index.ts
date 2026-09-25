import es from './es.json'
import en from './en.json'

export type Locale = 'es' | 'en'

export const locales = ['es', 'en'] as const
export const defaultLocale: Locale = 'es'
export { createStaticAlternates } from './alternates'

const translations = {
  es,
  en,
} as const

type TranslationKeys = typeof es

export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale] || translations[defaultLocale]
}

