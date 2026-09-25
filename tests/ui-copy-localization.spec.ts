import { expect, test } from "@playwright/test"

const notFoundRoutes = [
  {
    path: "/404", lang: "es", home: "/",
    description: "La página que buscás no existe.",
    heading: "Esta página se perdió en el deploy",
    message: "No encontramos lo que buscabas. Volvé al inicio y seguimos desde ahí.",
    backHome: "Volver al inicio",
  },
  {
    path: "/en/404", lang: "en", home: "/en",
    description: "The page you requested does not exist.",
    heading: "This page got lost in deployment",
    message: "We could not find what you asked for. Jump back home and keep exploring.",
    backHome: "Back to home",
  },
] as const

for (const route of notFoundRoutes) {
  test(`${route.path} renders localized not-found copy and preserves metadata and home link`, async ({ page }) => {
    await page.goto(route.path)
    await expect(page.locator("html")).toHaveAttribute("lang", route.lang)
    await expect(page).toHaveTitle(/^404 \| Sebastian Bravo$/)
    await expect(page.locator('head meta[name="description"]')).toHaveAttribute("content", route.description)
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute("href", `https://sebita.dev${route.path}`)
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", /\bnoindex\b/i)
    const main = page.getByRole("main")
    await expect(main.getByRole("heading", { name: route.heading, level: 1 })).toBeVisible()
    await expect(main.getByText(route.message, { exact: true })).toBeVisible()
    await expect(main.getByRole("link", { name: route.backHome })).toHaveAttribute("href", route.home)
  })
}

for (const route of [
  { path: "/blog/manttoai-ml-iot-random-forest", landmark: "Navegación del artículo" },
  { path: "/en/blog/manttoai-ml-iot-random-forest-en", landmark: "Post navigation" },
] as const) {
  test(`${route.path} names the article navigation in its locale`, async ({ page }) => {
    await page.goto(route.path)
    await expect(page.getByRole("navigation", { name: route.landmark, exact: true })).toBeVisible()
    await expect(page.locator("main#main-content article .prose-custom")).not.toBeEmpty()
  })
}
