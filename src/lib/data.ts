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

// ============================================
// INFORMACIÓN PERSONAL Y CONFIGURACIÓN
// ============================================

export const personalInfo = {
  name: "Sebastian Bravo",
  title: "Frontend Developer",
  description: "Frontend Developer. Construyo interfaces con React y TypeScript. Estudiante de Ingeniería Informática. Proyectos reales con IoT, ML y arquitectura enterprise.",
  email: "hello@sebastianbravo.dev",
  location: "Chile 🇨🇱",
  available: true,
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
      company: "Temutel",
      position: "Técnico en Redes y Telecomunicaciones",
      description: `Trabajé en Temutel, empresa proveedora de servicios para Telsur. Realicé instalación, configuración y mantenimiento de equipos de telecomunicaciones (routers, decodificadores, sistemas telefónicos) para clientes residenciales y comerciales. Soporte técnico en sitio y configuración de redes.`,
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
      company: "Temutel",
      position: "Network and Telecommunications Technician",
      description: `Worked at Temutel, a service provider for Telsur. Performed installation, configuration and maintenance of telecommunications equipment (routers, decoders, telephone systems) for residential and commercial clients. On-site technical support and network configuration.`,
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

export const workExperience = workExperienceData.es

// ============================================
// PROYECTOS — Updated with new GitHub repos
// ============================================

const projectsData = {
  es: [
    {
      slug: "manttoai",
      title: "ManttoAI",
      description: "Plataforma de mantenimiento predictivo IoT con Machine Learning. Telemetría en tiempo real, modelo Random Forest (94.1% F1-Score) y dashboard interactivo.",
      fullDescription: `ManttoAI es una plataforma open-source de mantenimiento predictivo que captura telemetría en tiempo real desde dispositivos IoT (ESP32) vía MQTT, evalúa umbrales operacionales y ejecuta un modelo de Machine Learning (Random Forest) para predecir fallas antes de que ocurran.

## Características Principales

- **📡 Telemetría IoT en Tiempo Real** — Integración nativa con MQTT (Mosquitto) para temperatura, humedad y vibración
- **🧠 Predicciones ML** — Modelo Random Forest (94.1% F1-Score) para evaluar riesgo de falla
- **🚨 Alertas Inteligentes** — Evaluación automática de umbrales con notificaciones email
- **📊 Dashboard React** — SPA con auto-refresh, tendencias históricas y gestión de equipos
- **🛠️ Simulador IoT** — Simulador por software que genera datos realistas de sensores 24/7
- **🤖 Asistente IA** — Chat híbrido (reglas + Ollama) para consultas técnicas

## Stack Tecnológico

- **Backend**: FastAPI, SQLAlchemy, Pydantic, MySQL 8
- **Frontend**: React 18, Vite, Tailwind CSS
- **IoT**: ESP32, Eclipse Mosquitte (MQTT)
- **ML**: Scikit-learn, Pandas, NumPy
- **Infra**: Docker, Docker Compose, Nginx`,
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
      fullDescription: `Vulcania es una plataforma web comunitaria para monitoreo volcánico en tiempo real. Muestra estados de alerta, mapa de puntos de encuentro, sistema de avisos comunitarios y chat entre usuarios con soporte de imágenes.

## Características Principales

- **Estado del volcán en tiempo real** — Niveles verde/amarillo/naranja/rojo
- **Mapa interactivo** — Puntos de encuentro y zonas de seguridad
- **Comunidad** — Sistema de avisos y publicaciones
- **Chat en tiempo real** — Mensajes entre usuarios con imágenes
- **Notificaciones push** — Alertas directas al navegador
- **Panel admin** — Gestión de alertas y contenido

## Stack Tecnológico

- **Framework**: Next.js 15, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, DB, Realtime, Storage)
- **Deploy**: Vercel`,
      tags: ["Next.js", "TypeScript", "Supabase", "shadcn/ui"],
      featured: true,
      status: "production" as const,
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
      fullDescription: `Sistema web completo para la gestión de mantenimiento de flota vehicular. Arquitectura enterprise con módulos de autenticación JWT, gestión de vehículos, planes preventivos, órdenes de trabajo, catálogo de repuestos, alertas y generación de reportes.

## Características Principales

- **Gestión de vehículos** — CRUD completo con historial de mantenimiento
- **Planes preventivos** — Programación automática de mantenimientos
- **Órdenes de trabajo** — Flujo completo con tareas y repuestos
- **Alertas preventivas** — Notificaciones de mantenimiento próximo
- **Reportes** — Generación de informes de mantenimiento
- **Auth JWT** — Autenticación con roles y permisos

## Stack Tecnológico

- **Backend**: NestJS, TypeScript, PostgreSQL
- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Deploy**: Docker en Dokploy (Hostinger)`,
      tags: ["NestJS", "Next.js", "TypeScript", "PostgreSQL", "Docker"],
      featured: true,
      status: "production" as const,
      publishDate: new Date("2026-03-02"),
      image: "rapido-sur",
      githubUrl: "https://github.com/sebitabravo/rapido-sur",
      liveUrl: undefined,
    },
    {
      slug: "wenuke",
      title: "Wenuke",
      description: "Asistente climático agrícola por WhatsApp para pequeños agricultores de Chile. IA conversacional con Groq Llama 3.1 70B, alertas de helada/lluvia y recomendaciones por cultivo.",
      fullDescription: `Wenuke (Werken-mapu, "mensajero de la tierra" en mapudungún) es un asistente climático agrícola que llega donde el agricultor ya está: WhatsApp. Sin apps, sin sensores.

## El problema

Pequeños agricultores pierden hasta el 30% de su producción anual por decidir con pronósticos climáticos genéricos. Una helada sin aviso destruye meses de trabajo en una noche.

## La solución

El agricultor comparte su ubicación por WhatsApp, elige sus cultivos, y recibe alertas anticipadas de helada, lluvia y granizo con recomendaciones accionables generadas por IA.

## Características Principales

- **Alertas climáticas** — Pronóstico hiperlocal con OpenMeteo (gratis, sin API key)
- **IA conversacional** — Groq Llama 3.1 70B con fallback offline para recomendaciones por cultivo
- **Sin apps** — Todo por WhatsApp, zero fricción para el agricultor
- **Costo operativo $0-10 USD/mes** — Sin APIs pagas obligatorias
- **Mapa interactivo** — Leaflet + OpenStreetMap para ubicar parcelas
- **Base de datos serverless** — Turso + aiosqlite (dual local/cloud)

## Stack Tecnológico

- **API**: FastAPI (Python 3.12)
- **IA**: Groq Llama 3.1 70B + fallback offline
- **Clima**: OpenMeteo (gratis)
- **BD**: Turso + aiosqlite
- **Mapas**: Leaflet + OpenStreetMap
- **Frontend**: HTML5 + Tailwind CSS + Vanilla JS
- **Infra**: Vercel (Static + Serverless)
- **CI/CD**: GitHub Actions (ruff + mypy + pytest)`,
      tags: ["FastAPI", "Python", "Groq LLM", "WhatsApp API", "Turso"],
      featured: true,
      status: "production" as const,
      metrics: [
        { label: "CI/CD", value: "Activo" },
        { label: "Docs", value: "Arquitectura + API" },
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
      fullDescription: `ManttoAI is an open-source predictive maintenance platform that captures real-time telemetry from IoT devices (ESP32) via MQTT, evaluates operational thresholds, and runs a Machine Learning model (Random Forest) to predict equipment failures before they occur.

## Key Features

- **📡 Real-Time IoT Telemetry** — Native MQTT integration (Mosquitto) for temperature, humidity, and vibration
- **🧠 ML Predictions** — Random Forest model (94.1% F1-Score) for failure risk assessment
- **🚨 Smart Alerts** — Automatic threshold evaluation with email notifications
- **📊 React Dashboard** — SPA with auto-refresh, historical trends, and equipment management
- **🛠️ IoT Simulator** — Software simulator generating realistic sensor data 24/7
- **🤖 AI Assistant** — Hybrid chat (rules + Ollama) for technical operator queries

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, Pydantic, MySQL 8
- **Frontend**: React 18, Vite, Tailwind CSS
- **IoT**: ESP32, Eclipse Mosquitto (MQTT)
- **ML**: Scikit-learn, Pandas, NumPy
- **Infra**: Docker, Docker Compose, Nginx`,
      tags: ["FastAPI", "React", "Machine Learning", "Docker", "IoT"],
      featured: true,
      status: "production" as const,
      metrics: [
        { label: "F1-Score", value: "94.1%" },
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
      fullDescription: `Vulcania is a community web platform for real-time volcanic monitoring. Displays alert levels, meeting point maps, community notice board, and user chat with image support.

## Key Features

- **Real-time volcano status** — Green/yellow/orange/red alert levels
- **Interactive map** — Meeting points and safety zones
- **Community** — Notice board and publications
- **Real-time chat** — Messages between users with image support
- **Push notifications** — Direct browser alerts
- **Admin panel** — Alert and content management

## Tech Stack

- **Framework**: Next.js 15, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, DB, Realtime, Storage)
- **Deploy**: Vercel`,
      tags: ["Next.js", "TypeScript", "Supabase", "shadcn/ui"],
      featured: true,
      status: "production" as const,
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
      fullDescription: `A complete web system for fleet vehicle maintenance management. Enterprise architecture with JWT auth modules, vehicle management, preventive plans, work orders, parts catalog, alerts, and report generation.

## Key Features

- **Vehicle management** — Full CRUD with maintenance history
- **Preventive plans** — Automatic maintenance scheduling
- **Work orders** — Complete flow with tasks and parts
- **Preventive alerts** — Upcoming maintenance notifications
- **Reports** — Maintenance report generation
- **JWT Auth** — Role-based authentication and permissions

## Tech Stack

- **Backend**: NestJS, TypeScript, PostgreSQL
- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Deploy**: Docker on Dokploy (Hostinger)`,
      tags: ["NestJS", "Next.js", "TypeScript", "PostgreSQL", "Docker"],
      featured: true,
      status: "production" as const,
      publishDate: new Date("2026-03-02"),
      image: "rapido-sur",
      githubUrl: "https://github.com/sebitabravo/rapido-sur",
      liveUrl: undefined,
    },
    {
      slug: "wenuke",
      title: "Wenuke",
      description: "Agricultural climate assistant via WhatsApp for small farmers in Chile. Conversational AI with Groq Llama 3.1 70B, frost/rain alerts and crop-specific recommendations.",
      fullDescription: `Wenuke (Werken-mapu, "messenger of the land" in Mapudungún) is an agricultural climate assistant that reaches farmers where they already are: WhatsApp. No apps, no sensors.

## The Problem

Small farmers lose up to 30% of their annual production by relying on generic weather forecasts made for cities. An unannounced frost destroys months of work overnight.

## The Solution

Farmers share their location via WhatsApp, choose their crops, and receive early frost, rain and hail alerts with actionable AI-generated recommendations.

## Key Features

- **Weather alerts** — Hyperlocal forecast with OpenMeteo (free, no API key)
- **Conversational AI** — Groq Llama 3.1 70B with offline fallback for crop recommendations
- **No apps** — Everything via WhatsApp, zero friction for farmers
- **Operating cost $0-10 USD/month** — No paid APIs required
- **Interactive map** — Leaflet + OpenStreetMap for plot location
- **Serverless database** — Turso + aiosqlite (dual local/cloud)

## Tech Stack

- **API**: FastAPI (Python 3.12)
- **AI**: Groq Llama 3.1 70B + offline fallback
- **Weather**: OpenMeteo (free)
- **DB**: Turso + aiosqlite
- **Maps**: Leaflet + OpenStreetMap
- **Frontend**: HTML5 + Tailwind CSS + Vanilla JS
- **Infra**: Vercel (Static + Serverless)
- **CI/CD**: GitHub Actions (ruff + mypy + pytest)`,
      tags: ["FastAPI", "Python", "Groq LLM", "WhatsApp API", "Turso"],
      featured: true,
      status: "production" as const,
      metrics: [
        { label: "CI/CD", value: "Active" },
        { label: "Docs", value: "Architecture + API" },
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

export const projects = projectsData.es

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

export const education = educationData.es

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
      category: 'academic' as const,
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

export const certifications = certificationsData.es

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
    intro: `Frontend Developer. Armo interfaces con React y TypeScript — el tipo de código que no te da vergüenza mostrar en una code review y que no se rompe con el primer edge case.`,
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
  },
  en: {
    intro: `Frontend Developer. I build interfaces with React and TypeScript — the kind of code you wouldn't be ashamed to show in a code review and that doesn't break on the first edge case.`,
    experience: `I built ManttoAI, a predictive maintenance platform with IoT and Machine Learning. Developed Vulcania, a community volcanic monitoring system with real-time maps used by real people. Shipped Rápido Sur, an ERP for fleet maintenance with enterprise architecture. I don't do Todo List tutorials.`,
    personal: `I'm a Computer Engineering student at INACAP. I like understanding how things work under the hood — from how an ESP32 transmits telemetry to how Vercel compiles your routes. If your team values people who get their hands dirty instead of just moving components around, let's talk.`,
    interests: [
      "Real-world software architecture",
      "Applied Machine Learning",
      "Advanced TypeScript & type-safety",
      "Cloud computing & DevOps (Docker, AWS, Vercel)",
      "Clean code & automated testing",
    ],
    interestsTitle: "Interests",
    techStackTitle: "Tech Stack",
  }
}

export function getAboutMe(locale: Locale = 'es') {
  return aboutMeData[locale]
}

export const aboutMe = aboutMeData.es
