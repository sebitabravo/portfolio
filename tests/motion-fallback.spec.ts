import { expect, test } from "@playwright/test"

async function blockLocalModuleScripts(page: import("@playwright/test").Page, baseURL: string) {
  const origin = new URL(baseURL).origin
  let blockedScripts = 0
  await page.route("**/_astro/**", async (route) => {
    const url = new URL(route.request().url())
    if (url.origin === origin && url.pathname.startsWith("/_astro/") && route.request().resourceType() === "script") {
      blockedScripts++
      await route.abort()
    } else {
      await route.continue()
    }
  })
  return () => blockedScripts
}

test("inline Hero fallback settles without local external module scripts", async ({ page }, testInfo) => {
  test.setTimeout(12_000)
  const blockedScripts = await blockLocalModuleScripts(page, testInfo.project.use.baseURL as string)

  await page.goto("/")
  expect(blockedScripts()).toBeGreaterThan(0)
  const root = page.locator("[data-portfolio-motion]")
  const canvas = root.locator("[data-hero-webgl]")
  await expect(root).toHaveAttribute("data-motion-status", "fallback", { timeout: 6_000 })
  await expect(canvas).toHaveAttribute("data-webgl-status", "fallback", { timeout: 6_000 })
})

test("an old inline timer cannot settle a newer owned loading state", async ({ page }, testInfo) => {
  test.setTimeout(12_000)
  const blockedScripts = await blockLocalModuleScripts(page, testInfo.project.use.baseURL as string)
  await page.goto("/")
  expect(blockedScripts()).toBeGreaterThan(0)
  const root = page.locator("[data-portfolio-motion]")
  const canvas = root.locator("[data-hero-webgl]")
  await expect(root).toHaveAttribute("data-motion-status", "loading")
  await expect(canvas).toHaveAttribute("data-webgl-status", "pending")

  await root.evaluate((element) => {
    element.dispatchEvent(new Event("portfolio-motion:started"))
    element.dataset.motionStatus = "idle"
    element.querySelector<HTMLElement>("[data-hero-webgl]")!.dataset.webglStatus = "idle"
    element.dataset.motionStatus = "loading"
    element.querySelector<HTMLElement>("[data-hero-webgl]")!.dataset.webglStatus = "pending"
  })
  await page.waitForTimeout(3_200)
  await expect(root).toHaveAttribute("data-motion-status", "loading")
  await expect(canvas).toHaveAttribute("data-webgl-status", "pending")
})
