// Resolución — taxonomía de temas del blog (S2, B4). Cuatro áreas de trabajo exclusivas,
// una por post, más el chip "todos": apuntes/curso no es tema (un curso de Docker es infra,
// un curso de minería es ia-datos). Fuente única de verdad: el schema del blog
// (src/content.config.ts) importa el enum de acá y los chips del índice derivan de acá.
export const BLOG_TOPICS = ["web", "ia-datos", "apps", "infra"] as const

export type BlogTopic = (typeof BLOG_TOPICS)[number]

interface TopicPost {
  data: { topic: string }
}

/** Cuenta posts por tema; los buckets sin posts quedan en 0. */
export function countByTopic<T extends TopicPost>(posts: readonly T[]): Record<BlogTopic, number> {
  const counts = { web: 0, "ia-datos": 0, apps: 0, infra: 0 } as Record<BlogTopic, number>
  for (const post of posts) {
    const topic = post.data.topic as BlogTopic
    if (topic in counts) counts[topic]++
  }
  return counts
}
