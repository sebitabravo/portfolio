import type { Locale } from "./i18n"

export function formatDate(date: Date, locale: Locale = "es"): string {
  const localeCode = locale === "es" ? "es-CL" : "en-US"
  // Content dates are UTC midnights; formatting in the build machine's zone could shift the day.
  return new Intl.DateTimeFormat(localeCode, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date)
}

// Mes y año abreviados para filas compactas ("feb 2026" / "Feb 2026").
export function formatMonthYear(date: Date, locale: Locale = "es"): string {
  const localeCode = locale === "es" ? "es-CL" : "en-US"
  return new Intl.DateTimeFormat(localeCode, { year: "numeric", month: "short", timeZone: "UTC" })
    .format(date)
    .replace(".", "")
}
