import { expect, test } from "@playwright/test"
import { personalInfo } from "../src/lib/data/personal"

for (const { path, label } of [
  { path: "/privacy", label: "Correo electrónico:" },
  { path: "/en/privacy", label: "Email:" },
]) {
  test(`${path} separates the email label from the address`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator("main")).toContainText(`${label} ${personalInfo.email}`)
  })
}
