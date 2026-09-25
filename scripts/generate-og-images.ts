// Regenerates the checked-in crawler-safe OG PNG fallbacks in public/og/.
// Most social crawlers (X, Facebook, LinkedIn, WhatsApp) cannot render SVG
// og:images, so Layout.astro points og:image at these static PNGs while the
// dynamic /og/:locale.svg endpoint stays alive for previously shared URLs.
// Run: pnpm generate:og (requires devDependency sharp, already allowlisted).
import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

import { buildOgSvg, OG_HEIGHT, OG_LOCALES, OG_WIDTH } from "../src/lib/og-image"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

for (const locale of OG_LOCALES) {
  const png = await sharp(Buffer.from(buildOgSvg(locale), "utf8"))
    .resize(OG_WIDTH, OG_HEIGHT, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toBuffer()

  await mkdir(join(root, "public", "og"), { recursive: true })
  await writeFile(join(root, "public", "og", `${locale}.png`), png)
  console.log(`og/${locale}.png ${png.length} bytes`)
}
