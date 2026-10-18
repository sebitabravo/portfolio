import { readFile, readdir, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { join, resolve } from "node:path"

import { compareCspHashParity, validateVercelConfig } from "./verify-csp-hashes"

type Header = { key?: unknown; value?: unknown }
type HeaderRule = { source?: unknown; headers?: unknown }
type VercelConfig = { headers?: unknown }

const HASH_PATTERN = /^'sha256-[A-Za-z0-9+/]{43}='$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function rewriteCspScriptHashes(policy: string, hashes: readonly string[]): string {
  const nextHashes = [...hashes].sort().map((hash) => `'sha256-${hash}'`)
  let replaced = false

  const directives = policy.split(";").map((part) => {
    const tokens = part.trim().split(/\s+/).filter(Boolean)
    if (tokens[0]?.toLowerCase() !== "script-src") return part

    replaced = true
    const sources = tokens.slice(1).filter((token) => !HASH_PATTERN.test(token))
    const prefix = part.startsWith(" ") ? " " : ""
    return `${prefix}${[tokens[0], ...sources, ...nextHashes].join(" ")}`
  })

  if (!replaced) throw new Error("CSP is missing the script-src directive")
  return directives.join(";")
}

export function updateVercelConfigHashes(
  input: unknown,
  hashes: readonly string[],
): { config: unknown; previousPolicy: string; nextPolicy: string } {
  if (!isRecord(input) || !Array.isArray(input.headers)) {
    throw new Error("vercel.json must contain a headers array")
  }

  const config = structuredClone(input) as VercelConfig
  const rules = config.headers as HeaderRule[]
  const globalRule = rules.find((rule) => isRecord(rule) && rule.source === "/(.*)")
  if (!isRecord(globalRule) || !Array.isArray(globalRule.headers)) {
    throw new Error("vercel.json must contain a global /(.*) header rule")
  }

  const header = (globalRule.headers as Header[]).find(
    (entry) =>
      isRecord(entry) && typeof entry.key === "string" && entry.key.toLowerCase() === "content-security-policy",
  )
  if (!isRecord(header) || typeof header.value !== "string") {
    throw new Error("global rule must contain a content-security-policy header")
  }

  const previousPolicy = header.value
  const nextPolicy = rewriteCspScriptHashes(previousPolicy, hashes)
  header.value = nextPolicy

  return { config, previousPolicy, nextPolicy }
}

async function collectHtml(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)
      return entry.isDirectory() ? collectHtml(path) : entry.name.endsWith(".html") ? [path] : []
    }),
  )
  return files.flat()
}

async function main(): Promise<void> {
  const shouldWrite = process.argv.includes("--write")

  let input: unknown
  let htmlFiles: string[]
  try {
    input = JSON.parse(await readFile("vercel.json", "utf8"))
    htmlFiles = await collectHtml("dist")
  } catch (error) {
    console.error(`CSP update could not read configuration or dist/: ${(error as Error).message}`)
    process.exitCode = 1
    return
  }

  if (htmlFiles.length === 0) {
    console.error("CSP update found no HTML files in dist/. Run pnpm build:static first.")
    process.exitCode = 1
    return
  }

  const validation = validateVercelConfig(input)
  if (validation.errors.length > 0 || !validation.policy) {
    console.error("Security-header contract failed:")
    for (const error of validation.errors) console.error(`  ${error}`)
    process.exitCode = 1
    return
  }

  const parity = compareCspHashParity(
    validation.policy.scriptHashes,
    await Promise.all(htmlFiles.map((file) => readFile(file, "utf8"))),
  )

  if (parity.generated.length === 0) {
    console.error("CSP update refused to remove every script hash: no executable inline scripts found.")
    process.exitCode = 1
    return
  }

  console.log(
    `CSP hashes: ${parity.generated.length} generated from ${parity.executableScripts} executable inline scripts.`,
  )
  for (const hash of parity.missing) console.log(`  add: 'sha256-${hash}'`)
  for (const hash of parity.unused) console.log(`  remove: 'sha256-${hash}'`)

  if (parity.missing.length === 0 && parity.unused.length === 0) {
    console.log("CSP hashes already match dist/.")
    return
  }

  const updated = updateVercelConfigHashes(input, parity.generated)
  const nextValidation = validateVercelConfig(updated.config)
  if (nextValidation.errors.length > 0) {
    console.error("Updated CSP failed the security-header contract:")
    for (const error of nextValidation.errors) console.error(`  ${error}`)
    process.exitCode = 1
    return
  }

  if (!shouldWrite) {
    console.log("Dry run. Re-run with --write to update vercel.json.")
    return
  }

  await writeFile("vercel.json", `${JSON.stringify(updated.config, null, 2)}\n`)
  console.log("Updated vercel.json. Run pnpm build to verify exact parity.")
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) void main()
