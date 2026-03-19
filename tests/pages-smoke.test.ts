import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const spanishPage = readFileSync("src/pages/index.astro", "utf8")
const englishPage = readFileSync("src/pages/en/index.astro", "utf8")

describe("home pages smoke", () => {
  it("renders every core section in Spanish", () => {
    expect(spanishPage).toContain('id="experiencia"')
    expect(spanishPage).toContain('id="proyectos"')
    expect(spanishPage).toContain('id="educacion"')
    expect(spanishPage).toContain('id="certificaciones"')
    expect(spanishPage).toContain('id="sobre-mi"')
    expect(spanishPage).toContain('id="contacto"')
  })

  it("renders every core section in English", () => {
    expect(englishPage).toContain('id="experience"')
    expect(englishPage).toContain('id="projects"')
    expect(englishPage).toContain('id="education"')
    expect(englishPage).toContain('id="certifications"')
    expect(englishPage).toContain('id="about"')
    expect(englishPage).toContain('id="contact"')
  })
})
