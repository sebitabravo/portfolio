import { describe, expect, it } from "vitest"
import { buildLayoutJsonLd, getWebPageSchema } from "../src/lib/seo-structured-data"

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

describe("Layout JSON-LD document", () => {
  const input = {
    title: "Portfolio <preview>",
    siteName: "Sebastian Bravo — Portfolio",
    description: "A portfolio page",
    canonical: "https://sebita.dev/en/",
    locale: "en" as const,
    profileUrl: "https://sebita.dev/en/",
    personName: "Sebastian Bravo",
    jobTitle: "Full Stack Developer",
    email: "contact@sebita.dev",
    imageUrl: "https://sebita.dev/profile.webp",
    sameAs: ["https://github.com/sebitabravo", "https://linkedin.com/in/sebitabravo"],
    noindex: false,
  }

  function parsed() {
    return JSON.parse(buildLayoutJsonLd(input)) as {
      "@context": string
      "@graph": Array<Record<string, unknown>>
    }
  }

  it("emits a schema.org graph with Person, WebSite and WebPage nodes", () => {
    const document = parsed()

    expect(document["@context"]).toBe("https://schema.org")
    expect(document["@graph"].map((node) => node["@type"]).sort()).toEqual([
      "Person",
      "WebPage",
      "WebSite",
    ])
  })

  it("keeps the site name on WebSite and the page title on WebPage", () => {
    const nodes = parsed()["@graph"]

    expect(nodes.find((node) => node["@type"] === "WebSite")).toMatchObject({
      name: "Sebastian Bravo — Portfolio",
    })
    expect(nodes.find((node) => node["@type"] === "WebPage")).toMatchObject({
      name: "Portfolio <preview>",
    })
  })

  it("keeps Person identity, contact and locale-bound profile URL", () => {
    const person = parsed()["@graph"].find((node) => node["@type"] === "Person")

    expect(person).toMatchObject({
      name: "Sebastian Bravo",
      alternateName: "sebitabravo",
      url: "https://sebita.dev/en/",
      jobTitle: "Full Stack Developer",
      email: "mailto:contact@sebita.dev",
      image: "https://sebita.dev/profile.webp",
      sameAs: ["https://github.com/sebitabravo", "https://linkedin.com/in/sebitabravo"],
      description: "A portfolio page",
    })
  })

  it("omits only the WebPage node for noindex pages", () => {
    const document = JSON.parse(buildLayoutJsonLd({ ...input, noindex: true })) as {
      "@graph": Array<Record<string, unknown>>
    }

    expect(document["@graph"].map((node) => node["@type"]).sort()).toEqual([
      "Person",
      "WebSite",
    ])
  })

  it("escapes angle brackets so the payload stays inline-safe", () => {
    const raw = buildLayoutJsonLd(input)

    expect(raw).not.toContain("<")
    expect(raw).toContain("\\u003cpreview>")
    expect(parsed()["@graph"].find((node) => node["@type"] === "WebPage")).toMatchObject({
      name: "Portfolio <preview>",
    })
  })
})
