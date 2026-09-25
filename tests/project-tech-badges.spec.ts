import { expect, test } from "@playwright/test"

test.describe("project tech badges", () => {
  test("TypeScript badge is tinted with foreground text and its icon in light mode", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "light"))
    await page.goto("/")

    const badge = page.locator(".project-tech-badge", { hasText: "TypeScript" }).first()
    await expect(badge).toBeVisible()

    const styles = await badge.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { bg: cs.backgroundColor, border: cs.borderColor, color: cs.color, hasIcon: !!el.querySelector("svg") }
    })

    expect(styles.bg).not.toBe("rgba(0, 0, 0, 0)")
    expect(styles.border).not.toBe("rgba(0, 0, 0, 0)")
    // Brand hues on pastel tints miss WCAG AA in light mode, so text stays foreground.
    expect(styles.color).toBe("rgb(41, 40, 39)")
    expect(styles.hasIcon).toBe(true)
  })

  test("TypeScript badge shows its brand color as text in dark mode", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "dark"))
    await page.goto("/")

    const badge = page.locator(".project-tech-badge", { hasText: "TypeScript" }).first()
    await expect(badge).toBeVisible()

    const styles = await badge.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { bg: cs.backgroundColor, color: cs.color, hasIcon: !!el.querySelector("svg") }
    })

    expect(styles.color).toBe("rgb(49, 120, 198)")
    expect(styles.bg).not.toBe("rgba(0, 0, 0, 0)")
    expect(styles.hasIcon).toBe(true)
  })
})
