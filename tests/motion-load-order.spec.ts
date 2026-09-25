import { expect, test } from "@playwright/test"

test("motion chunks load after the page load event and the hero still activates", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator("[data-portfolio-motion]")).toHaveAttribute("data-motion-status", /active|fallback/, {
    timeout: 10_000,
  })

  const timing = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
    const motion = performance
      .getEntriesByType("resource")
      .filter((entry) => /\/(gsap|ScrollTrigger|hero-webgl)\.[^/]+\.js$/.test(entry.name))
      .map((entry) => entry.startTime)
    return { loadEventStart: navigation.loadEventStart, motion }
  })

  expect(timing.motion.length).toBeGreaterThan(0)
  for (const start of timing.motion) expect(start).toBeGreaterThanOrEqual(timing.loadEventStart)
})
