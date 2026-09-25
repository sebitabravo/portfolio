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

// Class-merge helper following the shadcn/ui cn() convention (clsx + tailwind-merge).
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
