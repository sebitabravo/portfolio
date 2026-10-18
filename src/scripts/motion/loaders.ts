import type { HeroSceneFactory, MotionFlip, MotionGsap, MotionScrollTrigger } from "./types"

export interface MotionLoadOptions {
  readonly webgl: boolean
  readonly flip?: boolean
}

export interface LoadedMotionLayer {
  readonly gsap: MotionGsap
  readonly ScrollTrigger: MotionScrollTrigger
  readonly Flip: MotionFlip | null
  readonly createHeroScene: HeroSceneFactory | null
}

export async function loadMotionLayer(options: MotionLoadOptions): Promise<LoadedMotionLayer> {
  const webglPromise = options.webgl ? import("../hero-webgl").catch(() => null) : Promise.resolve(null)
  const flipPromise = options.flip ? import("gsap/Flip").catch(() => null) : Promise.resolve(null)
  const [{ gsap }, { ScrollTrigger }, webgl, flip] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
    webglPromise,
    flipPromise,
  ])

  // Flip no se auto-registra en ESM; sin esto `Flip.fit` revienta al leer su instancia de GSAP.
  if (flip?.Flip) gsap.registerPlugin(flip.Flip)

  return {
    gsap,
    ScrollTrigger,
    Flip: flip?.Flip ?? null,
    createHeroScene: webgl?.createHeroScene ?? null,
  }
}
