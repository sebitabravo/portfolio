import { createHash } from "node:crypto"
import { readFile, readdir } from "node:fs/promises"
import { join } from "node:path"

type VercelConfig = {
  headers?: Array<{ headers?: Array<{ key?: string; value?: string }> }>
}

async function collectHtml(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...await collectHtml(path))
    } else if (entry.name.endsWith(".html")) {
      files.push(path)
    }
  }

  return files
}

function hashScript(content: string): string {
  return createHash("sha256").update(content).digest("base64")
}

const config = JSON.parse(await readFile("vercel.json", "utf8")) as VercelConfig
const csp = config.headers
  ?.flatMap((entry) => entry.headers ?? [])
  .find((header) => header.key?.toLowerCase() === "content-security-policy")
  ?.value ?? ""
const allowedHashes = new Set(
  [...csp.matchAll(/'sha256-([^']+)'/g)].map((match) => match[1]),
)
const htmlFiles = await collectHtml("dist")
const missing = new Set<string>()
let executableScripts = 0

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8")
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attributes = match[1]
    const content = match[2]
    if (/\bsrc\s*=/.test(attributes) || /\btype\s*=\s*["']application\/ld\+json["']/i.test(attributes)) {
      continue
    }

    executableScripts += 1
    const hash = hashScript(content)
    if (!allowedHashes.has(hash)) missing.add(hash)
  }
}

if (missing.size > 0) {
  console.error(`CSP hash coverage failed: ${missing.size} executable inline script hash(es) missing from vercel.json`)
  for (const hash of missing) console.error(`  'sha256-${hash}'`)
  process.exit(1)
}

console.log(`CSP hash coverage passed: ${executableScripts} executable inline scripts covered.`)
