import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test.describe("Home Accessibility", () => {
  test(
    "Spanish home has no critical accessibility violations",
    { tag: ["@critical", "@e2e", "@a11y", "@HOME-A11Y-001"] },
    async ({ page }) => {
      await page.goto("/")
      await page.waitForLoadState("networkidle")

      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    },
  )

  test(
    "English home has no critical accessibility violations",
    { tag: ["@critical", "@e2e", "@a11y", "@HOME-A11Y-002"] },
    async ({ page }) => {
      await page.goto("/en")
      await page.waitForLoadState("networkidle")

      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    },
  )
})
