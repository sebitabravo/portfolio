import { readFile, readdir } from "node:fs/promises"
import { join, relative } from "node:path"

const limits = new Map([
  [".astro", 250],
  [".ts", 300],
  [".css", 1500],
])

const exceptions = new Map([
  ["src/layouts/Layout.astro", "shared SEO/document shell"],
  ["src/components/CertificationCarousel.astro", "content-rich carousel with scoped interaction styles"],
  ["src/pages/privacy.astro", "legal content document"],
  ["src/pages/en/privacy.astro", "legal content document"],
  ["src/lib/tech-colors.ts", "canonical technology color registry"],
])

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await collectFiles(path))
    else if (limits.has(path.slice(path.lastIndexOf(".")))) files.push(path)
  }

  return files
}

const violations: string[] = []
for (const file of await collectFiles("src")) {
  const relativePath = relative(process.cwd(), file)
  const extension = file.slice(file.lastIndexOf("."))
  const lineCount = (await readFile(file, "utf8")).split("\n").length - 1
  const limit = limits.get(extension) ?? Number.POSITIVE_INFINITY
  if (lineCount > limit && !exceptions.has(relativePath)) {
    violations.push(`${relativePath}: ${lineCount} lines (limit ${limit})`)
  }
}

if (violations.length > 0) {
  console.error("Source size limits failed:")
  violations.forEach((violation) => console.error(`  ${violation}`))
  process.exit(1)
}

console.log(`Source size limits passed. Exceptions: ${[...exceptions].map(([file, reason]) => `${file} (${reason})`).join("; ")}`)
