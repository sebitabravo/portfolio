import { describe, expect, it } from "vitest"
import { getWorkExperience } from "../src/lib/data/work"

// P5: work.ts follows the projects.ts pattern — SharedWork + Record<Locale, LocalizedWork>.
// Shared fields (company, dates, current, logos) match between locales by value;
// copy fields (position, description, location, employmentType, skills, highlights, url)
// diverge per locale and are preserved verbatim.
describe("work shared-locale contract (P5)", () => {
  it("shares structural fields between locales by value", () => {
    const es = getWorkExperience("es")
    const en = getWorkExperience("en")
    expect(es).toHaveLength(en.length)
    for (let i = 0; i < es.length; i++) {
      expect(en[i].company).toBe(es[i].company)
      expect(en[i].current).toBe(es[i].current)
      expect(en[i].startDate.getTime()).toBe(es[i].startDate.getTime())
      expect(en[i].endDate?.getTime()).toBe(es[i].endDate?.getTime())
      expect(en[i].logos).toEqual(es[i].logos)
    }
  })

  it("keeps Mimasoft skills in parity, Temutel skills localized (translated role)", () => {
    const es = getWorkExperience("es")
    const en = getWorkExperience("en")
    expect(en[0].skills).toEqual(es[0].skills)
    // RED documented: Temutel skill names are translated copy, preserved verbatim.
    expect(en[1].skills).not.toEqual(es[1].skills)
    expect(es[1].skills).toContain("Mantenimiento de Redes")
    expect(en[1].skills).toContain("Network Maintenance")
  })

  it("diverges only in localized copy, preserved verbatim", () => {
    const es = getWorkExperience("es")
    const en = getWorkExperience("en")
    expect(es[0].position).toBe("Desarrollador Full Stack")
    expect(en[0].position).toBe("Full Stack Developer")
    expect(en[0].description).not.toBe(es[0].description)
    expect(en[0].location).toBe("Santiago, Chile (Remote)")
    expect(es[0].location).toBe("Santiago, Chile (Remoto)")
    // employmentType divergence preserved, not normalized: ES long form vs EN short form.
    expect(es[0].employmentType).toBe("Contrato por proyecto (3 meses)")
    expect(en[0].employmentType).toBe("Contract")
    expect(es[1].employmentType).toBe("Contrato temporal")
    expect(en[1].employmentType).toBe("Temporary contract")
    // Locale-prefixed case-study url, mirroring projects.ts localized blogSlug.
    expect(es[0].url).toBe("/blog/mimasoft-landing-wordpress-mu-plugin")
    expect(en[0].url).toBe("/en/blog/mimasoft-landing-wordpress-mu-plugin")
    expect(es[0].highlights).toHaveLength(3)
    expect(en[0].highlights).toHaveLength(3)
  })

  it("returns independent clones per locale (no shared mutable state)", () => {
    const es = getWorkExperience("es")
    const en = getWorkExperience("en")
    expect(es[0].startDate).not.toBe(en[0].startDate)
    expect(es[0].skills).not.toBe(en[0].skills)
    expect(es[0].logos).not.toBe(en[0].logos)
    expect(es[0].highlights).not.toBe(en[0].highlights)
  })
})
