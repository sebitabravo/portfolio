import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const baseCss = readFileSync("src/styles/portfolio-base.css", "utf8")
const heroCss = readFileSync("src/styles/portfolio-hero.css", "utf8")
const contentCss = readFileSync("src/styles/portfolio-content.css", "utf8")
const responsiveCss = readFileSync("src/styles/portfolio-responsive.css", "utf8")
const headerCss = readFileSync("src/styles/header.css", "utf8")
const heroMarkup = readFileSync("src/components/Hero.astro", "utf8")
const carouselMarkup = readFileSync("src/components/CertificationCarousel.astro", "utf8")

const componentSheets = [baseCss, heroCss, contentCss, responsiveCss, headerCss]
const allCss = componentSheets.join("\n")

describe("CSS ownership contracts", () => {
  it("keeps runtime theme aliases connected to Tailwind's theme", () => {
    expect(baseCss).toContain('@import "tailwindcss"')
    expect(baseCss).toContain("@custom-variant dark")
    expect(baseCss).toContain("@theme inline")
    expect(baseCss).toContain("--color-background: hsl(var(--background))")
    expect(baseCss).toContain("--color-foreground: hsl(var(--foreground))")
  })

  it("puts reusable CSS ownership in component layers", () => {
    for (const sheet of componentSheets) {
      expect(sheet).toContain("@layer components")
    }
  })

  it("registers and consumes the two approved custom utilities", () => {
    expect(baseCss).toContain("@utility text-gradient")
    expect(baseCss).toContain("@utility scrollbar-hidden")
    expect(heroMarkup).toMatch(/hero-title-accent[^\"]*text-gradient|text-gradient[^\"]*hero-title-accent/)
    expect(carouselMarkup).toMatch(/cert-carousel-wrapper[^\"]*scrollbar-hidden|scrollbar-hidden[^\"]*cert-carousel-wrapper/)
  })

  it("does not retain known legacy classes without a production consumer", () => {
    for (const className of [
      "card-hover",
      "nav-glass",
      "animate-fade-in",
      "animate-slide-up",
      "animate-slide-down",
      "section-divider",
      "btn-cream",
      "animation-delay-100",
      "animation-delay-200",
      "animation-delay-300",
      "animation-delay-350",
      "animation-delay-400",
      "animation-delay-500",
    ]) {
      expect(allCss).not.toMatch(new RegExp(`\\.${className}\\b`))
    }
  })

  it("keeps the global stylesheet as an import facade", () => {
    const globalCss = readFileSync("src/styles/global.css", "utf8")
    expect(globalCss.trim().split("\n")).toHaveLength(5)
    expect(globalCss).toContain('@import "./portfolio-base.css"')
    expect(globalCss).toContain('@import "./header.css"')
  })
})
