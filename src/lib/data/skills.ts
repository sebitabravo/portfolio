// HABILIDADES TÉCNICAS
// ============================================

export const skills = {
  frontend: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS"],
  backend: ["Django", "FastAPI", "NestJS", "Python", "Node.js", "REST API"],
  databases: ["PostgreSQL", "MySQL", "MongoDB", "SQLite"],
  tools: ["Git", "Docker", "Linux", "AWS", "Vercel"],
  methodologies: ["Scrum", "Agile", "Git Flow"],
}

/** One canonical list for the hero-adjacent stack signal. */
export const canonicalTechnologies = Object.freeze([
  ...new Set(Object.values(skills).flat()),
])

// ============================================
