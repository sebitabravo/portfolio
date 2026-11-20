// Sitemap hecho a mano (reemplaza a @astrojs/sitemap): una URL por cada index.html del build
// que no sea noindex. Funciones puras; scripts/generate-sitemap.ts hace el recorrido de dist/.
export const SITE = "https://sebita.dev"

const escapeXml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** "blog/x/index.html" -> "https://sebita.dev/blog/x/"; los .html sueltos (404) no son páginas indexables. */
export function pageUrl(htmlPath: string): string | null {
  if (htmlPath === "index.html") return `${SITE}/`
  if (!htmlPath.endsWith("/index.html")) return null
  return `${SITE}/${htmlPath.slice(0, -"index.html".length)}`
}

export function isIndexable(html: string): boolean {
  const robots = html.match(/<meta\s+name="robots"\s+content="([^"]*)"/)
  return !(robots && /noindex/.test(robots[1]))
}

export function buildSitemap(urls: readonly string[]): string {
  const entries = [...urls].sort().map((url) => `<url><loc>${escapeXml(url)}</loc></url>`)
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join("")}</urlset>`
}

export function buildSitemapIndex(sitemapUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${escapeXml(sitemapUrl)}</loc></sitemap></sitemapindex>`
}
