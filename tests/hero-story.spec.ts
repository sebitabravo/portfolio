import { expect, test, type Locator, type Page } from "@playwright/test"

const opacity = (locator: Locator) => locator.evaluate((element) => Number(getComputedStyle(element).opacity))

// Lleva el scroll a un punto del tramo fijado: 0 cuando la pista toca el header, 1 cuando el escenario se suelta.
async function scrollToProgress(page: Page, progress: number) {
  await page.evaluate((value) => {
    const track = document.querySelector<HTMLElement>("[data-hero-story]")!
    const header = document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0
    const top = track.getBoundingClientRect().top + window.scrollY
    const distance = track.offsetHeight - (window.innerHeight - header)
    // Salto instantáneo: el sitio usa scroll suave y el test no debe medir a mitad del desplazamiento.
    window.scrollTo({ top: top - header + value * distance, behavior: "instant" })
  }, progress)
}

test.describe("Hero scrollytelling", () => {
  test("pins the screen and plays one act at a time", async ({ page }) => {
    await page.goto("/")
    const supported = await page.evaluate(() => CSS.supports("animation-timeline: view()"))
    test.skip(!supported, "Este navegador no ata animaciones al scroll; ver el caso estático.")

    const geometry = await page
      .locator("[data-hero-story]")
      .evaluate((element) => ({ height: element.getBoundingClientRect().height, viewport: window.innerHeight }))
    expect(geometry.height).toBeGreaterThan(geometry.viewport * 2)
    await expect(page.locator(".hero-story-stage")).toHaveCSS("position", "sticky")

    const acts = page.locator(".hero-story-act")
    await expect(acts).toHaveCount(3)
    expect(await opacity(acts.first())).toBeLessThan(0.05)

    await scrollToProgress(page, 0.54)
    await expect.poll(() => opacity(acts.nth(1))).toBeGreaterThan(0.95)
    await expect.poll(() => opacity(acts.nth(0))).toBeLessThan(0.05)
    await expect.poll(() => opacity(page.locator(".story-editor"))).toBeGreaterThan(0.95)

    await scrollToProgress(page, 0.95)
    await expect.poll(() => opacity(acts.nth(2))).toBeGreaterThan(0.95)
    await expect.poll(() => opacity(page.locator(".story-browser"))).toBeGreaterThan(0.95)
    await expect(page.locator(".story-browser .os-window-title")).toHaveText("vulcania-web.vercel.app")
  })

  test("reads the story as a static list under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/")

    const acts = page.locator(".hero-story-act")
    await expect(acts).toHaveText([/problema real/, /código/, /producción/])
    for (const act of await acts.all()) expect(await opacity(act)).toBe(1)
    await expect(page.locator(".hero-story-stage")).not.toHaveCSS("position", "sticky")
    await expect(page.locator(".story-window").first()).toBeHidden()
  })

  test("exposes the acts in order to assistive technology", async ({ page }) => {
    await page.goto("/en/")
    const story = page.locator(".hero-story-captions")
    await expect(story.getByRole("heading", { level: 2, name: "From concept to deployment" })).toBeAttached()
    await expect(story.getByRole("listitem")).toHaveCount(3)
    await expect(page.locator(".os-story")).toHaveAttribute("aria-hidden", "true")
  })
})

for (const viewport of [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
]) {
  test.describe(`hero LCP at ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport })

    test("keeps the hero title as the largest contentful paint", async ({ page, browserName }) => {
      // El presupuesto se audita con el LCP de Chromium (Lighthouse y Core Web Vitals);
      // Firefox y WebKit atribuyen el texto a otros elementos y no son la métrica que se mide.
      test.skip(browserName !== "chromium", "El LCP auditado es el de Chromium.")
      await page.goto("/")
      const supported = await page.evaluate(() =>
        PerformanceObserver.supportedEntryTypes.includes("largest-contentful-paint"),
      )
      test.skip(!supported, "Este navegador no expone Largest Contentful Paint.")

      const lcp = await page.evaluate(
        () =>
          new Promise<{ insideTitle: boolean; element: string }>((resolve) => {
            let latest: Element | null = null
            new PerformanceObserver((list) => {
              const entries = list.getEntries() as (PerformanceEntry & { element?: Element | null })[]
              latest = entries.at(-1)?.element ?? latest
            }).observe({ type: "largest-contentful-paint", buffered: true })
            setTimeout(() => {
              const element = latest ? `${latest.tagName.toLowerCase()}.${latest.className}` : "none"
              resolve({ insideTitle: Boolean(latest?.closest("h1")), element })
            }, 1200)
          }),
      )
      expect(lcp.insideTitle, `LCP element: ${lcp.element}`).toBe(true)
    })
  })
}
