import type { Locale } from "@/lib/i18n"
import type { WorkExperience } from "./types"
import mimasoft from "../../assets/experience/mimasoft.webp"
import temutel from "../../assets/experience/temutel.webp"
import telsur from "../../assets/experience/telsur.webp"

type SharedWork = Pick<WorkExperience, "company" | "startDate" | "endDate" | "current" | "logos">
type LocalizedWork = Pick<
  WorkExperience,
  "position" | "description" | "location" | "employmentType" | "skills" | "highlights" | "url"
>
type WorkEntry = SharedWork & Record<Locale, LocalizedWork>

const workEntries: WorkEntry[] = [
  {
    company: "MIMASOFT",
    startDate: new Date("2026-02-01"),
    endDate: new Date("2026-04-30"),
    current: false,
    logos: [{ src: mimasoft, alt: "MIMASOFT", url: "https://www.mimasoft.com" }],
    es: {
      position: "Desarrollador Full Stack",
      description: `Contribuí al desarrollo de una plataforma SaaS de huella de carbono en producción para el sector minero e industrial. Estandaricé la capa de datos migrando módulos legacy a TanStack Query, implementé sistema de permisos granulares con guards por tenant, y lideré una limpieza de codebase que redujo significativamente el bundle y la superficie de ataque.`,
      location: "Santiago, Chile (Remoto)",
      // Preserved verbatim: ES carries the duration detail ("3 meses") while EN
      // uses the short generic form. Not normalized — copy changes are out of scope.
      employmentType: "Contrato por proyecto (3 meses)",
      skills: ["React", "TypeScript", "Laravel", "TanStack Query", "Docker", "Git"],
      highlights: [
        { label: "Migración", value: "TanStack Query" },
        { label: "Control", value: "Guards por tenant" },
        { label: "Caso", value: "MU Plugin · 1.983 líneas" },
      ],
      url: "/blog/mimasoft-landing-wordpress-mu-plugin",
    },
    en: {
      position: "Full Stack Developer",
      description: `Contributed to a carbon footprint SaaS platform in production for the mining and industrial sector. Standardized the data layer by migrating legacy modules to TanStack Query, implemented a granular permission system with tenant-based guards, and led a codebase cleanup that significantly reduced bundle size and attack surface.`,
      location: "Santiago, Chile (Remote)",
      employmentType: "Contract",
      skills: ["React", "TypeScript", "Laravel", "TanStack Query", "Docker", "Git"],
      highlights: [
        { label: "Migration", value: "TanStack Query" },
        { label: "Control", value: "Tenant guards" },
        { label: "Case study", value: "MU Plugin · 1,983 lines" },
      ],
      url: "/en/blog/mimasoft-landing-wordpress-mu-plugin",
    },
  },
  {
    company: "Temutel",
    startDate: new Date("2022-12-01"),
    endDate: new Date("2023-02-28"),
    current: false,
    logos: [
      { src: temutel, alt: "Temutel Telecomunicaciones", url: "https://www.temutel.cl" },
      { src: telsur, alt: "Telsur GTD", url: "https://www.telsur.cl" },
    ],
    es: {
      position: "Técnico en Redes y Telecomunicaciones",
      description: `Instalación y soporte de equipos de telecomunicaciones para clientes residenciales y comerciales: 30+ instalaciones semanales para Telsur.`,
      location: "Temuco, Araucanía, Chile",
      employmentType: "Contrato temporal",
      // Unlike projects.ts tags (shared tech tokens), work skills stay localized:
      // the Temutel skill names are translated copy, preserved verbatim per locale.
      skills: ["Mantenimiento de Redes", "Instalación de Equipos", "Configuración de Routers", "Soporte Técnico"],
      highlights: undefined,
      url: undefined,
    },
    en: {
      position: "Network and Telecommunications Technician",
      description: `Installed and supported telecom equipment for residential and commercial Telsur customers: 30+ installations per week.`,
      location: "Temuco, Araucanía, Chile",
      employmentType: "Temporary contract",
      skills: ["Network Maintenance", "Equipment Installation", "Router Configuration", "Technical Support"],
      highlights: undefined,
      url: undefined,
    },
  },
]

// Keep the existing stable per-locale arrays and avoid sharing mutable dates/logos/skills between locales.
const workExperienceData: Record<Locale, WorkExperience[]> = {
  es: workEntries.map(({ es, en: _en, ...shared }) => ({
    ...shared,
    startDate: new Date(shared.startDate),
    endDate: shared.endDate ? new Date(shared.endDate) : shared.endDate,
    logos: shared.logos?.map((logo) => ({ ...logo })),
    ...es,
    skills: [...es.skills],
    highlights: es.highlights?.map((highlight) => ({ ...highlight })),
  })),
  en: workEntries.map(({ en, es: _es, ...shared }) => ({
    ...shared,
    startDate: new Date(shared.startDate),
    endDate: shared.endDate ? new Date(shared.endDate) : shared.endDate,
    logos: shared.logos?.map((logo) => ({ ...logo })),
    ...en,
    skills: [...en.skills],
    highlights: en.highlights?.map((highlight) => ({ ...highlight })),
  })),
}

export function getWorkExperience(locale: Locale = "es"): WorkExperience[] {
  return workExperienceData[locale]
}
