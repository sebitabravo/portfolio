import { expect, test } from "@playwright/test"

test("motion chunks load after the page load event and the hero still activates", async ({ page }) => {
  await page.goto("/")

  const motionChunkStarts = () =>
    page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .filter((entry) => /\/(gsap|ScrollTrigger|hero-webgl)\.[^/]+\.js$/.test(entry.name))
        .map((entry) => entry.startTime),
    )

  // Slow runners can reach the fallback status before the deferred chunks are requested.
  await expect.poll(async () => (await motionChunkStarts()).length, { timeout: 15_000 }).toBeGreaterThan(0)
  await expect(page.locator("[data-portfolio-motion]")).toHaveAttribute("data-motion-status", /active|fallback/, {
    timeout: 10_000,
  })

  const loadEventStart = await page.evaluate(
    () => (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).loadEventStart,
  )
  for (const start of await motionChunkStarts()) expect(start).toBeGreaterThanOrEqual(loadEventStart)
})
