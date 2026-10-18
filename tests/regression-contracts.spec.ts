import { expect, test } from "@playwright/test"
import { canonicalTechnologies } from "../src/lib/data/skills"

test.describe("Regression contracts", () => {
  test("keeps hero LCP visible, the stack static, and navigation controls accessible", async ({ page }) => {
    await page.goto("/")

    const heroState = await page.locator(".hero-title").evaluate((element) => {
      const styles = getComputedStyle(element)
      return { opacity: styles.opacity, filter: styles.filter }
    })
    expect(heroState).toEqual({ opacity: "1", filter: "none" })

    const signal = page.locator(".signal-strip")
    await expect(signal).toHaveAttribute("role", "region")
    await expect(signal).toHaveAttribute("aria-label", "Stack con el que construyo")
    await expect(signal.getByRole("listitem")).toHaveText([...canonicalTechnologies])
    await expect(signal.locator("[data-duplicate], [aria-hidden='true'].signal-technologies")).toHaveCount(0)
    await expect(signal.getByRole("button")).toHaveCount(0)
    await expect(signal.locator(".signal-marquee")).toHaveCount(0)
    expect(await signal.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0)

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

  for (const { route, label } of [
    { route: "/", label: "Stack con el que construyo" },
    { route: "/en/", label: "The stack I build with" },
  ]) {
    for (const reducedMotion of ["no-preference", "reduce"] as const) {
      test(`stack wraps without movement at ${route} with ${reducedMotion}`, async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 })
        await page.emulateMedia({ reducedMotion })
        await page.goto(route)
        const signal = page.getByRole("region", { name: label, exact: true })
        const technologies = signal.getByRole("listitem")
        await signal.scrollIntoViewIfNeeded()
        await expect(signal).toBeVisible()
        await expect(technologies).toHaveText([...canonicalTechnologies])
        await expect(signal.getByRole("list")).toHaveCSS("flex-wrap", "wrap")
        await expect(signal.getByRole("button")).toHaveCount(0)
        for (const technology of await technologies.all()) {
          await expect(technology).toBeVisible()
          await expect(technology).toHaveCSS("font-size", "13px")
        }
        const state = await signal.evaluate((element) => {
          const items = [...element.querySelectorAll("li")]
          const bounds = element.getBoundingClientRect()
          return {
            animationCount: element.getAnimations({ subtree: true }).length,
            fits: items.every((item) => {
              const rect = item.getBoundingClientRect()
              return rect.left >= bounds.left && rect.right <= bounds.right
            }),
            rows: new Set(items.map((item) => item.getBoundingClientRect().top)).size,
          }
        })
        expect(state.animationCount).toBe(0)
        expect(state.fits).toBe(true)
        expect(state.rows).toBeGreaterThan(1)
      })
    }
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

  test("renders experience as unboxed editorial rows", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto("/")

    const cascade = await page.locator("#experiencia").evaluate((section) => {
      const secondaryRow = section.querySelector<HTMLElement>(".experience-item-secondary")
      const company = section.querySelector<HTMLElement>("h4")
      const location = section.querySelector<HTMLElement>(".experience-meta p")

      return {
        secondaryBorder: secondaryRow ? getComputedStyle(secondaryRow).borderTopWidth : null,
        secondaryBackground: secondaryRow ? getComputedStyle(secondaryRow).backgroundColor : null,
        secondaryShadow: secondaryRow ? getComputedStyle(secondaryRow).boxShadow : null,
        secondaryDisplay: secondaryRow ? getComputedStyle(secondaryRow).display : null,
        companyFontSize: company ? getComputedStyle(company).fontSize : null,
        companyLineHeight: company ? getComputedStyle(company).lineHeight : null,
        locationLineHeight: location ? getComputedStyle(location).lineHeight : null,
      }
    })

    expect(cascade).toMatchObject({
      secondaryBorder: "0px",
      secondaryBackground: "rgba(0, 0, 0, 0)",
      secondaryShadow: "none",
      secondaryDisplay: "grid",
      companyFontSize: "21px",
      companyLineHeight: "24px",
    })
    expect(Number.parseFloat(cascade.locationLineHeight ?? "")).toBeCloseTo(20.8, 1)
  })
})
