/**
 * Contrato del layer de motion.
 *
 * Los módulos reciben GSAP y ScrollTrigger desde el controller, nunca los
 * importan por su cuenta. Esa única puerta de entrada es lo que permite
 * garantizar que un view swap no deje tweens, triggers ni contextos WebGL vivos.
 */

export const MOTION_STATUSES = ["idle", "loading", "active", "reduced", "fallback"] as const
export type MotionStatus = (typeof MOTION_STATUSES)[number]

export const WEBGL_STATUSES = ["idle", "pending", "ready", "fallback", "reduced", "disposed"] as const
export type WebglStatus = (typeof WEBGL_STATUSES)[number]

export type MotionLifecyclePhase = MotionStatus | "destroyed"
export type MotionModuleState = "idle" | "initializing" | "active" | "destroyed"

export type MotionModuleId =
  | "cards"
  | "hero"
  | "nav-indicator"
  | "experience-timeline"
  | "page-transitions"
  | "reveal"
  | "terminal"
  | "cursor"
  | "counters"

export type MotionRefreshReason =
  "viewport" | "fonts" | "images" | "breakpoint" | "reduced-motion" | "page-load" | "view-transition" | "manual"

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)" as const
export const FINE_POINTER_QUERY = "(pointer: fine)" as const
export const HOVER_QUERY = "(hover: hover)" as const

export type MotionPreference = "reduce" | "no-preference"

export interface MediaQueryState {
  readonly reducedMotion: boolean
  readonly finePointer: boolean
  readonly canHover: boolean
}

export interface MotionCapabilities extends MediaQueryState {
  readonly webgl2: boolean
  readonly saveData: boolean
  readonly lowPower: boolean
  readonly deviceMemory?: number
}

/** Tipo del singleton que exporta `gsap`; el controller lo inyecta ya cargado. */
export type MotionGsap = (typeof import("gsap"))["gsap"]
export type MotionScrollTrigger = (typeof import("gsap/ScrollTrigger"))["ScrollTrigger"]
export type MotionFlip = (typeof import("gsap/Flip"))["Flip"]

export type HeroSceneCleanup = () => void
export type HeroSceneFactory = (canvas: HeroCanvasElement, root: MotionRootElement) => HeroSceneCleanup | null

export interface MotionLibraries {
  readonly gsap: MotionGsap
  readonly ScrollTrigger: MotionScrollTrigger
  readonly Flip: MotionFlip | null
  readonly createHeroScene: HeroSceneFactory | null
}

export interface MotionContext {
  readonly scope: Document
  readonly libraries: MotionLibraries
  readonly capabilities: MotionCapabilities
  /** Se aborta en `destroy()`; todo listener del módulo debe usarlo. */
  readonly signal: AbortSignal
}

export interface MotionModule {
  readonly id: MotionModuleId
  init(context: MotionContext): void
  refresh(context: MotionContext, reason: MotionRefreshReason): void
  destroy(): void
  cleanup(): void
}

export const HEADER_NAV_CHANGE_EVENT = "header-nav:change" as const

export interface HeaderNavChangeDetail {
  readonly link: HTMLAnchorElement | null
}

export interface MotionController {
  readonly status: MotionStatus
  init(): void
  refresh(reason: MotionRefreshReason): void
  destroy(): void
  cleanup(): void
}

export interface MotionModuleError {
  readonly moduleId: MotionModuleId
  readonly phase: "init" | "refresh" | "destroy" | "cleanup"
  readonly cause: unknown
}

export interface MotionControllerOptions {
  readonly scope?: Document
  readonly modules?: readonly MotionModule[]
  readonly onError?: (error: MotionModuleError) => void
}

export type MotionRootElement = HTMLElement & {
  dataset: DOMStringMap & {
    motionStatus?: MotionStatus
  }
}

export type HeroCanvasElement = HTMLCanvasElement & {
  dataset: DOMStringMap & {
    webglStatus?: WebglStatus
  }
}

export const MOTION_EVENTS = {
  claimed: "portfolio-motion:claimed",
  started: "portfolio-motion:started",
  settled: "portfolio-motion:settled",
} as const

export type MotionEventName = (typeof MOTION_EVENTS)[keyof typeof MOTION_EVENTS]

export interface MotionSettledDetail {
  readonly status: MotionStatus
  readonly webglStatus: WebglStatus
}

/** Opciones nativas de `ScrollTrigger.batch()`, sin duplicar su definición. */
export type ScrollBatchOptions = Parameters<MotionScrollTrigger["batch"]>[1]
export type ScrollBatchCallback = NonNullable<ScrollBatchOptions["onEnter"]>
export type ScrollTriggerOptions = Parameters<MotionScrollTrigger["create"]>[0]

/** Tipos nativos de Flip: estado capturado, transición y ajuste geométrico. */
export type FlipState = ReturnType<MotionFlip["getState"]>
export type FlipTimeline = ReturnType<MotionFlip["from"]>
export type FlipFromOptions = NonNullable<Parameters<MotionFlip["from"]>[1]>
export type FlipFitOptions = NonNullable<Parameters<MotionFlip["fit"]>[2]>

export interface CardMotionElements {
  readonly section: HTMLElement
  readonly list: HTMLElement
  readonly cards: readonly HTMLElement[]
  readonly meter: HTMLElement | null
}

export interface HeroMotionElements {
  readonly root: MotionRootElement
  readonly canvas: HeroCanvasElement
}

export interface NavIndicatorElements {
  readonly nav: HTMLElement
  readonly links: readonly HTMLAnchorElement[]
  readonly indicator: HTMLElement
}

export interface ExperienceTimelineElements {
  readonly list: HTMLElement
  readonly items: readonly HTMLElement[]
  readonly spine: HTMLElement
}

export function isMotionStatus(value: unknown): value is MotionStatus {
  return typeof value === "string" && (MOTION_STATUSES as readonly string[]).includes(value)
}

export function isWebglStatus(value: unknown): value is WebglStatus {
  return typeof value === "string" && (WEBGL_STATUSES as readonly string[]).includes(value)
}

export function isMotionPreference(value: unknown): value is MotionPreference {
  return value === "reduce" || value === "no-preference"
}

export function isMotionModuleId(value: unknown): value is MotionModuleId {
  return (
    value === "cards" ||
    value === "hero" ||
    value === "nav-indicator" ||
    value === "experience-timeline" ||
    value === "page-transitions" ||
    value === "reveal" ||
    value === "terminal" ||
    value === "cursor" ||
    value === "counters"
  )
}

/** `getContext("webgl2")` devuelve `RenderingContext | null`; esto lo estrecha. */
export function isWebGL2Context(value: unknown): value is WebGL2RenderingContext {
  return typeof WebGL2RenderingContext !== "undefined" && value instanceof WebGL2RenderingContext
}

export function isReducedMotion(view?: Pick<Window, "matchMedia">): boolean {
  return view?.matchMedia(REDUCED_MOTION_QUERY).matches ?? false
}

export function isFinePointer(view?: Pick<Window, "matchMedia">): boolean {
  return view?.matchMedia(FINE_POINTER_QUERY).matches ?? false
}
