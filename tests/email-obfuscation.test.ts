// El sitio se sirve detrás de Cloudflare, que por defecto reescribe las
// direcciones de email a "[email protected]" y las decodifica con un script que
// nuestra CSP bloquea — el placeholder quedaba visible. El opt-out de Cloudflare
// es el comentario <!--email_off-->: este contrato lo fija en las páginas que
// publican la dirección, así nadie lo borra sin darse cuenta.
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { personalInfo } from "../src/lib/data/personal"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const DIST = join(ROOT, "dist")
const PAGES = ["index.html", "en/index.html", "privacy/index.html", "en/privacy/index.html"]

describe.runIf(existsSync(DIST))("email obfuscation opt-out", () => {
  for (const page of PAGES) {
    it(`${page} keeps the address outside Cloudflare obfuscation`, () => {
      const html = readFileSync(join(DIST, page), "utf8")
      expect(html, `${page}: falta el comentario de opt-out de Cloudflare`).toContain("<!--email_off-->")
      expect(html, `${page}: falta el cierre del bloque`).toContain("<!--/email_off-->")
      expect(html, `${page}: la dirección no se renderiza como texto`).toContain(personalInfo.email)
      expect(html, `${page}: quedó el placeholder de Cloudflare`).not.toContain("[email")
    })
  }

  it("the contact CTA keeps its aria-label and data-email inside the opt-out", () => {
    const html = readFileSync(join(DIST, "index.html"), "utf8")
    const block = html.match(/<!--email_off-->[\s\S]*?<!--\/email_off-->/g) ?? []
    expect(block.length, "bloques email_off en la home").toBeGreaterThanOrEqual(2)
    expect(block.join("")).toContain(`data-email="${personalInfo.email}"`)
  })
})
