// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest"

import { articleTitleTransitionName } from "../src/scripts/transitions"
import {
  FINE_POINTER_QUERY,
  HEADER_NAV_CHANGE_EVENT,
  HOVER_QUERY,
  MOTION_EVENTS,
  MOTION_STATUSES,
  REDUCED_MOTION_QUERY,
  WEBGL_STATUSES,
  isFinePointer,
  isMotionModuleId,
  isMotionPreference,
  isMotionStatus,
  isReducedMotion,
  isWebGL2Context,
  isWebglStatus,
} from "../src/scripts/motion/types"

function fakeView(matches: boolean) {
  const matchMedia = vi.fn(() => ({ matches }) as MediaQueryList)
  return { matchMedia } as unknown as Pick<Window, "matchMedia"> & { matchMedia: typeof matchMedia }
}

describe("motion identifiers", () => {
  it("exposes the complete status unions in their public order", () => {
    expect(MOTION_STATUSES).toEqual(["idle", "loading", "active", "reduced", "fallback"])
    expect(WEBGL_STATUSES).toEqual(["idle", "pending", "ready", "fallback", "reduced", "disposed"])
  })

  it("exposes stable media queries and event names", () => {
    expect(REDUCED_MOTION_QUERY).toBe("(prefers-reduced-motion: reduce)")
    expect(FINE_POINTER_QUERY).toBe("(pointer: fine)")
    expect(HOVER_QUERY).toBe("(hover: hover)")
    expect(HEADER_NAV_CHANGE_EVENT).toBe("header-nav:change")
    expect(MOTION_EVENTS).toEqual({
      claimed: "portfolio-motion:claimed",
      started: "portfolio-motion:started",
      settled: "portfolio-motion:settled",
    })
  })
})

describe("isMotionStatus", () => {
  it.each([...MOTION_STATUSES])("accepts the known status %s", (status) => {
    expect(isMotionStatus(status)).toBe(true)
  })

  it.each([["destroyed"], ["ACTIVE"], [""], [" idle"], [null], [undefined], [0], [{}], [["active"]]])(
    "rejects the non-status value %s",
    (value) => {
      expect(isMotionStatus(value)).toBe(false)
    },
  )
})

describe("isWebglStatus", () => {
  it.each([...WEBGL_STATUSES])("accepts the known WebGL status %s", (status) => {
    expect(isWebglStatus(status)).toBe(true)
  })

  it.each([["active"], ["READY"], [""], ["disposing"], [null], [undefined], [false], [1], [{}]])(
    "rejects the non-WebGL value %s",
    (value) => {
      expect(isWebglStatus(value)).toBe(false)
    },
  )
})

describe("isMotionPreference", () => {
  it("accepts both preference literals", () => {
    expect(isMotionPreference("reduce")).toBe(true)
    expect(isMotionPreference("no-preference")).toBe(true)
  })

  it.each([["reduced"], ["none"], [""], [null], [undefined], [true], [{}]])(
    "rejects the non-preference value %s",
    (value) => {
      expect(isMotionPreference(value)).toBe(false)
    },
  )
})

describe("isMotionModuleId", () => {
  it.each([["cards"], ["hero"], ["nav-indicator"], ["experience-timeline"], ["page-transitions"], ["reveal"]])(
    "accepts the module id %s",
    (moduleId) => {
      expect(isMotionModuleId(moduleId)).toBe(true)
    },
  )

  it.each([["header"], ["cards "], ["Cards"], [""], [null], [undefined], [7], [{}]])(
    "rejects the non-module value %s",
    (value) => {
      expect(isMotionModuleId(value)).toBe(false)
    },
  )
})

describe("isWebGL2Context", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns false when the runtime has no WebGL2 constructor", () => {
    vi.stubGlobal("WebGL2RenderingContext", undefined)

    expect(isWebGL2Context({})).toBe(false)
    expect(isWebGL2Context(null)).toBe(false)
  })

  it("accepts only instances of the WebGL2 constructor", () => {
    class FakeWebGL2RenderingContext {}
    vi.stubGlobal("WebGL2RenderingContext", FakeWebGL2RenderingContext)

    expect(isWebGL2Context(new FakeWebGL2RenderingContext())).toBe(true)
    expect(isWebGL2Context({})).toBe(false)
    expect(isWebGL2Context(null)).toBe(false)
    expect(isWebGL2Context(undefined)).toBe(false)
  })
})

describe("isReducedMotion", () => {
  it("reads the reduced-motion media query", () => {
    const view = fakeView(true)

    expect(isReducedMotion(view)).toBe(true)
    expect(view.matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_QUERY)
  })

  it("returns false when the view prefers motion or is absent", () => {
    expect(isReducedMotion(fakeView(false))).toBe(false)
    expect(isReducedMotion()).toBe(false)
  })
})

describe("isFinePointer", () => {
  it("reads the fine-pointer media query", () => {
    const view = fakeView(true)

    expect(isFinePointer(view)).toBe(true)
    expect(view.matchMedia).toHaveBeenCalledWith(FINE_POINTER_QUERY)
  })

  it("returns false for coarse pointers or an absent view", () => {
    expect(isFinePointer(fakeView(false))).toBe(false)
    expect(isFinePointer()).toBe(false)
  })
})

describe("articleTitleTransitionName", () => {
  it("preserves identifiers that are already valid custom idents", () => {
    expect(articleTitleTransitionName("vulcania-2024_monitoring")).toBe(
      "vt-article-title-vulcania-2024_monitoring",
    )
  })

  it("collapses punctuation, spaces and casing into a single separator", () => {
    expect(articleTitleTransitionName("CRM Backend / v2")).toBe("vt-article-title-crm-backend-v2")
    expect(articleTitleTransitionName("--Edge Cases!--")).toBe("vt-article-title-edge-cases")
  })

  it("keeps distinct post ids distinct after sanitizing", () => {
    const names = ["crm-backend", "crm-backend-v2", "crm_backend"].map(articleTitleTransitionName)

    expect(new Set(names).size).toBe(names.length)
  })

  it("falls back to a stable token when sanitizing leaves nothing", () => {
    expect(articleTitleTransitionName("///")).toBe("vt-article-title-article")
    expect(articleTitleTransitionName("")).toBe("vt-article-title-article")
  })
})
