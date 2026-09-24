import { expect, test, type Page } from "@playwright/test"
import type { Locale } from "../src/lib/i18n"

async function switchLanguage(page: Page, language: Locale) {
  await page.locator("#language-toggle").click()
  await page.locator(`#language-menu [data-lang="${language}"]`).click()
}

async function expectArticle(page: Page, path: string, heading: string, body: string) {
  await expect(page).toHaveURL(new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?$`))
  const article = page.locator("main#main-content article")
  await expect(article.locator("header h1")).toHaveText(heading)
  await expect(article.locator(".prose-custom")).toContainText(body)
}

test("blog index alternates keep locale-first order and the Spanish default target", async ({ page }) => {
  for (const [route, expected] of [
    ["/blog", [
      { hreflang: "es", href: "https://sebita.dev/blog" },
      { hreflang: "en", href: "https://sebita.dev/en/blog" },
      { hreflang: "x-default", href: "https://sebita.dev/blog" },
    ]],
    ["/en/blog", [
      { hreflang: "en", href: "https://sebita.dev/en/blog" },
      { hreflang: "es", href: "https://sebita.dev/blog" },
      { hreflang: "x-default", href: "https://sebita.dev/blog" },
    ]],
  ] as const) {
    await page.goto(route)
    const links = await page.locator('head link[rel="alternate"][hreflang]').evaluateAll((elements) =>
      elements.map((element) => ({ hreflang: element.getAttribute("hreflang"), href: element.getAttribute("href") })),
    )
    expect(links).toEqual(expected)
  }
})

test("Spanish translated article switches to the paired English slug on the preview origin", async ({ page }) => {
  await page.goto("/blog/manttoai-ml-iot-random-forest")
  await expectArticle(page, "/blog/manttoai-ml-iot-random-forest", "Lo que aprendí construyendo una plataforma IoT con Machine Learning para predecir fallas industriales", "ManttoAI fue mi proyecto de título")
  await switchLanguage(page, "en")
  await expectArticle(page, "/en/blog/manttoai-ml-iot-random-forest-en", "ManttoAI: building an IoT predictive-maintenance platform with Machine Learning", "ManttoAI was my capstone project")
  expect(new URL(page.url()).origin).toBe("http://127.0.0.1:4321")
})

test("alternate query and hash take precedence over the source and stay on the local origin", async ({ page }) => {
  await page.goto("/blog/manttoai-ml-iot-random-forest?ref=reader#old-section")
  await page.locator('link[rel="alternate"][hreflang="en"]').evaluate((link) => {
    link.setAttribute("href", "https://sebita.dev/en/blog/manttoai-ml-iot-random-forest-en?from=language#the-stack")
  })
  await switchLanguage(page, "en")
  await expect(page).toHaveURL("http://127.0.0.1:4321/en/blog/manttoai-ml-iot-random-forest-en?from=language#the-stack")
  await expect(page.locator("main article header h1")).toContainText("ManttoAI")
})

test("article alternates inherit the source query and hash when those are absent", async ({ page }) => {
  await page.goto("/blog/manttoai-ml-iot-random-forest?ref=reader#the-stack")
  await switchLanguage(page, "en")
  await expect(page).toHaveURL("http://127.0.0.1:4321/en/blog/manttoai-ml-iot-random-forest-en?ref=reader#the-stack")
  await expect(page.locator("main article header h1")).toContainText("ManttoAI")
})

test("Spanish fallback and English-only blog index keep the source query and hash", async ({ page }) => {
  await page.goto("/blog/bot-discord-moderacion-musica?ref=reader#stack")
  await switchLanguage(page, "en")
  await expect(page).toHaveURL("http://127.0.0.1:4321/en/blog/bot-discord-moderacion-musica?ref=reader#stack")
  await page.goto("/en/blog/manttoai-ml-iot-random-forest-en?ref=reader#stack")
  await page.locator('link[rel="alternate"][hreflang="es"]').evaluate((link) => link.remove())
  await switchLanguage(page, "es")
  await expect(page).toHaveURL("http://127.0.0.1:4321/blog?ref=reader#stack")
  await expect(page.locator("main#main-content h1")).toHaveText("Blog")
})

test("home section fragments translate between locales while preserving the query", async ({ page }) => {
  await page.goto("/?ref=reader#proyectos")
  await switchLanguage(page, "en")
  await expect(page).toHaveURL("http://127.0.0.1:4321/en/?ref=reader#projects")
  await expect(page.locator("#projects")).toHaveCount(1)
  await switchLanguage(page, "es")
  await expect(page).toHaveURL("http://127.0.0.1:4321/?ref=reader#proyectos")
  await expect(page.locator("#proyectos")).toHaveCount(1)
})

test("non-home prefix routes preserve query/hash and same-locale selection avoids navigation", async ({ page }) => {
  let mainFrameNavigations = 0
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) mainFrameNavigations += 1
  })
  await page.goto("/privacy?ref=reader#section")
  const initialNavigationCount = mainFrameNavigations

  await switchLanguage(page, "es")
  await expect(page).toHaveURL("http://127.0.0.1:4321/privacy?ref=reader#section")
  expect(mainFrameNavigations).toBe(initialNavigationCount)

  await switchLanguage(page, "en")
  await expect(page).toHaveURL("http://127.0.0.1:4321/en/privacy?ref=reader#section")
  expect(mainFrameNavigations).toBeGreaterThan(initialNavigationCount)
  await expect(page.locator("main#main-content")).toBeVisible()
})

test("English translated article switches to the paired Spanish slug", async ({ page }) => {
  await page.goto("/en/blog/vulcania-monitoreo-volcanico-comunitario-en")
  await switchLanguage(page, "es")
  await expectArticle(page, "/blog/vulcania-monitoreo-volcanico-comunitario", "Vulcania: monitoreo volcánico comunitario con Next.js, Supabase y síntesis de audio", "Chile tiene más de 90 volcanes activos")
})

test("English fallback article returns to its original Spanish article", async ({ page }) => {
  await page.goto("/en/blog/bot-discord-moderacion-musica")
  await expect(page.locator("main article[lang=es] [role=note]")).toBeVisible()
  await switchLanguage(page, "es")
  await expectArticle(page, "/blog/bot-discord-moderacion-musica", "Un bot de Discord con 19 comandos, Lavalink y PostgreSQL: sistema de moderación y música con Docker", "Este bot tiene 19 comandos funcionales")
})

test("Spanish article without translation uses its generated English fallback", async ({ page }) => {
  await page.goto("/blog/bot-discord-moderacion-musica")
  await switchLanguage(page, "en")
  await expectArticle(page, "/en/blog/bot-discord-moderacion-musica", "Un bot de Discord con 19 comandos, Lavalink y PostgreSQL: sistema de moderación y música con Docker", "Este bot tiene 19 comandos funcionales")
  await expect(page.locator("main article[lang=es] [role=note]")).toBeVisible()
})

test("an English article without a Spanish alternate goes to the Spanish blog index", async ({ page }) => {
  await page.goto("/en/blog/manttoai-ml-iot-random-forest-en")
  // No English-only article is published yet; remove its pair to exercise the missing-alternate branch.
  await page.locator('link[rel="alternate"][hreflang="es"]').evaluate((link) => link.remove())
  await switchLanguage(page, "es")
  await expect(page).toHaveURL(/\/blog\/?$/)
  await expect(page.locator("main#main-content h1")).toHaveText("Blog")
  await expect(page.locator("main#main-content")).toContainText("Escribo sobre lo que aprendo construyendo")
})
