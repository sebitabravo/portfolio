import type { Locale } from "./index"

/** Preserve the active locale first and point x-default to the Spanish route. */
export function createStaticAlternates(
  locale: Locale,
  spanishUrl: string,
  englishUrl: string,
): Array<{ hreflang: Locale | "x-default"; href: string }> {
  return [
    { hreflang: locale, href: locale === "es" ? spanishUrl : englishUrl },
    { hreflang: locale === "es" ? "en" : "es", href: locale === "es" ? englishUrl : spanishUrl },
    { hreflang: "x-default", href: spanishUrl },
  ]
}
