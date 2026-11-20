// El sitio se sirve detrás de Cloudflare, que por defecto reescribe cualquier <a>
// cuyo texto sea una dirección completa a "[email protected]" y la decodifica con un
// script que nuestra CSP bloquea — el placeholder quedaba visible en producción.
// La dirección se renderiza partida en spans (usuario / @ / dominio), igual que el
// CTA de contacto, que Cloudflare deja intacto. Este contrato fija esa forma.
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { personalInfo } from "../src/lib/data/personal"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const DIST = join(ROOT, "dist")
const PAGES = ["index.html", "en/index.html", "privacy/index.html", "en/privacy/index.html"]

const mailtoAnchors = (html: string): string[] =>
  [...html.matchAll(/<a\b[^>]*href="mailto:[^"]*"[^>]*>[\s\S]*?<\/a>/g)].map((match) => match[0])

describe.runIf(existsSync(DIST))("email obfuscation resilience", () => {
  for (const page of PAGES) {
    it(`${page} renders the address split so Cloudflare cannot rewrite it`, () => {
      const html = readFileSync(join(DIST, page), "utf8")
      expect(html, `${page}: quedó el placeholder de Cloudflare`).not.toContain("[email")

      const anchors = mailtoAnchors(html)
      expect(anchors.length, `${page}: no hay enlaces mailto`).toBeGreaterThan(0)
      for (const anchor of anchors) {
        const spans = anchor.match(/<\/span>/g) ?? []
        expect(
          spans.length,
          `${page}: el texto del enlace mailto debe estar partido en spans (usuario / @ / dominio)`,
        ).toBeGreaterThanOrEqual(2)
        expect(anchor, `${page}: el href conserva la dirección completa`).toContain(personalInfo.email)
      }
    })
  }

  it("the contact CTA keeps its aria-label and data-email", () => {
    const html = readFileSync(join(DIST, "index.html"), "utf8")
    expect(html).toContain(`data-email="${personalInfo.email}"`)
    expect(html).toContain(`aria-label="Copiar email ${personalInfo.email}"`)
  })
})
