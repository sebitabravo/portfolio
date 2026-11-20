import { experimental_AstroContainer as AstroContainer } from "astro/container"
import { describe, expect, it } from "vitest"
import { personalInfo } from "../src/lib/data/personal"
import Contact from "../src/components/Contact.astro"
import Hero from "../src/components/Hero.astro"
import ExperienceItem from "../src/components/ExperienceItem.astro"
import { getWorkExperience } from "../src/lib/data/work"

const anchors = (html: string): string[] => [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((match) => match[0])
const visibleText = (html: string): string => html.replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/<[^>]+>/g, "").trim()

describe.each(["es", "en"] as const)("Contact (%s)", (locale) => {
  it("never overrides the visible name of a link with an aria-label (WCAG 2.5.3)", async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Contact, { props: { locale } })
    const links = anchors(html)
    expect(links.length).toBeGreaterThanOrEqual(4)
    for (const link of links) {
      const label = link.match(/aria-label="([^"]*)"/)?.[1]
      if (label) expect(label).toContain(visibleText(link))
    }
  })

  it("prints the full email only once, in the giant button", async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Contact, { props: { locale } })
    const body = html.replace(/<button[\s\S]*?<\/button>/, "")
    const printed = visibleText(body.replace(/href="[^"]*"/g, ""))
    expect(printed).not.toContain(personalInfo.email)
    expect(printed).not.toContain(personalInfo.email.split("@")[0])
  })
})

describe("ExperienceItem", () => {
  it("does not repeat the highlights as a separate evidence line", async () => {
    const container = await AstroContainer.create()
    const [mimasoft] = getWorkExperience("es")
    const html = await container.renderToString(ExperienceItem, { props: { ...mimasoft, locale: "es" } })
    expect(html).not.toContain("Evidencia del trabajo")
    expect(html).not.toMatch(/Control Guards por tenant\s*·/)
    expect(html).toContain("Ver caso de estudio")
  })
})

describe("Hero email link", () => {
  it("exposes the full address as its accessible name even though it is split in spans", async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Hero, { props: { locale: "es" } })
    const link = anchors(html).find((anchor) => anchor.includes('href="mailto:'))
    expect(link).toBeDefined()
    expect(link).toContain(`aria-label="${personalInfo.email}"`)
    expect(link?.match(/<\/span>/g)?.length).toBeGreaterThanOrEqual(2)
  })
})
