import type { Locale } from "@/lib/i18n"

/**
 * Secciones del home Resolución, en el orden del diseño (§3): hero, trabajo,
 * experiencia, sobre mí, formación, contacto. Los ids son neutros por idioma:
 * el header porta los mismos anclas (#trabajo/#experiencia/#contacto) en es y
 * en, y el observer de sección activa (header-nav) cruza `data-nav` con el
 * href del enlace.
 *
 * El índice queda abierto a string porque la unidad final de tests migra las
 * aserciones viejas de home-sections (tests/pages-smoke) y, mientras tanto,
 * `astro check` no debe fallar por claves que ya no existen.
 */
export const homeSectionIds: Record<Locale, Record<string, string>> = {
  es: {
    work: "proyectos",
    experience: "experiencia",
    about: "sobre-mi",
    formation: "formacion",
    contact: "contacto",
  },
  en: {
    work: "projects",
    experience: "experience",
    about: "about",
    formation: "education",
    contact: "contact",
  },
}

type HomeSection = "work" | "experience" | "about" | "formation" | "contact"

export const homeSectionFragment = (locale: Locale, section: HomeSection): string =>
  `#${homeSectionIds[locale][section]}`
