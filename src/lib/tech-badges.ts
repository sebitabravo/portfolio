// Brand colors reach the badge through per-element custom properties, so one static utility set covers every tech.
import type { AstroComponentFactory } from "astro/runtime/server/index.js"

import Docker from "@/components/icons/Docker.astro"
import FastAPI from "@/components/icons/FastAPI.astro"
import Groq from "@/components/icons/Groq.astro"
import IoT from "@/components/icons/IoT.astro"
import MachineLearning from "@/components/icons/MachineLearning.astro"
import NestJS from "@/components/icons/NestJS.astro"
import Nextjs from "@/components/icons/Nextjs.astro"
import PostgreSQL from "@/components/icons/PostgreSQL.astro"
import Python from "@/components/icons/Python.astro"
import ReactIcon from "@/components/icons/React.astro"
import ShadcnUI from "@/components/icons/ShadcnUI.astro"
import Supabase from "@/components/icons/Supabase.astro"
import Turso from "@/components/icons/Turso.astro"
import TypeScript from "@/components/icons/TypeScript.astro"
import WhatsApp from "@/components/icons/WhatsApp.astro"

export interface TechBadge {
  color: string
  /** Dark-mode tint when it differs from `color`. */
  dark?: string
  /** Dark-mode text when it differs from the dark tint. */
  darkText?: string
  icon?: AstroComponentFactory
}

export const techBadges: Record<string, TechBadge> = {
  React: { color: "#61DAFB", darkText: "#00A8D8", icon: ReactIcon },
  "Next.js": { color: "#000000", dark: "#ffffff", icon: Nextjs },
  TypeScript: { color: "#3178C6", icon: TypeScript },
  Python: { color: "#3776AB", icon: Python },
  Docker: { color: "#2496ED", icon: Docker },
  IoT: { color: "#00C7B7", icon: IoT },
  NestJS: { color: "#E0234E", icon: NestJS },
  PostgreSQL: { color: "#336DB8", dark: "#4169E1", darkText: "#5C8BFF", icon: PostgreSQL },
  FastAPI: { color: "#009688", icon: FastAPI },
  Supabase: { color: "#3ECF8E", icon: Supabase },
  "shadcn/ui": { color: "#000000", dark: "#ffffff", icon: ShadcnUI },
  "Machine Learning": { color: "#8E44AD", darkText: "#A569BD", icon: MachineLearning },
  "Groq LLM": { color: "#F97316", icon: Groq },
  "WhatsApp API": { color: "#25D366", icon: WhatsApp },
  Turso: { color: "#4FF8D2", icon: Turso },
}

const FALLBACK_CLASS =
  "bg-neutral-100 dark:bg-neutral-800 text-foreground dark:text-neutral-100 border-neutral-300 dark:border-neutral-700"

const BRAND_CLASS =
  "bg-(--tech)/10 border-(--tech)/30 text-foreground dark:bg-(--tech-dark)/20 dark:border-(--tech-dark)/30 dark:text-(--tech-text-dark)"

export interface TechBadgeStyle {
  className: string
  style?: Record<string, string>
  icon?: AstroComponentFactory
}

export function getTechBadge(tech: string): TechBadgeStyle {
  const entry = techBadges[tech]
  if (!entry) {
    return { className: FALLBACK_CLASS }
  }

  const dark = entry.dark ?? entry.color
  return {
    className: BRAND_CLASS,
    style: {
      "--tech": entry.color,
      "--tech-dark": dark,
      "--tech-text-dark": entry.darkText ?? dark,
    },
    icon: entry.icon,
  }
}
