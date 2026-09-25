import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
type ShellCopy = {
  nav: { mainNavigation: string; brandHome: string }
  footer: { professionalProfiles: string; links: string }
  language: { toggleLabel: string }
  projects: { cardLabel: string; evidenceLabel: string; technologiesLabel: string }
  work: { evidenceLabel: string }
  contact: { mailSubject: string; responseTime: string; linkedinDescription: string; githubDescription: string; cvHelper: string }
  error404: { description: string; heading: string; message: string; backHome: string }
  blog: { postNavigation: string }
}
const es = JSON.parse(readFileSync("src/lib/i18n/es.json", "utf8")) as ShellCopy
const en = JSON.parse(readFileSync("src/lib/i18n/en.json", "utf8")) as ShellCopy

const header = readFileSync("src/components/Header.astro", "utf8")
const footer = readFileSync("src/components/Footer.astro", "utf8")
const languageToggle = readFileSync("src/components/LanguageToggle.astro", "utf8")
const languageToggleScript = readFileSync("src/scripts/language-toggle.ts", "utf8")
const projects = readFileSync("src/components/Projects.astro", "utf8")
const experienceItem = readFileSync("src/components/ExperienceItem.astro", "utf8")
const contact = readFileSync("src/components/Contact.astro", "utf8")
const notFound = readFileSync("src/components/LocalizedNotFoundPage.astro", "utf8")
const blogPost = readFileSync("src/components/blog/LocalizedBlogPost.astro", "utf8")

const copy = [
  {
    locale: "Spanish", dictionary: es,
    mainNavigation: "Navegación principal", brandHome: "Inicio — Sebastian Bravo",
    professionalProfiles: "Perfiles profesionales", footerLinks: "Enlaces del pie",
    toggleLabel: "Cambiar idioma (actual: {code})", code: "ES",
  },
  {
    locale: "English", dictionary: en,
    mainNavigation: "Main navigation", brandHome: "Home — Sebastian Bravo",
    professionalProfiles: "Professional profiles", footerLinks: "Footer links",
    toggleLabel: "Toggle language (current: {code})", code: "EN",
  },
] as const

describe("site-shell accessible copy", () => {
  it.each(copy)("keeps exact $locale translations in the dictionary", ({ dictionary, mainNavigation, brandHome, professionalProfiles, footerLinks, toggleLabel, code }) => {
    expect(dictionary.nav.mainNavigation).toBe(mainNavigation)
    expect(dictionary.nav.brandHome).toBe(brandHome)
    expect(dictionary.footer.professionalProfiles).toBe(professionalProfiles)
    expect(dictionary.footer.links).toBe(footerLinks)
    expect(dictionary.language.toggleLabel).toBe(toggleLabel)
    expect(dictionary.language.toggleLabel.replace("{code}", code)).toBe(
      code === "ES" ? "Cambiar idioma (actual: ES)" : "Toggle language (current: EN)",
    )
  })

  it("binds Header and Footer landmarks to dictionary keys", () => {
    expect(header).toContain("aria-label={t.nav.mainNavigation}")
    expect(header).toContain("aria-label={t.nav.brandHome}")
    expect(footer).toContain("aria-label={t.footer.professionalProfiles}")
    expect(footer).toContain("aria-label={t.footer.links}")
    for (const source of [header, footer]) {
      for (const { mainNavigation, brandHome, professionalProfiles, footerLinks } of copy) {
        for (const label of [mainNavigation, brandHome, professionalProfiles, footerLinks]) {
          expect(source).not.toContain(`'${label}'`)
        }
      }
    }
  })

  it("uses locale templates for both initial and client-updated language labels", () => {
    expect(languageToggle).toContain("getTranslations('es').language.toggleLabel")
    expect(languageToggle).toContain("getTranslations('en').language.toggleLabel")
    expect(languageToggle).toContain("labels[locale].replace('{code}', currentLangCode)")
    expect(languageToggle).toContain('data-label-template-es={labels.es}')
    expect(languageToggle).toContain('data-label-template-en={labels.en}')
    expect(languageToggleScript).toContain("getAttribute(`data-label-template-${lang}`)")
    expect(languageToggleScript).toContain("replace('{code}', lang.toUpperCase())")
    expect(languageToggle).toContain("import { initLanguageToggle } from '@/scripts/language-toggle'")
    expect(languageToggle).toContain("document.addEventListener('DOMContentLoaded', initLanguageToggle, { once: true })")
    expect(languageToggle).toContain("document.addEventListener('astro:after-swap', initLanguageToggle)")
    for (const { toggleLabel, code } of copy) {
      expect(languageToggle).not.toContain(toggleLabel.replace("{code}", code))
      expect(languageToggle).not.toContain(toggleLabel.split("{code}")[0])
    }
  })
})

const localizedUiCopy = [
  {
    dictionary: es, locale: "Spanish", cardLabel: "PROYECTO",
    projectEvidence: "Evidencia del proyecto", technologies: "Tecnologías",
    workEvidence: "Evidencia del trabajo", mailSubject: "Contacto desde tu portfolio",
    responseTime: "Te respondo en menos de 24h", linkedin: "Conectemos profesionalmente",
    github: "Mirá mi código abierto", cvHelper: "CV disponible para revisar mi experiencia completa.",
  },
  {
    dictionary: en, locale: "English", cardLabel: "PROJECT",
    projectEvidence: "Project evidence", technologies: "Technologies",
    workEvidence: "Work evidence", mailSubject: "Contact from your portfolio",
    responseTime: "I'll reply within 24h", linkedin: "Let's connect professionally",
    github: "Check my open source code", cvHelper: "Download the CV for the full experience overview.",
  },
] as const

describe("project, work, and contact UI copy", () => {
  it.each(localizedUiCopy)("keeps exact $locale labels and helper text in the dictionary", ({ dictionary, cardLabel, projectEvidence, technologies, workEvidence, mailSubject, responseTime, linkedin, github, cvHelper }) => {
    expect(dictionary.projects.cardLabel).toBe(cardLabel)
    expect(dictionary.projects.evidenceLabel).toBe(projectEvidence)
    expect(dictionary.projects.technologiesLabel).toBe(technologies)
    expect(dictionary.work.evidenceLabel).toBe(workEvidence)
    expect(dictionary.contact.mailSubject).toBe(mailSubject)
    expect(dictionary.contact.responseTime).toBe(responseTime)
    expect(dictionary.contact.linkedinDescription).toBe(linkedin)
    expect(dictionary.contact.githubDescription).toBe(github)
    expect(dictionary.contact.cvHelper).toBe(cvHelper)
  })

  it("binds project and work labels to the dictionary without changing data-driven metric or tag content", () => {
    expect(projects).toContain("featured ? t.projects.featured : t.projects.cardLabel")
    expect(projects).toContain('aria-label={t.projects.evidenceLabel}')
    expect(projects).toContain('aria-label={t.projects.technologiesLabel}')
    expect(projects).toContain("<span>{metric.label}</span>")
    expect(projects).toContain("{tag}")
    expect(experienceItem).toContain('aria-label={t.work.evidenceLabel}')
    expect(experienceItem).toContain("<span>{highlight.label}</span>")
    expect(experienceItem).toContain("{description}")
  })

  it("binds mail subject and contact help text to the dictionary", () => {
    expect(contact).toContain("encodeURIComponent(t.contact.mailSubject)")
    expect(contact).toContain("description: t.contact.responseTime")
    expect(contact).toContain("description: t.contact.linkedinDescription")
    expect(contact).toContain("description: t.contact.githubDescription")
    expect(contact).toContain("<p>{t.contact.cvHelper}</p>")
    expect(contact).toContain("label: personalInfo.email")
  })
})

const pageCopy = [
  {
    locale: "Spanish", dictionary: es,
    description: "La página que buscás no existe.",
    heading: "Esta página se perdió en el deploy",
    message: "No encontramos lo que buscabas. Volvé al inicio y seguimos desde ahí.",
    backHome: "Volver al inicio",
    postNavigation: "Navegación del artículo",
  },
  {
    locale: "English", dictionary: en,
    description: "The page you requested does not exist.",
    heading: "This page got lost in deployment",
    message: "We could not find what you asked for. Jump back home and keep exploring.",
    backHome: "Back to home",
    postNavigation: "Post navigation",
  },
] as const

describe("not-found and article navigation UI copy", () => {
  it.each(pageCopy)("keeps exact $locale translations in the dictionary", ({ dictionary, description, heading, message, backHome, postNavigation }) => {
    expect(dictionary.error404.description).toBe(description)
    expect(dictionary.error404.heading).toBe(heading)
    expect(dictionary.error404.message).toBe(message)
    expect(dictionary.error404.backHome).toBe(backHome)
    expect(dictionary.blog.postNavigation).toBe(postNavigation)
  })

  it("binds 404 copy to translations while preserving canonical, noindex, and home routes", () => {
    expect(notFound).toContain("getTranslations(locale)")
    expect(notFound).toContain("description={t.error404.description}")
    expect(notFound).toContain("{t.error404.heading}")
    expect(notFound).toContain("{t.error404.message}")
    expect(notFound).toContain("{t.error404.backHome}")
    expect(notFound).toContain('const homeUrl = locale === "es" ? "/" : "/en"')
    expect(notFound).toContain("href={homeUrl}")
    expect(notFound).toContain('title={`404 | ${personalInfo.name}`}')
    expect(notFound).toContain('canonicalUrl={locale === "es" ? "https://sebita.dev/404" : "https://sebita.dev/en/404"}')
    expect(notFound).toContain("noindex")
    expect(notFound).not.toContain("const content =")
    for (const { description, heading, message, backHome } of pageCopy) {
      for (const value of [description, heading, message, backHome]) expect(notFound).not.toContain(value)
    }
  })

  it("binds article navigation landmark to the dictionary without changing article content", () => {
    expect(blogPost).toContain('aria-label={t.blog.postNavigation}')
    expect(blogPost).toContain('<Content />')
    expect(blogPost).not.toContain('aria-label="Post navigation"')
  })
})
