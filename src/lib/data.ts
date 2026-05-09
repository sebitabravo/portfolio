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
  status: "production" | "wip" | "archived"
  metrics?: { label: string; value: string }[]
  publishDate: Date
  image: string
  githubUrl?: string
  liveUrl?: string
  order: number
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
  calendly: "", // Tu link de Cal.com o Calendly
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
      description: `Técnico en Temutel, proveedor de servicios para Telsur. Realicé ~30+ instalaciones y configuraciones semanales de equipos de telecomunicaciones (routers, decodificadores, sistemas telefónicos) para clientes residenciales y comerciales, con soporte técnico en sitio.`,
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
      description: `Technician at Temutel, a service provider for Telsur. Handled ~30+ weekly installations and configurations of telecommunications equipment (routers, decoders, telephone systems) for residential and commercial clients, with on-site technical support.`,
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
      name: "Desarrollo de Aplicaciones Básicas",
      organization: "INACAP",
      description: "Fundamentos de programación orientada a objetos, estructuras de datos, algoritmos y desarrollo con Python.",
      issueDate: new Date("2024-12-01"),
      expirationDate: null,
      pdfUrl: "/certifications/basic-app-development.pdf",
      skills: ["POO", "Python", "Estructuras de Datos", "Algoritmos"],
      order: 4,
      category: 'academic' as const,
    },
    {
      name: "Soporte Computacional",
      organization: "INACAP",
      description: "Administración de sistemas Windows/Linux, troubleshooting de redes, Cisco Packet Tracer y mantenimiento preventivo.",
      issueDate: new Date("2024-12-01"),
      expirationDate: null,
      pdfUrl: "/certifications/computer-support.pdf",
      skills: ["Linux", "Windows", "Soporte Técnico", "Packet Tracer", "Networking"],
      order: 5,
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
      order: 6,
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
      order: 7,
      category: 'academic' as const,
    },
    {
      name: "Instalación y Configuración de Windows",
      organization: "Mastermind",
      description: "Instalación y configuración de Windows 10/11, Windows Server, Active Directory, Group Policy y PowerShell básico.",
      issueDate: new Date("2023-12-01"),
      expirationDate: null,
      pdfUrl: "/certifications/windows-installation.pdf",
      skills: ["Windows", "Windows Server", "Active Directory", "Group Policy"],
      order: 8,
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
      name: "Basic Application Development",
      organization: "INACAP",
      description: "Fundamentals of object-oriented programming, data structures, algorithms and Python development.",
      issueDate: new Date("2024-12-01"),
      expirationDate: null,
      pdfUrl: "/certifications/basic-app-development.pdf",
      skills: ["OOP", "Python", "Data Structures", "Algorithms"],
      order: 4,
      category: 'academic' as const,
    },
    {
      name: "Computer Support",
      organization: "INACAP",
      description: "Windows/Linux system administration, network troubleshooting, Cisco Packet Tracer and preventive maintenance.",
      issueDate: new Date("2024-12-01"),
      expirationDate: null,
      pdfUrl: "/certifications/computer-support.pdf",
      skills: ["Linux", "Windows", "Technical Support", "Packet Tracer", "Networking"],
      order: 5,
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
      order: 6,
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
      order: 7,
      category: 'academic' as const,
    },
    {
      name: "Windows Installation and Configuration",
      organization: "Mastermind",
      description: "Installation and configuration of Windows 10/11, Windows Server, Active Directory, Group Policy and basic PowerShell.",
      issueDate: new Date("2023-12-01"),
      expirationDate: null,
      pdfUrl: "/certifications/windows-installation.pdf",
      skills: ["Windows", "Windows Server", "Active Directory", "Group Policy"],
      order: 8,
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
