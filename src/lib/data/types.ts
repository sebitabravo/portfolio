import type { ImageMetadata } from "astro"

export const PROJECT_STATUSES = {
  PRODUCTION: "production",
  DEVELOPMENT: "development",
  DEMO: "demo",
} as const

export type ProjectStatus = (typeof PROJECT_STATUSES)[keyof typeof PROJECT_STATUSES]

export const CERTIFICATION_CATEGORIES = {
  PROFESSIONAL: "professional",
  ACADEMIC: "academic",
} as const

export type CertificationCategory = (typeof CERTIFICATION_CATEGORIES)[keyof typeof CERTIFICATION_CATEGORIES]

export interface ExperienceLogo {
  src: ImageMetadata
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
  status: ProjectStatus
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
  category: CertificationCategory
}
