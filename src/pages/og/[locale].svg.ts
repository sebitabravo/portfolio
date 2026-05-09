import type { APIRoute, GetStaticPaths } from "astro"

export const prerender = true

const localeLabels = {
  es: "Portfolio de Sebastian Bravo",
  en: "Sebastian Bravo Portfolio",
} as const

export const getStaticPaths: GetStaticPaths = () => {
  return [
    { params: { locale: "es" } },
    { params: { locale: "en" } },
  ]
}

export const GET: APIRoute = ({ params, url }) => {
  const locale = params.locale === "en" ? "en" : "es"
  const fallbackTitle = localeLabels[locale]
  const requestedTitle = url.searchParams.get("title")
  const title = requestedTitle && requestedTitle.length <= 100
    ? requestedTitle
    : fallbackTitle

  const subtitle = locale === "es"
    ? "Desarrollador Frontend"
    : "Frontend Developer"

  const safeTitle = title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="#081F3F" />
      <stop offset="1" stop-color="#0E7490" />
    </linearGradient>
    <linearGradient id="accent" x1="220" y1="170" x2="980" y2="500" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F59E0B" stop-opacity="0.35" />
      <stop offset="1" stop-color="#60A5FA" stop-opacity="0.2" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect x="80" y="90" width="1040" height="450" rx="32" fill="url(#accent)" />
  <text x="140" y="230" fill="#F8FAFC" font-size="64" font-family="Inter, Arial, sans-serif" font-weight="700">${safeTitle}</text>
  <text x="140" y="300" fill="#E2E8F0" font-size="34" font-family="Inter, Arial, sans-serif" font-weight="500">${subtitle}</text>
  <text x="140" y="380" fill="#FCD34D" font-size="26" font-family="Inter, Arial, sans-serif" font-weight="600">sebita.dev</text>
</svg>`

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=604800, immutable",
    },
  })
}
