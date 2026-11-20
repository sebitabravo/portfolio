// Prueba en navegador (S4): las fuentes subseteadas cargan y cubren todos los
// glifos que el sitio usa de verdad, incluidos acentos, signos y flechas. Se
// ejecuta en los tres motores (chromium, firefox, webkit).
import { expect, test } from "@playwright/test"

const SAMPLE = "Sebastián Bravo · áéíóúñÁÉÍÓÚÑ¿¡«»—–…→←↑↓≥×§©³ 0123456789"

const FAMILIES = ["Geist Mono", "Geist Pixel", "GP Line", "GP Triangle", "GP Grid", "GP Circle"]

for (const family of FAMILIES) {
  test(`"${family}" loads and covers the rendered glyphs`, async ({ page }) => {
    await page.goto("/")
    const result = await page.evaluate(async ({ family, sample }) => {
      const faces = await document.fonts.load(`1em "${family}"`, sample).catch(() => [])
      return { faces: faces.length, check: document.fonts.check(`1em "${family}"`, sample) }
    }, { family, sample: SAMPLE })
    expect(result.faces, `@font-face de "${family}" no cargó`).toBeGreaterThan(0)
    expect(result.check, `"${family}" no cubre todos los glifos de "${SAMPLE}"`).toBe(true)
  })
}

test("the display font is the pixel family, not a fallback", async ({ page }) => {
  await page.goto("/")
  const stack = await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily)
  expect(stack).toContain("Geist Pixel")
})
