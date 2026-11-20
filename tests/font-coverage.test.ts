// Contrato del subset de fuentes (S4): las fuentes vendorizadas solo traen los
// codepoints que el sitio renderiza. Si alguien agrega un carácter que queda
// fuera de los rangos de scripts/font-subset.json, el texto cae al fallback sin
// que nadie lo note; este test lo detecta antes del build.
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const CONFIG = JSON.parse(readFileSync(join(ROOT, "scripts/font-subset.json"), "utf8")) as {
  unicodes: string
  maxBytes: number
}

const SKIP = new Set([".webp", ".avif", ".png", ".jpg", ".jpeg", ".gif", ".woff2", ".ico", ".pdf"])

function textFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return textFiles(path)
    return SKIP.has(entry.name.slice(entry.name.lastIndexOf("."))) ? [] : [path]
  })
}

function codepoints(spec: string): Array<[number, number]> {
  return spec.split(",").map((part) => {
    const [start, end] = part.trim().replace("U+", "").split("-")
    return [Number.parseInt(start, 16), Number.parseInt(end ?? start, 16)]
  })
}

const RANGES = codepoints(CONFIG.unicodes)
const covered = (code: number): boolean => RANGES.some(([a, b]) => code >= a && code <= b)

// Emoji y banderas no existen en las fuentes del sistema tipográfico: caen al
// emoji font del sistema por diseño.
const fallsBack = (code: number): boolean => code >= 0x1f000 || code === 0xfe0f

describe("font subset contract", () => {
  it("covers every character the site renders", () => {
    const missing = new Map<string, string>()
    for (const file of textFiles(join(ROOT, "src"))) {
      const text = readFileSync(file, "utf8")
      for (const char of text) {
        const code = char.codePointAt(0) ?? 0
        if (code < 0x20 || code === 0x7f || covered(code) || fallsBack(code)) continue
        missing.set(`U+${code.toString(16).toUpperCase().padStart(4, "0")} ${char}`, file.slice(ROOT.length + 1))
      }
    }
    expect(
      [...missing].slice(0, 12),
      "caracteres fuera de scripts/font-subset.json: agregalos al rango y corré scripts/subset-fonts.py",
    ).toEqual([])
  })

  it("keeps every vendored font inside the subset budget", () => {
    const dir = join(ROOT, "public/fonts")
    const fonts = readdirSync(dir).filter((name) => name.endsWith(".woff2"))
    expect(fonts.length).toBe(7)
    const heavy = fonts
      .map((name) => [name, statSync(join(dir, name)).size] as const)
      .filter(([, bytes]) => bytes > CONFIG.maxBytes)
      .map(([name, bytes]) => `${name} ${bytes}B > ${CONFIG.maxBytes}B`)
    expect(heavy, "fuente sin subsetear: corré scripts/subset-fonts.py").toEqual([])
  })
})
