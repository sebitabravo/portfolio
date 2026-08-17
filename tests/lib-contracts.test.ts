import { describe, expect, it, vi } from "vitest"

const { track } = vi.hoisted(() => ({ track: vi.fn() }))

vi.mock("@vercel/analytics", () => ({ track }))

import { trackEvent } from "../src/lib/analytics"
import { siteConfig } from "../src/lib/config"
import { getTechStyle } from "../src/lib/tech-colors"
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

  it("normalizes known and unknown technology styles", () => {
    expect(getTechStyle("React").text).toContain("text-foreground")
    expect(getTechStyle("React").text).toContain("dark:")
    expect(getTechStyle("Unknown technology")).toEqual({
      bg: "bg-neutral-100 dark:bg-neutral-800",
      text: "text-foreground dark:text-neutral-100",
      border: "border-neutral-300 dark:border-neutral-700",
      hoverBg: "hover:bg-neutral-200 dark:hover:bg-neutral-700",
    })
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

  it("tracks analytics without leaking provider failures", () => {
    track.mockReset()
    trackEvent({ name: "social_click", props: { platform: "github" } })
    expect(track).toHaveBeenCalledWith("social_click", { platform: "github" })

    track.mockImplementationOnce(() => {
      throw new Error("analytics unavailable")
    })
    expect(() => trackEvent({ name: "cv_download", props: { locale: "es" } })).not.toThrow()
  })
})
