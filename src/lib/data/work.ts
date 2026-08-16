import type { Locale } from "@/lib/i18n"

// EXPERIENCIA LABORAL
// ============================================

const workExperienceData = {
  es: [
    {
      company: "MIMASOFT",
      position: "Desarrollador Full Stack",
      description: `Contribuí al desarrollo de una plataforma SaaS de huella de carbono en producción para el sector minero e industrial. Estandaricé la capa de datos migrando módulos legacy a TanStack Query, implementé sistema de permisos granulares con guards por tenant, y lideré una limpieza de codebase que redujo significativamente el bundle y la superficie de ataque.`,
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-04-30"),
      current: false,
      location: "Santiago, Chile (Remoto)",
      employmentType: "Contrato por proyecto (3 meses)",
      skills: ["React", "TypeScript", "Laravel", "TanStack Query", "Docker", "Git"],
      highlights: [
        { label: "Migración", value: "TanStack Query" },
        { label: "Control", value: "Guards por tenant" },
        { label: "Caso", value: "MU Plugin · 1.983 líneas" },
      ],
      url: "/blog/mimasoft-landing-wordpress-mu-plugin",
      logos: [
        { src: "/experience/mimasoft.webp", alt: "MIMASOFT", url: "https://www.mimasoft.com" },
      ],
    },
    {
      company: "Temutel",
      position: "Técnico en Redes y Telecomunicaciones",
      description: `Técnico de instalación y soporte para Telsur. ~30+ instalaciones semanales de equipos de telecomunicaciones en clientes residenciales y comerciales.`,
      startDate: new Date("2022-12-01"),
      endDate: new Date("2023-02-28"),
      current: false,
      location: "Temuco, Araucanía, Chile",
      employmentType: "Contrato temporal",
      skills: ["Mantenimiento de Redes", "Instalación de Equipos", "Configuración de Routers", "Soporte Técnico"],
      logos: [
        { src: "/experience/temutel.webp", alt: "Temutel Telecomunicaciones", url: "https://www.temutel.cl" },
        { src: "/experience/telsur.webp", alt: "Telsur GTD", url: "https://www.telsur.cl" },
      ],
    }
  ],
  en: [
    {
      company: "MIMASOFT",
      position: "Full Stack Developer",
      description: `Contributed to a carbon footprint SaaS platform in production for the mining and industrial sector. Standardized the data layer by migrating legacy modules to TanStack Query, implemented a granular permission system with tenant-based guards, and led a codebase cleanup that significantly reduced bundle size and attack surface.`,
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-04-30"),
      current: false,
      location: "Santiago, Chile (Remote)",
      employmentType: "Contract",
      skills: ["React", "TypeScript", "Laravel", "TanStack Query", "Docker", "Git"],
      highlights: [
        { label: "Migration", value: "TanStack Query" },
        { label: "Control", value: "Tenant guards" },
        { label: "Case study", value: "MU Plugin · 1,983 lines" },
      ],
      url: "/en/blog/mimasoft-landing-wordpress-mu-plugin",
      logos: [
        { src: "/experience/mimasoft.webp", alt: "MIMASOFT", url: "https://www.mimasoft.com" },
      ],
    },
    {
      company: "Temutel",
      position: "Network and Telecommunications Technician",
      description: `Installation and support technician for Telsur. ~30+ weekly telecom equipment installations for residential and commercial clients.`,
      startDate: new Date("2022-12-01"),
      endDate: new Date("2023-02-28"),
      current: false,
      location: "Temuco, Araucanía, Chile",
      employmentType: "Temporary contract",
      skills: ["Network Maintenance", "Equipment Installation", "Router Configuration", "Technical Support"],
      logos: [
        { src: "/experience/temutel.webp", alt: "Temutel Telecomunicaciones", url: "https://www.temutel.cl" },
        { src: "/experience/telsur.webp", alt: "Telsur GTD", url: "https://www.telsur.cl" },
      ],
    }
  ]
}

export function getWorkExperience(locale: Locale = 'es') {
  return workExperienceData[locale]
}

// ============================================
