import { test } from "@playwright/test"
import path from "path"

const SCREENSHOT_DIR = path.resolve("tests/screenshots")

test.describe("Screenshots del portafolio", () => {
  test("Hero con wins", async ({ page }) => {
    await page.goto("http://localhost:4321")
    await page.waitForTimeout(1000)
    await page.screenshot({ path: `${SCREENSHOT_DIR}/01-hero-wins.png` })
  })

  test("Proyectos — Wenuke con screenshot real", async ({ page }) => {
    await page.goto("http://localhost:4321")
    const wenuke = page.locator("[data-project='wenuke']")
    await wenuke.scrollIntoViewIfNeeded()
    // Esperar que la imagen cargue antes de capturar
    const img = wenuke.locator("img").first()
    await img.waitFor({ state: "visible", timeout: 10000 })
    await img.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0 ? Promise.resolve() : new Promise((resolve) => { (el as HTMLImageElement).onload = resolve }))
    await page.waitForTimeout(300)
    await wenuke.screenshot({ path: `${SCREENSHOT_DIR}/02-wenuke-card.png` })
  })

  test("Temutel descripcion reducida", async ({ page }) => {
    await page.goto("http://localhost:4321")
    await page.locator("#experiencia").scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${SCREENSHOT_DIR}/03-temutel.png` })
  })

  test("Pagina completa", async ({ page }) => {
    await page.goto("http://localhost:4321")
    await page.waitForTimeout(1500)
    await page.screenshot({ path: `${SCREENSHOT_DIR}/04-full-page.png`, fullPage: true })
  })
})
