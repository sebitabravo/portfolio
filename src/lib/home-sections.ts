import type { Locale } from "@/lib/i18n"

// Semantic section keys are shared; only their anchor IDs vary by locale.
export const homeSectionIds = {
  es: {
    projects: "proyectos",
    experience: "experiencia",
    education: "educacion",
    certifications: "certificaciones",
    about: "sobre-mi",
    contact: "contacto",
  },
  en: {
    projects: "projects",
    experience: "experience",
    education: "education",
    certifications: "certifications",
    about: "about",
    contact: "contact",
  },
} as const satisfies Record<Locale, Record<"projects" | "experience" | "education" | "certifications" | "about" | "contact", string>>

type HomeSection = keyof typeof homeSectionIds.es

export const homeSectionFragment = (locale: Locale, section: HomeSection): string =>
  `#${homeSectionIds[locale][section]}`
