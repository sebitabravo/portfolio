import { describe, expect, it } from "vitest"
import en from "../src/lib/i18n/en.json"
import es from "../src/lib/i18n/es.json"
import { defaultLocale, getTranslations, locales } from "../src/lib/i18n"

function getDeepKeys(
  input: Record<string, unknown>,
  prefix = "",
): string[] {
  const keys: string[] = []

  for (const [key, value] of Object.entries(input)) {
    const currentKey = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...getDeepKeys(value as Record<string, unknown>, currentKey))
      continue
    }

    keys.push(currentKey)
  }

  return keys
}

describe("i18n dictionaries", () => {
  it("contains the same translation keys in both locales", () => {
    const englishKeys = getDeepKeys(en).sort()
    const spanishKeys = getDeepKeys(es).sort()

    expect(englishKeys).toEqual(spanishKeys)
  })

  it("exposes the supported locales and falls back to Spanish", () => {
    expect(locales).toEqual(["es", "en"])
    expect(defaultLocale).toBe("es")
    expect(getTranslations("en")).toBe(en)
    expect(getTranslations("es")).toBe(es)
    expect(getTranslations("fr" as never)).toBe(es)
  })
})
