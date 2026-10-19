import { createCardTilt } from "../motion-interactions"
import type { Cleanup } from "./interactions"
import type { MotionContext, MotionGsap, MotionModule } from "./types"

const CARD_SELECTOR = "[data-project-card]"
const LIST_SELECTOR = "[data-projects-list]"
const IMAGE_FALLBACK_SELECTOR = "img[data-img-fallback]"
const REVEAL_OPTIONS: IntersectionObserverInit = { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }

let eagerCleanup: Cleanup | null = null
let revealObserver: IntersectionObserver | null = null

export function setupProjectCards(scope: Document = document): void {
  teardownProjectCards()
  const controller = new AbortController()
  const images = Array.from(scope.querySelectorAll<HTMLImageElement>(IMAGE_FALLBACK_SELECTOR))
  for (const image of images) {
    image.addEventListener("error", () => image.classList.add("hidden"), { signal: controller.signal })
  }

  eagerCleanup = () => {
    controller.abort()
    eagerCleanup = null
  }
}

export function teardownProjectCards(): void {
  eagerCleanup?.()
  eagerCleanup = null
}

export function initCardReveal(scope: Document = document): void {
  revealObserver?.disconnect()
  revealObserver = null
  if (!("IntersectionObserver" in window)) return

  const cards = Array.from(scope.querySelectorAll<HTMLElement>(`${CARD_SELECTOR}[data-animate]`))
  if (cards.length === 0) return

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return

      const element = entry.target
      element.classList.add("reveal-pending")
      requestAnimationFrame(() => element.classList.add("animate-in"))
      observer.unobserve(element)
    })
  }, REVEAL_OPTIONS)

  for (const card of cards) {
    card.classList.remove("animate-in", "reveal-pending")
    if (card.getBoundingClientRect().top <= window.innerHeight * 1.1) {
      card.classList.add("reveal-pending")
    }
    observer.observe(card)
  }

  revealObserver = observer
}

export function createCardsModule(): MotionModule {
  let timeline: ReturnType<MotionGsap["fromTo"]> | null = null
  let cardCleanups: Cleanup[] = []

  const destroy = () => {
    timeline?.scrollTrigger?.kill()
    timeline?.kill()
    cardCleanups.forEach((cleanup) => cleanup())
    timeline = null
    cardCleanups = []
  }

  const init = (context: MotionContext) => {
    destroy()
    const projectGrid = context.scope.querySelector<HTMLElement>(LIST_SELECTOR)
    if (!projectGrid) return

    const cards = Array.from(projectGrid.querySelectorAll<HTMLElement>(CARD_SELECTOR))
    if (cards.length === 0) return

    const projectSection = projectGrid.closest<HTMLElement>("section[id]") ?? projectGrid
    const { gsap } = context.libraries

    timeline = gsap.fromTo(
      cards,
      {
        "--motion-y": "1.2rem",
        "--motion-scale": 0.985,
      },
      {
        "--motion-y": "0rem",
        "--motion-scale": 1,
        duration: 0.9,
        ease: "power2.out",
        stagger: 0.09,
        scrollTrigger: {
          trigger: projectSection,
          start: "top 88%",
          end: "top 36%",
          scrub: 0.75,
        },
      },
    )

    cardCleanups = cards.map((card) => createCardTilt(gsap, card, context.signal))
  }

  return {
    id: "cards",
    init,
    refresh() {},
    destroy,
    cleanup: destroy,
  }
}
