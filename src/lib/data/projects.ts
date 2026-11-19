import type { Locale } from "@/lib/i18n"
import { PROJECT_STAGES, type Project } from "./types"

type SharedProject = Pick<
  Project,
  "slug" | "tags" | "featured" | "homeStage" | "stageOrder" | "status" | "publishDate" | "githubUrl" | "liveUrl" | "order" | "stage"
>
type LocalizedProject = Pick<Project, "title" | "tagline" | "description" | "metrics" | "blogSlug"> & {
  // decision/trade-off del escenario (§2 momento 2). Trade-off ausente = la columna no se pinta, nunca queda vacía.
  decision?: string
  tradeoff?: string
}
type ProjectEntry = SharedProject & Record<Locale, LocalizedProject>

const projectEntries: ProjectEntry[] = [
  {
    slug: "copiloto",
    stage: PROJECT_STAGES.ORANGE,
    tags: ["FastAPI", "Python", "Docker", "Chatwoot", "LLM local", "SQLite"],
    featured: false,
    homeStage: true,
    stageOrder: 0,
    status: "development",
    publishDate: new Date("2026-10-28"),
    githubUrl: "https://github.com/sebitabravo/copiloto-recepcion",
    liveUrl: undefined,
    order: 0,
    es: {
      title: "Copiloto de Recepción",
      tagline: "Recepción hotelera con IA que no inventa y no confirma sola",
      description:
        "Asistente de WhatsApp para pymes de alojamiento: responde con datos verificados del hotel, consulta la disponibilidad en el PMS y deja la reserva lista para que la confirme una persona. Modelo local, métricas y panel con cronómetro de tres minutos.",
      metrics: [
        { label: "Pruebas", value: "194 en verde" },
        { label: "Lighthouse", value: "100 / 100 / 100 / 100" },
      ],
      decision:
        "LLM local (llama.cpp + Qwen 2.5) con los datos del hotel servidos por una herramienta en vez de la memoria del modelo.",
      tradeoff:
        "La inferencia cuesta unos 18 s, así que un camino de reglas que responde en 0,3 s se hace cargo del fallback cuando el modelo no está disponible.",
      blogSlug: "copiloto-recepcion-hotel-ia-local",
    },
    en: {
      title: "Reception Copilot",
      tagline: "Hotel reception AI that does not invent and does not confirm alone",
      description:
        "WhatsApp assistant for small lodging businesses: answers with verified hotel data, checks PMS availability and leaves the booking ready for a person to confirm. Local model, metrics and a panel with a three-minute timer.",
      metrics: [
        { label: "Tests", value: "194 green" },
        { label: "Lighthouse", value: "100 / 100 / 100 / 100" },
      ],
      decision:
        "Local LLM (llama.cpp + Qwen 2.5) serving hotel data through a tool instead of the model's memory.",
      tradeoff:
        "Inference takes about 18 s, so a rules path answering in 0.3 s takes over the fallback whenever the model is unavailable.",
      blogSlug: "copiloto-recepcion-hotel-ia-local-en",
    },
  },
  {
    slug: "manttoai",
    stage: PROJECT_STAGES.BLUE,
    tags: ["FastAPI", "React", "Machine Learning", "Docker", "IoT"],
    featured: false,
    homeStage: true,
    stageOrder: 3,
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
      decision: "Random Forest explicable con 5 features en vez de deep learning, sin GPU.",
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
      decision: "Explainable Random Forest with 5 features instead of deep learning, no GPU.",
      blogSlug: "manttoai-ml-iot-random-forest-en",
    },
  },
  {
    slug: "vulcania",
    stage: PROJECT_STAGES.RED,
    tags: ["Next.js", "TypeScript", "Supabase", "shadcn/ui"],
    featured: true,
    homeStage: true,
    stageOrder: 2,
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
      decision: "Leaflet + OpenStreetMap en vez de Mapbox o Google Maps.",
      tradeoff: "El import dinámico con `ssr: false` cuesta trabajo de integración extra.",
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
      decision: "Leaflet + OpenStreetMap instead of Mapbox or Google Maps.",
      tradeoff: "The dynamic import with `ssr: false` costs extra integration work.",
      blogSlug: "vulcania-monitoreo-volcanico-comunitario-en",
    },
  },
  {
    slug: "rapido-sur",
    stage: PROJECT_STAGES.YELLOW,
    tags: ["NestJS", "Next.js", "TypeScript", "PostgreSQL", "Docker"],
    featured: false,
    // §10 (decisión del owner): fuera del escenario del home hasta que exista una captura real
    // de su interfaz. El post asociado se filtra en su propia unidad.
    homeStage: false,
    stageOrder: 4,
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
    homeStage: true,
    stageOrder: 1,
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
      decision: "Turso + aiosqlite en vez de PostgreSQL para el despliegue serverless en el edge.",
      tradeoff:
        "Las escrituras en el edge son más lentas que en PostgreSQL tradicional, así que sirve solo para carga con dominio de lecturas.",
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
      decision: "Turso + aiosqlite instead of PostgreSQL for the serverless deployment at the edge.",
      tradeoff:
        "Writes at the edge are slower than in traditional PostgreSQL, so it only serves read-dominated load.",
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

/** Proyectos del escenario del home (§10): solo homeStage, en el orden del diseño (stageOrder). */
export function getStageProjects(locale: Locale = "es") {
  return projectsData[locale]
    .filter((project) => project.homeStage)
    .slice()
    .sort((a, b) => a.stageOrder - b.stageOrder)
}
