import type { Locale } from "./i18n"

interface PageMetadata {
  title: string
  description: string
  canonical: string
  locale: Locale
}

export function getWebPageSchema(noindex: boolean, page: PageMetadata) {
  return noindex ? [] : [{
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: page.canonical,
    inLanguage: page.locale,
  }]
}
