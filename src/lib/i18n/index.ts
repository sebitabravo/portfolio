import es from "./es.json"
import en from "./en.json"

export const LOCALES = {
  ES: "es",
  EN: "en",
} as const

export type Locale = (typeof LOCALES)[keyof typeof LOCALES]

export const locales: readonly Locale[] = [LOCALES.ES, LOCALES.EN]
export const defaultLocale: Locale = LOCALES.ES
export { createStaticAlternates } from "./alternates"

const translations = {
  es,
  en,
} as const

type TranslationKeys = typeof es

export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale] || translations[defaultLocale]
}
