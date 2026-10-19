import { experimental_AstroContainer as AstroContainer } from "astro/container"
import { describe, expect, it, vi } from "vitest"

// La primera credencial pierde su PDF: el resto conserva el enlace al certificado.
vi.mock("@/lib/data", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/lib/data")>()
  return {
    ...actual,
    getCertifications: (locale: Parameters<typeof actual.getCertifications>[0]) =>
      actual.getCertifications(locale).map((cert, index) => (index === 0 ? { ...cert, pdfUrl: undefined } : cert)),
  }
})

const { default: Certifications } = await import("../src/components/Certifications.astro")

describe("certifications render", () => {
  it("shows a credential without PDF as a static card, never as an empty link", async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Certifications, { props: { locale: "es" } })

    const cards = html.match(/<li class="cert-item"/g) ?? []
    const links = html.match(/<a [^>]*class="cert-link focus-ring"/g) ?? []
    expect(cards.length).toBeGreaterThan(1)
    expect(links).toHaveLength(cards.length - 1)
    expect(html).not.toMatch(/<a (?![^>]*href=)[^>]*class="cert-link/)
    expect(html.match(/Ver certificado/g)).toHaveLength(cards.length - 1)
  })
})
