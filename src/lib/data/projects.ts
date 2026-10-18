import type { Locale } from "@/lib/i18n"
import { PROJECT_STAGES, type Project } from "./types"

type SharedProject = Pick<
  Project,
  "slug" | "tags" | "featured" | "status" | "publishDate" | "githubUrl" | "liveUrl" | "order" | "stage"
>
type LocalizedProject = Pick<Project, "title" | "tagline" | "description" | "metrics" | "blogSlug">
type ProjectEntry = SharedProject & Record<Locale, LocalizedProject>

const projectEntries: ProjectEntry[] = [
  {
    slug: "manttoai",
    stage: PROJECT_STAGES.BLUE,
    tags: ["FastAPI", "React", "Machine Learning", "Docker", "IoT"],
    featured: false,
    status: "production",
    publishDate: new Date("2026-04-29"),
    githubUrl: "https://github.com/sebitabravo/ManttoAI",
    liveUrl: undefined,
    order: 3,
    es: {
      title: "ManttoAI",
      tagline: "Mantenimiento predictivo con IoT y Machine Learning",
      description:
        "Mantenimiento predictivo para industria con IoT y ML: telemetría en tiempo real y dashboard interactivo.",
      metrics: [
        { label: "Resultado", value: "94.1% F1-Score" },
        { label: "Código", value: "Disponible" },
      ],
      blogSlug: "manttoai-ml-iot-random-forest",
    },
    en: {
      title: "ManttoAI",
      tagline: "Predictive maintenance with IoT and Machine Learning",
      description:
        "Predictive maintenance for industry with IoT and ML: real-time telemetry and interactive dashboard.",
      metrics: [
        { label: "Outcome", value: "94.1% F1-Score" },
        { label: "Code", value: "Available" },
      ],
      blogSlug: "manttoai-ml-iot-random-forest-en",
    },
  },
  {
    slug: "vulcania",
    stage: PROJECT_STAGES.RED,
    tags: ["Next.js", "TypeScript", "Supabase", "shadcn/ui"],
    featured: true,
    status: "production",
    publishDate: new Date("2026-03-02"),
    githubUrl: "https://github.com/sebitabravo/vulcania-web",
    liveUrl: "https://vulcania-web.vercel.app",
    order: 1,
    es: {
      title: "Vulcania",
      tagline: "Monitoreo volcánico comunitario en tiempo real",
      description:
        "Monitoreo volcánico comunitario para zonas de riesgo sísmico: mapa colaborativo en tiempo real, chat, alertas tempranas y notificaciones push.",
      metrics: [
        { label: "Mapa", value: "Tiempo real" },
        { label: "Entrega", value: "En producción" },
      ],
      blogSlug: "vulcania-monitoreo-volcanico-comunitario",
    },
    en: {
      title: "Vulcania",
      tagline: "Real-time community volcano monitoring",
      description:
        "Community volcanic monitoring for at-risk seismic zones: real-time collaborative map, chat, early alerts and push notifications.",
      metrics: [
        { label: "Map", value: "Real time" },
        { label: "Delivery", value: "In production" },
      ],
      blogSlug: "vulcania-monitoreo-volcanico-comunitario-en",
    },
  },
  {
    slug: "rapido-sur",
    stage: PROJECT_STAGES.YELLOW,
    tags: ["NestJS", "Next.js", "TypeScript", "PostgreSQL", "Docker"],
    featured: false,
    status: "production",
    publishDate: new Date("2026-03-02"),
    githubUrl: "https://github.com/sebitabravo/rapido-sur",
    liveUrl: undefined,
    order: 4,
    es: {
      title: "Rápido Sur",
      tagline: "ERP de mantenimiento para flotas enterprise",
      description:
        "Gestión de mantenimiento vehicular para flotas enterprise: backend NestJS con JWT, frontend Next.js y PostgreSQL con planes preventivos y órdenes de trabajo.",
      metrics: [
        { label: "Alcance", value: "45 vehículos" },
        { label: "Entrega", value: "15 semanas" },
      ],
      blogSlug: "rapido-sur-erp-mantenimiento-flotas",
    },
    en: {
      title: "Rápido Sur",
      tagline: "Maintenance ERP for enterprise fleets",
      description:
        "Fleet vehicle maintenance management for enterprise: NestJS backend with JWT auth, Next.js frontend and PostgreSQL with preventive plans and work orders.",
      metrics: [
        { label: "Scope", value: "45 vehicles" },
        { label: "Delivery", value: "15 weeks" },
      ],
      blogSlug: "rapido-sur-erp-mantenimiento-flotas",
    },
  },
  {
    slug: "wenuke",
    stage: PROJECT_STAGES.GREEN,
    tags: ["FastAPI", "Python", "Groq LLM", "WhatsApp API", "Turso"],
    featured: false,
    status: "production",
    publishDate: new Date("2026-05-03"),
    githubUrl: "https://github.com/sebitabravo/Wenuke",
    liveUrl: "https://frontend-lac-eight-97.vercel.app",
    order: 2,
    es: {
      title: "Werken-mapu",
      tagline: "Asistente climático agrícola vía WhatsApp",
      description:
        "Asistente climático agrícola para pequeños agricultores de Chile vía WhatsApp: IA conversacional con Groq Llama 3.1 70B, alertas de helada/lluvia en tiempo real y recomendaciones personalizadas por cultivo.",
      metrics: [
        { label: "Canal", value: "WhatsApp" },
        { label: "Modelo", value: "Llama 3.1 70B" },
      ],
      blogSlug: "wenuke-asistente-climatico-whatsapp",
    },
    en: {
      title: "Werken-mapu",
      tagline: "Agricultural climate assistant on WhatsApp",
      description:
        "Agricultural climate assistant for small farmers in Chile via WhatsApp: conversational AI with Groq Llama 3.1 70B, real-time frost/rain alerts and personalized crop recommendations.",
      metrics: [
        { label: "Channel", value: "WhatsApp" },
        { label: "Model", value: "Llama 3.1 70B" },
      ],
      blogSlug: "wenuke-asistente-climatico-whatsapp",
    },
  },
]

// Keep the existing stable per-locale arrays and avoid sharing mutable dates/tags between locales.
const projectsData: Record<Locale, Project[]> = {
  es: projectEntries.map(({ es, en: _en, ...shared }) => ({
    ...shared,
    tags: [...shared.tags],
    publishDate: new Date(shared.publishDate),
    ...es,
  })),
  en: projectEntries.map(({ en, es: _es, ...shared }) => ({
    ...shared,
    tags: [...shared.tags],
    publishDate: new Date(shared.publishDate),
    ...en,
  })),
}

export function getProjects(locale: Locale = "es") {
  return projectsData[locale]
}
