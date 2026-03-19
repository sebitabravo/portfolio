import { getProjects } from "../src/lib/data"

const locales = ["es", "en"] as const
const timeoutMs = 12000

type LinkCheckResult = {
  ok: boolean
  status?: number
  error?: string
}

async function checkUrl(url: string): Promise<LinkCheckResult> {
  const requestInit: RequestInit = {
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      "User-Agent": "Mozilla/5.0 (Portfolio-Link-Validator)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  }

  try {
    const headResponse = await fetch(url, { ...requestInit, method: "HEAD" })
    if (headResponse.status < 400) {
      return { ok: true, status: headResponse.status }
    }
  } catch {
    // Ignorar para intentar GET como fallback
  }

  try {
    const getResponse = await fetch(url, { ...requestInit, method: "GET" })
    if (getResponse.status < 400) {
      return { ok: true, status: getResponse.status }
    }

    return {
      ok: false,
      status: getResponse.status,
      error: `HTTP ${getResponse.status}`,
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown fetch error",
    }
  }
}

async function main() {
  const urlContexts = new Map<string, Set<string>>()
  const imageErrors: string[] = []

  for (const locale of locales) {
    const projects = getProjects(locale)

    for (const project of projects) {
      const context = `${locale}:${project.slug}`

      if (project.featured && /^https?:\/\//.test(project.image)) {
        imageErrors.push(
          `Imagen externa detectada en proyecto destacado (${context}): ${project.image}`,
        )
      }

      const links = [project.githubUrl, project.liveUrl].filter(
        (value): value is string => Boolean(value),
      )

      for (const link of links) {
        if (!urlContexts.has(link)) {
          urlContexts.set(link, new Set())
        }
        urlContexts.get(link)?.add(context)
      }
    }
  }

  if (imageErrors.length > 0) {
    for (const imageError of imageErrors) {
      console.error(`x ${imageError}`)
    }
    process.exit(1)
  }

  const urls = Array.from(urlContexts.keys()).sort((a, b) => a.localeCompare(b))
  const failures: string[] = []

  console.log(`Validando ${urls.length} enlaces de proyectos...`)

  for (const url of urls) {
    const result = await checkUrl(url)
    const contexts = Array.from(urlContexts.get(url) ?? []).join(", ")

    if (result.ok) {
      console.log(`ok [${result.status}] ${url} (${contexts})`)
      continue
    }

    const reason = result.error ?? `HTTP ${result.status}`
    const failureLine = `x ${url} (${contexts}) -> ${reason}`
    failures.push(failureLine)
    console.error(failureLine)
  }

  if (failures.length > 0) {
    console.error(`\nSe detectaron ${failures.length} enlaces con problemas.`)
    process.exit(1)
  }

  console.log("\nTodos los enlaces de proyectos están operativos.")
}

main().catch((error) => {
  console.error("Fallo inesperado durante la validación de enlaces:", error)
  process.exit(1)
})
