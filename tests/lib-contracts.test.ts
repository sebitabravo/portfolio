import { describe, expect, it } from "vitest"

import { siteConfig } from "../src/lib/config"
import { formatDate } from "../src/lib/utils"

describe("shared library contracts", () => {
  it("keeps the public site configuration complete", () => {
    expect(siteConfig).toMatchObject({
      name: "Sebastian Bravo",
      title: expect.stringContaining("Full-Stack Developer"),
    })
    expect(siteConfig.description.length).toBeGreaterThan(40)
  })

  it("formats dates for both locales", () => {
    const date = new Date("2024-01-15T00:00:00.000Z")
    expect(formatDate(date, "es")).toContain("2024")
    expect(formatDate(date, "en")).toContain("2024")
  })
})
