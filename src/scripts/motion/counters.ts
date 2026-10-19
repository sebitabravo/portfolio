import type { MotionContext, MotionGsap, MotionModule } from "./types"

const COUNTER_SELECTOR = "[data-count-to]"

export interface ParsedCount {
  readonly prefix: string
  readonly value: number
  readonly decimals: number
  readonly suffix: string
}

export function parseCount(input: string): ParsedCount | null {
  const match = input.trim().match(/^(\D*?)(\d+(?:[.,]\d+)?)(.*)$/)
  if (!match) return null
  const [, prefix, digits, suffix] = match
  const normalized = digits.replace(",", ".")
  const decimals = normalized.includes(".") ? normalized.split(".")[1].length : 0
  return { prefix, value: Number.parseFloat(normalized), decimals, suffix }
}

export function formatCount(parsed: ParsedCount, current: number): string {
  const bounded = Math.min(parsed.value, Math.max(0, current))
  return `${parsed.prefix}${bounded.toFixed(parsed.decimals)}${parsed.suffix}`
}

// Cuenta desde cero solo si la cifra todavía no se ve; lo visible no salta.
export function createCountersModule(): MotionModule {
  let tweens: ReturnType<MotionGsap["to"]>[] = []
  let restored: { element: HTMLElement; text: string }[] = []

  const destroy = () => {
    tweens.forEach((tween) => {
      tween.scrollTrigger?.kill()
      tween.kill()
    })
    restored.forEach(({ element, text }) => {
      element.textContent = text
    })
    tweens = []
    restored = []
  }

  return {
    id: "counters",
    init(context: MotionContext) {
      destroy()
      const view = context.scope.defaultView
      const { gsap } = context.libraries
      for (const element of context.scope.querySelectorAll<HTMLElement>(COUNTER_SELECTOR)) {
        const parsed = parseCount(element.dataset.countTo ?? "")
        if (!parsed || !view) continue
        if (element.getBoundingClientRect().top < view.innerHeight) continue

        const text = element.textContent ?? ""
        restored.push({ element, text })
        const state = { value: 0 }
        element.textContent = formatCount(parsed, 0)
        tweens.push(
          gsap.to(state, {
            value: parsed.value,
            duration: 1.6,
            ease: "power3.out",
            onUpdate: () => {
              element.textContent = formatCount(parsed, state.value)
            },
            scrollTrigger: { trigger: element, start: "top 92%", once: true },
          }),
        )
      }
    },
    refresh() {},
    destroy,
    cleanup: destroy,
  }
}
