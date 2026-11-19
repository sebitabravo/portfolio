// Resolución — variantes de tarjeta OG por locale: blog y links (design/resolucion/og.html
// §12, las tres capturas og/*.png). Las rutas generadas son /og/<locale>/blog.svg y
// /og/<locale>/links.svg; la variante home vive en /og/<locale>.svg.
import type { APIRoute, GetStaticPaths } from "astro"

import {
  buildResolucionOgSvg,
  OG_DESIGN_CARDS,
  OG_DESIGN_LOCALES,
  type OgDesignCard,
  type OgDesignLocale,
} from "../_resolucion"

export const prerender = true

export const getStaticPaths: GetStaticPaths = () => {
  return OG_DESIGN_LOCALES.flatMap((locale) =>
    OG_DESIGN_CARDS.filter((card) => card !== "home").map((card) => ({
      params: { locale, card },
    })),
  )
}

export const GET: APIRoute = ({ params }) => {
  const locale = (params.locale === "en" ? "en" : "es") as OgDesignLocale
  const card = (params.card === "blog" || params.card === "links" ? params.card : "blog") as OgDesignCard
  const svg = buildResolucionOgSvg(locale, card)

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // Parity with the vercel.json `/og/(.*)` rule: static OG assets are
      // immutable for a year, so the dynamic endpoint must not disagree.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
