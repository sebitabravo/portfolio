// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createCountersModule, formatCount, parseCount } from "../src/scripts/motion/counters"
import { createTerminalModule, planTerminal } from "../src/scripts/motion/terminal"
import type { MotionContext, MotionGsap } from "../src/scripts/motion/types"

const gsapHarness = vi.hoisted(() => {
  const tweens: { vars: Record<string, unknown>; kill: ReturnType<typeof vi.fn>; scrollTrigger: { kill: ReturnType<typeof vi.fn> } }[] = []
  const quickSetters: ReturnType<typeof vi.fn>[] = []
  return {
    tweens,
    quickSetters,
    to: vi.fn((_target: object, vars: Record<string, unknown>) => {
      const tween = { vars, kill: vi.fn(), scrollTrigger: { kill: vi.fn() } }
      tweens.push(tween)
      return tween
    }),
    quickTo: vi.fn(() => {
      const setter = vi.fn()
      quickSetters.push(setter)
      return setter
    }),
    killTweensOf: vi.fn(),
  }
})

function createContext(finePointer = true): MotionContext {
  return {
    scope: document,
    libraries: {
      gsap: gsapHarness as unknown as MotionGsap,
      ScrollTrigger: {} as MotionContext["libraries"]["ScrollTrigger"],
      Flip: null,
      createHeroScene: null,
    },
    capabilities: {
      reducedMotion: false,
      finePointer,
      canHover: finePointer,
      webgl2: true,
      saveData: false,
      lowPower: false,
    },
    signal: new AbortController().signal,
  }
}

afterEach(() => {
  vi.clearAllMocks()
  gsapHarness.tweens.length = 0
  gsapHarness.quickSetters.length = 0
  document.body.innerHTML = ""
})

describe("terminal typing", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("plans one step per key and one output per command, in order", () => {
    const steps = planTerminal(["ls", "pwd"])
    expect(steps.map((step) => `${step.line}:${step.kind}:${step.text}`)).toEqual([
      "0:type:l",
      "0:type:ls",
      "0:output:",
      "1:type:p",
      "1:type:pw",
      "1:type:pwd",
      "1:output:",
    ])
    expect(steps.every((step, index) => index === 0 || step.at > steps[index - 1].at)).toBe(true)
  })

  it("clears the commands, types them and restores the full text on destroy", () => {
    document.body.innerHTML = `
      <div data-terminal>
        <p><span data-terminal-cmd>whoami</span><span data-terminal-out>sebastian</span></p>
        <p><span data-terminal-cmd>ls</span><span data-terminal-out>repos</span></p>
      </div>`
    const module = createTerminalModule()
    module.init(createContext())
    const [first, second] = document.querySelectorAll<HTMLElement>("[data-terminal-cmd]")
    const [output] = document.querySelectorAll<HTMLElement>("[data-terminal-out]")
    expect(first.textContent).toBe("")
    expect(output.style.visibility).toBe("hidden")

    vi.runAllTimers()
    expect(first.textContent).toBe("whoami")
    expect(second.textContent).toBe("ls")
    expect(output.style.visibility).toBe("")

    module.init(createContext())
    module.destroy()
    expect(first.textContent).toBe("whoami")
    expect(output.style.visibility).toBe("")
    module.refresh(createContext(), "manual")
    module.cleanup()
  })

  it("is a no-op without a terminal or without commands", () => {
    const module = createTerminalModule()
    expect(() => module.init(createContext())).not.toThrow()
    document.body.innerHTML = "<div data-terminal></div>"
    expect(() => module.init(createContext())).not.toThrow()
  })
})

describe("stat counters", () => {
  it("parses prefixes, decimals and suffixes", () => {
    expect(parseCount("94.1%")).toEqual({ prefix: "", value: 94.1, decimals: 1, suffix: "%" })
    expect(parseCount("+4")).toEqual({ prefix: "+", value: 4, decimals: 0, suffix: "" })
    expect(parseCount("3,5x")).toEqual({ prefix: "", value: 3.5, decimals: 1, suffix: "x" })
    expect(parseCount("sin número")).toBeNull()
  })

  it("formats bounded intermediate values", () => {
    const parsed = parseCount("94.1%")!
    expect(formatCount(parsed, 0)).toBe("0.0%")
    expect(formatCount(parsed, 50.04)).toBe("50.0%")
    expect(formatCount(parsed, 120)).toBe("94.1%")
    expect(formatCount(parsed, -3)).toBe("0.0%")
  })

  it("only counts numbers that are still offscreen and restores them on destroy", () => {
    document.body.innerHTML = `
      <strong id="visible" data-count-to="4">4</strong>
      <strong id="below" data-count-to="94.1%">94.1%</strong>
      <strong id="invalid" data-count-to="n/a">n/a</strong>`
    const visible = document.querySelector<HTMLElement>("#visible")!
    const below = document.querySelector<HTMLElement>("#below")!
    const invalid = document.querySelector<HTMLElement>("#invalid")!
    vi.spyOn(visible, "getBoundingClientRect").mockReturnValue({ top: 100 } as DOMRect)
    vi.spyOn(below, "getBoundingClientRect").mockReturnValue({ top: window.innerHeight + 400 } as DOMRect)
    vi.spyOn(invalid, "getBoundingClientRect").mockReturnValue({ top: window.innerHeight + 400 } as DOMRect)

    const module = createCountersModule()
    module.init(createContext())
    expect(visible.textContent).toBe("4")
    expect(below.textContent).toBe("0.0%")
    expect(invalid.textContent).toBe("n/a")
    expect(gsapHarness.tweens).toHaveLength(1)

    const tween = gsapHarness.tweens[0]
    const state = gsapHarness.to.mock.calls[0][0] as { value: number }
    state.value = 47
    ;(tween.vars.onUpdate as () => void)()
    expect(below.textContent).toBe("47.0%")

    module.destroy()
    expect(tween.kill).toHaveBeenCalled()
    expect(tween.scrollTrigger.kill).toHaveBeenCalled()
    expect(below.textContent).toBe("94.1%")
    module.refresh(createContext(), "manual")
    module.cleanup()
  })
})
