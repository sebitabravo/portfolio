export interface SiteConfig {
  name: string
  title: string
  description: string
}

export interface CarouselCertification {
  data: {
    name: string
    organization: string
    logo?: string
    pdfUrl: string
    category?: 'professional' | 'academic'
  }
}

export type { ExperienceLogo, WorkExperience, Project, Education, Certification } from "@/lib/data"
