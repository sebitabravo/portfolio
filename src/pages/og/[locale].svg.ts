import type { APIRoute, GetStaticPaths } from "astro"

import { buildOgSvg, resolveOgLocale, resolveOgTitle } from "@/lib/og-image"

export const prerender = true

export const getStaticPaths: GetStaticPaths = () => {
  return [{ params: { locale: "es" } }, { params: { locale: "en" } }]
}

export const GET: APIRoute = ({ params, url }) => {
  const locale = resolveOgLocale(params.locale)
  const title = resolveOgTitle(url.searchParams.get("title"), locale)
  const svg = buildOgSvg(locale, title)

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // Parity with the vercel.json `/og/(.*)` rule: static OG assets are
      // immutable for a year, so the dynamic endpoint must not disagree.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
