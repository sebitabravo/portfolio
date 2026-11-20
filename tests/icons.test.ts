import { experimental_AstroContainer as AstroContainer } from "astro/container"
import { describe, expect, it } from "vitest"
import { skills } from "../src/lib/data/skills"
import { getStageProjects } from "../src/lib/data/projects"
import { techIcons } from "../src/lib/glyphs/tech"
import { uiIcons } from "../src/lib/glyphs/ui"
import Icon from "../src/components/Icon.astro"
import TechList from "../src/components/TechList.astro"

// Las metodologías no se pintan como chips: solo los cuatro grupos del stack y los tags de proyecto.
const { methodologies: _methodologies, ...stack } = skills
const projectTags = (["es", "en"] as const).flatMap((locale) => getStageProjects(locale).flatMap((p) => p.tags))

describe("tech glyph map", () => {
  it.each([...new Set([...Object.values(stack).flat(), ...projectTags])])(
    "resolves %s to a glyph or an explicit null",
    (name) => {
      expect(techIcons, `${name} falta en tech.ts`).toHaveProperty([name])
      const icon = techIcons[name]
      if (icon !== null) expect(icon.paths.length).toBeGreaterThan(0)
    },
  )
})

describe("ui glyph map", () => {
  it.each(Object.entries(uiIcons))("%s has at least one path", (_name, icon) => {
    expect(icon.paths.length).toBeGreaterThan(0)
    for (const d of icon.paths) expect(d).toMatch(/^[Mm]/)
  })
})

describe("Icon", () => {
  it("renders a decorative svg that is hidden from assistive tech", async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Icon, { props: { name: "mail" } })
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('focusable="false"')
    expect(html).toContain('stroke="currentColor"')
    expect(html).not.toContain("style=")
  })

  it("paints fill glyphs with currentColor and no stroke", async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Icon, { props: { icon: techIcons["React"]!, size: 14 } })
    expect(html).toContain('fill="currentColor"')
    expect(html).toContain('width="14"')
    expect(html).not.toContain("stroke=")
  })

  it("renders nothing for an unknown glyph", async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Icon, { props: {} })
    expect(html.trim()).toBe("")
  })
})

describe("TechList", () => {
  it("shows a logo for known technologies and text only for the rest", async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(TechList, { props: { items: ["React", "REST API"] } })
    const items = html.match(/<li>[\s\S]*?<\/li>/g) ?? []
    expect(items).toHaveLength(2)
    expect(items[0]).toContain("<svg")
    expect(items[1]).not.toContain("<svg")
    expect(items[1]).toContain("REST API")
  })
})
