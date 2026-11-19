import { expect, test } from "@playwright/test"

function extractTransitionNames(html: string): string[] {
  const names = new Set<string>()
  const rule = /\[data-astro-transition-scope="[^"]+"\]\s*\{\s*view-transition-name:\s*([^;]+);/g

  for (const match of html.matchAll(rule)) names.add(match[1].trim())

  return [...names]
}

test("article titles expose unique shared-element transition names", async ({ page }) => {
  await page.goto("/blog")
  const indexNames = extractTransitionNames(await page.content())

  expect(indexNames.length).toBeGreaterThan(1)
  expect(new Set(indexNames).size).toBe(indexNames.length)
  expect(indexNames.every((name) => name.startsWith("vt-article-title-"))).toBe(true)

  await page.goto("/blog/vulcania-monitoreo-volcanico-comunitario")
  const detailNames = extractTransitionNames(await page.content())

  expect(detailNames.length).toBeGreaterThanOrEqual(1)
  expect(new Set(detailNames).size).toBe(detailNames.length)
  for (const name of detailNames) expect(indexNames).toContain(name)
})

// The project cards this once covered no longer exist: the home renders a tab
// index, and the design shares the title element only between the blog index
// and the article, which the test above covers.
