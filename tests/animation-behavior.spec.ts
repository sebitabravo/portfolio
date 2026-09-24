import { expect, test } from "@playwright/test"

test("no-preference renders different orbit pixels at two CSS animation positions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/")
  const orbit = page.locator(".hero-orbit-one")
  await expect(orbit).toBeVisible()
  await expect.poll(() => orbit.evaluate((element) => getComputedStyle(element).animationName)).toContain("hero-orbit")
  const running = await orbit.evaluate((element) => {
    const animation = element.getAnimations().find((item) => item instanceof CSSAnimation && item.animationName === "hero-orbit")
    if (!animation) return false
    const wasRunning = animation.playState === "running"
    // Freeze every other CSS animation and hide optional WebGL so only the orbit can alter pixels.
    document.getAnimations().filter((other) => other !== animation).forEach((other) => other.pause())
    const canvas = document.querySelector<HTMLElement>("[data-hero-webgl]")
    if (canvas) canvas.style.visibility = "hidden"
    animation.pause()
    animation.currentTime = 0
    return wasRunning
  })
  expect(running).toBe(true)
  const startPixels = await orbit.screenshot({ animations: "allow" })
  await orbit.evaluate((element) => {
    const animation = element.getAnimations().find((item) => item instanceof CSSAnimation && item.animationName === "hero-orbit")!
    animation.currentTime = 3000
  })
  const advancedPixels = await orbit.screenshot({ animations: "allow" })
  expect(startPixels.equals(advancedPixels)).toBe(false)
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

test("reduced motion keeps the hero visible without orbit or reveal animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  const orbit = page.locator(".hero-orbit-one")
  const reveal = page.locator(".hero-kicker.hero-reveal")
  await expect(orbit).toBeVisible()
  await expect(reveal).toBeVisible()
  const result = await page.evaluate(() => {
    const orbit = document.querySelector<HTMLElement>(".hero-orbit-one")!
    const reveal = document.querySelector<HTMLElement>(".hero-kicker.hero-reveal")!
    return {
      orbitAnimations: orbit.getAnimations().length,
      revealAnimations: reveal.getAnimations().length,
      revealOpacity: getComputedStyle(reveal).opacity,
      revealTransform: getComputedStyle(reveal).transform,
    }
  })
  expect(result).toEqual({ orbitAnimations: 0, revealAnimations: 0, revealOpacity: "1", revealTransform: "none" })
})
