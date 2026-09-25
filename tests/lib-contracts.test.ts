import { describe, expect, it } from "vitest"

import { siteConfig } from "../src/lib/config"
import { projectGradient } from "../src/lib/visual-gradients"
import { cn, formatDate } from "../src/lib/utils"

describe("shared library contracts", () => {
  it("keeps the public site configuration complete", () => {
    expect(siteConfig).toMatchObject({
      name: "Sebastian Bravo",
      title: expect.stringContaining("Full-Stack Developer"),
    })
    expect(siteConfig.description.length).toBeGreaterThan(40)
  })

  it("returns project gradients with a safe fallback", () => {
    expect(projectGradient("wenuke")).toContain("#25d366")
    expect(projectGradient("missing")).toContain("#2b2b2b")
  })

  it("formats dates and merges utility classes", () => {
    const date = new Date("2024-01-15T00:00:00.000Z")
    expect(formatDate(date, "es")).toContain("2024")
    expect(formatDate(date, "en")).toContain("2024")
    expect(cn("px-2", false && "py-1", "px-4")).toBe("px-4")
  })
})
