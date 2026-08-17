/**
 * Datos del Portfolio - Sebastian Bravo
 *
 * Archivo centralizado con todos los datos del portfolio.
 * Diseñado con la estética Superhuman: projects sell themselves.
 */

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
  url?: string
  highlights?: { label: string; value: string }[]
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
