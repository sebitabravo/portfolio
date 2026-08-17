import { readdir, readFile } from "node:fs/promises"
import { gzipSync } from "node:zlib"

const ASSET_DIRECTORY = "dist/_astro"
const MAX_RAW_KIB = 600
const MAX_GZIP_KIB = 150

const toKib = (bytes: number) => bytes / 1024

let files: string[]
try {
  files = (await readdir(ASSET_DIRECTORY)).filter((file) => file.endsWith(".js"))
} catch {
  console.error(`Bundle size check failed: ${ASSET_DIRECTORY} does not exist. Run the build first.`)
  process.exit(1)
}

if (files.length === 0) {
  console.error(`Bundle size check failed: no JavaScript chunks found in ${ASSET_DIRECTORY}.`)
  process.exit(1)
}

const measurements = await Promise.all(
  files.map(async (file) => {
    const content = await readFile(`${ASSET_DIRECTORY}/${file}`)
    return {
      file,
      rawBytes: content.byteLength,
      gzipBytes: gzipSync(content, { level: 9 }).byteLength,
    }
  }),
)

const violations = measurements.filter(
  ({ rawBytes, gzipBytes }) => rawBytes > MAX_RAW_KIB * 1024 || gzipBytes > MAX_GZIP_KIB * 1024,
)

if (violations.length > 0) {
  console.error(`Bundle size limits failed (raw <= ${MAX_RAW_KIB} KiB, gzip <= ${MAX_GZIP_KIB} KiB):`)
  for (const { file, rawBytes, gzipBytes } of violations) {
    console.error(`  ${file}: ${toKib(rawBytes).toFixed(1)} KiB raw / ${toKib(gzipBytes).toFixed(1)} KiB gzip`)
  }
  process.exit(1)
}

const largest = measurements.toSorted((a, b) => b.rawBytes - a.rawBytes)[0]
console.log(
  `Bundle size limits passed: ${measurements.length} JS chunks; largest ${largest.file} `
  + `(${toKib(largest.rawBytes).toFixed(1)} KiB raw / ${toKib(largest.gzipBytes).toFixed(1)} KiB gzip).`,
)
