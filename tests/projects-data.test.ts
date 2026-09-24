import { existsSync, statSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { getProjects } from "../src/lib/data"

describe("projects data", () => {
  it("keeps Spanish and English project slugs aligned", () => {
    const spanishSlugs = getProjects("es")
      .map((project) => project.slug)
      .sort()
    const englishSlugs = getProjects("en")
      .map((project) => project.slug)
      .sort()

    expect(englishSlugs).toEqual(spanishSlugs)
  })

  it("keeps every shared project fact aligned while preserving localized blog slugs", () => {
    const spanish = getProjects("es")
    const english = getProjects("en")
    const sharedFacts = (project: (typeof spanish)[number]) => ({
      slug: project.slug,
      tags: project.tags,
      featured: project.featured,
      status: project.status,
      publishDate: project.publishDate.toISOString(),
      githubUrl: project.githubUrl,
      liveUrl: project.liveUrl,
      order: project.order,
    })

    expect(english.map(sharedFacts)).toEqual(spanish.map(sharedFacts))
    expect(spanish.map((project) => [project.slug, project.blogSlug])).toEqual([
      ["manttoai", "manttoai-ml-iot-random-forest"],
      ["vulcania", "vulcania-monitoreo-volcanico-comunitario"],
      ["rapido-sur", "rapido-sur-erp-mantenimiento-flotas"],
      ["wenuke", "wenuke-asistente-climatico-whatsapp"],
    ])
    expect(english.map((project) => [project.slug, project.blogSlug])).toEqual([
      ["manttoai", "manttoai-ml-iot-random-forest-en"],
      ["vulcania", "vulcania-monitoreo-volcanico-comunitario-en"],
      ["rapido-sur", "rapido-sur-erp-mantenimiento-flotas"],
      ["wenuke", "wenuke-asistente-climatico-whatsapp"],
    ])
    expect(spanish.map((project) => project.slug).sort()).toEqual([
      "manttoai", "rapido-sur", "vulcania", "wenuke",
    ])
    expect(spanish.slice().sort((a, b) => a.order - b.order).map((project) => project.slug)).toEqual([
      "vulcania", "wenuke", "manttoai", "rapido-sur",
    ])
  })

  it("keeps descriptions and translated metrics locale-specific for matching projects", () => {
    const spanish = getProjects("es")
    const englishBySlug = new Map(getProjects("en").map((project) => [project.slug, project]))

    for (const project of spanish) {
      const translation = englishBySlug.get(project.slug)
      expect(translation, `Missing English project for ${project.slug}`).toBeDefined()
      expect(translation?.description).not.toBe(project.description)
      expect(translation?.metrics?.map((metric) => metric.label)).not.toEqual(
        project.metrics?.map((metric) => metric.label),
      )
    }

    expect(spanish.find((project) => project.slug === "manttoai")?.metrics).toContainEqual({
      label: "Código", value: "Disponible",
    })
    expect(englishBySlug.get("manttoai")?.metrics).toContainEqual({
      label: "Code", value: "Available",
    })
  })

  it("keeps the featured project's available links on HTTPS", () => {
    const featuredProjects = getProjects("es").filter((project) => project.featured)

    expect(featuredProjects).toHaveLength(1)

    for (const project of featuredProjects) {
      const links = [project.githubUrl, project.liveUrl].filter(
        (value): value is string => Boolean(value),
      )

      expect(links.length).toBeGreaterThan(0)

      for (const link of links) {
        expect(link.startsWith("https://")).toBe(true)
      }
    }
  })

  it("keeps every project's responsive screenshots and plain fallback locally available", () => {
    for (const locale of ["es", "en"] as const) {
      for (const { slug } of getProjects(locale)) {
        for (const variant of ["-800", "-1600", ""]) {
          const asset = new URL(`../public/screenshots/${slug}${variant}.webp`, import.meta.url)
          const filename = `${slug}${variant}.webp (${locale})`
          expect(existsSync(asset), `Missing screenshot ${filename}`).toBe(true)
          expect(statSync(asset).size, `Empty screenshot ${filename}`).toBeGreaterThan(0)
        }
      }
    }
  })
})
