import { createPointerMotion } from "../motion-interactions"
import { createMagneticTarget } from "./interactions"
import type { HeroCanvasElement, MotionContext, MotionGsap, MotionModule, MotionRootElement } from "./types"

type Cleanup = () => void

const HANDOFF_SELECTORS = [".hero-aside"] as const
const CTA_SELECTOR = ".hero-btn-primary"
const MAGNET_MAX_OFFSET = 7

export function createHeroModule(): MotionModule {
  let sceneCleanup: Cleanup | null = null
  let pointerCleanup: Cleanup | null = null
  let magneticCleanup: Cleanup | null = null
  let handoffTween: ReturnType<MotionGsap["fromTo"]> | null = null
  let handoffTargets: HTMLElement[] = []

  const destroy = () => {
    handoffTween?.scrollTrigger?.kill()
    handoffTween?.kill()
    handoffTween = null
    for (const target of handoffTargets) {
      target.style.removeProperty("--hero-exit-y")
      target.style.removeProperty("--hero-exit-opacity")
    }
    handoffTargets = []
    magneticCleanup?.()
    magneticCleanup = null
    pointerCleanup?.()
    pointerCleanup = null
    sceneCleanup?.()
    sceneCleanup = null
  }

  return {
    id: "hero",
    init(context: MotionContext) {
      destroy()
      const root = context.scope.querySelector<MotionRootElement>("[data-portfolio-motion]")
      const canvas = root?.querySelector<HeroCanvasElement>("[data-hero-webgl]")
      if (!root || !canvas) return

      const { gsap, createHeroScene } = context.libraries
      if (createHeroScene) {
        sceneCleanup = createHeroScene(canvas, root)
      } else {
        canvas.dataset.webglStatus = "fallback"
      }

      if (context.capabilities.finePointer) {
        pointerCleanup = createPointerMotion(gsap, root)
      }

      // El h1 queda fuera por diseño: es el candidato LCP y debe pintarse sin
      // opacidad, transform ni filtros administrados por GSAP.
      handoffTargets = HANDOFF_SELECTORS.flatMap((selector) => {
        const element = root.querySelector<HTMLElement>(selector)
        return element ? [element] : []
      })
      if (handoffTargets.length > 0) {
        handoffTween = gsap.fromTo(
          handoffTargets,
          { "--hero-exit-y": "0rem", "--hero-exit-opacity": 1 },
          {
            "--hero-exit-y": "-3.25rem",
            "--hero-exit-opacity": 0,
            ease: "none",
            scrollTrigger: {
              trigger: root.querySelector<HTMLElement>(".hero-frame") ?? root,
              start: "top top",
              end: "bottom 30%",
              scrub: 0.5,
            },
          },
        )
      }

      if (context.capabilities.finePointer) {
        const cta = root.querySelector<HTMLElement>(CTA_SELECTOR)
        if (cta) {
          magneticCleanup = createMagneticTarget(gsap, cta, {
            maxOffset: MAGNET_MAX_OFFSET,
            signal: context.signal,
          })
        }
      }
    },
    refresh() {
      handoffTween?.scrollTrigger?.refresh()
    },
    destroy,
    cleanup: destroy,
  }
}
