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
      await page.waitForTimeout(250)
      const transform = await page.locator("[data-reading-progress]").evaluate((element) => getComputedStyle(element).transform)
      const scaleX = transform.match(/^matrix\(([^,]+)/)?.[1]
      expect(Number(scaleX)).toBeGreaterThan(0)

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
        const badge = document.querySelector(".available-badge")

        if (!hero || !nav || !badge) return null

        return {
          htmlClass: document.documentElement.className,
          heroColor: getComputedStyle(hero).color,
          heroBackground: getComputedStyle(hero).backgroundImage,
          navColor: getComputedStyle(nav).color,
          navBackground: getComputedStyle(nav).backgroundColor,
          badgeBackground: getComputedStyle(badge).backgroundColor,
        }
      })

      expect(colors).not.toBeNull()
      expect(colors?.htmlClass).not.toMatch(/\bdark\b/)
      expect(colors?.heroColor).toBe("rgb(23, 19, 41)")
      expect(colors?.heroBackground).not.toContain("rgb(16, 20, 58)")
      expect(colors?.navColor).toBe("rgb(23, 23, 23)")
      expect(colors?.navBackground).toContain("255")
      expect(colors?.badgeBackground).toContain("220")
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
        { timeout: 4000 },
      )
      await expect(page.locator("[data-hero-webgl]")).toHaveAttribute(
        "data-webgl-status",
        /^(ready|fallback)$/,
        { timeout: 4000 },
      )

      await page.locator("#proyectos").scrollIntoViewIfNeeded()
      await page.waitForTimeout(350)
      const meterTransform = await page.locator("[data-project-scroll-meter] span").evaluate(
        (element) => getComputedStyle(element).transform,
      )
      const scaleX = meterTransform.match(/^matrix\(([^,]+)/)?.[1]
      expect(Number(scaleX)).toBeGreaterThan(0)
    },
  )

  test(
    "availability badge does not cover hero metadata",
    { tag: ["@e2e", "@home", "@HOME-E2E-005"] },
    async ({ page }) => {
      for (const viewport of [
        { width: 1280, height: 720 },
        { width: 390, height: 844 },
      ]) {
        await page.setViewportSize(viewport)
        await page.goto("/")

        const geometry = await page.evaluate(() => {
          const badge = document.querySelector(".hero-art-status")?.getBoundingClientRect()
          const metadata = document.querySelector(".hero-art-tag-bottom")?.getBoundingClientRect()

          if (!badge || !metadata) return null

          return {
            overlaps: badge.left < metadata.right
              && badge.right > metadata.left
              && badge.top < metadata.bottom
              && badge.bottom > metadata.top,
          }
        })

        expect(geometry).not.toBeNull()
        expect(geometry?.overlaps).toBe(false)
      }
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
