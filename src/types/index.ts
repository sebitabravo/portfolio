import type { ImageMetadata } from "astro"
import type { CertificationCategory } from "@/lib/data/types"

export interface SiteConfig {
  name: string
  title: string
  description: string
}

// THEMES lives here instead of scripts/theme-toggle.ts on purpose: that
// module ships inside a CSP-hashed inline <script>, so its runtime bytes must
// stay identical. The toggle imports only the type (erased at build).
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const

export type ThemePreference = (typeof THEMES)[keyof typeof THEMES]

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
