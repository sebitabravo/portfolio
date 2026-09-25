import { expect, test } from "@playwright/test"

const routes = [
  "/blog",
  "/en/blog",
  "/blog/manttoai-ml-iot-random-forest",
  "/en/blog/manttoai-ml-iot-random-forest-en",
  "/privacy",
  "/en/privacy",
]

for (const width of [390, 640, 768, 1280]) {
  for (const route of routes) {
    test(`${route} at ${width}px starts its content below the fixed header`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(route)
      const { headerBottom, contentTop } = await page.evaluate(() => {
        const header = document.querySelector(".site-nav")!.getBoundingClientRect()
        const first = document.querySelector("#main-content nav, #main-content h1")!.getBoundingClientRect()
        return { headerBottom: header.bottom, contentTop: first.top }
      })
      expect(contentTop).toBeGreaterThanOrEqual(headerBottom + 8)
    })
  }
}
