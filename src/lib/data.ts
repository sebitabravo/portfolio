/**
 * Datos del Portfolio - Sebastian Bravo
 *
 * Archivo centralizado con todos los datos del portfolio en español.
 * Inspirado en la arquitectura simple del portfolio de referencia.
 */

import type { Locale } from "@/lib/i18n"

// ============================================
// INFORMACIÓN PERSONAL Y CONFIGURACIÓN
// ============================================

export const personalInfo = {
  name: "Sebastian Bravo",
  title: "Desarrollador Full Stack",
  description: "Desarrollador Full Stack apasionado por crear aplicaciones web modernas y eficientes. Especializado en React, Django y tecnologías cloud.",
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
      description: `Instalación, configuración y mantenimiento de equipos de telecomunicaciones (routers, decodificadores, sistemas telefónicos) para clientes residenciales y comerciales. Soporte técnico en sitio y configuración de redes.`,
      startDate: new Date("2022-12-01"),
      endDate: new Date("2023-02-28"),
      current: false,
      location: "Temuco, Araucanía, Chile",
      employmentType: "Contrato temporal",
      skills: ["Mantenimiento de Redes", "Instalación de Equipos", "Configuración de Routers", "Soporte Técnico"],
    }
  ],
  en: [
    {
      company: "Temutel",
      position: "Network and Telecommunications Technician",
      description: `Installation, configuration and maintenance of telecommunications equipment (routers, decoders, telephone systems) for residential and commercial clients. On-site technical support and network configuration.`,
      startDate: new Date("2022-12-01"),
      endDate: new Date("2023-02-28"),
      current: false,
      location: "Temuco, Araucanía, Chile",
      employmentType: "Temporary contract",
      skills: ["Network Maintenance", "Equipment Installation", "Router Configuration", "Technical Support"],
    }
  ]
}

export function getWorkExperience(locale: Locale = 'es') {
  return workExperienceData[locale]
}

// Mantener exportación por defecto para compatibilidad
export const workExperience = workExperienceData.es

// ============================================
// PROYECTOS
// ============================================

const projectsData = {
  es: [
    {
      slug: "camport",
      title: "CAMPORT - Sistema de Gestión Ganadera",
      description: "Un sistema de gestión ganadera con integración IoT.",
      fullDescription: `Una solución integral para la gestión ganadera, aprovechando IoT para el seguimiento de animales y la recopilación de datos en tiempo real.

## Características

- Seguimiento de la ubicación de los animales en tiempo real
- Monitoreo de la salud a través de sensores IoT
- Panel de análisis y reportes de datos
- Gestión de usuarios para el personal de la granja

## Tecnologías

- **Frontend**: JavaScript
- **Backend**: Node.js
- **Hardware**: Dispositivos IoT`,
      tags: ["JavaScript", "IoT"],
      featured: true,
      publishDate: new Date("2025-10-16"),
      image: "camport",
      githubUrl: "https://github.com/sebitabravo/iotlights",
      liveUrl: undefined,
      order: 1,
    },
    {
      slug: "banking-client-management",
      title: "Sistema de Gestión de Clientes Bancarios",
      description: "Sistema bancario full-stack con API REST, dashboard interactivo, autenticación JWT y despliegue en Docker",
    fullDescription: `Un sistema completo de gestión de clientes bancarios con API REST, dashboard interactivo, autenticación JWT y despliegue en Docker. Cuenta con un frontend moderno en React con estadísticas completas y análisis de riesgo de clientes.

## Características Principales

- **API REST completa** con autenticación JWT y tokens de actualización
- **Dashboard interactivo** con 4 vistas: Dashboard, CRUD, Análisis y Monitoreo de salud
- **5 gráficos Recharts** para visualización de datos
- **90% de reducción en llamadas API** mediante caché inteligente
- **Middleware de seguridad personalizado** con limitación de tasa
- **Documentación Swagger/OpenAPI**
- **18 casos de prueba pytest** para confiabilidad
- **Modo demo** con restricciones de solo lectura

## Tecnologías

- **Frontend**: React 18.3.1, Tailwind CSS, shadcn/ui
- **Backend**: Django 5.1.3, Django REST Framework 3.15.2
- **Base de datos**: PostgreSQL 16
- **Infraestructura**: Docker, Gunicorn`,
    tags: ["Django", "React", "PostgreSQL", "Docker"],
    featured: true,
    publishDate: new Date("2025-10-16"),
    image: "banking",
    githubUrl: "https://github.com/sebitabravo/eva3-backend",
    liveUrl: "https://eva3-backend.vercel.app/",
    order: 2,
  },
  {
    slug: "restaurant-booking-api",
    title: "API de Gestión de Reservas de Restaurante",
    description: "API REST profesional para gestión de reservas de restaurante construida con Django y PostgreSQL",
    fullDescription: `Una API REST profesional para la gestión de reservas de restaurante, construida con Django y Django Rest Framework. Cuenta con autenticación completa, limitación de tasa y estadísticas avanzadas para sistemas de reservas escalables.

## Características Principales

- **API pública de lectura** (100 peticiones/hora) para ver reservas
- **Acceso de escritura solo para administradores** (20 peticiones/hora) para gestionar recursos
- **Gestión de recursos multiusuario** con autenticación segura
- **Estadísticas y métricas avanzadas** para análisis de reservas
- **Validación robusta** con manejo completo de errores
- **Limitación de tasa** para protección de la API
- **Documentación Swagger/OpenAPI** para fácil integración
- **Autenticación JWT** con soporte de tokens de actualización

## Tecnologías

- **Backend**: Django 5.1.3, Django REST Framework 3.15.2
- **Base de datos**: PostgreSQL 16
- **Autenticación**: JWT con tokens de actualización
- **Servidor**: Gunicorn
- **Despliegue**: Docker

## Aspectos Únicos

- Opciones de despliegue flexibles (local y Docker)
- Scripts de monitoreo de recursos
- Limitación y throttling avanzado de tasa
- Implementaciones de seguridad completas
- Configuración basada en entorno`,
    tags: ["Django", "PostgreSQL", "Docker"],
    featured: false,
    publishDate: new Date("2025-10-16"),
    image: "restaurant",
    githubUrl: "https://github.com/sebitabravo/eva2-backend",
    liveUrl: undefined,
    order: 3,
  },
    {
      slug: "crm-small-business",
      title: "CRM para Pequeñas Empresas",
      description: "Aplicación web de CRM para gestionar clientes, productos y pedidos de manera eficiente",
      fullDescription: `Una aplicación web de Customer Relationship Management (CRM) diseñada para pequeñas empresas, donde se pueden gestionar clientes, productos y pedidos de manera sencilla y eficiente. Migrado de JavaScript vanilla a React para mejorar la experiencia de usuario.

## Características Principales

- **Gestión de clientes** - Seguimiento y organización de información de clientes
- **Catálogo de productos** - Administración de inventario y detalles de productos
- **Procesamiento de pedidos** - Manejo de pedidos y seguimiento de su estado
- **UX mejorada** - Interfaz moderna en React con navegación fluida

## Tecnologías

- **Frontend**: React, React Router, Bootstrap
- **Cliente HTTP**: Axios para peticiones API
- **Despliegue**: Vercel`,
      tags: ["React", "JavaScript", "Bootstrap"],
      featured: false,
      publishDate: new Date("2025-10-16"),
      image: "crm",
      githubUrl: "https://github.com/sebitabravo/crm-react",
      liveUrl: undefined,
      order: 8,
    },
  ],
  en: [
    {
      slug: "camport",
      title: "CAMPORT - Livestock Management System",
      description: "A livestock management system with IoT integration.",
      fullDescription: `A comprehensive solution for livestock management, leveraging IoT for animal tracking and real-time data collection.

## Features

- Real-time animal location tracking
- Health monitoring through IoT sensors
- Data analysis and reporting dashboard
- User management for farm staff

## Technologies

- **Frontend**: JavaScript
- **Backend**: Node.js
- **Hardware**: IoT devices`,
      tags: ["JavaScript", "IoT"],
      featured: true,
      publishDate: new Date("2025-10-16"),
      image: "camport",
      githubUrl: "https://github.com/sebitabravo/iotlights",
      liveUrl: undefined,
      order: 1,
    },
    {
      slug: "banking-client-management",
      title: "Banking Client Management System",
      description: "Full-stack banking system with REST API, interactive dashboard, JWT authentication and Docker deployment",
      fullDescription: `A complete banking client management system with REST API, interactive dashboard, JWT authentication and Docker deployment. Features a modern React frontend with comprehensive statistics and client risk analysis.

## Key Features

- **Complete REST API** with JWT authentication and refresh tokens
- **Interactive dashboard** with 4 views: Dashboard, CRUD, Analytics and Health monitoring
- **5 Recharts visualizations** for data display
- **90% reduction in API calls** through smart caching
- **Custom security middleware** with rate limiting
- **Swagger/OpenAPI documentation**
- **18 pytest test cases** for reliability
- **Demo mode** with read-only restrictions

## Technologies

- **Frontend**: React 18.3.1, Tailwind CSS, shadcn/ui
- **Backend**: Django 5.1.3, Django REST Framework 3.15.2
- **Database**: PostgreSQL 16
- **Infrastructure**: Docker, Gunicorn`,
      tags: ["Django", "React", "PostgreSQL", "Docker"],
      featured: true,
      publishDate: new Date("2025-10-16"),
      image: "banking",
      githubUrl: "https://github.com/sebitabravo/eva3-backend",
      liveUrl: "https://eva3-backend.vercel.app/",
      order: 2,
    },
    {
      slug: "restaurant-booking-api",
      title: "Restaurant Booking Management API",
      description: "Professional REST API for restaurant reservation management built with Django and PostgreSQL",
      fullDescription: `A professional REST API for restaurant reservation management, built with Django and Django Rest Framework. Features complete authentication, rate limiting and advanced statistics for scalable booking systems.

## Key Features

- **Public read API** (100 requests/hour) to view reservations
- **Admin-only write access** (20 requests/hour) to manage resources
- **Multi-user resource management** with secure authentication
- **Advanced statistics and metrics** for reservation analysis
- **Robust validation** with comprehensive error handling
- **Rate limiting** for API protection
- **Swagger/OpenAPI documentation** for easy integration
- **JWT authentication** with refresh token support

## Technologies

- **Backend**: Django 5.1.3, Django REST Framework 3.15.2
- **Database**: PostgreSQL 16
- **Authentication**: JWT with refresh tokens
- **Server**: Gunicorn
- **Deployment**: Docker

## Unique Features

- Flexible deployment options (local and Docker)
- Resource monitoring scripts
- Advanced rate limiting and throttling
- Comprehensive security implementations
- Environment-based configuration`,
      tags: ["Django", "PostgreSQL", "Docker"],
      featured: false,
      publishDate: new Date("2025-10-16"),
      image: "restaurant",
      githubUrl: "https://github.com/sebitabravo/eva2-backend",
      liveUrl: undefined,
      order: 3,
    },
    {
      slug: "crm-small-business",
      title: "CRM for Small Businesses",
      description: "Web CRM application to efficiently manage clients, products and orders",
      fullDescription: `A Customer Relationship Management (CRM) web application designed for small businesses, where clients, products and orders can be managed simply and efficiently. Migrated from vanilla JavaScript to React to improve user experience.

## Key Features

- **Client management** - Track and organize customer information
- **Product catalog** - Inventory administration and product details
- **Order processing** - Order handling and status tracking
- **Improved UX** - Modern React interface with smooth navigation

## Technologies

- **Frontend**: React, React Router, Bootstrap
- **HTTP Client**: Axios for API requests
- **Deployment**: Vercel`,
      tags: ["React", "JavaScript", "Bootstrap"],
      featured: false,
      publishDate: new Date("2025-10-16"),
      image: "crm",
      githubUrl: "https://github.com/sebitabravo/crm-react",
      liveUrl: undefined,
      order: 8,
    },
  ]
}

export function getProjects(locale: Locale = 'es') {
  return projectsData[locale]
}

// Mantener exportación por defecto para compatibilidad
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

// Mantener exportación por defecto para compatibilidad
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
    },
  ]
}

export function getCertifications(locale: Locale = 'es') {
  return certificationsData[locale]
}

// Mantener exportación por defecto para compatibilidad
export const certifications = certificationsData.es

// ============================================
// HABILIDADES TÉCNICAS
// ============================================

export const skills = {
  frontend: ["React", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Bootstrap"],
  backend: ["Django", "Python", "Node.js", "REST API", "GraphQL"],
  databases: ["PostgreSQL", "MySQL", "MongoDB", "SQLite"],
  tools: ["Git", "Docker", "Linux", "Windows", "AWS", "Vercel"],
  methodologies: ["Scrum", "Agile", "Git Flow"],
}

// ============================================
// SOBRE MÍ
// ============================================

const aboutMeData = {
  es: {
    intro: `Desarrollador Full Stack especializado en React, Django y tecnologías cloud. Apasionado por crear aplicaciones web modernas, eficientes y escalables.`,

    experience: `Experiencia en desarrollo de sistemas de gestión empresarial, APIs REST y aplicaciones web completas. Me enfoco en escribir código limpio y resolver problemas complejos.`,

    personal: `Constantemente aprendiendo nuevas tecnologías, explorando arquitectura de software y compartiendo conocimiento con la comunidad dev.`,

    interests: [
      "Desarrollo web moderno",
      "Arquitectura de software",
      "Cloud computing & DevOps",
      "Metodologías ágiles",
      "Clean code & testing",
    ],
    interestsTitle: "Intereses",
    techStackTitle: "Stack Tecnológico",
  },
  en: {
    intro: `Full Stack Developer specialized in React, Django and cloud technologies. Passionate about creating modern, efficient and scalable web applications.`,

    experience: `Experience in developing enterprise management systems, REST APIs and complete web applications. I focus on writing clean code and solving complex problems.`,

    personal: `Constantly learning new technologies, exploring software architecture and sharing knowledge with the dev community.`,

    interests: [
      "Modern web development",
      "Software architecture",
      "Cloud computing & DevOps",
      "Agile methodologies",
      "Clean code & testing",
    ],
    interestsTitle: "Interests",
    techStackTitle: "Tech Stack",
  }
}

export function getAboutMe(locale: Locale = 'es') {
  return aboutMeData[locale]
}

// Mantener exportación por defecto para compatibilidad
export const aboutMe = aboutMeData.es
