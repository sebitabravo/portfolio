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
  blogSlug?: string
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
  pdfUrl?: string
  order: number
  category: "professional" | "academic"
}

// ============================================
// INFORMACIÓN PERSONAL Y CONFIGURACIÓN
// ============================================

export const personalInfo = {
  name: "Sebastian Bravo",
  title: "Full-Stack Developer",
  description: "Full-Stack Developer. Construyo plataformas web completas con React, TypeScript, IoT y Machine Learning. Estudiante de Ingeniería Informática. Inglés C1.",
  descriptionEn: "Full-Stack Developer. I build production-grade web platforms with React, TypeScript, IoT and Machine Learning. Computer Engineering student. English C1.",
  email: "sebitabravocontacto@gmail.com",
  location: "Chile 🇨🇱",
  available: true,
}

export const social = {
  github: "https://github.com/sebitabravo",
  linkedin: "https://linkedin.com/in/sebitabravo",
}

// ============================================
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
      githubUrl: "https://github.com/sebitabravo/ManttoAI",
      liveUrl: undefined,
      order: 3,
      blogSlug: "manttoai-ml-iot-random-forest",
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
      githubUrl: "https://github.com/sebitabravo/vulcania-web",
      liveUrl: "https://vulcania-web.vercel.app",
      order: 1,
      blogSlug: "vulcania-monitoreo-volcanico-comunitario",
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
      githubUrl: "https://github.com/sebitabravo/rapido-sur",
      liveUrl: undefined,
      blogSlug: "rapido-sur-erp-mantenimiento-flotas",
    },
    {
      slug: "wenuke",
      title: "Werken-mapu",
      description: "Asistente climático agrícola por WhatsApp para pequeños agricultores de Chile. IA conversacional con Groq Llama 3.1 70B, alertas de helada/lluvia y recomendaciones por cultivo.",
      tags: ["FastAPI", "Python", "Groq LLM", "WhatsApp API", "Turso"],
      featured: true,
      status: "production" as const,
      metrics: [
        { label: "Modelo", value: "Llama 3.1 70B" },
        { label: "Usuarios", value: "Agricultores" },
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
      githubUrl: "https://github.com/sebitabravo/ManttoAI",
      liveUrl: undefined,
      blogSlug: "manttoai-ml-iot-random-forest",
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
      githubUrl: "https://github.com/sebitabravo/vulcania-web",
      liveUrl: "https://vulcania-web.vercel.app",
      order: 1,
      blogSlug: "vulcania-monitoreo-volcanico-comunitario",
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
      githubUrl: "https://github.com/sebitabravo/rapido-sur",
      liveUrl: undefined,
      blogSlug: "rapido-sur-erp-mantenimiento-flotas",
    },
    {
      slug: "wenuke",
      title: "Werken-mapu",
      description: "Agricultural climate assistant via WhatsApp for small farmers in Chile. Conversational AI with Groq Llama 3.1 70B, frost/rain alerts and crop-specific recommendations.",
      tags: ["FastAPI", "Python", "Groq LLM", "WhatsApp API", "Turso"],
      featured: true,
      status: "production" as const,
      metrics: [
        { label: "Model", value: "Llama 3.1 70B" },
        { label: "Users", value: "Small farmers" },
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
      pdfUrl: "/certifications/aws-cloud-foundations.pdf",
      order: 1,
      category: 'professional' as const,
    },
    {
      name: "Git de noob a pro",
      organization: "Mastermind",
      pdfUrl: "/certifications/git-noob-pro.pdf",
      order: 2,
      category: 'professional' as const,
    },
    {
      name: "Desarrollador Full Stack",
      organization: "INACAP",
      pdfUrl: "/certifications/full-stack-developer.pdf",
      order: 3,
      category: 'academic' as const,
    },
    {
      name: "Diseño y Gestión de Base de Datos",
      organization: "INACAP",
      pdfUrl: "/certifications/database-design.pdf",
      order: 4,
      category: 'academic' as const,
    },
    {
      name: "Diseño Ágil de Sistemas",
      organization: "INACAP",
      pdfUrl: "/certifications/agile-systems-design.pdf",
      order: 5,
      category: 'academic' as const,
    },
  ],
  en: [
    {
      name: "AWS Academy Graduate - AWS Academy Cloud Foundations",
      organization: "Amazon Web Services (AWS)",
      pdfUrl: "/certifications/aws-cloud-foundations.pdf",
      order: 1,
      category: 'professional' as const,
    },
    {
      name: "Git from Noob to Pro",
      organization: "Mastermind",
      pdfUrl: "/certifications/git-noob-pro.pdf",
      order: 2,
      category: 'professional' as const,
    },
    {
      name: "Full Stack Developer",
      organization: "INACAP",
      pdfUrl: "/certifications/full-stack-developer.pdf",
      order: 3,
      category: 'academic' as const,
    },
    {
      name: "Database Design and Management",
      organization: "INACAP",
      pdfUrl: "/certifications/database-design.pdf",
      order: 4,
      category: 'academic' as const,
    },
    {
      name: "Agile Systems Design",
      organization: "INACAP",
      pdfUrl: "/certifications/agile-systems-design.pdf",
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
    techStackSubtitle: "Las herramientas con las que construyo día a día",
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
    techStackSubtitle: "The tools I build with day to day",
    lookingFor: `I'm looking for a team where I can make a real impact. I'm motivated by projects that solve concrete problems with well-applied technology — TypeScript, Python, cloud and automated testing.`,
  }
}

export function getAboutMe(locale: Locale = 'es') {
  return aboutMeData[locale]
}
