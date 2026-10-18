import { expect, test } from "@playwright/test"

test("no-preference keeps the accessible hero title static independently of optional WebGL", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/")
  const title = page.getByRole("heading", { level: 1, name: "Sebastian Bravo" })
  await expect(title).toBeVisible()
  await expect(title.locator(".hero-title-name")).toHaveText(["Sebastian", "Bravo"])
  await expect(title).not.toHaveAttribute("style")
  const state = await title.evaluate((element) => {
    const styles = getComputedStyle(element)
    return { animations: element.getAnimations().length, opacity: styles.opacity, transform: styles.transform }
  })
  expect(state).toEqual({ animations: 0, opacity: "1", transform: "none" })
  await expect(page.locator(".hero-lede")).toBeVisible()
  await expect(page.locator(".hero-actions a")).toHaveCount(2)
})

test("live reduced-motion changes retain the static hero and only activate optional motion while allowed", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  const hero = page.locator("[data-portfolio-motion]")
  const canvas = hero.locator("[data-hero-webgl]")
  await expect(hero).toHaveAttribute("data-motion-status", "reduced")
  await expect(canvas).toHaveAttribute("data-webgl-status", "reduced")

  await page.emulateMedia({ reducedMotion: "no-preference" })
  await expect(hero).toHaveAttribute("data-motion-status", "active")
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(hero).toHaveAttribute("data-motion-status", "reduced")
  await expect(canvas).toHaveAttribute("data-webgl-status", "reduced")
  await expect(page.locator(".hero-orbit-one")).toBeVisible()

  await page.emulateMedia({ reducedMotion: "no-preference" })
  await expect(hero).toHaveAttribute("data-motion-status", "active")
})

test("reduced motion keeps hero identity and copy visible without reveal animations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1, name: "Sebastian Bravo" })).toBeVisible()
  const content = page.locator(".hero-title, .hero-role, .hero-lede, .hero-actions, .hero-meta")
  await expect(content).toHaveCount(5)
  for (const element of await content.all()) {
    await expect(element).toBeVisible()
    const state = await element.evaluate((node) => {
      const styles = getComputedStyle(node)
      return { animations: node.getAnimations().length, opacity: styles.opacity, transform: styles.transform }
    })
    expect(state).toEqual({ animations: 0, opacity: "1", transform: "none" })
  }
  await expect(page.locator("[data-hero-webgl]")).toHaveAttribute("data-webgl-status", "reduced")
})
