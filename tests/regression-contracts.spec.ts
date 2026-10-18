import { expect, test } from "@playwright/test"

test.describe("Regression contracts", () => {
  test("keeps hero LCP visible and motion controls accessible", async ({ page }) => {
    await page.goto("/")

    const heroState = await page.locator(".hero-title").evaluate((element) => {
      const styles = getComputedStyle(element)
      return { opacity: styles.opacity, filter: styles.filter }
    })
    expect(heroState).toEqual({ opacity: "1", filter: "none" })

    const signal = page.locator(".signal-strip")
    const signalToggle = page.locator("[data-signal-toggle]")
    await expect(signal).toHaveAttribute("role", "region")
    await expect(signalToggle).toHaveAttribute("aria-pressed", "false")
    await expect(signalToggle).toHaveAttribute("aria-label", /Pausar/)
    await signalToggle.click()
    await expect(signal).toHaveClass(/is-paused/)
    await expect(signalToggle).toHaveAttribute("aria-pressed", "true")
    await expect(signalToggle).toHaveAttribute("aria-label", /Reanudar/)

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
