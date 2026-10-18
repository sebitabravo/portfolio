import { expect, test } from "@playwright/test"

for (const theme of ["light", "dark"]) {
  test(`project technologies are readable text chips in ${theme} mode`, async ({ page }) => {
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
      // Etiqueta de dato en la fuente de texto: tamaño legible, sin mayúsculas forzadas ni borde.
      await expect(chips.first()).toHaveCSS("font-size", "13px")
      await expect(chips.first()).toHaveCSS("text-transform", "none")
      await expect(chips.first()).toHaveCSS("border-top-width", "0px")
      await expect(chips.first()).not.toHaveCSS("font-family", /Mono/)
      await expect(chips.first()).toHaveCSS(
        "color",
        theme === "light" ? "rgba(23, 20, 15, 0.82)" : "rgba(243, 239, 230, 0.82)",
      )
    }
  })
}
