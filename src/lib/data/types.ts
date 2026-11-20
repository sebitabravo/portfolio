export const PROJECT_STATUSES = {
  PRODUCTION: "production",
  DEVELOPMENT: "development",
  DEMO: "demo",
} as const

export type ProjectStatus = (typeof PROJECT_STATUSES)[keyof typeof PROJECT_STATUSES]

// Cada proyecto toma una franja del arcoíris de la marca como color de escenario.
export const PROJECT_STAGES = {
  RED: "r1",
  ORANGE: "r2",
  YELLOW: "r3",
  GREEN: "r4",
  BLUE: "r5",
  VIOLET: "r6",
} as const

export type ProjectStage = (typeof PROJECT_STAGES)[keyof typeof PROJECT_STAGES]

export const CERTIFICATION_CATEGORIES = {
  PROFESSIONAL: "professional",
  ACADEMIC: "academic",
} as const

export type CertificationCategory = (typeof CERTIFICATION_CATEGORIES)[keyof typeof CERTIFICATION_CATEGORIES]

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
  url?: string
  highlights?: { label: string; value: string }[]
}

export interface Project {
  slug: string
  title: string
  tagline: string
  description: string
  stage: ProjectStage
  tags: string[]
  /** Bandera del diseño (DESIGN.md §10): presencia del proyecto fuera del escenario del home. */
  featured: boolean
  /** Bandera del escenario del home: false excluye el proyecto del índice y el escenario (§10). */
  homeStage: boolean
  /** Orden del índice del escenario (§3: copiloto, wenuke, vulcania, manttoai). */
  stageOrder: number
  status: ProjectStatus
  metrics?: { label: string; value: string }[]
  publishDate: Date
  githubUrl?: string
  liveUrl?: string
  order: number
  blogSlug?: string
  /** Decisión técnica del escenario (§2 momento 2); null/ausente = la columna no se pinta. */
  decision?: string
  tradeoff?: string
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
  monogram: string
  pdfUrl?: string
  order: number
  category: CertificationCategory
}
