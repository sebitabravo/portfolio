import type { Locale } from "@/lib/i18n"

// PROYECTOS — Updated with new GitHub repos
// ============================================

const projectsData = {
  es: [
    {
      slug: "manttoai",
      title: "ManttoAI",
      description: "Mantenimiento predictivo para industria con IoT y ML: telemetría en tiempo real y dashboard interactivo.",
      tags: ["FastAPI", "React", "Machine Learning", "Docker", "IoT"],
      featured: false,
      status: "production" as const,
      metrics: [
        { label: "Resultado", value: "94.1% F1-Score" },
        { label: "Operación", value: "En producción" },
      ],
      publishDate: new Date("2026-04-29"),
      githubUrl: "https://github.com/sebitabravo/ManttoAI",
      liveUrl: undefined,
      order: 3,
      blogSlug: "manttoai-ml-iot-random-forest",
    },
    {
      slug: "vulcania",
      title: "Vulcania",
      description: "Monitoreo volcánico comunitario para zonas de riesgo sísmico: mapa colaborativo en tiempo real, chat, alertas tempranas y notificaciones push.",
      tags: ["Next.js", "TypeScript", "Supabase", "shadcn/ui"],
      featured: true,
      status: "production" as const,
      metrics: [
        { label: "Mapa", value: "Tiempo real" },
        { label: "Entrega", value: "En producción" },
      ],
      publishDate: new Date("2026-03-02"),
      githubUrl: "https://github.com/sebitabravo/vulcania-web",
      liveUrl: "https://vulcania-web.vercel.app",
      order: 1,
      blogSlug: "vulcania-monitoreo-volcanico-comunitario",
    },
    {
      slug: "rapido-sur",
      title: "Rápido Sur",
      description: "Gestión de mantenimiento vehicular para flotas enterprise: backend NestJS con JWT, frontend Next.js y PostgreSQL con planes preventivos y órdenes de trabajo.",
      order: 4,
      tags: ["NestJS", "Next.js", "TypeScript", "PostgreSQL", "Docker"],
      featured: false,
      status: "production" as const,
      metrics: [
        { label: "Dominio", value: "Flotas" },
        { label: "Flujo", value: "Preventivo + OT" },
      ],
      publishDate: new Date("2026-03-02"),
      githubUrl: "https://github.com/sebitabravo/rapido-sur",
      liveUrl: undefined,
      blogSlug: "rapido-sur-erp-mantenimiento-flotas",
    },
    {
      slug: "wenuke",
      title: "Werken-mapu",
      description: "Asistente climático agrícola para pequeños agricultores de Chile vía WhatsApp: IA conversacional con Groq Llama 3.1 70B, alertas de helada/lluvia en tiempo real y recomendaciones personalizadas por cultivo.",
      tags: ["FastAPI", "Python", "Groq LLM", "WhatsApp API", "Turso"],
      featured: false,
      status: "production" as const,
      metrics: [
        { label: "Canal", value: "WhatsApp" },
        { label: "Modelo", value: "Llama 3.1 70B" },
      ],
      publishDate: new Date("2026-05-03"),
      githubUrl: "https://github.com/sebitabravo/Wenuke",
      liveUrl: "https://frontend-lac-eight-97.vercel.app",
      order: 2,
      blogSlug: "wenuke-asistente-climatico-whatsapp",
    },
  ],
  en: [
    {
      slug: "manttoai",
      title: "ManttoAI",
      description: "Predictive maintenance for industry with IoT and ML: real-time telemetry and interactive dashboard.",
      order: 3,
      tags: ["FastAPI", "React", "Machine Learning", "Docker", "IoT"],
      featured: false,
      status: "production" as const,
      metrics: [
        { label: "Outcome", value: "94.1% F1-Score" },
        { label: "Runtime", value: "In production" },
      ],
      publishDate: new Date("2026-04-29"),
      githubUrl: "https://github.com/sebitabravo/ManttoAI",
      liveUrl: undefined,
      blogSlug: "manttoai-ml-iot-random-forest",
    },
    {
      slug: "vulcania",
      title: "Vulcania",
      description: "Community volcanic monitoring for at-risk seismic zones: real-time collaborative map, chat, early alerts and push notifications.",
      tags: ["Next.js", "TypeScript", "Supabase", "shadcn/ui"],
      featured: true,
      status: "production" as const,
      metrics: [
        { label: "Map", value: "Real time" },
        { label: "Delivery", value: "In production" },
      ],
      publishDate: new Date("2026-03-02"),
      githubUrl: "https://github.com/sebitabravo/vulcania-web",
      liveUrl: "https://vulcania-web.vercel.app",
      order: 1,
      blogSlug: "vulcania-monitoreo-volcanico-comunitario",
    },
    {
      slug: "rapido-sur",
      title: "Rápido Sur",
      description: "Fleet vehicle maintenance management for enterprise: NestJS backend with JWT auth, Next.js frontend and PostgreSQL with preventive plans and work orders.",
      order: 4,
      tags: ["NestJS", "Next.js", "TypeScript", "PostgreSQL", "Docker"],
      featured: false,
      status: "production" as const,
      metrics: [
        { label: "Domain", value: "Fleet ops" },
        { label: "Flow", value: "Preventive + WO" },
      ],
      publishDate: new Date("2026-03-02"),
      githubUrl: "https://github.com/sebitabravo/rapido-sur",
      liveUrl: undefined,
      blogSlug: "rapido-sur-erp-mantenimiento-flotas",
    },
    {
      slug: "wenuke",
      title: "Werken-mapu",
      description: "Agricultural climate assistant for small farmers in Chile via WhatsApp: conversational AI with Groq Llama 3.1 70B, real-time frost/rain alerts and personalized crop recommendations.",
      tags: ["FastAPI", "Python", "Groq LLM", "WhatsApp API", "Turso"],
      featured: false,
      status: "production" as const,
      metrics: [
        { label: "Channel", value: "WhatsApp" },
        { label: "Model", value: "Llama 3.1 70B" },
      ],
      publishDate: new Date("2026-05-03"),
      githubUrl: "https://github.com/sebitabravo/Wenuke",
      liveUrl: "https://frontend-lac-eight-97.vercel.app",
      order: 2,
      blogSlug: "wenuke-asistente-climatico-whatsapp",
    },
  ]
}

export function getProjects(locale: Locale = 'es') {
  return projectsData[locale]
}

// ============================================
