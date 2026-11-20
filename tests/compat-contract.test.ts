// Resolución — contrato estático de compatibilidad (S4, T12). Lee el árbol fuente tal cual:
// es un contrato de texto sobre src/styles/**, src/scripts/** y astro.config.mjs. Cada
// API moderna que el diseño asume (`light-dark()`, unidades `svh`, `aspect-ratio`,
// `IntersectionObserver`, `ResizeObserver`, `document.fonts`, `Intl.DateTimeFormat`) debe
// estar guardada o degradada, y el target de build no puede viajar como `esnext`.
// Cada fallo nombra el archivo exacto (y línea, cuando aplica).
import { readFileSync, readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const ROOT = fileURLToPath(new URL("..", import.meta.url))

function listFiles(dir: string, suffix: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? listFiles(`${dir}/${entry.name}`, suffix)
      : entry.name.endsWith(suffix)
        ? [`${dir}/${entry.name}`]
        : [],
  )
}

const rel = (file: string): string => file.slice(ROOT.length + 1)

type Occurrence = { line: number; snippet: string }

/** Sustituye comentarios de bloque por espacios, preservando saltos de línea: las
 *  menciones documentales a `light-dark(`/`svh`/etc. dentro de comentarios no son código. */
const stripBlockComments = (text: string): string =>
  text.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, " "))

/** Quita además comentarios de línea (sin tocar `https://` en strings). */
const stripTsComments = (source: string): string =>
  stripBlockComments(source).replace(/(?<!:)\/\/[^\n]*/g, (match) => match.replace(/[^\n]/g, ""))

// Unit regexes: `vh` no debe matchear dentro de `svh`/`lvh`/`dvh`, y `svh` literal no
// debe matchear dentro de otro identificador. Se comparan sólo contra el valor de la
// declaración (lo que va después del primer `:`).
const VH_UNIT = /(?<![a-z])vh(?![a-z])/i
const SVH_UNIT = /(?<![a-z])svh(?![a-z])/i
const LIGHT_DARK_SUPPORTS = /^@supports\s*\(\s*color\s*:\s*light-dark\s*\(/i

const valueOf = (declaration: string): string =>
  declaration.slice(Math.max(0, declaration.indexOf(":") + 1))

/** Ocurrencias de `light-dark(` que no viven dentro de un bloque abierto por
 *  `@supports (color: light-dark(...)`. Respeta strings entre comillas. */
function unguardedLightDark(rawCss: string): Occurrence[] {
  const css = stripBlockComments(rawCss)
  const out: Occurrence[] = []
  const stack: string[] = []
  const guarded = (): boolean => stack.some((prelude) => LIGHT_DARK_SUPPORTS.test(prelude))
  let prelude = ""
  let line = 1
  let quote: string | null = null
  const flag = (text: string, atLine: number): void => {
    const index = text.indexOf("light-dark(")
    out.push({
      line: atLine,
      snippet: text.slice(Math.max(0, index - 24), index + 34).trim(),
    })
  }
  for (const ch of css) {
    if (ch === "\n") {
      line++
      prelude += ch
      continue
    }
    if (quote !== null) {
      if (ch === quote) quote = null
      prelude += ch
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      prelude += ch
      continue
    }
    if (ch === "{") {
      const trimmed = prelude.trim()
      if (!guarded() && !LIGHT_DARK_SUPPORTS.test(trimmed) && trimmed.includes("light-dark(")) {
        flag(trimmed, line)
      }
      stack.push(trimmed)
      prelude = ""
      continue
    }
    if (ch === "}") {
      stack.pop()
      prelude = ""
      continue
    }
    if (ch === ";") {
      if (!guarded() && prelude.includes("light-dark(")) flag(prelude, line)
      prelude = ""
      continue
    }
    prelude += ch
  }
  return out
}

/** Uso de `svh` sin una declaración con `vh` de respaldo en la misma regla, antes en el
 *  bloque. Recorre bloque por bloque acumulando las declaraciones ya vistas. */
function svhWithoutVhFallback(rawCss: string): Occurrence[] {
  const css = stripBlockComments(rawCss)
  const out: Occurrence[] = []
  const stack: string[][] = []
  let decl = ""
  let declLine = 0
  let line = 1
  let quote: string | null = null
  for (const ch of css) {
    if (ch === "\n") {
      line++
      decl += ch
      continue
    }
    if (quote !== null) {
      if (ch === quote) quote = null
      decl += ch
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      decl += ch
      continue
    }
    if (ch === "{") {
      stack.push([])
      decl = ""
      declLine = 0
      continue
    }
    if (ch === "}") {
      stack.pop()
      decl = ""
      declLine = 0
      continue
    }
    if (ch === ";") {
      if (stack.length > 0) {
        const block = stack[stack.length - 1]
        if (SVH_UNIT.test(valueOf(decl)) && !block.some((earlier) => VH_UNIT.test(valueOf(earlier)))) {
          out.push({ line: declLine || line, snippet: decl.trim().replace(/\s+/g, " ").slice(0, 80) })
        }
        block.push(decl)
      }
      decl = ""
      declLine = 0
      continue
    }
    if (declLine === 0 && !/\s/.test(ch)) declLine = line
    decl += ch
  }
  return out
}

/** true si el archivo declara `aspect-ratio:` (línea de declaración) pero no tiene
 *  ningún `@supports not (aspect-ratio` de respaldo. */
function missingAspectRatioFallback(css: string): boolean {
  const text = stripBlockComments(css)
  const declares = /(^|\n)\s*aspect-ratio\s*:/.test(text)
  const fallback = /@supports\s+not\s*\(\s*aspect-ratio/i.test(text)
  return declares && !fallback
}

const OBSERVERS = ["IntersectionObserver", "ResizeObserver"] as const

/** APIs observador construidas con `new X(...)` sin la guardia `"X" in ...`. */
function missingObserverGuards(source: string): string[] {
  return OBSERVERS.filter(
    (api) => new RegExp(`new\\s+${api}\\b`).test(source) && !new RegExp(`["']${api}["']\\s+in\\b`).test(source),
  )
}

// Guardias aceptadas para document.fonts: chequeo con `in`, encadenamiento opcional,
// truthiness (`if (document.fonts)`, `document.fonts &&/??`), o el chequeo por typeof
// sobre un alias ya asignado (`const fonts = document.fonts; if (!fonts || typeof fonts.load !== "function")`).
const FONT_GUARD =
  /(?:["']fonts["']\s+in\s+\w+|document\?\.fonts|document\.fonts\s*(?:&&|\?\?|\?\.|!==\s*undefined|!=\s*null)|typeof\s+\w*fonts\w*\.load\s*!==\s*["']function["']|if\s*\(\s*!\s*\w*fonts\w*\s*\|\|)/i
const FONT_LOAD = /(?:document\.fonts|(?<![a-z])fonts)\s*\??\.\s*load\s*\(/

describe("compat contract (S4)", () => {
  const styleFiles = listFiles(`${ROOT}/src/styles`, ".css")
  const scriptFiles = listFiles(`${ROOT}/src/scripts`, ".ts")

  it("never uses light-dark() outside a @supports (color: light-dark( block", () => {
    const violations = styleFiles.flatMap((file) =>
      unguardedLightDark(readFileSync(file, "utf8")).map(
        (occurrence) => `${rel(file)}:${occurrence.line} — ${occurrence.snippet}`,
      ),
    )
    expect(
      violations,
      "light-dark() sin bloque @supports (color: light-dark( — arreglar los archivos listados",
    ).toEqual([])
  })

  it("provides a vh fallback declaration before every svh usage in the same rule", () => {
    const violations = styleFiles.flatMap((file) =>
      svhWithoutVhFallback(readFileSync(file, "utf8")).map(
        (occurrence) => `${rel(file)}:${occurrence.line} — ${occurrence.snippet}`,
      ),
    )
    expect(
      violations,
      "svh sin fallback vh previo en la misma regla — arreglar los archivos listados",
    ).toEqual([])
  })

  it("provides an @supports not (aspect-ratio fallback for every aspect-ratio declaration", () => {
    const violations = styleFiles
      .filter((file) => missingAspectRatioFallback(readFileSync(file, "utf8")))
      .map((file) => `${rel(file)} — declara aspect-ratio sin @supports not (aspect-ratio`)
    expect(
      violations,
      "aspect-ratio sin fallback @supports not (aspect-ratio — arreglar los archivos listados",
    ).toEqual([])
  })

  it("guards IntersectionObserver and ResizeObserver construction with an existence check", () => {
    const violations = scriptFiles.flatMap((file) =>
      missingObserverGuards(readFileSync(file, "utf8")).map(
        (api) => `${rel(file)} — construye new ${api} sin la guardia "${api}" in ...`,
      ),
    )
    expect(
      violations,
      "new IntersectionObserver/ResizeObserver sin guardia de existencia — arreglar los archivos listados",
    ).toEqual([])
  })

  it("guards document.fonts before .load in resolve.ts and wraps Intl.DateTimeFormat in try in hero.ts", () => {
    const resolveSource = stripTsComments(readFileSync(`${ROOT}/src/scripts/resolve.ts`, "utf8"))
    const guardIndex = resolveSource.search(FONT_GUARD)
    const loadIndex = resolveSource.search(FONT_LOAD)
    expect(loadIndex, "src/scripts/resolve.ts — llama a fonts.load").toBeGreaterThanOrEqual(0)
    expect(
      guardIndex >= 0 && guardIndex < loadIndex,
      `src/scripts/resolve.ts — llama a fonts.load (índice ${loadIndex}) sin guardia de document.fonts antes (guardia en índice ${guardIndex})`,
    ).toBe(true)

    const heroSource = stripTsComments(readFileSync(`${ROOT}/src/scripts/hero.ts`, "utf8"))
    const tryIndex = heroSource.search(/\btry\s*\{/)
    const intlIndex = heroSource.search(/new\s+Intl\.DateTimeFormat/)
    const catchIndex = heroSource.search(/\bcatch\s*(?:\(|\{)/)
    expect(intlIndex, "src/scripts/hero.ts — usa new Intl.DateTimeFormat").toBeGreaterThanOrEqual(0)
    expect(
      tryIndex >= 0 && tryIndex < intlIndex,
      `src/scripts/hero.ts — new Intl.DateTimeFormat (índice ${intlIndex}) no está envuelto en try (try en índice ${tryIndex})`,
    ).toBe(true)
    expect(
      catchIndex > intlIndex,
      `src/scripts/hero.ts — el try alrededor de new Intl.DateTimeFormat no tiene catch después (catch en índice ${catchIndex})`,
    ).toBe(true)
  })

  it("builds with conservative vite targets, not esnext", () => {
    const config = readFileSync(`${ROOT}/astro.config.mjs`, "utf8")
    const target = config.match(/target\s*:\s*(\[[\s\S]*?\]|["'][^"']*["'])/)?.[1]
    expect(target, "astro.config.mjs — falta vite.build.target").toBeDefined()
    expect(
      target!,
      `astro.config.mjs — vite.build.target (${target}) no debe ser "esnext"`,
    ).not.toMatch(/esnext/)
    for (const conservative of ["chrome87", "safari13.1", "firefox78"]) {
      expect(
        target!,
        `astro.config.mjs — vite.build.target (${target}) debe incluir "${conservative}"`,
      ).toContain(conservative)
    }
  })
})
