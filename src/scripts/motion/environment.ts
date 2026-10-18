import {
  FINE_POINTER_QUERY,
  HOVER_QUERY,
  REDUCED_MOTION_QUERY,
  type MotionCapabilities,
  type MotionPreference,
} from "./types"

export type MotionConnection = {
  effectiveType?: string
  saveData?: boolean
}

type NavigatorWithHints = Navigator & {
  connection?: MotionConnection
  deviceMemory?: number
}

export function shouldLoadWebGLEnhancement(connection?: MotionConnection, deviceMemory?: number): boolean {
  if (connection?.saveData || connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g") {
    return false
  }

  return typeof deviceMemory !== "number" || deviceMemory >= 2
}

export function canLoadWebGLEnhancement(): boolean {
  const { connection, deviceMemory } = navigator as NavigatorWithHints
  return shouldLoadWebGLEnhancement(connection, deviceMemory)
}

export function readMotionPreference(view: Pick<Window, "matchMedia">): MotionPreference {
  return view.matchMedia(REDUCED_MOTION_QUERY).matches ? "reduce" : "no-preference"
}

export function readMotionCapabilities(view: Pick<Window, "matchMedia"> = window): MotionCapabilities {
  const { connection, deviceMemory } = navigator as NavigatorWithHints
  const saveData = Boolean(connection?.saveData)

  return {
    reducedMotion: view.matchMedia(REDUCED_MOTION_QUERY).matches,
    finePointer: view.matchMedia(FINE_POINTER_QUERY).matches,
    canHover: view.matchMedia(HOVER_QUERY).matches,
    webgl2: typeof WebGL2RenderingContext !== "undefined",
    saveData,
    lowPower: saveData || (typeof deviceMemory === "number" && deviceMemory < 4),
    deviceMemory,
  }
}
