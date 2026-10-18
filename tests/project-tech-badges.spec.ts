import { expect, test } from "@playwright/test"

for (const theme of ["light", "dark"]) {
  test(`project technologies are plain readable text in ${theme} mode`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem("theme", value), theme)
    await page.goto("/")
    const cards = page.locator("[data-project-card]")
    await expect(cards).toHaveCount(4)
    for (const card of await cards.all()) {
      await card.scrollIntoViewIfNeeded()
      const tags = card.getByLabel("Tecnologías", { exact: true })
      await expect(tags).toBeVisible()
      const expected = (await card.getAttribute("data-project-tags"))!.split(",").slice(0, 5)
      await expect(tags.locator("span:not([aria-hidden])")).toHaveText(expected)
      await expect(tags.locator('[aria-hidden="true"]')).toHaveText(expected.slice(1).map(() => "·"))
      await expect(tags.locator("svg, .tech-badge, .project-tech-badge")).toHaveCount(0)
      await expect(tags).toHaveCSS("font-size", "13px")
      await expect(tags).toHaveCSS("background-color", "rgba(0, 0, 0, 0)")
      await expect(tags).toHaveCSS("color", theme === "light" ? "rgb(92, 88, 81)" : "rgb(162, 155, 144)")
      await expect(tags).toHaveCSS("border-top-width", "0px")
    }
  })
}
