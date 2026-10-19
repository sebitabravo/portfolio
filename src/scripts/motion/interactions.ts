import type { MotionGsap } from "./types"

export type Cleanup = () => void

export type MotionRoot = HTMLElement & {
  dataset: DOMStringMap & {
    motionStatus?: string
  }
}

export interface MagneticTargetOptions {
  readonly maxOffset?: number
  readonly signal?: AbortSignal
}

type NumericTween = (value: number) => void

interface CardLayer {
  readonly controller: AbortController
  readonly observer: ResizeObserver | null
  readonly reset: () => void
  readonly destroy: () => void
  tiltCount: number
  gsap: MotionGsap | null
  rotateX: NumericTween | null
  rotateY: NumericTween | null
  refs: number
}

const CARD_TILT = 2.5
const MAGNET_MAX_OFFSET = 7
const cardLayers = new WeakMap<HTMLElement, CardLayer>()

function bindSignal(signal: AbortSignal | undefined, cleanup: Cleanup): Cleanup {
  if (!signal) return () => undefined
  if (signal.aborted) {
    cleanup()
    return () => undefined
  }
  signal.addEventListener("abort", cleanup, { once: true })
  return () => signal.removeEventListener("abort", cleanup)
}

export function createPointerMotion(gsap: MotionGsap, root: MotionRoot, signal?: AbortSignal): Cleanup {
  if (signal?.aborted) return () => undefined
  const frame = root.querySelector<HTMLElement>(".hero-art-frame")
  if (!frame) return () => undefined
  // Solo el reflejo del vidrio sigue al puntero: el marco ya no se inclina en el rediseño.
  const glowX = gsap.quickTo(frame, "--hero-glow-x", { duration: 0.8, ease: "power3.out" })
  const glowY = gsap.quickTo(frame, "--hero-glow-y", { duration: 0.8, ease: "power3.out" })
  let bounds = frame.getBoundingClientRect()
  let latestPointer: PointerEvent | null = null
  let pointerFrame = 0
  let destroyed = false

  const updateBounds = () => {
    bounds = frame.getBoundingClientRect()
  }
  const applyPointer = () => {
    pointerFrame = 0
    if (!latestPointer) return
    const x = (latestPointer.clientX - bounds.left) / bounds.width - 0.5
    const y = (latestPointer.clientY - bounds.top) / bounds.height - 0.5

    glowX((x + 0.5) * 100)
    glowY((y + 0.5) * 100)
  }
  const onPointerMove = (event: PointerEvent) => {
    latestPointer = event
    if (!pointerFrame) pointerFrame = requestAnimationFrame(applyPointer)
  }
  const reset = () => {
    latestPointer = null
    if (pointerFrame) cancelAnimationFrame(pointerFrame)
    pointerFrame = 0
    glowX(50)
    glowY(50)
  }
  const controller = new AbortController()
  const cleanup = () => {
    if (destroyed) return
    destroyed = true
    unbindSignal()
    controller.abort()
    boundsObserver?.disconnect()
    reset()
    gsap.killTweensOf(frame)
  }
  const unbindSignal = bindSignal(signal, cleanup)
  const boundsObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateBounds)
  boundsObserver?.observe(frame)
  if (!boundsObserver) window.addEventListener("resize", updateBounds, { signal: controller.signal })
  frame.addEventListener("pointerenter", updateBounds, { signal: controller.signal })
  frame.addEventListener("pointermove", onPointerMove, { signal: controller.signal })
  frame.addEventListener("pointerleave", reset, { signal: controller.signal })

  return cleanup
}

export function createMagneticTarget(
  gsap: MotionGsap,
  target: HTMLElement,
  options: MagneticTargetOptions = {},
): Cleanup {
  if (options.signal?.aborted) return () => undefined
  const maxOffset = options.maxOffset ?? MAGNET_MAX_OFFSET
  const moveX = gsap.quickTo(target, "--magnet-x", { duration: 0.35, ease: "power3.out" })
  const moveY = gsap.quickTo(target, "--magnet-y", { duration: 0.35, ease: "power3.out" })
  let bounds = target.getBoundingClientRect()
  let latestPointer: PointerEvent | null = null
  let pointerFrame = 0
  let destroyed = false

  const updateBounds = () => {
    bounds = target.getBoundingClientRect()
  }
  const applyPointer = () => {
    pointerFrame = 0
    if (!latestPointer) return
    const offsetX = latestPointer.clientX - (bounds.left + bounds.width / 2)
    const offsetY = latestPointer.clientY - (bounds.top + bounds.height / 2)
    const distance = Math.hypot(offsetX, offsetY)
    const scale = distance > maxOffset ? maxOffset / distance : 1
    moveX(offsetX * scale)
    moveY(offsetY * scale)
  }
  const onPointerMove = (event: PointerEvent) => {
    latestPointer = event
    if (!pointerFrame) pointerFrame = requestAnimationFrame(applyPointer)
  }
  const reset = () => {
    latestPointer = null
    if (pointerFrame) cancelAnimationFrame(pointerFrame)
    pointerFrame = 0
    moveX(0)
    moveY(0)
  }
  const controller = new AbortController()
  const cleanup = () => {
    if (destroyed) return
    destroyed = true
    unbindSignal()
    controller.abort()
    boundsObserver?.disconnect()
    reset()
    gsap.killTweensOf(target)
  }
  const unbindSignal = bindSignal(options.signal, cleanup)
  const boundsObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateBounds)
  boundsObserver?.observe(target)
  if (!boundsObserver) window.addEventListener("resize", updateBounds, { signal: controller.signal })
  target.addEventListener("pointerenter", updateBounds, { signal: controller.signal })
  target.addEventListener("pointermove", onPointerMove, { signal: controller.signal })
  target.addEventListener("pointerleave", reset, { signal: controller.signal })
  return cleanup
}

function createCardLayer(card: HTMLElement): CardLayer {
  const controller = new AbortController()
  let bounds = card.getBoundingClientRect()
  let latestPointer: PointerEvent | null = null
  let pointerFrame = 0
  let destroyed = false
  const updateBounds = () => {
    bounds = card.getBoundingClientRect()
  }
  const reset = () => {
    latestPointer = null
    if (pointerFrame) cancelAnimationFrame(pointerFrame)
    pointerFrame = 0
    layer.rotateX?.(0)
    layer.rotateY?.(0)
  }
  const applyPointer = () => {
    pointerFrame = 0
    if (!latestPointer) return
    const x = (latestPointer.clientX - bounds.left) / bounds.width - 0.5
    const y = (latestPointer.clientY - bounds.top) / bounds.height - 0.5

    layer.rotateX?.(y * -CARD_TILT)
    layer.rotateY?.(x * CARD_TILT)
  }
  const onPointerMove = (event: PointerEvent) => {
    latestPointer = event
    if (!pointerFrame) pointerFrame = requestAnimationFrame(applyPointer)
  }
  const destroy = () => {
    if (destroyed) return
    destroyed = true
    controller.abort()
    observer?.disconnect()
    reset()
    layer.gsap?.killTweensOf(card)
  }

  const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateBounds)
  const layer: CardLayer = {
    controller,
    observer,
    reset,
    destroy,
    tiltCount: 0,
    gsap: null,
    rotateX: null,
    rotateY: null,
    refs: 0,
  }

  observer?.observe(card)
  if (!observer) window.addEventListener("resize", updateBounds, { signal: controller.signal })
  card.addEventListener("pointerenter", updateBounds, { signal: controller.signal })
  card.addEventListener("pointermove", onPointerMove, { signal: controller.signal })
  card.addEventListener("pointerleave", reset, { signal: controller.signal })

  return layer
}

function acquireCardLayer(card: HTMLElement): { layer: CardLayer; release: Cleanup } {
  let layer = cardLayers.get(card)
  if (!layer) {
    layer = createCardLayer(card)
    cardLayers.set(card, layer)
  }
  layer.refs += 1

  let released = false
  const release = () => {
    if (released) return
    released = true
    layer!.refs -= 1
    if (layer!.refs <= 0) {
      layer!.destroy()
      cardLayers.delete(card)
    }
  }

  return { layer, release }
}

export function createCardTilt(gsap: MotionGsap, card: HTMLElement, signal?: AbortSignal): Cleanup {
  if (signal?.aborted) return () => undefined
  const { layer, release } = acquireCardLayer(card)

  if (layer.tiltCount === 0) {
    layer.gsap = gsap
    layer.rotateX = gsap.quickTo(card, "--card-rotate-x", { duration: 0.45, ease: "power3.out" })
    layer.rotateY = gsap.quickTo(card, "--card-rotate-y", { duration: 0.45, ease: "power3.out" })
  }
  layer.tiltCount += 1

  let cleaned = false
  const cleanup = () => {
    if (cleaned) return
    cleaned = true
    layer.tiltCount -= 1
    if (layer.tiltCount <= 0) {
      layer.rotateX?.(0)
      layer.rotateY?.(0)
      layer.gsap?.killTweensOf(card)
      layer.gsap = null
      layer.rotateX = null
      layer.rotateY = null
    }
    unbindSignal()
    release()
  }
  const unbindSignal = bindSignal(signal, cleanup)

  return cleanup
}
