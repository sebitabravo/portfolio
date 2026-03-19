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

  it("ensures featured projects have local image keys and valid links", () => {
    const featuredProjects = getProjects("es").filter((project) => project.featured)

    expect(featuredProjects.length).toBeGreaterThan(0)

    for (const project of featuredProjects) {
      expect(project.image.startsWith("http")).toBe(false)

      const links = [project.githubUrl, project.liveUrl].filter(
        (value): value is string => Boolean(value),
      )

      expect(links.length).toBeGreaterThan(0)

      for (const link of links) {
        expect(link.startsWith("https://")).toBe(true)
      }
    }
  })
})
