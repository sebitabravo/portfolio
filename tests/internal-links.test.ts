// Contrato de enlaces internos (S4): ningún href con fragmento del sitio construido
// puede apuntar a un id que no exista, y ninguna ruta interna puede quedar pegada al
// prefijo de idioma (`/en` + `blog` = `/enblog`). El build tiene que existir; en CI el
// unit suite corre antes del build, así que el test se salta con un mensaje claro.
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const DIST = join(ROOT, "dist")

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return htmlFiles(path)
    return entry.name.endsWith(".html") ? [path] : []
  })
}

const hrefs = (html: string): string[] =>
  [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1] as string)

const ids = (html: string): Set<string> =>
  new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1] as string))

describe.runIf(existsSync(DIST))("internal link contract", () => {
  const files = existsSync(DIST) ? htmlFiles(DIST) : []
  const byRoute = new Map<string, string>()
  for (const file of files) {
    byRoute.set(file.slice(DIST.length).replace(/index\.html$/, "").replace(/\.html$/, ""), readFileSync(file, "utf8"))
  }

  it("never links to a fragment that does not exist on the target page", () => {
    const dangling: string[] = []
    for (const [route, html] of byRoute) {
      for (const href of hrefs(html)) {
        if (!href.includes("#") || /^https?:/.test(href)) continue
        const [path, fragment] = href.split("#")
        if (!fragment) continue
        // Un href que empieza con `#` navega dentro de la misma página (los índices
        // de los posts usan ese formato); solo los que traen ruta se resuelven aparte.
        const target = path === "" ? html : (byRoute.get(path) ?? byRoute.get(path.replace(/\/$/, "")) ?? byRoute.get(`${path}/`))
        if (!target) continue
        if (!ids(target).has(fragment)) dangling.push(`${path === "" ? route : path}#${fragment}`)
      }
    }
    expect([...new Set(dangling)].slice(0, 10), "anclas internas sin destino").toEqual([])
  })

  it("never glues a path onto a locale prefix", () => {
    const glued: string[] = []
    for (const [route, html] of byRoute) {
      for (const href of hrefs(html)) {
        if (/\/(en|es)(blog|links|privacy|404)/.test(href)) glued.push(`${route} -> ${href}`)
      }
    }
    expect([...new Set(glued)].slice(0, 10), "rutas internas sin barra").toEqual([])
  })

  it("keeps the retired cal.com agenda out of the built site", () => {
    const offenders = [...byRoute].filter(([, html]) => /cal\.com/i.test(html)).map(([route]) => route)
    expect(offenders, "cal.com sigue en el build").toEqual([])
  })
})
