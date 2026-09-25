import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  CERTIFICATION_CATEGORIES,
  PROJECT_STATUSES,
  type CertificationCategory,
  type ProjectStatus,
} from "../src/lib/data/types"
import { LOCALES, defaultLocale, locales, type Locale } from "../src/lib/i18n"
import {
  THEMES,
  type CarouselCertification,
  type CarouselCertificationData,
  type ThemePreference,
} from "../src/types"

describe("shared const-objects with derived types", () => {
  it("derives Locale from LOCALES with Spanish as default", () => {
    expect(LOCALES).toEqual({ ES: "es", EN: "en" })
    const supported: readonly Locale[] = locales
    expect([...supported]).toEqual([LOCALES.ES, LOCALES.EN])
    expect(defaultLocale).toBe(LOCALES.ES)
  })

  it("derives ProjectStatus from PROJECT_STATUSES", () => {
    expect(PROJECT_STATUSES).toEqual({
      PRODUCTION: "production",
      DEVELOPMENT: "development",
      DEMO: "demo",
    })
    const statuses: ProjectStatus[] = [
      PROJECT_STATUSES.PRODUCTION,
      PROJECT_STATUSES.DEVELOPMENT,
      PROJECT_STATUSES.DEMO,
    ]
    expect(statuses).toHaveLength(3)
  })

  it("derives CertificationCategory from CERTIFICATION_CATEGORIES", () => {
    expect(CERTIFICATION_CATEGORIES).toEqual({
      PROFESSIONAL: "professional",
      ACADEMIC: "academic",
    })
    const category: CertificationCategory = CERTIFICATION_CATEGORIES.PROFESSIONAL
    expect(category).toBe("professional")
  })

  it("derives ThemePreference from THEMES", () => {
    expect(THEMES).toEqual({ LIGHT: "light", DARK: "dark", SYSTEM: "system" })
    const preference: ThemePreference = THEMES.SYSTEM
    expect(preference).toBe("system")
  })
})

describe("carousel certification shape", () => {
  it("keeps the carousel payload flat behind a dedicated data interface", () => {
    const data: CarouselCertificationData = {
      name: "Full Stack Developer",
      organization: "INACAP",
      category: CERTIFICATION_CATEGORIES.ACADEMIC,
    }
    const cert: CarouselCertification = { data }
    expect(Object.keys(cert)).toEqual(["data"])
    expect(cert.data.name).toBe("Full Stack Developer")
  })
})

describe("ambient types", () => {
  it("keeps src/env.d.ts free of `any`", () => {
    const envDts = readFileSync(new URL("../src/env.d.ts", import.meta.url), "utf8")
    expect(envDts).not.toMatch(/:\s*any\b/)
  })
})
