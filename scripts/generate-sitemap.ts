// Escribe dist/sitemap-0.xml y dist/sitemap-index.xml a partir de las páginas ya construidas.
// robots.txt apunta a sitemap-index.xml, así que los nombres de archivo no cambian.
import { readFile, readdir, writeFile } from "node:fs/promises"
import { SITE, buildSitemap, buildSitemapIndex, isIndexable, pageUrl } from "../src/lib/sitemap"

const DIST = "dist"
const urls: string[] = []

for (const entry of await readdir(DIST, { recursive: true })) {
  const file = entry.split("\\").join("/")
  if (!file.endsWith("index.html")) continue
  const url = pageUrl(file)
  if (url && isIndexable(await readFile(`${DIST}/${file}`, "utf8"))) urls.push(url)
}

if (urls.length === 0) throw new Error("generate-sitemap: dist/ no tiene páginas indexables; corré el build antes")

await writeFile(`${DIST}/sitemap-0.xml`, buildSitemap(urls))
await writeFile(`${DIST}/sitemap-index.xml`, buildSitemapIndex(`${SITE}/sitemap-0.xml`))
console.log(`Sitemap written: ${urls.length} URLs`)
