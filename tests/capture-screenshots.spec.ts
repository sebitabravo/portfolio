import { test } from "@playwright/test"

test.describe("Screenshots del portafolio", () => {
  test("Hero editorial", async ({ page }, testInfo) => {
    await page.goto("/")
    await page.waitForTimeout(1000)
    await page.screenshot({ path: testInfo.outputPath("01-hero-editorial.png") })
  })

  test("Proyectos — Wenuke con screenshot real", async ({ page }, testInfo) => {
    await page.goto("/")
    const wenuke = page.locator("[data-project='wenuke']")
    await wenuke.scrollIntoViewIfNeeded()
    // Esperar que la imagen cargue antes de capturar
    const img = wenuke.locator("img").first()
    await img.waitFor({ state: "visible", timeout: 10000 })
    await img.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0 ? Promise.resolve() : new Promise((resolve) => { (el as HTMLImageElement).onload = resolve }))
    await page.waitForTimeout(300)
    await wenuke.screenshot({ path: testInfo.outputPath("02-wenuke-card.png") })
  })

  test("Temutel descripcion reducida", async ({ page }, testInfo) => {
    await page.goto("/")
    await page.locator("#experiencia").scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    await page.screenshot({ path: testInfo.outputPath("03-temutel.png") })
  })

  test("Pagina completa", async ({ page }, testInfo) => {
    await page.goto("/")
    await page.waitForTimeout(1500)
    await page.screenshot({ path: testInfo.outputPath("04-full-page.png"), fullPage: true })
  })
})
