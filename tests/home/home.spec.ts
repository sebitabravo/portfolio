import { expect, test } from "@playwright/test"

test.describe("Home Page", () => {
  test("home alternates keep locale-first order and the Spanish default target", async ({ page }) => {
    for (const [route, expected] of [
      ["/", [
        { hreflang: "es", href: "https://sebita.dev" },
        { hreflang: "en", href: "https://sebita.dev/en/" },
        { hreflang: "x-default", href: "https://sebita.dev" },
      ]],
      ["/en/", [
        { hreflang: "en", href: "https://sebita.dev/en/" },
        { hreflang: "es", href: "https://sebita.dev" },
        { hreflang: "x-default", href: "https://sebita.dev" },
      ]],
    ] as const) {
      await page.goto(route)
      const links = await page.locator('head link[rel="alternate"][hreflang]').evaluateAll((elements) =>
        elements.map((element) => ({ hreflang: element.getAttribute("hreflang"), href: element.getAttribute("href") })),
      )
      expect(links).toEqual(expected)
    }
  })
})
