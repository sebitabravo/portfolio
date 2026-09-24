import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { homeSectionIds } from "../src/lib/home-sections"

const spanishPage = readFileSync("src/pages/index.astro", "utf8")
const englishPage = readFileSync("src/pages/en/index.astro", "utf8")
const homePage = readFileSync("src/components/LocalizedHomePage.astro", "utf8")
const spanishNotFound = readFileSync("src/pages/404.astro", "utf8")
const englishNotFound = readFileSync("src/pages/en/404.astro", "utf8")
const header = readFileSync("src/components/Header.astro", "utf8")
const footer = readFileSync("src/components/Footer.astro", "utf8")
const blogIndex = readFileSync("src/components/blog/LocalizedBlogIndex.astro", "utf8")
const blogPost = readFileSync("src/components/blog/LocalizedBlogPost.astro", "utf8")
const design = readFileSync("DESIGN.md", "utf8")
const sections = [
  ["projects", "Projects", "proyectos", "projects"],
  ["experience", "Experience", "experiencia", "experience"],
  ["education", "Education", "educacion", "education"],
  ["certifications", "Certifications", "certificaciones", "certifications"],
  ["about", "AboutMe", "sobre-mi", "about"],
  ["contact", "Contact", "contacto", "contact"],
] as const

describe("home pages smoke", () => {
  it("renders every core section in Spanish", () => {
    expect(spanishPage).toContain('<LocalizedHomePage locale="es" />')
    for (const [key, , spanishId] of sections) {
      expect(homeSectionIds.es[key]).toBe(spanishId)
    }
  })

  it("renders every core section in English", () => {
    expect(englishPage).toContain('<LocalizedHomePage locale="en" />')
    for (const [key, , , englishId] of sections) {
      expect(homeSectionIds.en[key]).toBe(englishId)
    }
  })

  it("uses the shared IDs for every full-bleed band and one canonical stack marquee", () => {
    expect(homePage).toContain('import { homeSectionIds } from "@/lib/home-sections"')
    expect(homePage).toContain("const ids = homeSectionIds[locale]")
    expect(homePage.match(/<SectionBand\b/g)).toHaveLength(sections.length)
    for (const [key, component] of sections) {
      const matchingBands = homePage.split(`<SectionBand id={ids.${key}}`)
      expect(matchingBands).toHaveLength(2)
      const band = matchingBands[1]?.split("</SectionBand>")[0]
      expect(band).toContain(`<${component} locale={locale} />`)
    }
    expect(homePage.match(/<SignalStrip locale=\{locale\} \/>/g)).toHaveLength(1)
    expect(homePage).toContain('tone="tinted"')
    expect(homePage).not.toContain('<hr class="section-divider')
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

  it("keeps Header and Footer at the documented 1200px content width", () => {
    expect(design).toContain("- Max content: 1200px")
    const headerWrapper = header.match(/<header\b[^>]*>\s*<div class="([^"]+)"/)?.[1]
    const footerWrapper = footer.match(/<footer\b[^>]*class="([^"]+)"/)?.[1]
    for (const wrapper of [headerWrapper, footerWrapper]) {
      expect(wrapper).toMatch(/(?:^|\s)max-w-\[1200px\](?:\s|$)/)
    }
  })
})
