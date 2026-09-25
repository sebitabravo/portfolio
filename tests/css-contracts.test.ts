import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("global stylesheet architecture", () => {
  it("remains an import-only facade for the five owned stylesheets", () => {
    // A browser can verify delivered CSS and computed styles, but not whether
    // the source entrypoint contains rules or delegates to its owner files.
    const globalCss = readFileSync("src/styles/global.css", "utf8")
    const imports = [...globalCss.matchAll(/@import\s+["']\.\/([^"']+)["'];?/g)]
    expect(imports.map((match) => match[1]).sort()).toEqual([
      "portfolio-base.css", "portfolio-hero.css", "portfolio-content.css",
      "portfolio-responsive.css", "header.css",
    ].sort())
    expect(globalCss.replace(/@import\s+["']\.\/[^"']+["'];?/g, "").trim()).toBe("")
  })
})
