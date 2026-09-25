import { expect, test } from "@playwright/test"

test("theme aliases follow the active runtime palette in both locales", async ({ page }) => {
  for (const route of ["/", "/en/"]) {
    for (const theme of ["light", "dark"]) {
      await page.addInitScript((value) => localStorage.setItem("theme", value), theme)
      await page.goto(route)
      const colors = await page.locator("body").evaluate((body) => {
        const utility = document.createElement("span")
        utility.className = "bg-background text-foreground"
        const tokens = document.createElement("span")
        tokens.style.cssText = "color:hsl(var(--foreground));background-color:hsl(var(--background))"
        body.append(utility, tokens)
        const actual = getComputedStyle(utility)
        const expected = getComputedStyle(tokens)
        const result = {
          background: actual.backgroundColor, foreground: actual.color,
          expectedBackground: expected.backgroundColor, expectedForeground: expected.color,
          dark: document.documentElement.classList.contains("dark"),
        }
        utility.remove()
        tokens.remove()
        return result
      })
      expect(colors.dark).toBe(theme === "dark")
      expect(colors.background).toBe(colors.expectedBackground)
      expect(colors.foreground).toBe(colors.expectedForeground)
    }
  }
})

test("approved utilities render a gradient title and a scrollable hidden-scrollbar carousel", async ({ page }) => {
  await page.goto("/")
  const title = page.locator(".hero-title-accent")
  await expect(title).toHaveCSS("color", "rgba(0, 0, 0, 0)")
  await expect(title).toHaveCSS("background-clip", "text")

  const wrapper = page.locator("#certCarouselWrapper")
  await expect(wrapper).toHaveCSS("scrollbar-width", "none")
  const dimensions = await wrapper.evaluate((element) => ({
    content: element.scrollWidth, viewport: element.clientWidth,
  }))
  expect(dimensions.content).toBeGreaterThan(dimensions.viewport)
  await page.locator("#certNavNext").click()
  await expect.poll(() => wrapper.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)
})

test("served compiled CSS does not ship retired legacy selectors", async ({ page }) => {
  await page.goto("/")
  const links = await page.locator('link[rel="stylesheet"]').evaluateAll((elements) =>
    elements.map((element) => (element as HTMLLinkElement).href),
  )
  expect(links.length).toBeGreaterThan(0)
  const css = (await Promise.all(links.map(async (href) => {
    const response = await page.request.get(href)
    expect(response.ok()).toBe(true)
    return response.text()
  }))).join("\n")
  // Preserve layered cascade behavior without coupling the test to CSS source files.
  expect(css).toContain("@layer components")
  for (const className of [
    "card-hover", "nav-glass", "animate-fade-in", "animate-slide-up",
    "animate-slide-down", "section-divider", "btn-cream",
    "animation-delay-100", "animation-delay-200", "animation-delay-300",
    "animation-delay-350", "animation-delay-400", "animation-delay-500",
  ]) {
    expect(css, className).not.toMatch(new RegExp(`\\.${className}(?![\\w-])`))
  }
})

test("signal strip styles are component-scoped in compiled CSS", async ({ page }) => {
  await page.goto("/")
  const strip = page.locator(".signal-strip")
  await expect(strip).toHaveCSS("position", "relative")
  await expect(strip).toHaveCSS("overflow", "hidden")
  // Inspect delivered selectors as well as the rendered style: an unscoped duplicate would defeat ownership.
  const sheets = await page.locator('link[rel="stylesheet"]').evaluateAll((elements) =>
    elements.map((element) => (element as HTMLLinkElement).href),
  )
  const css = (await Promise.all(sheets.map(async (href) => (await page.request.get(href)).text()))).join("\n")
  expect(css.match(/\.signal-strip\[data-astro-cid-[\w-]+\]/g)?.length).toBeGreaterThan(0)
  expect(css.match(/(?:^|[,{])\s*\.signal-strip\s*[{,:]/g)).toBeNull()
})
