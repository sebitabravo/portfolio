import { expect, test } from "@playwright/test"

for (const theme of ["light", "dark"]) {
  test(`project technologies are readable mono chips in ${theme} mode`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem("theme", value), theme)
    await page.goto("/")
    const cards = page.locator("[data-project-card]")
    await expect(cards).toHaveCount(4)
    for (const card of await cards.all()) {
      await card.scrollIntoViewIfNeeded()
      const tags = card.getByLabel("Tecnologías", { exact: true })
      await expect(tags).toBeVisible()
      const expected = (await card.getAttribute("data-project-tags"))!.split(",").slice(0, 4)
      const chips = tags.locator(".chip")
      await expect(chips).toHaveText(expected)
      await expect(tags.locator("svg, .tech-badge, .project-tech-badge")).toHaveCount(0)
      await expect(chips.first()).toHaveCSS("font-size", "11px")
      await expect(chips.first()).toHaveCSS("text-transform", "uppercase")
      await expect(chips.first()).toHaveCSS("border-top-width", "1px")
      await expect(chips.first()).toHaveCSS("color", theme === "light" ? "rgb(90, 82, 70)" : "rgb(166, 162, 154)")
    }
  })
}
