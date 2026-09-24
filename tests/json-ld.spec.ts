import { expect, test, type Page } from "@playwright/test"

type Node = Record<string, unknown> & { "@type": string }

async function schemas(page: Page) {
  return page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
    scripts.map((script) => JSON.parse(script.textContent ?? "")),
  ) as Promise<Array<{ "@graph"?: Node[] } & Node>>
}

for (const [route, locale] of [["/", "es"], ["/en/", "en"]] as const) {
  test(`home ${locale} exposes one canonical WebPage alongside Person and WebSite`, async ({ page }) => {
    await page.goto(route)
    const documents = await schemas(page)
    const nodes = documents.flatMap((document) => document["@graph"] ?? [document])
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href")
    const title = await page.title()
    const description = await page.locator('meta[name="description"]').getAttribute("content")

    expect(documents.every((document) => document["@context"] === "https://schema.org")).toBe(true)
    expect(nodes.map((node) => node["@type"]).sort()).toEqual(["Person", "WebPage", "WebSite"])
    expect(nodes.find((node) => node["@type"] === "WebPage")).toMatchObject({
      name: title, description, url: canonical, inLanguage: locale,
    })
    expect(nodes.find((node) => node["@type"] === "WebSite")).toMatchObject({
      url: "https://sebita.dev", inLanguage: locale, description,
    })
    expect(nodes.find((node) => node["@type"] === "Person")).toMatchObject({
      name: await page.locator('meta[name="author"]').getAttribute("content"),
      url: `https://sebita.dev${route}`, description,
    })
  })
}

for (const [route, locale] of [
  ["/blog/manttoai-ml-iot-random-forest", "es"],
  ["/en/blog/manttoai-ml-iot-random-forest-en", "en"],
] as const) {
  test(`blog ${locale} exposes a single Article and canonical WebPage`, async ({ page }) => {
    await page.goto(route)
    const documents = await schemas(page)
    const nodes = documents.flatMap((document) => document["@graph"] ?? [document])
    const article = nodes.find((node) => node["@type"] === "Article")
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href")
    const published = await page.locator("article time[datetime]").getAttribute("datetime")

    expect(nodes.map((node) => node["@type"]).sort()).toEqual(["Article", "Person", "WebPage", "WebSite"])
    expect(nodes.find((node) => node["@type"] === "WebPage")).toMatchObject({
      name: await page.title(), url: canonical, inLanguage: locale,
      description: await page.locator('meta[name="description"]').getAttribute("content"),
    })
    expect(article).toMatchObject({
      headline: await page.locator("article h1").innerText(),
      datePublished: published,
      author: { "@type": "Person", name: await page.locator('meta[name="author"]').getAttribute("content"), url: "https://sebita.dev" },
      publisher: { "@type": "Organization", name: await page.locator('meta[name="author"]').getAttribute("content") },
    })
    expect(article).not.toHaveProperty("dateModified")
  })
}

test("English fallback article keeps its Spanish canonical and one Article node", async ({ page }) => {
  await page.goto("/en/blog/bot-discord-moderacion-musica")
  const nodes = (await schemas(page)).flatMap((document) => document["@graph"] ?? [document])
  expect(nodes.map((node) => node["@type"]).sort()).toEqual(["Article", "Person", "WebPage", "WebSite"])
  expect(nodes.find((node) => node["@type"] === "WebPage")).toMatchObject({
    url: await page.locator('link[rel="canonical"]').getAttribute("href"), inLanguage: "en",
  })
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://sebita.dev/blog/bot-discord-moderacion-musica")
  expect(nodes.find((node) => node["@type"] === "Article")).toMatchObject({
    headline: await page.locator("article h1").innerText(),
  })
})
