export const OG_WIDTH = 1200
export const OG_HEIGHT = 630
export const OG_TITLE_MAX_LENGTH = 100

export const OG_LOCALES = ["es", "en"] as const
export type OgLocale = (typeof OG_LOCALES)[number]

const localeLabels = {
  es: "Portfolio de Sebastian Bravo",
  en: "Sebastian Bravo Portfolio",
} as const

const localeSubtitles = {
  es: "Desarrollador Frontend",
  en: "Frontend Developer",
} as const

export function resolveOgLocale(locale: string | undefined): OgLocale {
  return locale === "en" ? "en" : "es"
}

export function resolveOgTitle(requestedTitle: string | null, locale: OgLocale): string {
  if (requestedTitle && requestedTitle.length > 0 && requestedTitle.length <= OG_TITLE_MAX_LENGTH) {
    return requestedTitle
  }
  return localeLabels[locale]
}

function escapeOgText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function buildOgSvg(locale: OgLocale, requestedTitle?: string | null): string {
  const title = resolveOgTitle(requestedTitle ?? null, locale)
  const subtitle = localeSubtitles[locale]
  const safeTitle = escapeOgText(title)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
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
}
