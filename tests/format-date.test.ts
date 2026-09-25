import { afterEach, describe, expect, it, vi } from "vitest"
import { formatDate } from "../src/lib/utils"

// Content dates are calendar dates stored as UTC midnight; a UTC-3 build must not show the previous day.
const publishDate = new Date("2026-09-25T00:00:00.000Z")

describe("formatDate", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("formats Spanish dates with day, month and year", () => {
    expect(formatDate(publishDate, "es")).toBe("25 de septiembre de 2026")
  })

  it("formats English dates with day, month and year", () => {
    expect(formatDate(publishDate, "en")).toBe("September 25, 2026")
  })

  it("keeps the calendar day when the build machine is behind UTC", () => {
    vi.stubEnv("TZ", "America/Santiago")
    expect(formatDate(publishDate, "es")).toBe("25 de septiembre de 2026")
    expect(formatDate(publishDate, "en")).toBe("September 25, 2026")
  })
})
