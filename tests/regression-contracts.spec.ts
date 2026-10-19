import { expect, test } from "@playwright/test"
import { canonicalTechnologies } from "../src/lib/data/skills"

test.describe("Regression contracts", () => {
  test("keeps hero LCP visible, the stack accessible, and navigation controls accessible", async ({ page }) => {
    await page.goto("/")

    const heroState = await page.locator(".hero-title").evaluate((element) => {
      const styles = getComputedStyle(element)
      return { opacity: styles.opacity, filter: styles.filter }
    })
    expect(heroState).toEqual({ opacity: "1", filter: "none" })

    const signal = page.locator(".signal-strip")
    await expect(signal).toHaveAttribute("role", "region")
    await expect(signal).toHaveAttribute("aria-label", "Stack con el que construyo")
    // La copia del bucle es decorativa: el árbol accesible expone una sola lista.
    await expect(signal.getByRole("listitem")).toHaveText([...canonicalTechnologies])
    await expect(signal.locator("[aria-hidden='true'].signal-technologies")).toHaveCount(1)
    await expect(signal.locator("[data-duplicate], .signal-marquee")).toHaveCount(0)

    await expect(page.locator("#language-toggle")).toHaveAttribute("aria-haspopup", "menu")
    await expect(page.locator("#language-toggle")).toHaveAttribute("aria-controls", "language-menu")
    await expect(page.locator("#theme-toggle")).toHaveAttribute("aria-controls", "theme-menu")
    await expect(page.locator(".project-card-featured")).toHaveCount(1)
    const projectPicture = page.locator(".project-card-featured picture")
    const avifSource = projectPicture.locator('source[type="image/avif"]')
    const webpFallback = projectPicture.locator("img[data-img-fallback]")
    await expect(avifSource).toHaveAttribute("srcset", /\/_astro\/[^,\s]+\.avif 800w(?:,|$)/)
    await expect(avifSource).toHaveAttribute("srcset", /\/_astro\/[^,\s]+\.avif 1600w(?:,|$)/)
    await expect(webpFallback).toHaveAttribute("srcset", /\/_astro\/[^,\s]+\.webp 800w(?:,|$)/)
    await expect(webpFallback).toHaveAttribute("srcset", /\/_astro\/[^,\s]+\.webp 1600w(?:,|$)/)
  })

  for (const { route, label, pause, resume } of [
    { route: "/", label: "Stack con el que construyo", pause: "Pausar tecnologías en movimiento", resume: "Reanudar tecnologías en movimiento" },
    { route: "/en/", label: "The stack I build with", pause: "Pause moving technologies", resume: "Resume moving technologies" },
  ]) {
    test(`stack marquee loops with a pause control at ${route}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" })
      await page.goto(route)
      const signal = page.getByRole("region", { name: label, exact: true })
      await signal.scrollIntoViewIfNeeded()
      await expect(signal.getByRole("listitem")).toHaveText([...canonicalTechnologies])
      const track = signal.locator("[data-marquee-track]")
      expect(await track.evaluate((element) => element.getAnimations().length)).toBe(1)

      const toggle = signal.getByRole("button", { name: pause, exact: true })
      await toggle.click()
      await expect(signal).toHaveAttribute("data-paused", "true")
      await expect(signal.getByRole("button", { name: resume, exact: true })).toBeVisible()
      // Pausado no se mueve aunque el puntero salga de la banda.
      await page.mouse.move(0, 0)
      await expect.poll(() => track.evaluate((element) => element.getAnimations()[0]?.playState)).toBe("paused")
      await signal.getByRole("button", { name: resume, exact: true }).click()
      await expect(signal).toHaveAttribute("data-paused", "false")
      // Reanudar mueve la banda aunque el botón conserve el foco y el puntero siga encima.
      const toggleButton = signal.locator("[data-marquee-toggle]")
      await toggleButton.focus()
      await toggleButton.hover()
      await expect.poll(() => track.evaluate((element) => element.getAnimations()[0]?.playState)).toBe("running")

      // Desde el teclado el foco en el botón tampoco congela la marquesina.
      await page.mouse.move(0, 0)
      await page.keyboard.press("Enter")
      await expect(signal).toHaveAttribute("data-paused", "true")
      await page.keyboard.press("Enter")
      await expect(signal).toHaveAttribute("data-paused", "false")
      await expect.poll(() => track.evaluate((element) => element.getAnimations()[0]?.playState)).toBe("running")
    })

    test(`stack wraps without movement or controls at ${route} with reduced motion`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      await page.emulateMedia({ reducedMotion: "reduce" })
      await page.goto(route)
      const signal = page.getByRole("region", { name: label, exact: true })
      const technologies = signal.getByRole("listitem")
      await signal.scrollIntoViewIfNeeded()
      await expect(signal).toBeVisible()
      await expect(technologies).toHaveText([...canonicalTechnologies])
      await expect(signal.getByRole("list")).toHaveCSS("flex-wrap", "wrap")
      await expect(signal.getByRole("button")).toHaveCount(0)
      for (const technology of await technologies.all()) await expect(technology).toBeVisible()
      const state = await signal.evaluate((element) => {
        const items = [...element.querySelectorAll(".signal-technologies:not([aria-hidden]) li")]
        const bounds = element.getBoundingClientRect()
        return {
          animationCount: element.getAnimations({ subtree: true }).length,
          fits: items.every((item) => {
            const rect = item.getBoundingClientRect()
            return rect.left >= bounds.left && rect.right <= bounds.right
          }),
          rows: new Set(items.map((item) => Math.round(item.getBoundingClientRect().top))).size,
        }
      })
      expect(state.animationCount).toBe(0)
      expect(state.fits).toBe(true)
      expect(state.rows).toBeGreaterThan(1)
    })
  }

  test("English blog and project case studies never render the empty state", async ({ page }) => {
    await page.goto("/en/blog")
    await expect(page.locator("article")).not.toHaveCount(0)
    await expect(page.getByText("No articles published yet.")).not.toBeVisible()

    for (const slug of [
      "vulcania-monitoreo-volcanico-comunitario",
      "wenuke-asistente-climatico-whatsapp",
      "manttoai-ml-iot-random-forest",
      "rapido-sur-erp-mantenimiento-flotas",
      "vulcania-monitoreo-volcanico-comunitario-en",
      "manttoai-ml-iot-random-forest-en",
    ]) {
      const response = await page.request.get(`/en/blog/${slug}`)
      expect(response.status(), slug).toBe(200)
    }

    for (const slug of [
      "vulcania-monitoreo-volcanico-comunitario-en",
      "manttoai-ml-iot-random-forest-en",
    ]) {
      await page.goto(`/en/blog/${slug}`)
      await expect(page.locator("article[lang='en']")).toBeVisible()
      await expect(page.getByText("This article is currently available in Spanish.")).not.toBeVisible()
    }
  })

  test("renders experience as an exclusive disclosure table", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/")

    const rows = page.locator("#experiencia details.experience-item")
    await expect(rows).toHaveCount(2)
    await expect(rows.first()).toHaveAttribute("open", "")
    await expect(rows.nth(1)).not.toHaveAttribute("open", "")
    await expect(rows.first().locator("summary h3")).toHaveText("Desarrollador Full Stack")
    await expect(rows.first().locator(".experience-company")).toHaveText("MIMASOFT")
    await expect(rows.first().locator(".experience-copy")).toBeVisible()
    await expect(page.locator("#experiencia .experience-columns")).toHaveCSS("display", "grid")

    await rows.nth(1).locator("summary").click()
    await expect(rows.nth(1)).toHaveAttribute("open", "")
    await expect(rows.first()).not.toHaveAttribute("open", "")
    await expect(rows.nth(1).locator(".experience-copy")).toContainText("Telsur")

    await rows.nth(1).locator("summary").focus()
    await page.keyboard.press("Enter")
    await expect(rows.nth(1)).not.toHaveAttribute("open", "")
  })
})
