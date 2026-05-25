import { chromium } from "@playwright/test"

const BASE = "http://localhost:4321"

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

  // 1. Hero con wins
  await page.goto(BASE)
  await page.waitForTimeout(1000)
  await page.screenshot({ path: "tests/screenshots/01-hero-wins.png", fullPage: false })

  // Scroll a Proyectos
  await page.locator("#proyectos").scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await page.screenshot({ path: "tests/screenshots/02-projects.png", fullPage: false })

  // Wenuke card close-up
  const wenuke = page.locator("[data-project='wenuke']")
  await wenuke.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await wenuke.screenshot({ path: "tests/screenshots/03-wenuke-screenshot.png" })

  // Temutel reducido
  await page.locator("#experiencia").scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await page.screenshot({ path: "tests/screenshots/04-temutel-reducido.png", fullPage: false })

  await browser.close()
  console.log("Screenshots captured in tests/screenshots/")
}

main()
