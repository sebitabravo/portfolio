import { expect, test } from "@playwright/test"

test.describe("Blog — imágenes sociales", () => {
  test("valid blog images use optimized social and JSON-LD URLs; missing keys retain OG fallback", async ({ page }) => {
    await page.goto("/blog/rapido-sur-erp-mantenimiento-flotas")
    const social = await page.locator('meta[property="og:image"]').getAttribute("content")
    expect(social).toMatch(/^https:\/\/sebita\.dev\/_astro\/[^/]+\.webp$/)
    const article = await page.locator('script[type="application/ld+json"]').last().textContent()
    expect(JSON.parse(article!).image).toBe(social)

    await page.goto("/blog/bot-discord-moderacion-musica")
    const missing = await page.locator('script[type="application/ld+json"]').last().textContent()
    expect(JSON.parse(missing!)).not.toHaveProperty("image")
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\/es\.png/)
  })
})

test.describe("Layout general", () => {
  test("página carga sin errores de consola", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))
    await page.goto("/")
    await page.waitForTimeout(2000)
    expect(errors).toHaveLength(0)
  })
})
