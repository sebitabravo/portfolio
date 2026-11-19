// Resolución — tarjetas sociales (design/resolucion/og.html §12): 1200×630, nombre en Geist
// Pixel sobre el campo de puntos. Varias variantes (home | links | blog) por locale, como las
// tres capturas og/*.png del diseño. La fuente se incrusta como woff2 vendido en base64:
// los rastreadores sociales no ejecutan fuentes externas dentro de un SVG y la red externa
// queda fuera de la CSP ('self'), así que la cara pixel viaja dentro del propio archivo.
import { readFileSync } from "node:fs"
import { join } from "node:path"

export const OG_DESIGN_LOCALES = ["es", "en"] as const
export type OgDesignLocale = (typeof OG_DESIGN_LOCALES)[number]
export const OG_DESIGN_CARDS = ["home", "links", "blog"] as const
export type OgDesignCard = (typeof OG_DESIGN_CARDS)[number]

export const OG_DESIGN_WIDTH = 1200
export const OG_DESIGN_HEIGHT = 630

type CardCopy = { kicker: string; name: string; description: string; domain: string }

const COPY: Record<OgDesignLocale, Record<OgDesignCard, CardCopy>> = {
  es: {
    home: {
      kicker: "desarrollador full-stack",
      name: "Sebastián\nBravo",
      description: "plataformas web completas, con IA donde resuelve un problema real",
      domain: "sebita.dev",
    },
    links: {
      kicker: "sebastián bravo, desarrollador full-stack",
      name: "links",
      description: "portafolio, proyectos, blog, github, linkedin y agenda",
      domain: "sebita.dev/links",
    },
    blog: {
      kicker: "sebastián bravo",
      name: "blog",
      description: "full-stack, IoT, machine learning y lecciones de código en producción",
      domain: "sebita.dev/blog",
    },
  },
  en: {
    home: {
      kicker: "full-stack developer",
      name: "Sebastián\nBravo",
      description: "complete web platforms, with AI where it solves a real problem",
      domain: "sebita.dev/en",
    },
    links: {
      kicker: "Sebastián Bravo, full-stack developer",
      name: "links",
      description: "portfolio, projects, blog, github, linkedin and booking",
      domain: "sebita.dev/en/links",
    },
    blog: {
      kicker: "Sebastián Bravo",
      name: "blog",
      description: "full-stack, IoT, machine learning and production code lessons",
      domain: "sebita.dev/en/blog",
    },
  },
}

let pixelFace: string | null = null
let monoFace: string | null = null

function embeddedFont(file: string, family: string, cache: string | null): string {
  if (cache) return cache
  const woff2 = readFileSync(join(process.cwd(), "public", "fonts", file)).toString("base64")
  const face = `@font-face { font-family: "${family}"; src: url(data:font/woff2;base64,${woff2}) format("woff2"); }`
  if (family === "Geist Pixel") pixelFace = face
  else monoFace = face
  return face
}

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export function buildResolucionOgSvg(locale: OgDesignLocale, card: OgDesignCard): string {
  const copy = COPY[locale][card]
  const multiline = copy.name.includes("\n")
  const nameSize = multiline ? 190 : 260
  const nameLines = multiline ? copy.name.split("\n") : [copy.name]
  const lineHeight = Math.round(nameSize * 0.9)
  // .og: padding 56px 64px, flex column con space-between entre kicker, nombre y pie.
  const nameTop = multiline ? 144 : 198
  const firstBaseline = Math.round(nameTop + lineHeight * 0.82)
  const pixel = embeddedFont("GeistPixel-Square.woff2", "Geist Pixel", pixelFace)
  const mono = embeddedFont("GeistMono-Regular.woff2", "Geist Mono", monoFace)

  const nameSpans = nameLines
    .map((line, i) => `<text x="64" y="${firstBaseline + i * lineHeight}" fill="#ffffff">${escapeText(line)}</text>`)
    .join("\n  ")

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${OG_DESIGN_WIDTH}" height="${OG_DESIGN_HEIGHT}" viewBox="0 0 ${OG_DESIGN_WIDTH} ${OG_DESIGN_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="dots" x="12" y="12" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="12" cy="12" r="2" fill="#262626"/>
    </pattern>
    <style>
      ${pixel}
      ${mono}
    </style>
  </defs>
  <rect width="${OG_DESIGN_WIDTH}" height="${OG_DESIGN_HEIGHT}" fill="#000000"/>
  <rect width="${OG_DESIGN_WIDTH}" height="${OG_DESIGN_HEIGHT}" fill="url(#dots)"/>
  <text x="64" y="78" fill="#a1a1a1" font-size="22" font-family="Geist Mono, monospace">${escapeText(copy.kicker)}</text>
  <g font-family="Geist Pixel, monospace" font-size="${nameSize}">
  ${nameSpans}
  </g>
  <text x="64" y="568" fill="#a1a1a1" font-size="22" font-family="Geist Mono, monospace">${escapeText(copy.description)}</text>
  <text x="1136" y="568" fill="#ffffff" font-size="22" font-weight="500" text-anchor="end" font-family="Geist Mono, monospace">${escapeText(copy.domain)}</text>
</svg>`
}
