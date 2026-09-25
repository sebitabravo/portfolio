export type MotionConnection = {
  effectiveType?: string
  saveData?: boolean
}

export function shouldLoadWebGLEnhancement(connection?: MotionConnection, deviceMemory?: number): boolean {
  if (connection?.saveData || connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g") {
    return false
  }

  return typeof deviceMemory !== "number" || deviceMemory >= 2
}

export function canLoadWebGLEnhancement(): boolean {
  const connection = (navigator as Navigator & { connection?: MotionConnection }).connection
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  return shouldLoadWebGLEnhancement(connection, deviceMemory)
}

export async function loadMotionLayer(shouldLoadWebGL: boolean) {
  const webglPromise = shouldLoadWebGL ? import("./hero-webgl").catch(() => null) : Promise.resolve(null)
  const [{ gsap }, { ScrollTrigger }, webgl] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
    webglPromise,
  ])

  return { gsap, ScrollTrigger, webgl }
}
