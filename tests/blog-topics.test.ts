// Resolución — taxonomía de temas del blog (S2, B4): cada .mdx de src/content/blog declara
// exactamente un `topic` del enum compartido en src/lib/blog-topics.ts, ningún bucket queda
// vacío y las cuentas suman el total de archivos. Un tema por post: apuntes/curso NO es tema
// (un curso de Docker es infra, un curso de minería es ia-datos). Ambos diccionarios exponen
// las cinco etiquetas de filtro con la misma clave.
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import en from "../src/lib/i18n/en.json"
import es from "../src/lib/i18n/es.json"
import { BLOG_TOPICS, countByTopic, type BlogTopic } from "../src/lib/blog-topics"

const BLOG_DIR = new URL("../src/content/blog/", import.meta.url).pathname

const TOPIC_LINE = /^topic:\s*["']?(web|ia-datos|apps|infra)["']?\s*$/m

const mdxFiles = readdirSync(BLOG_DIR)
  .filter((file) => file.endsWith(".mdx"))
  .sort()

function frontmatterOf(file: string): string {
  const match = readFileSync(join(BLOG_DIR, file), "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/)
  return match?.[1] ?? ""
}

describe("temas del blog en el frontmatter", () => {
  it("declara un topic del enum en todos los .mdx", () => {
    for (const file of mdxFiles) {
      const line = frontmatterOf(file).match(TOPIC_LINE)?.[1]
      expect(line, `${file} sin topic válido`).toBeDefined()
    }
  })

  it("deja los cuatro buckets con al menos un post", () => {
    const counts = new Map<BlogTopic, number>(BLOG_TOPICS.map((topic) => [topic, 0]))
    for (const file of mdxFiles) {
      const topic = frontmatterOf(file).match(TOPIC_LINE)?.[1] as BlogTopic
      counts.set(topic, (counts.get(topic) ?? 0) + 1)
    }
    for (const topic of BLOG_TOPICS) {
      expect(counts.get(topic), `bucket ${topic} vacío`).toBeGreaterThan(0)
    }
  })

  it("suma las cuentas por tema al total de archivos", () => {
    const posts = mdxFiles.map((file) => ({
      data: { topic: frontmatterOf(file).match(TOPIC_LINE)?.[1] as BlogTopic },
    }))
    const counts = countByTopic(posts)
    const total = BLOG_TOPICS.reduce((sum, topic) => sum + counts[topic], 0)
    expect(total).toBe(mdxFiles.length)
  })
})

describe("BLOG_TOPICS", () => {
  it("expone el enum compartido en orden fijo", () => {
    expect(BLOG_TOPICS).toEqual(["web", "ia-datos", "apps", "infra"])
  })

  it("countByTopic cuenta por bucket e ignora temas desconocidos", () => {
    const posts = [
      { data: { topic: "web" } },
      { data: { topic: "web" } },
      { data: { topic: "infra" } },
      { data: { topic: "no-existe" } },
    ]
    expect(countByTopic(posts)).toEqual({ web: 2, "ia-datos": 0, apps: 0, infra: 1 })
    expect(countByTopic([])).toEqual({ web: 0, "ia-datos": 0, apps: 0, infra: 0 })
  })
})

describe("etiquetas de filtro en los diccionarios", () => {
  it("es expone las cinco etiquetas localizadas", () => {
    expect(es.blog.filters).toEqual({
      all: "todos",
      web: "web",
      "ia-datos": "ia y datos",
      apps: "apps",
      infra: "infra",
    })
  })

  it("en expone las cinco etiquetas localizadas", () => {
    expect(en.blog.filters).toEqual({
      all: "all",
      web: "web",
      "ia-datos": "ai & data",
      apps: "apps",
      infra: "infra",
    })
  })
})
