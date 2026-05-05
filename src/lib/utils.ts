/**
 * Format a date to a readable string
 */
export function formatDate(date: Date, locale: 'es' | 'en' = 'es'): string {
  const localeCode = locale === 'es' ? 'es-ES' : 'en-US'
  return date.toLocaleDateString(localeCode, { year: "numeric", month: "long" })
}

/**
 * Class name utility with tailwind-merge (shadcn/ui version)
 */
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Convierte markdown básico (##, **, -, saltos de línea) a HTML.
 * Solo para contenido controlado, no sanitiza input externo.
 */
export function renderMarkdown(md: string): string {
  const lines = md.split("\n")
  const out: string[] = []
  let inList = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // H2: ## Title
    if (/^##\s/.test(trimmed)) {
      if (inList) { out.push("</ul>"); inList = false }
      out.push(`<h4 class="text-sm font-semibold text-foreground/80 mt-4 mb-2">${inlineMarkdown(trimmed.replace(/^##\s+/, ""))}</h4>`)
      continue
    }

    // H3: ### Title
    if (/^###\s/.test(trimmed)) {
      if (inList) { out.push("</ul>"); inList = false }
      out.push(`<h5 class="text-sm font-medium text-foreground/75 mt-3 mb-1">${inlineMarkdown(trimmed.replace(/^###\s+/, ""))}</h5>`)
      continue
    }

    // List item: - text
    if (/^-\s/.test(trimmed)) {
      if (!inList) { out.push("<ul>"); inList = true }
      out.push(`<li class="ml-3 text-sm text-foreground/65 before:content-['—'] before:mr-2 before:text-foreground/30">${inlineMarkdown(trimmed.replace(/^-\s+/, ""))}</li>`)
      continue
    }

    // Empty line: close list or paragraph break
    if (trimmed === "") {
      if (inList) { out.push("</ul>"); inList = false }
      continue
    }

    // Regular paragraph
    if (inList) { out.push("</ul>"); inList = false }
    out.push(`<p class="text-sm text-foreground/65">${inlineMarkdown(trimmed)}</p>`)
  }

  if (inList) { out.push("</ul>") }

  return out.join("\n")
}

function inlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code class='text-xs bg-muted px-1 rounded'>$1</code>")
}
