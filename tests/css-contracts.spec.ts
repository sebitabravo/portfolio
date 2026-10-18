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

test("hero title is solid and certifications form a static responsive five-item grid", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  const title = page.locator(".hero-title-accent")
  await expect(title).toHaveCSS("color", "rgb(242, 239, 232)")
  await expect(title).toHaveCSS("background-image", "none")
  await expect(title).not.toHaveCSS("background-clip", "text")
  const grid = page.locator("#certificaciones ul")
  await expect(grid.locator(":scope > li")).toHaveCount(5)
  await expect(page.locator("#certCarouselWrapper, #certNavNext, [data-duplicate][aria-hidden='true']")).toHaveCount(0)
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    await grid.scrollIntoViewIfNeeded()
    await expect(grid).toHaveCSS("display", "grid")
    const state = await grid.evaluate((element) => ({
      columns: getComputedStyle(element).gridTemplateColumns.split(" ").length,
      overflow: element.scrollWidth > element.clientWidth,
      animations: element.getAnimations({ subtree: true }).length,
    }))
    expect(state).toEqual({ columns: width < 768 ? 1 : 2, overflow: false, animations: 0 })
    for (const item of await grid.locator(":scope > li").all()) await expect(item).toBeVisible()
  }
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
  // Astro puede incluir los estilos del componente en línea según su tamaño.
  const sheets = await page.locator('link[rel="stylesheet"]').evaluateAll((elements) =>
    elements.map((element) => (element as HTMLLinkElement).href),
  )
  const inline = await page.locator("style").allTextContents()
  const css = [...inline, ...await Promise.all(sheets.map(async (href) => (await page.request.get(href)).text()))].join("\n")
  expect(css.match(/\.signal-strip\[data-astro-cid-[\w-]+\]/g)?.length).toBeGreaterThan(0)
  expect(css.match(/(?:^|[,{])\s*\.signal-strip\s*[{,:]/g)).toBeNull()
})
