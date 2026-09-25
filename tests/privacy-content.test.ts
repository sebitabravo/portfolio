import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const spanishRoute = readFileSync("src/pages/privacy.astro", "utf8")
const englishRoute = readFileSync("src/pages/en/privacy.astro", "utf8")
const privacy = readFileSync("src/components/LocalizedPrivacy.astro", "utf8")

describe("privacy thin wrappers", () => {
  it.each([
    { name: "Spanish", route: spanishRoute, locale: "es" },
    { name: "English", route: englishRoute, locale: "en" },
  ])(
    "delegates $name privacy composition to the shared component with locale $locale",
    ({ route, locale }) => {
      expect(route).toMatch(
        /import LocalizedPrivacy from ["']@\/components\/LocalizedPrivacy\.astro["']/,
      )
      expect(route).toContain(`<LocalizedPrivacy locale="${locale}" />`)
      expect(route.match(/<LocalizedPrivacy\b/g)).toHaveLength(1)
      expect(route).not.toMatch(/<(?:main|h1|section)\b/)
    },
  )
})

describe("localized privacy content", () => {
  it("wires locale into Layout with privacy canonical and alternates", () => {
    expect(privacy).toContain("locale: Locale")
    expect(privacy).toContain("createStaticAlternates(locale")
    expect(privacy).toContain("https://sebita.dev/privacy/")
    expect(privacy).toContain("https://sebita.dev/en/privacy/")
    expect(privacy).toContain("locale={locale}")
    expect(privacy).toContain("canonicalUrl={canonicalUrl}")
    expect(privacy).toContain("alternates={alternates}")
  })

  it("keeps eight numbered sections in both locales", () => {
    for (const heading of [
      "1. Responsable del Tratamiento",
      "2. Datos que NO Recolectamos",
      "3. Analítica y Medición",
      "4. Enlaces a Sitios Externos",
      "5. Derechos ARCO (Chile)",
      "6. Derechos GDPR (Visitantes Europeos)",
      "7. Cambios a esta Política",
      "8. Contacto",
      "1. Data Controller",
      "2. Data We Do NOT Collect",
      "3. Analytics and Measurement",
      "4. External Links",
      "5. Your GDPR Rights (European Visitors)",
      "6. Your ARCO Rights (Chile)",
      "7. Changes to This Policy",
      "8. Contact",
    ]) {
      expect(privacy).toContain(heading)
    }
  })

  it("describes the no-tracking state without active Vercel Analytics copy", () => {
    expect(privacy).not.toContain("vercel.com/analytics")
    expect(privacy).not.toContain("Vercel Analytics")
    expect(privacy).not.toContain("Vercel Web Analytics")
    expect(privacy).not.toContain("va.vercel-scripts")
    expect(privacy).not.toContain("anonimizadas por Vercel")
    expect(privacy).not.toContain("anonymized by Vercel")
  })

  it("keeps both contact emails bound to the configured recipient", () => {
    expect(privacy).toContain("personalInfo.email")
    expect(privacy.match(/mailto:\$\{personalInfo\.email\}/g)).toHaveLength(2)
  })
})
