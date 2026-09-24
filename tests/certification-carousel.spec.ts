import { expect, test } from "@playwright/test"

for (const { path, label } of [
  { path: "/", label: "Certificaciones" },
  { path: "/en/", label: "Certifications" },
]) {
  test(`accessible named region for ${path}`, async ({ page }) => {
    await page.goto(path)

    const carousel = page.locator("#certCarouselContainer")
    await expect(carousel.and(page.getByRole("region", { name: label, exact: true }))).toBeVisible()
    await expect(carousel.getByRole("button")).toHaveCount(2)
  })
}

test("auto-scroll pauses on hover and keyboard focus, then resumes after focus leaves", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/")

  const container = page.locator("#certCarouselContainer")
  const wrapper = page.locator("#certCarouselWrapper")
  const position = () => wrapper.evaluate((element) => element.scrollLeft)
  await container.scrollIntoViewIfNeeded()
  await page.mouse.move(0, 0)
  await expect(container).toBeInViewport()
  await expect.poll(position).toBeGreaterThan(4)

  await container.hover()
  const hoveredPosition = await position()
  await page.waitForTimeout(350)
  expect(await position()).toBe(hoveredPosition)

  await page.mouse.move(0, 0)
  await expect.poll(position).toBeGreaterThan(hoveredPosition + 4)

  // A fixed, tabbable sibling lets focus exit without scrolling the carousel out of view.
  await container.evaluate((element) => {
    const outside = document.createElement("button")
    outside.id = "after-cert-carousel-focus"
    outside.textContent = "Outside carousel"
    outside.style.cssText = "position:fixed;top:80px;right:12px;z-index:100"
    element.after(outside)
  })
  const firstLink = container.locator("a.cert-item:not([data-duplicate])").first()
  // WebKit and Firefox on macOS can skip links on Tab; focus the link directly
  // to exercise its focus event, then use Tab for the keyboard exit below.
  await firstLink.focus()
  await expect(firstLink).toBeFocused()
  const focusedPosition = await position()
  await page.waitForTimeout(350)
  expect(await position()).toBe(focusedPosition)

  // Moving between carousel descendants must not restart animation.
  await page.locator("#certNavNext").focus()
  const insidePosition = await position()
  await page.waitForTimeout(350)
  expect(await position()).toBe(insidePosition)
  await page.keyboard.press("Tab")
  await expect(page.locator("#after-cert-carousel-focus")).toBeFocused()
  await expect(container).toBeInViewport()
  await expect.poll(position).toBeGreaterThan(insidePosition + 4)
})

test("runtime reduced motion stops auto-scroll and resumes only when allowed", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.addInitScript(() => {
    const original = window.requestAnimationFrame.bind(window)
    const tracked = window as Window & { __carouselFrames?: number }
    tracked.__carouselFrames = 0
    window.requestAnimationFrame = (callback) => original((timestamp) => {
      if (String(callback).includes("scrollLeft")) tracked.__carouselFrames = (tracked.__carouselFrames ?? 0) + 1
      callback(timestamp)
    })
  })
  await page.goto("/")

  const container = page.locator("#certCarouselContainer")
  const wrapper = page.locator("#certCarouselWrapper")
  const position = () => wrapper.evaluate((element) => element.scrollLeft)
  const frameCount = () => page.evaluate(() => (window as Window & { __carouselFrames?: number }).__carouselFrames ?? 0)
  await container.scrollIntoViewIfNeeded()
  await page.mouse.move(0, 0)
  await expect(container).toBeInViewport()
  await expect.poll(position).toBeGreaterThan(4)
  await expect.poll(frameCount).toBeGreaterThan(4)

  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(container.locator(".cert-item[data-duplicate='true']").first()).toBeHidden()
  await expect(container.locator(".cert-carousel")).toHaveCSS("flex-wrap", "wrap")
  await container.scrollIntoViewIfNeeded()
  await page.mouse.move(0, 0)
  await expect(container).toBeInViewport()
  // The static grid can mask scrollLeft changes, so also assert the JS loop stops.
  const reducedFrames = await frameCount()
  await page.waitForTimeout(350)
  expect(await frameCount()).toBe(reducedFrames)

  // Returning to no-preference must still respect the existing hover guard.
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await container.scrollIntoViewIfNeeded()
  await container.hover()
  await expect.poll(() => container.evaluate((element) => element.matches(":hover"))).toBe(true)
  const hoveredFrames = await frameCount()
  await page.waitForTimeout(350)
  expect(await frameCount()).toBe(hoveredFrames)
  await page.mouse.move(0, 0)
  await container.scrollIntoViewIfNeeded()
  await expect(container).toBeInViewport()
  await expect.poll(frameCount).toBeGreaterThan(hoveredFrames + 4)
})

test("reduced motion displays a static grid without auto-scroll", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")

  const container = page.locator("#certCarouselContainer")
  const wrapper = page.locator("#certCarouselWrapper")
  await container.scrollIntoViewIfNeeded()
  await page.mouse.move(0, 0)
  await expect(container).toBeInViewport()
  await expect(container.locator(".cert-nav-btn").first()).toBeHidden()
  await expect(container.locator(".cert-item[data-duplicate='true']").first()).toBeHidden()
  await expect(container.locator(".cert-carousel")).toHaveCSS("flex-wrap", "wrap")
  const position = await wrapper.evaluate((element) => element.scrollLeft)
  await page.waitForTimeout(350)
  expect(await wrapper.evaluate((element) => element.scrollLeft)).toBe(position)

  // Initialization must retain its change listener even when motion starts reduced.
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await expect.poll(() => wrapper.evaluate((element) => element.scrollLeft)).toBeGreaterThan(position + 4)
})
