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

// El rótulo del período abierto llega del diccionario del llamador: aquí solo se arma el rango.
export function formatPeriod(
  start: Date,
  end: Date | null | undefined,
  current: boolean,
  present: string,
  locale: Locale = "es",
): string {
  const finish = current || !end ? present : formatMonthYear(end, locale)
  return `${formatMonthYear(start, locale)} — ${finish}`
}

// Class-merge helper following the shadcn/ui cn() convention (clsx + tailwind-merge).
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
