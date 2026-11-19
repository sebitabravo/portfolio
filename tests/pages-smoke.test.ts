import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { homeSectionIds } from "../src/lib/home-sections"

const spanishPage = readFileSync("src/pages/index.astro", "utf8")
const englishPage = readFileSync("src/pages/en/index.astro", "utf8")
const localizedHome = readFileSync("src/components/LocalizedHomePage.astro", "utf8")
const header = readFileSync("src/components/Header.astro", "utf8")
const spanishNotFound = readFileSync("src/pages/404.astro", "utf8")
const englishNotFound = readFileSync("src/pages/en/404.astro", "utf8")
const blogIndex = readFileSync("src/components/blog/LocalizedBlogIndex.astro", "utf8")
const blogPost = readFileSync("src/components/blog/LocalizedBlogPost.astro", "utf8")

// src/lib/home-sections.ts es la única fuente de verdad de los ids de sección
// del home; estos tests cruzan el módulo con el markup real en vez de repetir
// una segunda lista que puede quedarse vieja.
const declaredKeys = Object.keys(homeSectionIds.es)

const idKeys = (source: string, attribute: "id" | "data-nav") =>
  Array.from(source.matchAll(new RegExp(`${attribute}="?\\{ids\\.(\\w+)\\}`, "g")), (match) => match[1]!)

describe("home pages smoke", () => {
  it("renders every core section in Spanish", () => {
    expect(spanishPage).toContain('<LocalizedHomePage locale="es" />')
    expect(new Set(idKeys(localizedHome, "id"))).toEqual(new Set(declaredKeys))
    for (const key of idKeys(localizedHome, "data-nav")) {
      expect(declaredKeys).toContain(key)
    }
  })

  it("renders every core section in English, with English ids of its own", () => {
    expect(englishPage).toContain('<LocalizedHomePage locale="en" />')
    // Los ids se traducen por locale para que las anclas viajen en el cambio de
    // idioma (#proyectos <-> #projects); el contrato que lo fija vive en
    // tests/blog-language-switch.spec.ts.
    expect(Object.keys(homeSectionIds.en)).toEqual(declaredKeys)
    expect(Object.values(homeSectionIds.en)).toEqual([
      "projects",
      "experience",
      "about",
      "education",
      "contact",
    ])
  })

  it("builds its nav anchors from the declared sections instead of hardcoding them", () => {
    // Un ancla literal en el header queda muerta en silencio cuando una sección
    // se renombra: pasó con #trabajo al pasar a #proyectos. El nav sale de
    // homeSectionFragment, así que no puede desincronizarse del mapa.
    expect(header).not.toContain("#trabajo")
    expect(header).toContain("homeSectionFragment")
    for (const section of ["work", "experience", "contact"]) {
      expect(header).toContain(`homeSectionFragment(locale, "${section}")`)
    }
  })
})

describe("remaining localized pages", () => {
  it("uses dictionary copy for the blog index title, description, intro, and empty state", () => {
    expect(blogIndex).toContain('title={`${t.blog.title} - ${personalInfo.name}`}')
    expect(blogIndex).toContain('description={t.blog.description}')
    expect(blogIndex).toMatch(/<h1\b[^>]*>\{t\.blog\.title\}<\/h1>/)
    expect(blogIndex).toMatch(/<p\b[^>]*>\s*\{t\.blog\.intro\}\s*<\/p>/)
    expect(blogIndex).toMatch(/posts\.length === 0\s*\?\s*\(\s*<p\b[^>]*>\{t\.blog\.empty\}<\/p>/)
  })

  it("binds both blog breadcrumbs and the article home link to dictionary copy", () => {
    for (const template of [blogIndex, blogPost]) {
      expect(template).toContain('aria-label={t.nav.breadcrumb}')
      expect(template).toMatch(/<a\b[^>]*>\{t\.nav\.home\}<\/a>/)
      expect(template).toContain('{t.blog.title}')
    }
    expect(blogIndex).toMatch(/aria-current="page">\{t\.blog\.title\}<\/li>/)
    expect(blogPost).toMatch(/<a\b[^>]*>\{t\.blog\.title\}<\/a>/)
    expect(blogPost).toContain('{`← ${t.blog.back}`}')
    expect(blogPost).toContain('{`${t.nav.home} →`}')
  })

  it.each([
    { name: "Spanish", route: spanishNotFound, locale: "es" },
    { name: "English", route: englishNotFound, locale: "en" },
  ])("delegates $name 404 composition to the shared page with locale $locale", ({ route, locale }) => {
    expect(route).toMatch(/import LocalizedNotFoundPage from ["']@\/components\/LocalizedNotFoundPage\.astro["']/)
    expect(route).toContain(`<LocalizedNotFoundPage locale="${locale}" />`)
    expect(route.match(/<LocalizedNotFoundPage\b/g)).toHaveLength(1)
    expect(route).not.toMatch(/<(?:main|h1)\b/)
  })
})
