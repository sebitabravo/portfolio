export interface SiteConfig {
  name: string
  title: string
  description: string
  author: string
  email: string
  social: {
    github?: string
    linkedin?: string
    twitter?: string
    instagram?: string
  }
}

export interface Project {
  slug: string
  title: string
  description: string
  fullDescription: string
  tags: string[]
  featured: boolean
  publishDate: Date
  image: string
  githubUrl?: string
  liveUrl?: string
  order: number
}

export interface WorkExperience {
  company: string
  position: string
  description: string
  startDate: Date
  endDate?: Date | null
  current: boolean
  location?: string
  employmentType: string
  skills: string[]
  order?: number
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
}

export interface CarouselCertification {
  data: {
    name: string
    organization: string
    logo?: string
    pdfUrl: string
  }
}
