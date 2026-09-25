import { describe, expect, it } from "vitest"
import { getProjects } from "../src/lib/data/projects"
import { getTechBadge, techBadges } from "../src/lib/tech-badges"

describe("tech badge registry", () => {
  it("styles known technologies with their brand color and keeps light text readable", () => {
    const badge = getTechBadge("TypeScript")
    expect(badge.style).toMatchObject({ "--tech": "#3178C6", "--tech-dark": "#3178C6", "--tech-text-dark": "#3178C6" })
    expect(badge.icon).toBeDefined()
    expect(badge.className).toContain("text-foreground")
    expect(badge.className).not.toMatch(/#[0-9a-f]{3,8}/i)
  })

  it("applies dark-mode overrides only where a technology defines them", () => {
    expect(getTechBadge("PostgreSQL").style).toMatchObject({
      "--tech": "#336DB8",
      "--tech-dark": "#4169E1",
      "--tech-text-dark": "#5C8BFF",
    })
    expect(getTechBadge("React").style).toMatchObject({ "--tech-dark": "#61DAFB", "--tech-text-dark": "#00A8D8" })
  })

  it("falls back to neutral styling for unknown technologies", () => {
    const badge = getTechBadge("Unknown technology")
    expect(badge.style).toBeUndefined()
    expect(badge.icon).toBeUndefined()
    expect(badge.className).toBe(
      "bg-neutral-100 dark:bg-neutral-800 text-foreground dark:text-neutral-100 border-neutral-300 dark:border-neutral-700",
    )
  })

  it("registers exactly the technologies used by project data", () => {
    const usedTags = new Set([...getProjects("es"), ...getProjects("en")].flatMap((project) => project.tags))
    expect([...usedTags].filter((tag) => !(tag in techBadges))).toEqual([])
    expect(Object.keys(techBadges).filter((tag) => !usedTags.has(tag))).toEqual([])
  })
})
