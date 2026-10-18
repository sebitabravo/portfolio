import type { MotionContext, MotionGsap, MotionModule, MotionScrollTrigger } from "./types"

const LIST_SELECTOR = "[data-experience-list]"
const ITEM_SELECTOR = "[data-experience-item]"
const PROGRESS_SELECTOR = "[data-experience-progress]"
const REVEAL_SELECTOR = "[data-animate]"

export function createExperienceTimelineModule(): MotionModule {
  let progress: HTMLElement | null = null
  let trigger: ReturnType<MotionScrollTrigger["create"]> | null = null
  let revealTween: ReturnType<MotionGsap["fromTo"]> | null = null
  let revealTargets: HTMLElement[] = []

  const destroy = () => {
    trigger?.kill()
    revealTween?.scrollTrigger?.kill()
    revealTween?.kill()
    trigger = null
    revealTween = null
    progress?.style.removeProperty("--timeline-progress")
    for (const target of revealTargets) {
      target.style.removeProperty("opacity")
      target.style.removeProperty("transform")
      target.style.removeProperty("visibility")
    }
    revealTargets = []
    progress = null
  }

  return {
    id: "experience-timeline",
    init(context: MotionContext) {
      destroy()
      const experienceList = context.scope.querySelector<HTMLElement>(LIST_SELECTOR)
      if (!experienceList) return

      const items = Array.from(experienceList.querySelectorAll<HTMLElement>(ITEM_SELECTOR))
      if (items.length === 0) return

      progress = context.scope.querySelector<HTMLElement>(PROGRESS_SELECTOR)
      const { gsap, ScrollTrigger } = context.libraries

      if (progress) {
        const progressLine = progress
        const updateProgress = (instance: { progress: number }) => {
          progressLine.style.setProperty("--timeline-progress", instance.progress.toFixed(3))
        }

        progressLine.style.setProperty("--timeline-progress", "0")
        trigger = ScrollTrigger.create({
          trigger: experienceList,
          start: "top 80%",
          end: "bottom 60%",
          scrub: true,
          onUpdate: updateProgress,
          onRefresh: updateProgress,
        })
      }

      revealTargets = items.map((item) => item.querySelector<HTMLElement>(REVEAL_SELECTOR) ?? item)
      // Sin `immediateRender: false` GSAP oculta toda la lista al inicializar,
      // incluso lo que está fuera del viewport; el reveal dejaría de ser una
      // mejora y pasaría a ser la única fuente de visibilidad. ScrollTrigger
      // solo lee la opción desde las variables de destino.
      revealTween = gsap.fromTo(
        revealTargets,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          immediateRender: false,
          duration: 0.65,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: {
            trigger: experienceList,
            start: "top 85%",
            once: true,
          },
        },
      )
    },
    refresh() {
      trigger?.refresh()
      revealTween?.scrollTrigger?.refresh()
    },
    destroy,
    cleanup: destroy,
  }
}
