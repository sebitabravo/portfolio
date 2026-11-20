import { existsSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { SITE, buildSitemap, buildSitemapIndex, isIndexable, pageUrl } from "../src/lib/sitemap"

describe("pageUrl", () => {
  it.each([
    ["index.html", `${SITE}/`],
    ["blog/index.html", `${SITE}/blog/`],
    ["en/blog/post-en/index.html", `${SITE}/en/blog/post-en/`],
  ])("maps %s to %s", (file, url) => {
    expect(pageUrl(file)).toBe(url)
  })

  it("ignores bare html files such as the 404", () => {
    expect(pageUrl("404.html")).toBeNull()
    expect(pageUrl("en/404.html")).toBeNull()
  })
})

describe("isIndexable", () => {
  it("rejects noindex pages and accepts the rest", () => {
    expect(isIndexable('<meta name="robots" content="noindex, nofollow">')).toBe(false)
    expect(isIndexable('<meta name="robots" content="index, follow">')).toBe(true)
    expect(isIndexable("<html></html>")).toBe(true)
  })
})

describe("buildSitemap", () => {
  it("sorts URLs and escapes XML special characters", () => {
    const xml = buildSitemap([`${SITE}/b/`, `${SITE}/a/?x=1&y=2`])
    expect(xml.indexOf("/a/")).toBeLessThan(xml.indexOf("/b/"))
    expect(xml).toContain("?x=1&amp;y=2")
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
  })

  it("points the index at the single sitemap file robots.txt expects", () => {
    expect(buildSitemapIndex(`${SITE}/sitemap-0.xml`)).toContain(`<loc>${SITE}/sitemap-0.xml</loc>`)
    expect(readFileSync("public/robots.txt", "utf8")).toContain(`Sitemap: ${SITE}/sitemap-index.xml`)
  })
})

describe.runIf(existsSync("dist/sitemap-0.xml"))("built sitemap", () => {
  const xml = existsSync("dist/sitemap-0.xml") ? readFileSync("dist/sitemap-0.xml", "utf8") : ""
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])

  it("lists the home pages and no 404", () => {
    expect(locs).toContain(`${SITE}/`)
    expect(locs).toContain(`${SITE}/en/`)
    expect(locs.some((url) => url.includes("404"))).toBe(false)
  })

  it("has no duplicate URLs", () => {
    expect(new Set(locs).size).toBe(locs.length)
  })
})
