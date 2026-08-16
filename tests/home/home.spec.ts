import { expect, test } from "@playwright/test"
import { HomePage } from "./home-page"

test.describe("Home Page", () => {
  test(
    "core sections and project filters work",
    { tag: ["@critical", "@e2e", "@home", "@HOME-E2E-001"] },
    async ({ page }) => {
      const homePage = new HomePage(page)

      await homePage.gotoSpanishHome()
      await homePage.verifyCoreSections()
      await homePage.verifyProjectFiltering()
    },
  )

  test(
    "mobile navigation, theme, language and reading progress work",
    { tag: ["@critical", "@e2e", "@home", "@HOME-E2E-002"] },
    async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto("/")

      const mobileMenu = page.locator("[data-dropdown-menu='mobile-nav-es']")
      const mobileTrigger = page.locator("[data-dropdown-trigger='mobile-nav-es']")
      await mobileTrigger.click()
      await expect(mobileMenu.getByRole("link", { name: "Contacto", exact: true })).toBeVisible()
      await expect(mobileTrigger).toHaveAttribute("aria-expanded", "true")
      await page.keyboard.press("Escape")
      await expect(mobileTrigger).toHaveAttribute("aria-expanded", "false")

      await page.locator("#theme-toggle").click()
      await expect(page.locator("#theme-menu")).toBeVisible()
      await page.getByRole("menuitemradio", { name: "Oscuro", exact: true }).click()
      await expect(page.locator("html")).toHaveClass(/dark/)

      await page.locator("#proyectos").scrollIntoViewIfNeeded()
      await expect
        .poll(
          () => page.locator("[data-reading-progress]").evaluate((element) => {
            const match = element.getAttribute("style")?.match(/scaleX\(([^)]+)\)/)
            return Number(match?.[1] ?? 0)
          }),
          { timeout: 5000 },
        )
        .toBeGreaterThan(0)

      await expect(page.locator("#contacto").getByText("Descargar CV", { exact: true })).toBeVisible()

      await page.locator("#language-toggle").click()
      await page.getByRole("menuitemradio", { name: "English", exact: true }).click()
      await page.waitForURL("**/en/")
      await expect(page).toHaveURL(/\/en\/?$/)
    },
  )

  test(
    "light theme keeps hero and navigation coherent",
    { tag: ["@critical", "@e2e", "@a11y", "@HOME-E2E-006"] },
    async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("theme", "light"))
      await page.goto("/")

      const colors = await page.evaluate(() => {
        const hero = document.querySelector(".hero-gradient")
        const nav = document.querySelector(".site-nav")
        const status = document.querySelector(".hero-meta-status")

        if (!hero || !nav || !status) return null

        return {
          htmlClass: document.documentElement.className,
          heroColor: getComputedStyle(hero).color,
          heroBackground: getComputedStyle(hero).backgroundImage,
          navColor: getComputedStyle(nav).color,
          navBackground: getComputedStyle(nav).backgroundColor,
          statusColor: getComputedStyle(status).color,
        }
      })

      expect(colors).not.toBeNull()
      expect(colors?.htmlClass).not.toMatch(/\bdark\b/)
      expect(colors?.heroColor).toBe("rgb(23, 19, 41)")
      expect(colors?.heroBackground).not.toContain("rgb(16, 20, 58)")
      expect(colors?.navColor).toBe("rgb(23, 23, 23)")
      expect(colors?.navBackground).toContain("255")
      expect(colors?.statusColor).toBe("rgb(76, 82, 123)")
    },
  )

  test(
    "reduced motion keeps content visible and stops loops",
    { tag: ["@critical", "@e2e", "@a11y", "@HOME-E2E-003"] },
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" })
      await page.goto("/")
      await page.waitForTimeout(900)

      const state = await page.evaluate(() => {
        const animatedSelectors = [".hero-orbit", ".hero-orbit-dot", ".hero-ambient", ".signal-marquee"]
        const hiddenElements = Array.from(document.querySelectorAll("[data-animate], .hero-reveal"))
          .filter((element) => Number.parseFloat(getComputedStyle(element).opacity) < 0.99)
        const activeLoops = animatedSelectors.flatMap((selector) =>
          Array.from(document.querySelectorAll(selector)).filter((element) => getComputedStyle(element).animationName !== "none"),
        )

        return { hiddenCount: hiddenElements.length, activeLoopCount: activeLoops.length }
      })

      expect(state.hiddenCount).toBe(0)
      expect(state.activeLoopCount).toBe(0)
      await expect(page.locator("[data-hero-webgl]")).toHaveAttribute("data-webgl-status", "reduced")
    },
  )

  test(
    "progressive motion layer falls back safely and follows project scroll",
    { tag: ["@e2e", "@home", "@HOME-E2E-004"] },
    async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto("/")

      await expect(page.locator("[data-portfolio-motion]")).toHaveAttribute(
        "data-motion-status",
        /^(active|fallback)$/,
        { timeout: 10000 },
      )
      await expect(page.locator("[data-hero-webgl]")).toHaveAttribute(
        "data-webgl-status",
        /^(ready|fallback)$/,
        { timeout: 10000 },
      )

      await page.locator("#proyectos").scrollIntoViewIfNeeded()
      await expect
        .poll(
          () => page.locator("[data-project-scroll-meter] span").evaluate((element) => {
            const match = element.getAttribute("style")?.match(/scaleX\(([^)]+)\)/)
            return Number(match?.[1] ?? 0)
          }),
          { timeout: 5000 },
        )
        .toBeGreaterThan(0)
    },
  )

  test(
    "availability stays a single hero status instead of covering the visual",
    { tag: ["@e2e", "@home", "@HOME-E2E-005"] },
    async ({ page }) => {
      await page.goto("/")

      await expect(page.locator(".hero-meta-status")).toHaveCount(1)
      await expect(page.locator(".hero-art-status")).toHaveCount(0)
      await expect(page.locator(".hero-art-tag")).toHaveCount(0)
      await expect(page.locator(".hero-art-caption")).toHaveCount(0)
    },
  )

  test(
    "section bands keep one stack signal and add About conversion",
    { tag: ["@e2e", "@home", "@HOME-E2E-007"] },
    async ({ page }) => {
      await page.goto("/")

      await expect(page.locator("[data-section-band='tinted']")).toHaveCount(2)
      await expect(page.locator(".signal-strip")).toHaveCount(1)
      await expect(page.locator(".about-focus a")).toHaveAttribute("href", "#contacto")
      await expect(page.locator("#sobre-mi")).not.toContainText("Stack Tecnológico")
      await expect(page.locator("#sobre-mi .tech-item")).toHaveCount(0)
    },
  )
})
