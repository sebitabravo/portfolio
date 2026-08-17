import { expect, test } from "@playwright/test"

test.describe("Judgment Day regression contracts", () => {
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
    await expect(page.locator("img[data-img-fallback]").first()).toHaveAttribute(
      "srcset",
      /-800\.webp 800w/,
    )
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

  test("preserves the legacy experience cascade after CSS layering", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto("/")

    const cascade = await page.locator("#experiencia").evaluate((section) => {
      const secondaryCard = section.querySelector<HTMLElement>(".experience-item-secondary .experience-item-card")
      const company = section.querySelector<HTMLElement>("h4")
      const location = section.querySelector<HTMLElement>(".experience-item p")

      return {
        secondaryPadding: secondaryCard ? getComputedStyle(secondaryCard).padding : null,
        companyFontSize: company ? getComputedStyle(company).fontSize : null,
        companyLineHeight: company ? getComputedStyle(company).lineHeight : null,
        locationLineHeight: location ? getComputedStyle(location).lineHeight : null,
      }
    })

    expect(cascade).toMatchObject({
      secondaryPadding: "18.4px 24px",
      companyFontSize: "20px",
      companyLineHeight: "24px",
    })
    expect(Number.parseFloat(cascade.locationLineHeight ?? "")).toBeCloseTo(19.2, 1)
  })
})
