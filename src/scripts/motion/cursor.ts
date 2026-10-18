import type { MotionContext, MotionGsap, MotionModule } from "./types"

const TARGET_SELECTOR = "[data-cursor-label]"
const OFFSET = 18

export function resolveCursorLabel(target: EventTarget | null): string | null {
  if (!(target instanceof Element)) return null
  const owner = target.closest<HTMLElement>(TARGET_SELECTOR)
  return owner?.dataset.cursorLabel?.trim() || null
}

// Etiqueta que sigue al puntero fino sobre los casos; nunca reemplaza el cursor nativo.
export function createCursorModule(): MotionModule {
  let pill: HTMLElement | null = null
  let gsapRef: MotionGsap | null = null

  const destroy = () => {
    if (pill) gsapRef?.killTweensOf(pill)
    pill?.remove()
    pill = null
    gsapRef = null
  }

  return {
    id: "cursor",
    init(context: MotionContext) {
      destroy()
      if (!context.capabilities.finePointer) return
      const { gsap } = context.libraries
      const body = context.scope.body
      const element = context.scope.createElement("div")
      element.className = "cursor-pill"
      element.setAttribute("aria-hidden", "true")
      body.append(element)
      pill = element
      gsapRef = gsap

      const moveX = gsap.quickTo(element, "x", { duration: 0.45, ease: "power3.out" })
      const moveY = gsap.quickTo(element, "y", { duration: 0.45, ease: "power3.out" })
      let current: string | null = null

      context.scope.addEventListener(
        "pointermove",
        (event: PointerEvent) => {
          moveX(event.clientX + OFFSET)
          moveY(event.clientY + OFFSET)
          const label = resolveCursorLabel(event.target)
          if (label !== current) {
            current = label
            if (label) element.textContent = `${label} ↗`
            element.classList.toggle("is-visible", Boolean(label))
          }
        },
        { passive: true, signal: context.signal },
      )
      context.scope.documentElement.addEventListener(
        "pointerleave",
        () => {
          current = null
          element.classList.remove("is-visible")
        },
        { signal: context.signal },
      )
    },
    refresh() {},
    destroy,
    cleanup: destroy,
  }
}
