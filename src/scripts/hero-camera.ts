// Matemática pura de la cámara del hero: sin Three.js ni DOM, para probarla aislada.

export interface HeroPointer {
  readonly x: number
  readonly y: number
}

export interface HeroCameraState {
  readonly x: number
  readonly y: number
  readonly lookY: number
  readonly roll: number
  readonly fov: number
  readonly speed: number
}

export const BASE_FOV = 55

// Estado de cámara puro: puntero [-1, 1], scroll [0, 1] y turbo [0, 1].
export function computeHeroCamera(pointer: HeroPointer, scroll: number, turbo: number): HeroCameraState {
  return {
    x: pointer.x * 1.35,
    y: 2.15 + scroll * 2.4 - pointer.y * 0.45,
    lookY: 1.05 - scroll * 1.5 - pointer.y * 0.3,
    roll: -pointer.x * 0.055,
    fov: BASE_FOV + turbo * 10,
    speed: 2.1 + scroll * 1.6 + turbo * 6,
  }
}

export function approach(current: number, target: number, factor: number): number {
  return current + (target - current) * factor
}

// Progreso del hero para el scroll narrativo: 0 arriba, 1 cuando el hero ya salió.
export function heroScrollProgress(scrollY: number, heroHeight: number): number {
  if (!Number.isFinite(scrollY) || !Number.isFinite(heroHeight) || heroHeight <= 0) return 0
  return Math.min(1, Math.max(0, scrollY / heroHeight))
}

export interface StoryTrack {
  readonly top: number
  readonly height: number
}

// Avance dentro del tramo fijado: 0 cuando la pista toca el header, 1 cuando el escenario se suelta.
// Devuelve null si la pista no es más alta que el escenario (sin scroll timelines o con menos movimiento).
export function storyProgress(
  scrollY: number,
  track: StoryTrack,
  viewportHeight: number,
  headerHeight: number,
): number | null {
  const distance = track.height - (viewportHeight - headerHeight)
  const values = [scrollY, track.top, track.height, viewportHeight, headerHeight]
  if (values.some((value) => !Number.isFinite(value)) || distance <= 1) return null
  return Math.min(1, Math.max(0, (scrollY + headerHeight - track.top) / distance))
}
