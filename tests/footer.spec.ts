// El pie agrupa enlaces en dos <nav> con rótulo. Astro recorta el espacio entre
// elementos inline, así que sin una regla de layout propia los enlaces quedaban
// pegados ("githublinkedin", "BlogPrivacidad"). Este contrato mide la caja real
// de cada enlace: dos enlaces consecutivos nunca pueden tocarse.
import { expect, test } from "@playwright/test"

const ROUTES = ["/", "/en/"]

for (const route of ROUTES) {
  for (const width of [390, 1440]) {
    test(`footer links are separated on ${route} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(route)
      const groups = page.locator("footer nav")
      const count = await groups.count()
      expect(count).toBeGreaterThanOrEqual(2)

      for (let g = 0; g < count; g++) {
        const links = groups.nth(g).locator("a")
        const total = await links.count()
        expect(total, `footer nav ${g} on ${route}`).toBeGreaterThanOrEqual(2)

        const boxes = await links.evaluateAll((nodes) =>
          nodes.map((node) => {
            const rect = node.getBoundingClientRect()
            return { text: (node.textContent ?? "").trim(), left: rect.left, right: rect.right, top: rect.top }
          }),
        )

        for (let i = 1; i < boxes.length; i++) {
          const previous = boxes[i - 1]
          const current = boxes[i]
          if (Math.abs(previous.top - current.top) > 2) continue // wrapped to another row
          const gap = current.left - previous.right
          expect(
            gap,
            `"${previous.text}" y "${current.text}" están pegados en ${route} (${width}px)`,
          ).toBeGreaterThanOrEqual(8)
        }
      }
    })
  }
}
