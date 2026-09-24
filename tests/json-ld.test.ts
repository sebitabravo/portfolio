import { describe, expect, it } from "vitest"
import { getWebPageSchema } from "../src/lib/seo-structured-data"

describe("WebPage JSON-LD", () => {
  const page = {
    title: "Portfolio <preview>",
    description: "A portfolio page",
    canonical: "https://sebita.dev/en/projects/",
    locale: "en" as const,
  }

  it("creates one WebPage node from canonical page metadata for indexable pages", () => {
    expect(getWebPageSchema(false, page)).toEqual([{
      "@type": "WebPage",
      name: "Portfolio <preview>",
      description: "A portfolio page",
      url: "https://sebita.dev/en/projects/",
      inLanguage: "en",
    }])
  })

  it("omits only the WebPage node for noindex pages", () => {
    expect(getWebPageSchema(true, page)).toEqual([])
  })

  it("preserves Spanish locale and its canonical URL", () => {
    expect(getWebPageSchema(false, {
      ...page,
      canonical: "https://sebita.dev/",
      locale: "es",
    })).toEqual([{
      "@type": "WebPage",
      name: page.title,
      description: page.description,
      url: "https://sebita.dev/",
      inLanguage: "es",
    }])
  })
})
