import { expect, test } from "@playwright/test"

function extractTransitionNames(html: string): string[] {
  const names = new Set<string>()
  const rule = /\[data-astro-transition-scope="[^"]+"\]\s*\{\s*view-transition-name:\s*([^;]+);/g

  for (const match of html.matchAll(rule)) names.add(match[1].trim())

  return [...names]
}

test("article titles expose unique shared-element transition names", async ({ page }) => {
  await page.goto("/blog")
  const indexNames = extractTransitionNames(await page.content())

  expect(indexNames.length).toBeGreaterThan(1)
  expect(new Set(indexNames).size).toBe(indexNames.length)
  expect(indexNames.every((name) => name.startsWith("vt-article-title-"))).toBe(true)

  await page.goto("/blog/vulcania-monitoreo-volcanico-comunitario")
  const detailNames = extractTransitionNames(await page.content())

  expect(detailNames).toHaveLength(1)
  expect(indexNames).toContain(detailNames[0])
})

test("project cards reuse the detail transition name", async ({ page }) => {
  await page.goto("/")
  const homeNames = extractTransitionNames(await page.content())

  expect(homeNames.length).toBeGreaterThan(0)
  expect(new Set(homeNames).size).toBe(homeNames.length)
  expect(homeNames).toContain("vt-article-title-vulcania-monitoreo-volcanico-comunitario")
})

test("client navigation tears down motion before the swap and rebuilds it", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))

  await page.goto("/")
  const root = page.locator("[data-portfolio-motion]")
  await expect(root).toHaveAttribute("data-motion-status", /loading|active/)
  await root.dispatchEvent("pointerenter")
  await expect(root).toHaveAttribute("data-motion-status", "active", { timeout: 15_000 })

  await page.locator('.site-nav .nav-link[href*="/blog"]').click()
  await expect(page).toHaveURL(/\/blog\/?$/)
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  await expect(page.locator("[data-portfolio-motion]")).toHaveCount(0)

  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
  const restored = page.locator("[data-portfolio-motion]")
  await expect(restored).toHaveCount(1)
  await expect(restored).toHaveAttribute("data-motion-status", /loading|active/)
  expect(errors).toEqual([])
})

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } })

  test("disables view transition animations and swaps instantly", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("[data-portfolio-motion]")).toHaveAttribute("data-motion-status", "reduced", {
      timeout: 15_000,
    })
    expect(await page.content()).toContain("@media (prefers-reduced-motion){::view-transition-group(*)")

    await page.locator('.site-nav .nav-link[href*="/blog"]').click()
    await expect(page).toHaveURL(/\/blog\/?$/)

    const runningViewTransitions = await page.evaluate(() => {
      const animations = document.getAnimations?.() ?? []
      return animations.filter((animation) => {
        const effect = animation.effect as KeyframeEffect | null
        return animation.playState === "running" && Boolean(effect?.pseudoElement?.startsWith("::view-transition"))
      }).length
    })

    expect(runningViewTransitions).toBe(0)
  })
})
