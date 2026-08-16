import type { Locale } from "@/lib/i18n"

// SOBRE MÍ
// ============================================

const aboutMeData = {
  es: {
    intro: `Me gusta convertir problemas concretos en productos web que se puedan usar, mantener y explicar sin humo. Trabajo entre producto, interfaz y backend, con especial cuidado por los detalles que sostienen una buena experiencia.`,
    experience: `Construí ManttoAI, una plataforma de mantenimiento predictivo con IoT y Machine Learning. Desarrollé Vulcania, un sistema comunitario de monitoreo volcánico con mapa en tiempo real usado por personas reales. Armé Rápido Sur, un ERP de gestión de flotas vehiculares con arquitectura enterprise. No hago tutoriales de Todo List.`,
    personal: `Estudio Ingeniería Informática en INACAP y sigo aprendiendo desde la práctica: desde cómo un ESP32 transmite telemetría hasta cómo una plataforma llega a producción. Si tu equipo valora curiosidad, criterio y gente que se ensucia las manos, hablemos.`,
    interests: [
      "Arquitectura de software a escala real",
      "Machine Learning aplicado a problemas concretos",
      "TypeScript avanzado y type-safety",
      "Cloud computing & DevOps (Docker, AWS, Vercel)",
      "Clean code & testing automatizado",
    ],
    interestsTitle: "Intereses",
    lookingFor: `Busco un equipo donde pueda contribuir con impacto real. Me motivan los proyectos que resuelven problemas concretos con tecnología bien aplicada — TypeScript, Python, cloud y testing automatizado.`,
  },
  en: {
    intro: `I like turning concrete problems into web products that people can use, maintain and understand without the hype. I work across product, interface and backend, with care for the details that make an experience hold together.`,
    experience: `I built ManttoAI, a predictive maintenance platform with IoT and Machine Learning. Developed Vulcania, a community volcanic monitoring system with real-time maps. Shipped Rápido Sur, an ERP for fleet maintenance with enterprise architecture. Every project I take on solves a real problem.`,
    personal: `I'm a Computer Engineering student at INACAP and keep learning through practice: from how an ESP32 transmits telemetry to how a platform reaches production. If your team values curiosity, judgment and technical depth, let's talk.`,
    interests: [
      "Real-world software architecture",
      "Applied Machine Learning",
      "Advanced TypeScript & type-safety",
      "Cloud computing & DevOps (Docker, AWS, Vercel)",
      "Clean code & automated testing",
    ],
    interestsTitle: "Interests",
    lookingFor: `I'm looking for a team where I can make a real impact. I'm motivated by projects that solve concrete problems with well-applied technology — TypeScript, Python, cloud and automated testing.`,
  }
}

export function getAboutMe(locale: Locale = 'es') {
  return aboutMeData[locale]
}
