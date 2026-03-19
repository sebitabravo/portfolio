import { test } from "@playwright/test"
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
})
