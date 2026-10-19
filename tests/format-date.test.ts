import { afterEach, describe, expect, it, vi } from "vitest"
import { cn, formatDate, formatMonthYear, formatPeriod } from "../src/lib/utils"

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

describe("compact periods", () => {
  it("abbreviates month and year without trailing dots", () => {
    expect(formatMonthYear(new Date("2026-02-01"), "es")).toBe("feb 2026")
    expect(formatMonthYear(new Date("2026-02-01"), "en")).toBe("Feb 2026")
  })

  it("closes finished periods with their end month", () => {
    expect(formatPeriod(new Date("2026-02-01"), new Date("2026-04-30"), false, "Presente", "es")).toBe("feb 2026 — abr 2026")
    expect(formatPeriod(new Date("2022-12-01"), new Date("2023-02-28"), false, "Present", "en")).toBe("Dec 2022 — Feb 2023")
  })

  it("closes current or open-ended periods with the caller's localized label", () => {
    expect(formatPeriod(new Date("2023-03-01"), new Date("2027-12-31"), true, "Presente", "es")).toBe("mar 2023 — Presente")
    expect(formatPeriod(new Date("2023-03-01"), null, false, "Present", "en")).toBe("Mar 2023 — Present")
  })

  it("merges conflicting utility classes", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4")
  })
})
