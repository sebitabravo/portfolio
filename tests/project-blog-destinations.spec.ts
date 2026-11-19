import { expect, test } from "@playwright/test"
import { homeSectionFragment } from "../src/lib/home-sections"

for (const { locale, dataLocale, home, blogPrefix } of [
  { locale: "español", dataLocale: "es", home: "/", blogPrefix: "/blog/" },
  { locale: "inglés", dataLocale: "en", home: "/en/", blogPrefix: "/en/blog/" },
] as const) {
  test(`cada proyecto en ${locale} enlaza a un artículo generado`, async ({ page }) => {
    await page.goto(home)
    const homeUrl = new URL(page.url())
    expect(["127.0.0.1", "localhost", "[::1]"]).toContain(homeUrl.hostname)

    const links = page.locator(`${homeSectionFragment(dataLocale, "work")} a[href^="${blogPrefix}"]`)
    const count = await links.count()
    expect(count, `No hay enlaces a casos en ${home}`).toBeGreaterThan(0)

    const destinations: { slug: string; href: string }[] = []
    for (let index = 0; index < count; index++) {
      const href = await links.nth(index).getAttribute("href")
      expect(href, `Enlace sin URL en ${home}`).toBeTruthy()
      const slug = href!.split("/").filter(Boolean).pop()!
      destinations.push({ slug, href: href! })
    }

    for (const { slug, href } of destinations) {
      await test.step(`Proyecto ${slug}: ${href}`, async () => {
        const url = new URL(href, homeUrl)
        const context = `Proyecto ${slug}: ${url.href}`
        expect(url.origin, context).toBe(homeUrl.origin)
        expect(url.pathname.startsWith(blogPrefix), context).toBe(true)

        const response = await page.goto(`${url.pathname}${url.search}${url.hash}`, { waitUntil: "domcontentloaded" })
        expect(response?.status(), context).toBe(200)
        expect(response?.url(), context).toBe(new URL(`${url.pathname}${url.search}`, homeUrl).href)
        const article = page.locator("main#main-content article")
        await expect(article, context).toHaveCount(1)
        await expect(article.locator("header h1"), context).toHaveText(/\S/)
        await expect(article.locator(".prose"), context).toContainText(/\S/)

        if (dataLocale === "en") {
          const articleLanguage = await article.getAttribute("lang")
          const fallbackNotice = article.getByRole("note")
          if (articleLanguage === "es") {
            await expect(fallbackNotice, context).toHaveText(/\S/)
          } else {
            expect(articleLanguage, context).toBe("en")
            await expect(fallbackNotice, context).toHaveCount(0)
          }
        }
      })
    }
  })
}
