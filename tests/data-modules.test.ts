import { describe, expect, it } from "vitest"
import {
  getAboutMe,
  getCertifications,
  getEducation,
  getProjects,
  getWorkExperience,
  canonicalTechnologies,
  personalInfo,
  skills,
  social,
} from "../src/lib/data"

describe("portfolio data modules", () => {
  it("exposes stable personal and social contact data", () => {
    expect(personalInfo).toMatchObject({
      name: "Sebastian Bravo",
      title: "Full-Stack Developer",
      available: true,
    })
    expect(personalInfo.email).toContain("@")
    expect(social.github).toMatch(/^https:\/\//)
    expect(social.linkedin).toMatch(/^https:\/\//)
  })

  it("keeps skills grouped and non-empty", () => {
    expect(Object.keys(skills)).toEqual([
      "frontend",
      "backend",
      "databases",
      "tools",
      "methodologies",
    ])
    expect(Object.values(skills).every((group) => group.length > 0)).toBe(true)
    expect(new Set(Object.values(skills).flat()).size).toBeGreaterThan(10)
    expect(canonicalTechnologies).toEqual([...new Set(Object.values(skills).flat())])
  })

  it("provides localized about content without losing the required fields", () => {
    for (const locale of ["es", "en"] as const) {
      const about = getAboutMe(locale)
      expect(about.intro).toBeTruthy()
      expect(about.experience).toBeTruthy()
      expect(about.personal).toBeTruthy()
      expect(about.interests).toHaveLength(5)
      expect(about.interestsTitle).toBeTruthy()
      expect(about.lookingFor).toBeTruthy()
    }
    expect(getAboutMe("es").intro).not.toEqual(getAboutMe("en").intro)
  })

  it("keeps work and education records structurally complete in both locales", () => {
    for (const locale of ["es", "en"] as const) {
      const work = getWorkExperience(locale)
      const education = getEducation(locale)

      expect(work).toHaveLength(2)
      expect(education).toHaveLength(2)
      expect(work.every((item) => item.company && item.skills.length > 0)).toBe(true)
      expect(education.every((item) => item.institution && item.skills.length > 0)).toBe(true)
      expect(work.every((item) => item.startDate instanceof Date && item.endDate instanceof Date)).toBe(true)
      expect(education.every((item) => item.startDate instanceof Date && item.endDate instanceof Date)).toBe(true)
    }
    expect(getWorkExperience("es")[0].company).toBe("MIMASOFT")
    expect(getWorkExperience("en")[0].position).toBe("Full Stack Developer")
    expect(getWorkExperience("es")[0].url).toContain("mimasoft-landing-wordpress-mu-plugin")
    expect(getWorkExperience("es")[0].highlights).toHaveLength(3)
  })

  it("keeps localized project inventories aligned and ordered", () => {
    const spanish = getProjects("es")
    const english = getProjects("en")
    expect(spanish).toHaveLength(4)
    expect(english).toHaveLength(4)
    expect(english.map((project) => project.slug).sort()).toEqual(
      spanish.map((project) => project.slug).sort(),
    )
    expect(spanish.map((project) => project.order)).toEqual([3, 1, 4, 2])
    expect(spanish.filter((project) => project.featured)).toHaveLength(1)
    expect(english.filter((project) => project.featured)).toHaveLength(1)
    expect(spanish.every((project) => project.publishDate instanceof Date)).toBe(true)
  })

  it("keeps certification order, categories and URLs valid", () => {
    for (const locale of ["es", "en"] as const) {
      const certifications = getCertifications(locale)
      expect(certifications).toHaveLength(5)
      expect(certifications.map((item) => item.order)).toEqual([1, 2, 3, 4, 5])
      expect(certifications.every((item) => item.pdfUrl?.startsWith("/certifications/") && item.name)).toBe(true)
      expect(new Set(certifications.map((item) => item.category))).toEqual(
        new Set(["professional", "academic"]),
      )
    }
    expect(getCertifications("es")[1].name).toBe("Git de noob a pro")
    expect(getCertifications("en")[1].name).toBe("Git from Noob to Pro")
  })
})
