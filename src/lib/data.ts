/**
 * Datos del Portfolio - Sebastian Bravo
 *
 * Archivo centralizado con todos los datos del portfolio.
 * Diseñado con la estética Superhuman: projects sell themselves.
 */

import type { Locale } from "@/lib/i18n"

export interface ExperienceLogo {
  src: string
  alt: string
  url: string
}

export interface WorkExperience {
  company: string
  position: string
  description: string
  startDate: Date
  endDate?: Date | null
  current: boolean
  location?: string
  employmentType?: string
  skills: string[]
  logos?: ExperienceLogo[]
}

export interface Project {
  slug: string
  title: string
  description: string
  tags: string[]
  featured: boolean
  status: "production" | "development" | "demo"
  metrics?: { label: string; value: string }[]
  publishDate: Date
  githubUrl?: string
  liveUrl?: string
  order: number
  longDescription?: string
  problemStatement?: string
  approach?: string
  architecture?: string
  challenges?: { title: string; description: string }[]
  results?: string[]
  lessonsLearned?: string[]
}

export interface Education {
  institution: string
  degree: string
  description: string
  startDate: Date
  endDate?: Date | null
  current: boolean
  location?: string
  grade?: string
  skills: string[]
  order: number
}

export interface Certification {
  name: string
  organization: string
  description: string
  issueDate: Date
  expirationDate?: Date | null
  pdfUrl?: string
  skills: string[]
  order: number
  category: "professional" | "academic"
}

// ============================================
// INFORMACIÓN PERSONAL Y CONFIGURACIÓN
// ============================================

export const personalInfo = {
  name: "Sebastian Bravo",
  title: "Full-Stack Developer",
  description: "Full-Stack Developer. Construyo plataformas web completas con React, TypeScript, IoT y Machine Learning. Estudiante de Ingeniería Informática.",
  descriptionEn: "Full-Stack Developer. I build production-grade web platforms with React, TypeScript, IoT and Machine Learning. Computer Engineering student.",
  email: "sebitabravocontacto@gmail.com",
  location: "Chile 🇨🇱",
  available: true,
  calendly: "https://cal.com/sebitabravo/15min", // Cambiá por tu link real de Cal.com o Calendly
}

export const social = {
  github: "https://github.com/sebitabravo",
  linkedin: "https://linkedin.com/in/sebitabravo",
  twitter: "https://twitter.com/sebitabravo",
}

// ============================================
// EXPERIENCIA LABORAL
// ============================================

const workExperienceData = {
  es: [
    {
      company: "MIMASOFT",
      position: "Desarrollador Full Stack",
      description: `Contribuí al desarrollo de una plataforma SaaS de huella de carbono en producción para el sector minero e industrial. Estandaricé la capa de datos migrando 43 módulos a TanStack Query, resolví bug crítico de autenticación CSRF, implementé sistema de permisos granulares (15 permisos/módulo con guards por tenant) y eliminé +10K líneas de dead code reduciendo bundle y superficie de ataque.`,
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-04-30"),
      current: false,
      location: "Santiago, Chile (Remoto)",
      employmentType: "Contrato",
      skills: ["React", "TypeScript", "Laravel", "TanStack Query", "Docker", "Git"],
      logos: [
        { src: "/experience/mimasoft.png", alt: "MIMASOFT", url: "https://www.mimasoft.com" },
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
        { src: "/experience/temutel.png", alt: "Temutel Telecomunicaciones", url: "https://www.temutel.cl" },
        { src: "/experience/telsur.png", alt: "Telsur GTD", url: "https://www.telsur.cl" },
      ],
    }
  ],
  en: [
    {
      company: "MIMASOFT",
      position: "Full Stack Developer",
      description: `Contributed to a carbon footprint SaaS platform in production for the mining and industrial sector. Standardized the data layer by migrating 43 modules to TanStack Query, fixed a critical CSRF authentication bug, implemented granular permission system (15 permissions/module with tenant-based guards), and removed 10K+ lines of dead code reducing bundle size and attack surface.`,
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-04-30"),
      current: false,
      location: "Santiago, Chile (Remote)",
      employmentType: "Contract",
      skills: ["React", "TypeScript", "Laravel", "TanStack Query", "Docker", "Git"],
      logos: [
        { src: "/experience/mimasoft.png", alt: "MIMASOFT", url: "https://www.mimasoft.com" },
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
        { src: "/experience/temutel.png", alt: "Temutel Telecomunicaciones", url: "https://www.temutel.cl" },
        { src: "/experience/telsur.png", alt: "Telsur GTD", url: "https://www.telsur.cl" },
      ],
    }
  ]
}

export function getWorkExperience(locale: Locale = 'es') {
  return workExperienceData[locale]
}

// ============================================
// PROYECTOS — Updated with new GitHub repos
// ============================================

const projectsData = {
  es: [
    {
      slug: "manttoai",
      title: "ManttoAI",
      description: "Plataforma de mantenimiento predictivo IoT con Machine Learning. Telemetría en tiempo real, modelo Random Forest (94.1% F1-Score) y dashboard interactivo.",
      tags: ["FastAPI", "React", "Machine Learning", "Docker", "IoT"],
      featured: true,
      status: "production" as const,
      metrics: [
        { label: "F1-Score", value: "94.1%" },
        { label: "Stack", value: "6 techs" },
      ],
      publishDate: new Date("2026-04-29"),
      image: "manttoai",
      githubUrl: "https://github.com/sebitabravo/ManttoAI",
      liveUrl: undefined,
      order: 3,
      longDescription: `ManttoAI es una plataforma de mantenimiento predictivo que utiliza sensores IoT y Machine Learning para predecir fallas en equipos industriales antes de que ocurran. El sistema procesa telemetría en tiempo real (temperatura, vibración, corriente) desde sensores ESP32 y aplica un modelo Random Forest entrenado con datos históricos para generar alertas predictivas con un F1-Score de 94.1%. La arquitectura combina FastAPI para ingestión de datos de alta frecuencia, PostgreSQL para almacenamiento de series temporales, y React con Recharts para visualización interactiva. Todo el sistema se despliega con Docker Compose, facilitando la replicación en entornos industriales.`,
      problemStatement: `El mantenimiento industrial tradicional es reactivo (reparar cuando falla) o calendarizado (reemplazar por fecha). Ambos enfoques son ineficientes: el reactivo genera paradas no planificadas y pérdidas de producción; el calendarizado reemplaza componentes con vida útil remanente. La industria necesita mantenimiento basado en condición: intervenir solo cuando los datos indican que es necesario.`,
      approach: `Desarrollé un pipeline completo: sensores ESP32 capturan telemetría y la transmiten vía MQTT a un broker Mosquitto. Un worker en FastAPI consume los mensajes, los valida y los persiste en PostgreSQL. El modelo Random Forest se entrenó con datos etiquetados de fallas reales, optimizando hiperparámetros con GridSearchCV. El dashboard React consume una API REST que expone métricas agregadas y predicciones en tiempo real.`,
      architecture: `Microservicios con Docker Compose: broker MQTT (Mosquitto) → FastAPI ingestion worker → PostgreSQL (timeseries) → FastAPI REST API → React SPA. El modelo ML se sirve como un servicio independiente con joblib. Nginx como reverse proxy. Comunicación asincrónica vía MQTT para telemetría, REST síncrono para queries del dashboard.`,
      challenges: [
        { title: "Procesamiento de datos en tiempo real", description: "Los sensores transmiten a 1Hz. Con 10+ sensores, son 864,000 registros/día. Implementamos ventanas de agregación y downsampling para mantener queries rápidos." },
        { title: "Precisión del modelo en equipos diversos", description: "Un mismo modelo para distintos tipos de equipo (bombas, motores, compresores) tiende a generalizar mal. Usamos feature engineering específico por tipo de equipo y validación cruzada estratificada." },
        { title: "UX para operadores no técnicos", description: "El dashboard debía ser intuitivo para personal de planta sin experiencia en ML. Diseñamos indicadores visuales simples (verde/amarillo/rojo) con drill-down progresivo hacia datos técnicos." },
      ],
      results: [
        "Modelo Random Forest con 94.1% F1-Score en detección de fallas inminentes",
        "Dashboard interactivo con telemetría en tiempo real y alertas predictivas",
        "Arquitectura Docker Compose lista para deploy en entornos industriales",
        "Pipeline ETL completo desde sensor IoT hasta visualización",
      ],
      lessonsLearned: [
        "El feature engineering para series temporales (ventanas deslizantes, medias móviles, FFT) tuvo más impacto en la precisión que cambiar el algoritmo de ML",
        "MQTT QoS 2 es necesario para telemetría industrial; QoS 0 pierde mensajes en redes inestables",
        "Separar ingestion de queries en servicios FastAPI distintos permite escalar horizontalmente la lectura sin afectar la escritura",
        "Docker Compose es suficiente para deployments on-premise; Kubernetes sería sobre-ingeniería para 10-50 sensores",
      ],
    },
    {
      slug: "vulcania",
      title: "Vulcania",
      description: "Plataforma de monitoreo volcánico comunitario con mapa en tiempo real, chat, alertas y notificaciones push.",
      tags: ["Next.js", "TypeScript", "Supabase", "shadcn/ui"],
      featured: true,
      status: "production" as const,
      metrics: [
        { label: "Demo", value: "Online" },
        { label: "Stack", value: "4 techs" },
      ],
      publishDate: new Date("2026-03-02"),
      image: "vulcania",
      githubUrl: "https://github.com/sebitabravo/vulcania-web",
      liveUrl: "https://vulcania-web.vercel.app",
      order: 1,
      longDescription: `Vulcania es una plataforma de monitoreo volcánico comunitario que combina datos en tiempo real con herramientas de comunicación para comunidades que viven cerca de volcanes activos. La aplicación incluye un mapa interactivo con datos sismológicos actualizados, chat comunitario para coordinación, sistema de alertas configurables y notificaciones push. Construida con Next.js 14 App Router y Supabase, ofrece experiencia PWA instalable para funcionar incluso con conectividad limitada, algo crítico en zonas rurales cercanas a volcanes.`,
      problemStatement: `Las comunidades que viven cerca de volcanes activos dependen de información técnica dispersa (SERNAGEOMIN, ONEMI) que no está diseñada para consumo comunitario. No existe una herramienta accesible que centralice datos en tiempo real, permita comunicación entre vecinos y emita alertas comprensibles. Durante emergencias, la información fragmentada cuesta tiempo crítico.`,
      approach: `Diseñé la plataforma como PWA mobile-first. Next.js 14 App Router para SSR/SSG híbrido. Supabase (PostgreSQL + Realtime) para datos geoespaciales y sincronización en tiempo real del chat. Leaflet para el mapa interactivo con capas de datos volcánicos. Las notificaciones push usan Service Workers y Web Push API. La UI sigue principios de diseño inclusivo: alto contraste, texto grande, iconografía universal.`,
      architecture: `Next.js 14 App Router → Supabase (PostgreSQL + PostGIS + Realtime) → Leaflet mapa interactivo → PWA Service Worker para notificaciones push. Autenticación con Supabase Auth (OAuth + email). Row Level Security para datos comunitarios. Vercel para hosting con Edge Functions.`,
      challenges: [
        { title: "Sincronización en tiempo real multi-usuario", description: "El chat y las alertas debían reflejarse instantáneamente para todos los usuarios. Supabase Realtime resolvió el canal de broadcast, pero tuvimos que manejar race conditions en mensajes concurrentes con ordenamiento por timestamp del servidor." },
        { title: "Diseño mobile-first para uso en campo", description: "Los usuarios acceden principalmente desde smartphones en zonas con señal irregular. La PWA debía funcionar offline con datos cacheados y sincronizar al reconectar." },
        { title: "Notificaciones push confiables", description: "Las alertas de actividad volcánica son críticas. Implementamos reintentos exponenciales, suscripción a tópicos por nivel de urgencia, y fallback a SMS vía Twilio para alertas críticas." },
      ],
      results: [
        "Plataforma PWA funcional con demo online en producción",
        "Mapa interactivo en tiempo real con datos sismológicos",
        "Chat comunitario con sincronización instantánea vía Supabase Realtime",
        "Sistema de alertas con notificaciones push configurables por nivel de urgencia",
      ],
      lessonsLearned: [
        "Supabase Realtime simplifica drásticamente WebSockets; lo que antes requería un servicio dedicado ahora son suscripciones declarativas",
        "Las PWA son infravaloradas: instalabilidad, offline-first y notificaciones nativas sin pasar por app stores",
        "Row Level Security en Postgres (vía Supabase) permite delegar autorización a la capa de datos sin middleware complejo",
        "Leaflet sobre Mapbox/Google Maps: más liviano, open source, y suficiente para datos geoespaciales de complejidad media",
      ],
    },
    {
      slug: "rapido-sur",
      title: "Rápido Sur",
      description: "Sistema enterprise de gestión de mantenimiento vehicular. NestJS + Next.js + PostgreSQL con auth JWT, planes preventivos y órdenes de trabajo.",
      order: 4,
      tags: ["NestJS", "Next.js", "TypeScript", "PostgreSQL", "Docker"],
      featured: true,
      status: "production" as const,
      metrics: [
        { label: "Arquitectura", value: "Enterprise" },
        { label: "Stack", value: "5 techs" },
      ],
      publishDate: new Date("2026-03-02"),
      image: "rapido-sur",
      githubUrl: "https://github.com/sebitabravo/rapido-sur",
      liveUrl: undefined,
      longDescription: `Rápido Sur es un sistema enterprise de gestión de mantenimiento vehicular diseñado para flotas de transporte. La plataforma cubre el ciclo completo: registro de vehículos, planes de mantenimiento preventivo por kilometraje/tiempo, órdenes de trabajo con seguimiento de estado, y dashboard de métricas de flota. La arquitectura sigue patrones enterprise: autenticación JWT con refresh tokens rotativos, control de acceso basado en roles (admin, supervisor, mecánico), y API REST documentada con Swagger.`,
      problemStatement: `Las empresas de transporte con flotas medianas (20-200 vehículos) gestionan el mantenimiento con planillas Excel y comunicación por WhatsApp. Esto genera vehículos sin mantenimiento preventivo, reparaciones de emergencia costosas, y nula trazabilidad del historial. Un sistema centralizado con roles y workflows reduce costos operativos y extiende la vida útil de la flota.`,
      approach: `Modelé el dominio con DDD: vehículos, planes de mantenimiento, órdenes de trabajo y usuarios como agregados raíz. NestJS como backend modular con Guards para RBAC, Next.js App Router para el frontend con Server Components para datos estáticos y Client Components para interactividad. PostgreSQL con migraciones gestionadas por Prisma. Docker Compose para desarrollo y producción.`,
      architecture: `NestJS API REST (modular monolith) → Next.js 14 App Router → PostgreSQL + Prisma ORM → Docker Compose. Autenticación JWT con access/refresh tokens. Guards por rol (admin, supervisor, mecánico). Swagger auto-generado desde decoradores NestJS.`,
      challenges: [
        { title: "Lógica de mantenimiento preventivo", description: "Los planes combinan reglas por kilometraje, tiempo calendario y tipo de vehículo. Modelamos un engine de reglas configurable en vez de hardcodear intervalos, permitiendo ajustes por cliente sin deploy." },
        { title: "Control de acceso granular", description: "Tres roles con permisos distintos sobre vehículos, órdenes de trabajo y reportes. Implementamos Guards decorativos en NestJS con verificación a nivel de recurso, no solo de endpoint." },
        { title: "Migración de datos legacy", description: "Muchas flotas tenían datos históricos en Excel. Construimos un importador CSV con validación, deduplicación y trazabilidad de origen para preservar el historial durante la migración." },
      ],
      results: [
        "Sistema enterprise completo con arquitectura modular NestJS + Next.js",
        "API REST documentada con Swagger autogenerado",
        "Autenticación JWT con refresh tokens rotativos y RBAC de 3 roles",
        "Engine de reglas configurable para planes de mantenimiento preventivo",
      ],
      lessonsLearned: [
        "NestJS con sus Guards, Pipes e Interceptors reduce drásticamente el boilerplate de autorización y validación comparado con Express vanilla",
        "DDD en backend paga su complejidad inicial cuando el dominio tiene reglas de negocio no triviales como los planes de mantenimiento",
        "Prisma acelera el desarrollo pero sus queries generados pueden ser ineficientes para agregaciones; en esos casos raw SQL es necesario",
        "Docker Compose basta para entornos de staging y producción pequeña; Kubernetes se justifica cuando necesitás auto-scaling horizontal",
      ],
    },
    {
      slug: "wenuke",
      title: "Wenuke",
      description: "Asistente climático agrícola por WhatsApp para pequeños agricultores de Chile. IA conversacional con Groq Llama 3.1 70B, alertas de helada/lluvia y recomendaciones por cultivo.",
      tags: ["FastAPI", "Python", "Groq LLM", "WhatsApp API", "Turso"],
      featured: true,
      status: "production" as const,
      metrics: [
        { label: "Modelo", value: "Llama 3.1 70B" },
        { label: "Usuarios", value: "Agricultores" },
      ],
      publishDate: new Date("2026-05-03"),
      image: "wenuke",
      githubUrl: "https://github.com/sebitabravo/Wenuke",
      liveUrl: "https://frontend-lac-eight-97.vercel.app",
      order: 2,
      longDescription: `Wenuke es un asistente climático agrícola que entrega información precisa y accionable a pequeños agricultores chilenos directamente por WhatsApp, sin necesidad de instalar apps ni aprender interfaces nuevas. El sistema usa inteligencia artificial conversacional (Groq + Llama 3.1 70B) para interpretar preguntas en lenguaje natural sobre clima, heladas, lluvias y recomendaciones por tipo de cultivo. Los agricultores reciben alertas automáticas de helada y lluvia configuradas por ubicación, y pueden consultar condiciones específicas para sus cultivos (trigo, maíz, papas, hortalizas).`,
      problemStatement: `Los pequeños agricultores en Chile toman decisiones críticas (siembra, cosecha, protección contra heladas) con información climática genérica de la televisión o radio. No tienen acceso a datos precisos por ubicación ni a recomendaciones específicas por cultivo. Las apps climáticas existentes asumen smartphones modernos, conectividad permanente y alfabetización digital. WhatsApp, en cambio, es ubicuo incluso en zonas rurales con señal 3G.`,
      approach: `Desarrollé un chatbot de WhatsApp usando la API de Twilio para WhatsApp Business. El backend en FastAPI maneja webhooks de mensajes entrantes, consulta datos climáticos de Open-Meteo API, y usa Groq (Llama 3.1 70B) para interpretar lenguaje natural y generar respuestas contextuales en español chileno. La base de datos Turso (libsql) almacena preferencias de usuarios, ubicaciones guardadas y cultivos configurados. Las alertas programadas usan APScheduler para verificar condiciones cada 3 horas.`,
      architecture: `FastAPI (webhook handler + REST API) → Twilio WhatsApp Business API → Groq LLM (Llama 3.1 70B) → Open-Meteo API (datos climáticos) → Turso DB (libsql, edge). APScheduler para alertas programadas. Vercel para hosting serverless del frontend informativo.`,
      challenges: [
        { title: "Formato de mensajes WhatsApp", description: "WhatsApp limita mensajes a 4096 caracteres y no soporta markdown completo. Diseñamos respuestas concisas con formato simple (emojis, saltos de línea, negritas limitadas) priorizando información accionable sobre exhaustividad." },
        { title: "Latencia del LLM en conversación", description: "Llama 3.1 70B en Groq tarda 2-4 segundos en generar respuestas. Para no hacer esperar al agricultor, implementamos streaming de respuesta con actualizaciones parciales y un mensaje de 'escribiendo...' vía WhatsApp typing indicator." },
        { title: "Terminología agrícola en español", description: "Los LLMs genéricos no conocen bien términos agrícolas chilenos ('rulo' para secano, 'chacra', 'media sombra'). Fine-tuneamos prompts con glosario de términos y ejemplos de conversaciones reales de agricultores." },
      ],
      results: [
        "Chatbot conversacional con IA accesible vía WhatsApp sin instalar apps",
        "Alertas automáticas de helada/lluvia configurables por ubicación y cultivo",
        "Recomendaciones específicas por tipo de cultivo usando lenguaje natural",
        "Arquitectura serverless escalable con FastAPI + Turso edge database",
      ],
      lessonsLearned: [
        "WhatsApp como plataforma de delivery tiene tasas de engagement mucho más altas que apps propias en zonas rurales",
        "El prompt engineering con ejemplos del dominio (few-shot) fue más efectivo que fine-tuning para adaptar el LLM a terminología agrícola chilena",
        "Turso (libsql) en edge da latencias de lectura <1ms pero las escrituras son más lentas que PostgreSQL tradicional; ideal para cargas read-heavy como preferencias de usuario",
        "APScheduler en el mismo proceso FastAPI funciona para alertas simple; para escala mayor, separar scheduler a un worker independiente con Redis",
      ],
    },
  ],
  en: [
    {
      slug: "manttoai",
      title: "ManttoAI",
      description: "IoT predictive maintenance platform with Machine Learning. Real-time telemetry, Random Forest model (94.1% F1-Score) and interactive dashboard.",
      order: 3,
      tags: ["FastAPI", "React", "Machine Learning", "Docker", "IoT"],
      featured: true,
      status: "production" as const,
      metrics: [
        { label: "F1-Score", value: "94.1%" },
        { label: "Stack", value: "6 techs" },
      ],
      publishDate: new Date("2026-04-29"),
      image: "manttoai",
      githubUrl: "https://github.com/sebitabravo/ManttoAI",
      liveUrl: undefined,
      longDescription: `ManttoAI is a predictive maintenance platform that uses IoT sensors and Machine Learning to predict industrial equipment failures before they happen. The system processes real-time telemetry (temperature, vibration, current) from ESP32 sensors and applies a Random Forest model trained on historical data to generate predictive alerts with a 94.1% F1-Score. The architecture combines FastAPI for high-frequency data ingestion, PostgreSQL for time-series storage, and React with Recharts for interactive visualization. The entire system is deployed with Docker Compose, simplifying replication in industrial environments.`,
      problemStatement: `Traditional industrial maintenance is either reactive (fix when broken) or scheduled (replace by date). Both approaches are inefficient: reactive causes unplanned downtime and production losses; scheduled replaces components with remaining useful life. Industry needs condition-based maintenance: intervene only when data indicates it's necessary.`,
      approach: `I developed a complete pipeline: ESP32 sensors capture telemetry and transmit via MQTT to a Mosquitto broker. A FastAPI worker consumes messages, validates them, and persists them to PostgreSQL. The Random Forest model was trained on labeled failure data, optimizing hyperparameters with GridSearchCV. The React dashboard consumes a REST API that exposes aggregated metrics and real-time predictions.`,
      architecture: `Microservices with Docker Compose: MQTT broker (Mosquitto) → FastAPI ingestion worker → PostgreSQL (timeseries) → FastAPI REST API → React SPA. The ML model is served as an independent service using joblib. Nginx as reverse proxy. Async communication via MQTT for telemetry, synchronous REST for dashboard queries.`,
      challenges: [
        { title: "Real-time data processing", description: "Sensors transmit at 1Hz. With 10+ sensors, that's 864,000 records/day. We implemented aggregation windows and downsampling to keep queries fast." },
        { title: "Model accuracy across diverse equipment", description: "A single model for different equipment types (pumps, motors, compressors) tends to generalize poorly. We used equipment-specific feature engineering and stratified cross-validation." },
        { title: "UX for non-technical operators", description: "The dashboard had to be intuitive for plant personnel without ML experience. We designed simple visual indicators (green/yellow/red) with progressive drill-down to technical data." },
      ],
      results: [
        "Random Forest model with 94.1% F1-Score in imminent failure detection",
        "Interactive dashboard with real-time telemetry and predictive alerts",
        "Docker Compose architecture ready for industrial environment deployment",
        "Complete ETL pipeline from IoT sensor to visualization",
      ],
      lessonsLearned: [
        "Feature engineering for time series (sliding windows, moving averages, FFT) had more impact on accuracy than changing the ML algorithm",
        "MQTT QoS 2 is necessary for industrial telemetry; QoS 0 loses messages on unstable networks",
        "Separating ingestion from queries into distinct FastAPI services allows horizontal scaling of reads without affecting writes",
        "Docker Compose is sufficient for on-premise deployments; Kubernetes would be over-engineering for 10-50 sensors",
      ],
    },
    {
      slug: "vulcania",
      title: "Vulcania",
      description: "Community volcanic monitoring platform with real-time map, chat, alerts and push notifications.",
      tags: ["Next.js", "TypeScript", "Supabase", "shadcn/ui"],
      featured: true,
      status: "production" as const,
      metrics: [
        { label: "Demo", value: "Online" },
        { label: "Stack", value: "4 techs" },
      ],
      publishDate: new Date("2026-03-02"),
      image: "vulcania",
      githubUrl: "https://github.com/sebitabravo/vulcania-web",
      liveUrl: "https://vulcania-web.vercel.app",
      order: 1,
      longDescription: `Vulcania is a community volcanic monitoring platform that combines real-time data with communication tools for communities living near active volcanoes. The application includes an interactive map with up-to-date seismological data, community chat for coordination, configurable alert systems, and push notifications. Built with Next.js 14 App Router and Supabase, it offers an installable PWA experience that works even with limited connectivity — critical in rural areas near volcanoes.`,
      problemStatement: `Communities living near active volcanoes rely on scattered technical information (SERNAGEOMIN, ONEMI) that isn't designed for community consumption. There's no accessible tool that centralizes real-time data, enables neighbor-to-neighbor communication, and issues understandable alerts. During emergencies, fragmented information costs critical time.`,
      approach: `I designed the platform as a mobile-first PWA. Next.js 14 App Router for hybrid SSR/SSG. Supabase (PostgreSQL + Realtime) for geospatial data and real-time chat sync. Leaflet for the interactive map with volcanic data layers. Push notifications use Service Workers and the Web Push API. The UI follows inclusive design principles: high contrast, large text, universal iconography.`,
      architecture: `Next.js 14 App Router → Supabase (PostgreSQL + PostGIS + Realtime) → Leaflet interactive map → PWA Service Worker for push notifications. Authentication via Supabase Auth (OAuth + email). Row Level Security for community data. Vercel for hosting with Edge Functions.`,
      challenges: [
        { title: "Real-time multi-user sync", description: "Chat and alerts needed to reflect instantly for all users. Supabase Realtime solved the broadcast channel, but we had to handle race conditions in concurrent messages with server-timestamp ordering." },
        { title: "Mobile-first design for field use", description: "Users primarily access from smartphones in areas with spotty signal. The PWA had to work offline with cached data and sync on reconnect." },
        { title: "Reliable push notifications", description: "Volcanic activity alerts are critical. We implemented exponential retries, urgency-level topic subscriptions, and SMS fallback via Twilio for critical alerts." },
      ],
      results: [
        "Functional PWA platform with online demo in production",
        "Real-time interactive map with seismological data",
        "Community chat with instant sync via Supabase Realtime",
        "Alert system with configurable push notifications by urgency level",
      ],
      lessonsLearned: [
        "Supabase Realtime dramatically simplifies WebSockets; what previously required a dedicated service is now declarative subscriptions",
        "PWAs are underrated: installability, offline-first, and native notifications without going through app stores",
        "Row Level Security in Postgres (via Supabase) allows delegating authorization to the data layer without complex middleware",
        "Leaflet over Mapbox/Google Maps: lighter, open source, and sufficient for medium-complexity geospatial data",
      ],
    },
    {
      slug: "rapido-sur",
      title: "Rápido Sur",
      description: "Enterprise fleet vehicle maintenance system. NestJS + Next.js + PostgreSQL with JWT auth, preventive maintenance plans and work orders.",
      order: 4,
      tags: ["NestJS", "Next.js", "TypeScript", "PostgreSQL", "Docker"],
      featured: true,
      status: "production" as const,
      metrics: [
        { label: "Architecture", value: "Enterprise" },
        { label: "Stack", value: "5 techs" },
      ],
      publishDate: new Date("2026-03-02"),
      image: "rapido-sur",
      githubUrl: "https://github.com/sebitabravo/rapido-sur",
      liveUrl: undefined,
      longDescription: `Rápido Sur is an enterprise fleet vehicle maintenance system designed for transportation fleets. The platform covers the complete cycle: vehicle registration, preventive maintenance plans by mileage/time, work orders with status tracking, and fleet metrics dashboard. The architecture follows enterprise patterns: JWT authentication with rotating refresh tokens, role-based access control (admin, supervisor, mechanic), and Swagger-documented REST API.`,
      problemStatement: `Transportation companies with medium fleets (20-200 vehicles) manage maintenance with Excel spreadsheets and WhatsApp communication. This leads to vehicles without preventive maintenance, costly emergency repairs, and zero history traceability. A centralized system with roles and workflows reduces operational costs and extends fleet lifespan.`,
      approach: `I modeled the domain with DDD: vehicles, maintenance plans, work orders, and users as aggregate roots. NestJS as modular backend with Guards for RBAC, Next.js App Router for the frontend with Server Components for static data and Client Components for interactivity. PostgreSQL with Prisma-managed migrations. Docker Compose for development and production.`,
      architecture: `NestJS REST API (modular monolith) → Next.js 14 App Router → PostgreSQL + Prisma ORM → Docker Compose. JWT authentication with access/refresh tokens. Role-based Guards (admin, supervisor, mechanic). Swagger auto-generated from NestJS decorators.`,
      challenges: [
        { title: "Preventive maintenance logic", description: "Plans combine rules by mileage, calendar time, and vehicle type. We modeled a configurable rules engine instead of hardcoding intervals, allowing per-client adjustments without deployment." },
        { title: "Granular access control", description: "Three roles with distinct permissions over vehicles, work orders, and reports. We implemented decorative Guards in NestJS with resource-level verification, not just endpoint-level." },
        { title: "Legacy data migration", description: "Many fleets had historical data in Excel. We built a CSV importer with validation, deduplication, and source traceability to preserve history during migration." },
      ],
      results: [
        "Complete enterprise system with modular NestJS + Next.js architecture",
        "REST API documented with auto-generated Swagger",
        "JWT authentication with rotating refresh tokens and 3-role RBAC",
        "Configurable rules engine for preventive maintenance plans",
      ],
      lessonsLearned: [
        "NestJS with its Guards, Pipes, and Interceptors drastically reduces authorization and validation boilerplate compared to vanilla Express",
        "DDD in the backend pays its initial complexity cost when the domain has non-trivial business rules like maintenance plans",
        "Prisma accelerates development but its generated queries can be inefficient for aggregations; raw SQL is necessary in those cases",
        "Docker Compose is sufficient for staging and small production environments; Kubernetes is justified when horizontal auto-scaling is needed",
      ],
    },
    {
      slug: "wenuke",
      title: "Wenuke",
      description: "Agricultural climate assistant via WhatsApp for small farmers in Chile. Conversational AI with Groq Llama 3.1 70B, frost/rain alerts and crop-specific recommendations.",
      tags: ["FastAPI", "Python", "Groq LLM", "WhatsApp API", "Turso"],
      featured: true,
      status: "production" as const,
      metrics: [
        { label: "Model", value: "Llama 3.1 70B" },
        { label: "Users", value: "Small farmers" },
      ],
      publishDate: new Date("2026-05-03"),
      image: "wenuke",
      githubUrl: "https://github.com/sebitabravo/Wenuke",
      liveUrl: "https://frontend-lac-eight-97.vercel.app",
      order: 2,
      longDescription: `Wenuke is an agricultural climate assistant that delivers precise, actionable information to small Chilean farmers directly via WhatsApp — no app installation or new interfaces to learn. The system uses conversational AI (Groq + Llama 3.1 70B) to interpret natural language questions about weather, frost, rainfall, and crop-specific recommendations. Farmers receive automatic frost and rain alerts configured by location, and can query specific conditions for their crops (wheat, corn, potatoes, vegetables).`,
      problemStatement: `Small farmers in Chile make critical decisions (planting, harvesting, frost protection) with generic climate information from TV or radio. They lack access to precise location-based data and crop-specific recommendations. Existing climate apps assume modern smartphones, permanent connectivity, and digital literacy. WhatsApp, in contrast, is ubiquitous even in rural areas with 3G signal.`,
      approach: `I developed a WhatsApp chatbot using the Twilio API for WhatsApp Business. The FastAPI backend handles incoming message webhooks, queries climate data from Open-Meteo API, and uses Groq (Llama 3.1 70B) to interpret natural language and generate contextual responses in Chilean Spanish. The Turso database (libsql) stores user preferences, saved locations, and configured crops. Scheduled alerts use APScheduler to check conditions every 3 hours.`,
      architecture: `FastAPI (webhook handler + REST API) → Twilio WhatsApp Business API → Groq LLM (Llama 3.1 70B) → Open-Meteo API (climate data) → Turso DB (libsql, edge). APScheduler for scheduled alerts. Vercel for serverless hosting of the informational frontend.`,
      challenges: [
        { title: "WhatsApp message format", description: "WhatsApp limits messages to 4096 characters and doesn't support full markdown. We designed concise responses with simple formatting (emojis, line breaks, limited bold) prioritizing actionable information over exhaustiveness." },
        { title: "LLM latency in conversation", description: "Llama 3.1 70B on Groq takes 2-4 seconds to generate responses. To avoid making farmers wait, we implemented response streaming with partial updates and a 'typing...' indicator via WhatsApp typing indicator." },
        { title: "Agricultural terminology in Spanish", description: "Generic LLMs don't know Chilean agricultural terms well ('rulo' for dryland, 'chacra', 'media sombra'). We fine-tuned prompts with a glossary of terms and real farmer conversation examples." },
      ],
      results: [
        "Conversational AI chatbot accessible via WhatsApp without app installation",
        "Automatic frost/rain alerts configurable by location and crop",
        "Crop-specific recommendations using natural language",
        "Scalable serverless architecture with FastAPI + Turso edge database",
      ],
      lessonsLearned: [
        "WhatsApp as a delivery platform has much higher engagement rates than custom apps in rural areas",
        "Prompt engineering with domain examples (few-shot) was more effective than fine-tuning for adapting the LLM to Chilean agricultural terminology",
        "Turso (libsql) at the edge gives <1ms read latencies but writes are slower than traditional PostgreSQL; ideal for read-heavy workloads like user preferences",
        "APScheduler in the same FastAPI process works for simple alerts; for larger scale, separate the scheduler to an independent worker with Redis",
      ],
    },
  ]
}

export function getProjects(locale: Locale = 'es') {
  return projectsData[locale]
}

// ============================================
// EDUCACIÓN
// ============================================

const educationData = {
  es: [
    {
      institution: "INACAP",
      degree: "Ingeniería Informática",
      description: `Formación en desarrollo de software, arquitectura de sistemas y gestión de proyectos. Desarrollo de aplicaciones web completas usando React, Django, Python y bases de datos relacionales.`,
      startDate: new Date("2023-03-01"),
      endDate: new Date("2027-12-31"),
      current: true,
      location: "Chile",
      grade: "En curso",
      skills: ["POO", "Desarrollo Back-End", "Base de Datos", "Arquitectura de Software", "Full Stack"],
      order: 1,
    },
    {
      institution: "Liceo Politécnico Pueblo Nuevo",
      degree: "Técnico en Telecomunicaciones",
      description: `Formación técnica en instalación y configuración de redes de telecomunicaciones, fibra óptica, routers/switches empresariales y cableado estructurado.`,
      startDate: new Date("2021-03-01"),
      endDate: new Date("2022-12-31"),
      current: false,
      location: "Chile",
      grade: "6.2",
      skills: ["Routers/Switches", "Configuración de Redes", "Fibra Óptica", "Networking"],
      order: 2,
    },
  ],
  en: [
    {
      institution: "INACAP",
      degree: "Computer Engineering",
      description: `Training in software development, systems architecture and project management. Development of complete web applications using React, Django, Python and relational databases.`,
      startDate: new Date("2023-03-01"),
      endDate: new Date("2027-12-31"),
      current: true,
      location: "Chile",
      grade: "In progress",
      skills: ["OOP", "Back-End Development", "Database", "Software Architecture", "Full Stack"],
      order: 1,
    },
    {
      institution: "Liceo Politécnico Pueblo Nuevo",
      degree: "Telecommunications Technician",
      description: `Technical training in installation and configuration of telecommunications networks, fiber optics, enterprise routers/switches and structured cabling.`,
      startDate: new Date("2021-03-01"),
      endDate: new Date("2022-12-31"),
      current: false,
      location: "Chile",
      grade: "6.2",
      skills: ["Routers/Switches", "Network Configuration", "Fiber Optics", "Networking"],
      order: 2,
    },
  ]
}

export function getEducation(locale: Locale = 'es') {
  return educationData[locale]
}

// ============================================
// CERTIFICACIONES
// ============================================

const certificationsData = {
  es: [
    {
      name: "AWS Academy Graduate - AWS Academy Cloud Foundations",
      organization: "Amazon Web Services (AWS)",
      description: "Conocimientos fundamentales en computación en la nube, servicios AWS (EC2, S3, RDS, Lambda), arquitectura de alta disponibilidad y seguridad en la nube.",
      issueDate: new Date("2025-07-01"),
      expirationDate: null,
      pdfUrl: "/certifications/aws-cloud-foundations.pdf",
      skills: ["AWS", "Cloud Computing", "EC2", "S3", "Cloud Architecture"],
      order: 1,
      category: 'professional' as const,
    },
    {
      name: "Git de noob a pro",
      organization: "Mastermind",
      description: "Control de versiones avanzado con Git: branching strategies, Git Flow, resolución de conflictos, GitHub workflows y automatización.",
      issueDate: new Date("2025-01-01"),
      expirationDate: null,
      pdfUrl: "/certifications/git-noob-pro.pdf",
      skills: ["Git", "GitHub", "Control de Versiones", "Git Flow"],
      order: 2,
      category: 'professional' as const,
    },
    {
      name: "Desarrollador Full Stack",
      organization: "INACAP",
      description: "Desarrollo full stack completo: Frontend (HTML5, CSS3, JavaScript, React.js) y Backend (Python, Django, REST APIs), con deployment y mejores prácticas.",
      issueDate: new Date("2024-12-01"),
      expirationDate: null,
      pdfUrl: "/certifications/full-stack-developer.pdf",
      skills: ["Django", "Python", "JavaScript", "React.js", "REST API", "Full Stack"],
      order: 3,
      category: 'academic' as const,
    },
    {
      name: "Diseño y Gestión de Base de Datos",
      organization: "INACAP",
      description: "Diseño de bases de datos relacionales, SQL avanzado, MySQL, PostgreSQL, MongoDB y optimización de rendimiento.",
      issueDate: new Date("2024-10-01"),
      expirationDate: null,
      pdfUrl: "/certifications/database-design.pdf",
      skills: ["MongoDB", "MySQL", "PostgreSQL", "SQL", "Database Design"],
      order: 4,
      category: 'academic' as const,
    },
    {
      name: "Diseño Ágil de Sistemas",
      organization: "INACAP",
      description: "Metodologías ágiles (Scrum, Kanban), gestión de sprints, user stories y herramientas de gestión ágil (Jira, Trello).",
      issueDate: new Date("2024-10-01"),
      expirationDate: null,
      pdfUrl: "/certifications/agile-systems-design.pdf",
      skills: ["Scrum", "Metodologías Ágiles", "Agile", "Sprint Planning"],
      order: 5,
      category: 'academic' as const,
    },
  ],
  en: [
    {
      name: "AWS Academy Graduate - AWS Academy Cloud Foundations",
      organization: "Amazon Web Services (AWS)",
      description: "Fundamental knowledge in cloud computing, AWS services (EC2, S3, RDS, Lambda), high availability architecture and cloud security.",
      issueDate: new Date("2025-07-01"),
      expirationDate: null,
      pdfUrl: "/certifications/aws-cloud-foundations.pdf",
      skills: ["AWS", "Cloud Computing", "EC2", "S3", "Cloud Architecture"],
      order: 1,
      category: 'professional' as const,
    },
    {
      name: "Git from Noob to Pro",
      organization: "Mastermind",
      description: "Advanced version control with Git: branching strategies, Git Flow, conflict resolution, GitHub workflows and automation.",
      issueDate: new Date("2025-01-01"),
      expirationDate: null,
      pdfUrl: "/certifications/git-noob-pro.pdf",
      skills: ["Git", "GitHub", "Version Control", "Git Flow"],
      order: 2,
      category: 'professional' as const,
    },
    {
      name: "Full Stack Developer",
      organization: "INACAP",
      description: "Complete full stack development: Frontend (HTML5, CSS3, JavaScript, React.js) and Backend (Python, Django, REST APIs), with deployment and best practices.",
      issueDate: new Date("2024-12-01"),
      expirationDate: null,
      pdfUrl: "/certifications/full-stack-developer.pdf",
      skills: ["Django", "Python", "JavaScript", "React.js", "REST API", "Full Stack"],
      order: 3,
      category: 'academic' as const,
    },
    {
      name: "Database Design and Management",
      organization: "INACAP",
      description: "Relational database design, advanced SQL, MySQL, PostgreSQL, MongoDB and performance optimization.",
      issueDate: new Date("2024-10-01"),
      expirationDate: null,
      pdfUrl: "/certifications/database-design.pdf",
      skills: ["MongoDB", "MySQL", "PostgreSQL", "SQL", "Database Design"],
      order: 4,
      category: 'academic' as const,
    },
    {
      name: "Agile Systems Design",
      organization: "INACAP",
      description: "Agile methodologies (Scrum, Kanban), sprint management, user stories and agile management tools (Jira, Trello).",
      issueDate: new Date("2024-10-01"),
      expirationDate: null,
      pdfUrl: "/certifications/agile-systems-design.pdf",
      skills: ["Scrum", "Agile Methodologies", "Agile", "Sprint Planning"],
      order: 5,
      category: 'academic' as const,
    },
  ]
}

export function getCertifications(locale: Locale = 'es') {
  return certificationsData[locale]
}

// ============================================
// HABILIDADES TÉCNICAS
// ============================================

export const skills = {
  frontend: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS"],
  backend: ["Django", "FastAPI", "NestJS", "Python", "Node.js", "REST API"],
  databases: ["PostgreSQL", "MySQL", "MongoDB", "SQLite"],
  tools: ["Git", "Docker", "Linux", "AWS", "Vercel"],
  methodologies: ["Scrum", "Agile", "Git Flow"],
}

// ============================================
// SOBRE MÍ
// ============================================

const aboutMeData = {
  es: {
    intro: `Full-Stack Developer. Construyo plataformas web completas con React, TypeScript, IoT y Machine Learning — el tipo de código que no te da vergüenza mostrar en una code review y que no se rompe con el primer edge case.`,
    experience: `Construí ManttoAI, una plataforma de mantenimiento predictivo con IoT y Machine Learning. Desarrollé Vulcania, un sistema comunitario de monitoreo volcánico con mapa en tiempo real usado por personas reales. Armé Rápido Sur, un ERP de gestión de flotas vehiculares con arquitectura enterprise. No hago tutoriales de Todo List.`,
    personal: `Estudio Ingeniería Informática en INACAP. Me gusta entender cómo funcionan las cosas por debajo — desde cómo un ESP32 transmite telemetría hasta cómo Vercel compila tus rutas. Si tu equipo valora gente que se ensucia las manos y no solo mueve componentes, hablemos.`,
    interests: [
      "Arquitectura de software a escala real",
      "Machine Learning aplicado a problemas concretos",
      "TypeScript avanzado y type-safety",
      "Cloud computing & DevOps (Docker, AWS, Vercel)",
      "Clean code & testing automatizado",
    ],
    interestsTitle: "Intereses",
    techStackTitle: "Stack Tecnológico",
    lookingFor: `Busco un equipo donde pueda contribuir con impacto real. Me motivan los proyectos que resuelven problemas concretos con tecnología bien aplicada — TypeScript, Python, cloud y testing automatizado.`,
  },
  en: {
    intro: `Full-Stack Developer. I build production-grade web platforms with React, TypeScript, IoT and Machine Learning, focused on clean code and solid architecture.`,
    experience: `I built ManttoAI, a predictive maintenance platform with IoT and Machine Learning. Developed Vulcania, a community volcanic monitoring system with real-time maps. Shipped Rápido Sur, an ERP for fleet maintenance with enterprise architecture. Every project I take on solves a real problem.`,
    personal: `I'm a Computer Engineering student at INACAP. I like understanding how things work under the hood — from how an ESP32 transmits telemetry to how Vercel compiles your routes. If your team values curiosity and technical depth, let's talk.`,
    interests: [
      "Real-world software architecture",
      "Applied Machine Learning",
      "Advanced TypeScript & type-safety",
      "Cloud computing & DevOps (Docker, AWS, Vercel)",
      "Clean code & automated testing",
    ],
    interestsTitle: "Interests",
    techStackTitle: "Tech Stack",
    lookingFor: `I'm looking for a team where I can make a real impact. I'm motivated by projects that solve concrete problems with well-applied technology — TypeScript, Python, cloud and automated testing.`,
  }
}

export function getAboutMe(locale: Locale = 'es') {
  return aboutMeData[locale]
}
