// Resolución — endpoint OG dinámico: emite la tarjeta del diseño (nombre en Geist Pixel sobre
// el campo de puntos, 1200×630, design/resolucion/og.html §12). Variante home por locale;
// las variantes links/blog viven en src/pages/og/[locale]/[card].svg.ts. El prerender produce
// los archivos en el build; los PNG crawler-safe de public/og/ siguen siendo el og:image que
// apunta Layout (regenerarlos requiere scripts/generate-og-images.ts, fuera de esta unidad).
import type { APIRoute, GetStaticPaths } from "astro"

import { buildResolucionOgSvg, OG_DESIGN_LOCALES, type OgDesignLocale } from "./_resolucion"

export const prerender = true

export const getStaticPaths: GetStaticPaths = () => {
  return OG_DESIGN_LOCALES.map((locale) => ({ params: { locale } }))
}

export const GET: APIRoute = ({ params }) => {
  const locale = (params.locale === "en" ? "en" : "es") as OgDesignLocale
  const svg = buildResolucionOgSvg(locale, "home")

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // Parity with the vercel.json `/og/(.*)` rule: static OG assets are
      // immutable for a year, so the dynamic endpoint must not disagree.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
