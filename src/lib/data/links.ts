// Resolución — datos del hub de enlaces (/links, §12 de DESIGN.md). Toda la copy del hub
// vive acá y no enterrada en el markup; cada línea de las descargas de YouTube lleva la URL
// completa porque YouTube solo auto-enlaza direcciones enteras. UTM/ref se omiten a propósito.
import type { Locale } from "@/lib/i18n"
import { personalInfo } from "./personal"

export interface HubLink {
  title: string
  href: string
  display: string
  download?: boolean
  external?: boolean
}

export interface HubCopyBlock {
  id: string
  label: string
  button: string
  variant: "primary" | "sm"
  content: string
}

export interface HubCopy {
  metaTitle: string
  metaDescription: string
  role: string
  lead: string
  links: HubLink[]
  emailTitle: string
  emailAria: string
  emailCopied: string
  emailFailed: string
  youtubeHeading: string
  youtubeNote: string
  blocks: HubCopyBlock[]
  textCopied: string
  previewHeading: string
  previewAlt: string
}

const EMAIL = personalInfo.email
const BASE = "https://sebita.dev"
const YOUTUBE = "https://www.youtube.com/@sebitabravo"
const CAL = "https://cal.com/sebitabravo/15min"
const CV = "/cv/Sebastian_Bravo_CV.pdf"

export const hubContent: Record<Locale, HubCopy> = {
  es: {
    metaTitle: "Links — Sebastián Bravo",
    metaDescription:
      "Portafolio, proyectos, blog, GitHub, LinkedIn y agenda de Sebastián Bravo, desarrollador full-stack.",
    role: "desarrollador full-stack",
    lead: "Plataformas web completas, del front-end al despliegue, con IA donde resuelve un problema real.",
    links: [
      { title: "portafolio", href: BASE, display: "sebita.dev", external: true },
      { title: "proyectos", href: `${BASE}/#trabajo`, display: "sebita.dev/#trabajo", external: true },
      { title: "blog", href: `${BASE}/blog`, display: "sebita.dev/blog", external: true },
      { title: "cv", href: CV, display: "descargar pdf", download: true },
      { title: "github", href: "https://github.com/sebitabravo", display: "github.com/sebitabravo", external: true },
      {
        title: "linkedin",
        href: "https://linkedin.com/in/sebitabravo",
        display: "linkedin.com/in/sebitabravo",
        external: true,
      },
      { title: "agenda", href: CAL, display: "cal.com/sebitabravo/15min", external: true },
      { title: "youtube", href: YOUTUBE, display: "youtube.com/@sebitabravo", external: true },
    ],
    emailTitle: "email",
    emailAria: `Copiar email ${EMAIL}`,
    emailCopied: "copiado",
    emailFailed: "reintentar",
    youtubeHeading: "para youtube",
    youtubeNote:
      "Texto plano listo para pegar en la descripción de un video. YouTube convierte las URL completas en enlaces; por eso cada línea lleva la dirección entera.",
    textCopied: "Texto copiado",
    blocks: [
      {
        id: "blk-full",
        label: "descripción completa",
        button: "copiar descripción",
        variant: "primary",
        content: [
          "Sebastián Bravo, desarrollador full-stack",
          "",
          `portafolio: ${BASE}`,
          `proyectos: ${BASE}/#trabajo`,
          `blog: ${BASE}/blog`,
          "github: https://github.com/sebitabravo",
          "linkedin: https://linkedin.com/in/sebitabravo",
          "agenda 15 min: https://cal.com/sebitabravo/15min",
          `youtube: ${YOUTUBE}`,
          `contacto: ${EMAIL}`,
        ].join("\n"),
      },
      {
        id: "blk-short",
        label: "una línea (comentario fijado)",
        button: "copiar línea",
        variant: "sm",
        content: `Más en ${BASE} | GitHub https://github.com/sebitabravo`,
      },
    ],
    previewHeading: "vista previa al compartir",
    previewAlt: "Tarjeta social de sebita.dev/links",
  },
  en: {
    metaTitle: "Links — Sebastián Bravo",
    metaDescription:
      "Portfolio, projects, blog, GitHub, LinkedIn and booking for Sebastián Bravo, full-stack developer.",
    role: "Full-Stack Developer",
    lead: "Complete web platforms, from front-end to deployment, with AI where it solves a real problem.",
    links: [
      { title: "portfolio", href: BASE, display: "sebita.dev", external: true },
      { title: "projects", href: `${BASE}/#trabajo`, display: "sebita.dev/#trabajo", external: true },
      { title: "blog", href: `${BASE}/blog`, display: "sebita.dev/blog", external: true },
      { title: "cv", href: CV, display: "download pdf", download: true },
      { title: "github", href: "https://github.com/sebitabravo", display: "github.com/sebitabravo", external: true },
      {
        title: "linkedin",
        href: "https://linkedin.com/in/sebitabravo",
        display: "linkedin.com/in/sebitabravo",
        external: true,
      },
      { title: "book a call", href: CAL, display: "cal.com/sebitabravo/15min", external: true },
      { title: "youtube", href: YOUTUBE, display: "youtube.com/@sebitabravo", external: true },
    ],
    emailTitle: "email",
    emailAria: `Copy email ${EMAIL}`,
    emailCopied: "copied",
    emailFailed: "retry",
    youtubeHeading: "for youtube",
    youtubeNote:
      "Plain text ready to paste into a video description. YouTube turns full URLs into links; that is why every line carries the whole address.",
    textCopied: "Text copied",
    blocks: [
      {
        id: "blk-full",
        label: "full description",
        button: "copy description",
        variant: "primary",
        content: [
          "Sebastián Bravo, full-stack developer",
          "",
          `portfolio: ${BASE}`,
          `projects: ${BASE}/#trabajo`,
          `blog: ${BASE}/blog`,
          "github: https://github.com/sebitabravo",
          "linkedin: https://linkedin.com/in/sebitabravo",
          "book 15 min: https://cal.com/sebitabravo/15min",
          `youtube: ${YOUTUBE}`,
          `contact: ${EMAIL}`,
        ].join("\n"),
      },
      {
        id: "blk-short",
        label: "one line (pinned comment)",
        button: "copy line",
        variant: "sm",
        content: `More at ${BASE} | GitHub https://github.com/sebitabravo`,
      },
    ],
    previewHeading: "share preview",
    previewAlt: "Social card for sebita.dev/en/links",
  },
}
