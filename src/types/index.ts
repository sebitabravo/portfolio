import type { ImageMetadata } from "astro"
import type { CertificationCategory } from "@/lib/data/types"

export interface SiteConfig {
  name: string
  title: string
  description: string
}

export interface CarouselCertificationData {
  name: string
  organization: string
  logo?: ImageMetadata
  pdfUrl?: string
  category?: CertificationCategory
}

export interface CarouselCertification {
  data: CarouselCertificationData
}

export type { ExperienceLogo, WorkExperience, Project, Education, Certification } from "@/lib/data"
// Value re-exports stay limited to the dependency-free data/types module so
// importing them never drags the data facade into client bundles.
export { CERTIFICATION_CATEGORIES, PROJECT_STATUSES } from "@/lib/data/types"
export type { CertificationCategory, ProjectStatus } from "@/lib/data/types"
