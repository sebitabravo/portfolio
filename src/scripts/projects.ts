import { trackEvent } from "@/lib/analytics"

let spotlightCleanup: (() => void) | null = null

export function setupProjects() {
  spotlightCleanup?.()
  spotlightCleanup = null

  document.querySelectorAll<HTMLElement>("[data-track-project]").forEach((button) => {
    if (button.dataset.trackBound === "true") return
    button.dataset.trackBound = "true"
    button.addEventListener("click", () => {
      const project = button.dataset.trackProject ?? ""
      const action = (button.dataset.trackAction ?? "code") as "live" | "code" | "casestudy"
      trackEvent({ name: "project_view", props: { project, action } })
    })
  })

  const cardCleanups: Array<() => void> = []
  document.querySelectorAll<HTMLElement>("[data-project-card]").forEach((card) => {
    if (card.dataset.spotlightBound === "true") return
    card.dataset.spotlightBound = "true"
    const controller = new AbortController()
    let bounds = card.getBoundingClientRect()
    let latestEvent: PointerEvent | null = null
    let frame = 0
    const updateBounds = () => {
      bounds = card.getBoundingClientRect()
    }
    const renderSpotlight = () => {
      frame = 0
      if (!latestEvent) return
      card.style.setProperty("--spotlight-x", `${latestEvent.clientX - bounds.left}px`)
      card.style.setProperty("--spotlight-y", `${latestEvent.clientY - bounds.top}px`)
    }
    const onPointerMove = (event: PointerEvent) => {
      latestEvent = event
      if (!frame) frame = requestAnimationFrame(renderSpotlight)
    }
    const reset = () => {
      latestEvent = null
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    }
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateBounds)
    resizeObserver?.observe(card)
    card.addEventListener("pointerenter", updateBounds, { signal: controller.signal })
    card.addEventListener("pointermove", onPointerMove, { signal: controller.signal })
    card.addEventListener("pointerleave", reset, { signal: controller.signal })
    cardCleanups.push(() => {
      controller.abort()
      resizeObserver?.disconnect()
      reset()
    })
  })

  spotlightCleanup = () => {
    cardCleanups.forEach((cleanup) => cleanup())
    cardCleanups.length = 0
  }

  document.querySelectorAll<HTMLImageElement>("img[data-img-fallback]").forEach((img) => {
    if (img.dataset.fallbackBound === "true") return
    img.dataset.fallbackBound = "true"
    img.addEventListener("error", () => {
      img.style.display = "none"
    })
  })
}

export function teardownProjects() {
  spotlightCleanup?.()
  spotlightCleanup = null
}
