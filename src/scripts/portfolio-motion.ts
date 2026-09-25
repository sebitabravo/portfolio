import { createCardTilt, createPointerMotion } from "./motion-interactions"
import { canLoadWebGLEnhancement, loadMotionLayer, shouldLoadWebGLEnhancement } from "./motion-capabilities"

export { shouldLoadWebGLEnhancement }

type Cleanup = () => void

type MotionRoot = HTMLElement & {
  dataset: DOMStringMap & {
    motionStatus?: string
  }
}

let activeCleanup: Cleanup | null = null
let setupSequence = 0
const MOTION_FALLBACK_TIMEOUT = 4000

/**
 * Progressive motion layer for the home page.
 *
 * The HTML/CSS experience remains complete without this module. WebGL and
 * GSAP are loaded only after hero interaction or 200px viewport proximity, and every listener,
 * ScrollTrigger and WebGL resource is released before an Astro view swap.
 */
export function setupPortfolioMotion(): void {
  const sequence = ++setupSequence
  activeCleanup?.()
  activeCleanup = null

  const root = document.querySelector<MotionRoot>("[data-portfolio-motion]")
  const canvas = root?.querySelector<HTMLCanvasElement>("[data-hero-webgl]")
  if (!root || !canvas) return
  const motionRoot = root
  const heroCanvas = canvas

  root.dispatchEvent(new Event("portfolio-motion:claimed"))

  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)")
  let matchMediaCleanup: Cleanup | null = null
  let activationObserver: IntersectionObserver | null = null
  let activationSequence = 0
  let disposed = false
  let loadingStarted = false
  let fallbackTimer: number | null = null
  let activationTimedOut = false

  root.dataset.motionStatus = "loading"
  canvas.dataset.webglStatus = "pending"

  const checkProximity = () => {
    const { top, bottom } = root.getBoundingClientRect()
    if (top <= window.innerHeight + 200 && bottom >= -200) startLoading()
  }
  const clearFallbackTimer = () => {
    if (fallbackTimer === null) return
    window.clearTimeout(fallbackTimer)
    fallbackTimer = null
  }

  const stopDeferredStartup = () => {
    root.removeEventListener("pointerenter", startLoading)
    root.removeEventListener("focusin", startLoading)
    root.removeEventListener("touchstart", startLoading)
    window.removeEventListener("scroll", checkProximity)
    window.removeEventListener("resize", checkProximity)
    activationObserver?.disconnect()
    activationObserver = null
  }

  activeCleanup = () => {
    disposed = true
    activationSequence += 1
    motionPreference.removeEventListener?.("change", onPreferenceChange)
    stopDeferredStartup()
    clearFallbackTimer()
    matchMediaCleanup?.()
    matchMediaCleanup = null
    root.dataset.motionStatus = "idle"
    if (canvas.dataset.webglStatus === "pending") canvas.dataset.webglStatus = "idle"
  }

  const load = (activation: number) => {
    void loadMotionLayer(!motionPreference.matches && canLoadWebGLEnhancement())
      .then(({ gsap, ScrollTrigger, webgl }) => {
        if (
          disposed ||
          sequence !== setupSequence ||
          activation !== activationSequence ||
          activationTimedOut ||
          motionPreference.matches
        )
          return

        gsap.registerPlugin(ScrollTrigger)
        const media = gsap.matchMedia()

        media.add(
          {
            reduceMotion: "(prefers-reduced-motion: reduce)",
            allowMotion: "(prefers-reduced-motion: no-preference)",
            finePointer: "(pointer: fine)",
          },
          (context) => {
            if (disposed || sequence !== setupSequence || activation !== activationSequence || activationTimedOut)
              return undefined
            const conditions = context.conditions as { reduceMotion?: boolean; finePointer?: boolean }

            if (motionPreference.matches || conditions.reduceMotion) {
              root.dataset.motionStatus = "reduced"
              canvas.dataset.webglStatus = "reduced"
              clearFallbackTimer()
              return undefined
            }

            root.dataset.motionStatus = "active"
            clearFallbackTimer()
            let sceneCleanup: Cleanup | null = null
            if (webgl) sceneCleanup = webgl.createHeroScene(canvas, root)
            else canvas.dataset.webglStatus = "fallback"
            const interactionCleanup = conditions.finePointer ? createPointerMotion(gsap, root) : null
            const scrollCleanup = createScrollMotion(gsap, ScrollTrigger)

            return () => {
              scrollCleanup?.()
              interactionCleanup?.()
              sceneCleanup?.()
            }
          },
        )

        matchMediaCleanup = () => media.revert()
      })
      .catch(() => {
        if (
          disposed ||
          sequence !== setupSequence ||
          activation !== activationSequence ||
          activationTimedOut ||
          motionPreference.matches
        )
          return
        clearFallbackTimer()
        root.dataset.motionStatus = "fallback"
        canvas.dataset.webglStatus = "fallback"
      })
  }

  function startLoading(): void {
    if (loadingStarted || disposed || sequence !== setupSequence || motionPreference.matches) return
    loadingStarted = true
    const activation = ++activationSequence
    stopDeferredStartup()
    motionRoot.dispatchEvent(new Event("portfolio-motion:started"))

    // Enhancement loading is bounded: slow Firefox/CI imports must settle into
    // a valid fallback state instead of leaving the contract stuck at loading.
    fallbackTimer = window.setTimeout(() => {
      fallbackTimer = null
      if (disposed || sequence !== setupSequence || activation !== activationSequence) return
      activationTimedOut = true
      if (motionRoot.dataset.motionStatus === "loading") motionRoot.dataset.motionStatus = "fallback"
      if (heroCanvas.dataset.webglStatus === "pending") heroCanvas.dataset.webglStatus = "fallback"
    }, MOTION_FALLBACK_TIMEOUT)

    load(activation)
  }

  function onPreferenceChange(): void {
    if (disposed || sequence !== setupSequence) return
    if (motionPreference.matches) {
      activationSequence += 1
      loadingStarted = false
      stopDeferredStartup()
      clearFallbackTimer()
      matchMediaCleanup?.()
      matchMediaCleanup = null
      motionRoot.dataset.motionStatus = "reduced"
      heroCanvas.dataset.webglStatus = "reduced"
    } else {
      activationTimedOut = false
      motionRoot.dataset.motionStatus = "loading"
      heroCanvas.dataset.webglStatus = "pending"
      armActivation()
    }
  }

  function armActivation(): void {
    motionRoot.addEventListener("pointerenter", startLoading)
    motionRoot.addEventListener("focusin", startLoading)
    motionRoot.addEventListener("touchstart", startLoading)
    if (window.IntersectionObserver) {
      activationObserver = new window.IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) startLoading()
        },
        { rootMargin: "200px" },
      )
      activationObserver.observe(motionRoot)
      checkProximity()
    } else {
      checkProximity()
      if (!loadingStarted) {
        window.addEventListener("scroll", checkProximity, { passive: true })
        window.addEventListener("resize", checkProximity)
      }
    }
  }

  motionPreference.addEventListener?.("change", onPreferenceChange)
  if (motionPreference.matches) {
    motionRoot.dataset.motionStatus = "reduced"
    heroCanvas.dataset.webglStatus = "reduced"
  } else {
    armActivation()
  }
}

export function teardownPortfolioMotion(): void {
  setupSequence += 1
  activeCleanup?.()
  activeCleanup = null
}

function createScrollMotion(
  gsap: (typeof import("gsap"))["gsap"],
  ScrollTrigger: (typeof import("gsap/ScrollTrigger"))["ScrollTrigger"],
): Cleanup {
  const projectGrid = document.querySelector<HTMLElement>("[data-projects-list]")
  if (!projectGrid) return () => undefined

  const cards = Array.from(projectGrid.querySelectorAll<HTMLElement>("[data-project-card]"))
  if (cards.length === 0) return () => undefined

  const projectSection = projectGrid.closest<HTMLElement>("section[id]") ?? projectGrid
  const meter = projectGrid.parentElement?.querySelector<HTMLElement>("[data-project-scroll-meter] span")
  const projectTimeline = gsap.fromTo(
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

  const sectionTrigger = ScrollTrigger.create({
    trigger: projectSection,
    start: "top bottom",
    end: "bottom top",
    scrub: true,
    onUpdate: (instance) => {
      projectGrid.style.setProperty("--project-progress", instance.progress.toFixed(3))
      if (meter) meter.style.transform = `scaleX(${instance.progress})`
    },
  })

  const cardCleanups = cards.map((card) => createCardTilt(gsap, card))

  return () => {
    projectTimeline.scrollTrigger?.kill()
    projectTimeline.kill()
    sectionTrigger.kill()
    cardCleanups.forEach((cleanup) => cleanup())
    projectGrid.style.removeProperty("--project-progress")
    if (meter) meter.style.transform = "scaleX(0)"
  }
}
