import { canLoadWebGLEnhancement, readMotionCapabilities } from "./environment"
import { loadMotionLayer } from "./loaders"
import {
  MOTION_EVENTS,
  REDUCED_MOTION_QUERY,
  type HeroCanvasElement,
  type MotionCapabilities,
  type MotionContext,
  type MotionController,
  type MotionControllerOptions,
  type MotionLibraries,
  type MotionModuleError,
  type MotionRefreshReason,
  type MotionRootElement,
  type MotionStatus,
  type WebglStatus,
} from "./types"

type Cleanup = () => void
type ModulePhase = MotionModuleError["phase"]

const ACTIVATION_MARGIN = 200
const MOTION_FALLBACK_TIMEOUT = 4000

interface MediaConditions {
  readonly reduceMotion?: boolean
  readonly finePointer?: boolean
}

export function createMotionController(options: MotionControllerOptions = {}): MotionController {
  const scope = options.scope ?? document
  const view = scope.defaultView
  const modules = [...(options.modules ?? [])]
  const abortController = new AbortController()

  let root: MotionRootElement | null = null
  let canvas: HeroCanvasElement | null = null
  let preference: MediaQueryList | null = null
  let matchMediaCleanup: Cleanup | null = null
  let activationObserver: IntersectionObserver | null = null
  let activeContext: MotionContext | null = null
  let status: MotionStatus = "idle"
  let setupStatus: "idle" | "initialized" | "destroyed" = "idle"
  let activationSequence = 0
  let loadingStarted = false
  let fallbackTimer: number | null = null
  let activationTimedOut = false

  const setStatus = (next: MotionStatus) => {
    status = next
    if (root) root.dataset.motionStatus = next
  }
  const setCanvasStatus = (next: WebglStatus) => {
    if (canvas) canvas.dataset.webglStatus = next
  }
  const report = (moduleId: MotionModuleError["moduleId"], phase: ModulePhase, cause: unknown) => {
    try {
      options.onError?.({ moduleId, phase, cause })
    } catch {
      // Un handler externo defectuoso no puede romper el ciclo de vida.
    }
  }
  const clearFallbackTimer = () => {
    if (fallbackTimer === null || !view) return
    view.clearTimeout(fallbackTimer)
    fallbackTimer = null
  }

  const stopDeferredStartup = () => {
    if (!root || !view) return
    root.removeEventListener("pointerenter", startLoading)
    root.removeEventListener("focusin", startLoading)
    root.removeEventListener("touchstart", startLoading)
    view.removeEventListener("scroll", checkProximity)
    view.removeEventListener("resize", checkProximity)
    activationObserver?.disconnect()
    activationObserver = null
  }

  const runModules = (phase: ModulePhase, context?: MotionContext, reason?: MotionRefreshReason) => {
    const ordered = phase === "destroy" || phase === "cleanup" ? [...modules].reverse() : modules
    for (const module of ordered) {
      try {
        if (phase === "init" && context) module.init(context)
        else if (phase === "refresh" && context) module.refresh(context, reason ?? "manual")
        else if (phase === "destroy") module.destroy()
        else if (phase === "cleanup") module.cleanup()
      } catch (cause) {
        report(module.id, phase, cause)
      }
    }
    if (phase === "destroy") activeContext = null
  }
  const createContext = (libraries: MotionLibraries, conditions?: MediaConditions): MotionContext | null => {
    if (!view) return null
    const capabilities: MotionCapabilities = {
      ...readMotionCapabilities(view),
      reducedMotion: preference?.matches === true || conditions?.reduceMotion === true,
      finePointer: conditions?.finePointer === true,
    }

    return { scope, libraries, capabilities, signal: abortController.signal }
  }

  const isStale = (activation: number) =>
    setupStatus === "destroyed" ||
    activation !== activationSequence ||
    activationTimedOut ||
    preference?.matches === true

  const load = (activation: number) => {
    const loadWebGL = preference?.matches !== true && canLoadWebGLEnhancement()
    const loadFlip = Boolean(scope.querySelector("[data-nav-indicator]"))

    void loadMotionLayer({ webgl: loadWebGL, flip: loadFlip })
      .then((libraries) => {
        if (isStale(activation)) return

        libraries.gsap.registerPlugin(libraries.ScrollTrigger)
        const media = libraries.gsap.matchMedia()

        media.add(
          {
            reduceMotion: "(prefers-reduced-motion: reduce)",
            allowMotion: "(prefers-reduced-motion: no-preference)",
            finePointer: "(pointer: fine)",
          },
          (context) => {
            if (isStale(activation)) return undefined
            const conditions = context.conditions as MediaConditions | undefined

            if (preference?.matches || conditions?.reduceMotion) {
              setStatus("reduced")
              setCanvasStatus("reduced")
              clearFallbackTimer()
              return undefined
            }

            setStatus("active")
            clearFallbackTimer()
            const motionContext = createContext(libraries, conditions)
            activeContext = motionContext
            if (motionContext) runModules("init", motionContext)

            return () => runModules("destroy")
          },
        )

        matchMediaCleanup = () => media.revert()
      })
      .catch(() => {
        if (isStale(activation)) return
        clearFallbackTimer()
        setStatus("fallback")
        setCanvasStatus("fallback")
      })
  }

  function checkProximity(): void {
    if (!root || !view || setupStatus === "destroyed") return
    const { top, bottom } = root.getBoundingClientRect()
    if (top <= view.innerHeight + ACTIVATION_MARGIN && bottom >= -ACTIVATION_MARGIN) startLoading()
  }

  function startLoading(): void {
    if (loadingStarted || setupStatus === "destroyed" || preference?.matches) return
    loadingStarted = true
    const activation = ++activationSequence
    stopDeferredStartup()
    root?.dispatchEvent(new Event(MOTION_EVENTS.started))

    if (!view) return
    fallbackTimer = view.setTimeout(() => {
      fallbackTimer = null
      if (setupStatus === "destroyed" || activation !== activationSequence) return
      activationTimedOut = true
      if (status === "loading") setStatus("fallback")
      if (canvas?.dataset.webglStatus === "pending") setCanvasStatus("fallback")
    }, MOTION_FALLBACK_TIMEOUT)

    load(activation)
  }

  function onPreferenceChange(): void {
    if (setupStatus === "destroyed" || !preference) return

    if (preference.matches) {
      activationSequence += 1
      loadingStarted = false
      stopDeferredStartup()
      clearFallbackTimer()
      matchMediaCleanup?.()
      matchMediaCleanup = null
      setStatus("reduced")
      setCanvasStatus("reduced")
      return
    }

    activationTimedOut = false
    setStatus("loading")
    setCanvasStatus("pending")
    armActivation()
  }

  function armActivation(): void {
    if (!root || !view) return
    root.addEventListener("pointerenter", startLoading)
    root.addEventListener("focusin", startLoading)
    root.addEventListener("touchstart", startLoading)

    if (view.IntersectionObserver) {
      activationObserver = new view.IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) startLoading()
        },
        { rootMargin: "200px" },
      )
      activationObserver.observe(root)
      checkProximity()
      return
    }

    checkProximity()
    if (!loadingStarted) {
      view.addEventListener("scroll", checkProximity, { passive: true })
      view.addEventListener("resize", checkProximity)
    }
  }

  const init = () => {
    if (setupStatus !== "idle" || !view) return

    const nextRoot = scope.querySelector<MotionRootElement>("[data-portfolio-motion]")
    const nextCanvas = nextRoot?.querySelector<HeroCanvasElement>("[data-hero-webgl]")
    if (!nextRoot || !nextCanvas) return

    setupStatus = "initialized"
    root = nextRoot
    canvas = nextCanvas
    root.dispatchEvent(new Event(MOTION_EVENTS.claimed))

    preference = view.matchMedia(REDUCED_MOTION_QUERY)
    setStatus("loading")
    setCanvasStatus("pending")
    preference.addEventListener?.("change", onPreferenceChange)

    if (preference.matches) {
      setStatus("reduced")
      setCanvasStatus("reduced")
      return
    }

    armActivation()
  }

  const refresh = (reason: MotionRefreshReason) => {
    if (setupStatus !== "initialized" || status !== "active" || !activeContext) return
    runModules("refresh", activeContext, reason)
  }

  const destroy = () => {
    if (setupStatus === "destroyed" || setupStatus === "idle") return
    setupStatus = "destroyed"
    activationSequence += 1
    preference?.removeEventListener?.("change", onPreferenceChange)
    stopDeferredStartup()
    clearFallbackTimer()

    try {
      matchMediaCleanup?.()
    } catch {
      // La liberación de módulos sigue aunque el media context falle.
    }
    matchMediaCleanup = null
    runModules("destroy")
    abortController.abort()
    setStatus("idle")
    if (canvas?.dataset.webglStatus === "pending") setCanvasStatus("idle")
  }

  const cleanup = () => {
    destroy()
    runModules("cleanup")
    modules.length = 0
    root = null
    canvas = null
    preference = null
    activeContext = null
  }

  return {
    get status() {
      return status
    },
    init,
    refresh,
    destroy,
    cleanup,
  }
}
