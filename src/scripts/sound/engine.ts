// Resolución — motor de sonido: Web Audio sintetizado, sin assets ni fetch.
// Puerto de design/resolucion/common.js (§5 de DESIGN.md). Off por defecto,
// persistido en localStorage bajo la clave propia del diseño ("sb-sound").
//
// Máquina de estados de <html data-audio>:
//   idle    → sin intento aún, o el estado cayó de running (hace falta un gesto nuevo)
//   ready   → el AudioContext existe y state === "running"
//   blocked → se intentó reanudar y la política de autoplay (o el navegador) no dejó
//
// El contexto se crea o reanuda dentro de un gesto real: el click del switch o
// un pointerdown/keydown en captura —permanente, no once— cuando la preferencia
// persistida es on. visibilitychange suspende al ocultar (iOS ya lo hace) y, al
// volver, exige un gesto nuevo en vez de reclamar readiness. Límite de 40ms por
// voz; nunca suena en scroll pasivo porque ninguna voz se dispara desde scroll.

export type SoundVoice = "tick" | "press" | "chirp" | "shutter"

const SOUND_KEY = "sb-sound"

function createSound() {
  const root = document.documentElement
  let ctx: AudioContext | null = null
  let enabled = false
  const last: Record<string, number> = {}

  try {
    enabled = localStorage.getItem(SOUND_KEY) === "on"
  } catch {
    /* almacenamiento no disponible: el sonido queda en off */
  }

  const noiseBuffer = (): AudioBuffer => {
    const length = Math.floor((ctx as AudioContext).sampleRate * 0.06)
    const buffer = (ctx as AudioContext).createBuffer(1, length, (ctx as AudioContext).sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
    return buffer
  }

  const envelope = (time: number, duration: number, gain: number): GainNode => {
    const context = ctx as AudioContext
    const g = context.createGain()
    g.gain.setValueAtTime(gain, time)
    g.gain.exponentialRampToValueAtTime(0.0001, time + duration)
    g.connect(context.destination)
    return g
  }

  const oscillator = (type: OscillatorType, f0: number, f1: number, duration: number, gain: number, at = 0): void => {
    const context = ctx as AudioContext
    const time = context.currentTime + at
    const osc = context.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(f0, time)
    if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(f1, time + duration)
    osc.connect(envelope(time, duration, gain))
    osc.start(time)
    osc.stop(time + duration + 0.02)
  }

  const voices: Record<SoundVoice, () => void> = {
    tick: () => oscillator("triangle", 1600, 900, 0.018, 0.04),
    press: () => oscillator("square", 600, 600, 0.03, 0.03),
    chirp: () => {
      oscillator("sine", 880, 880, 0.07, 0.05)
      oscillator("sine", 1320, 1320, 0.1, 0.05, 0.08)
    },
    shutter: () => {
      const context = ctx as AudioContext
      const time = context.currentTime
      const source = context.createBufferSource()
      const filter = context.createBiquadFilter()
      source.buffer = noiseBuffer()
      filter.type = "bandpass"
      filter.frequency.value = 2400
      filter.Q.value = 0.8
      source.connect(filter)
      filter.connect(envelope(time, 0.06, 0.06))
      source.start(time)
    },
  }

  const setState = (state: "idle" | "ready" | "blocked"): void => {
    root.dataset.audio = state
  }

  /** Crea el contexto si falta, reanuda dentro del gesto y devuelve el estado real. */
  const unlock = async (): Promise<boolean> => {
    if (!ctx) {
      const AudioContextCtor: typeof AudioContext | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextCtor) {
        setState("blocked")
        return false
      }
      try {
        ctx = new AudioContextCtor()
      } catch {
        /* navegador sin Web Audio real: el sonido falla silencioso */
        setState("blocked")
        return false
      }
      // data-audio honesto: statechange es la única fuente de verdad.
      ctx.addEventListener("statechange", () => {
        if (ctx && ctx.state === "running") setState("ready")
        else setState("idle") // cayó de running (iOS al ocultar): hace falta un gesto nuevo
      })
    }
    if (ctx.state === "running") {
      setState("ready")
      return true
    }
    try {
      await ctx.resume()
    } catch {
      /* política de autoplay o sin dispositivo de audio: unlock devuelve false */
    }
    const state = ctx.state as AudioContextState
    const running = state === "running"
    setState(running ? "ready" : "blocked")
    return running
  }

  /** Gesto real (captura, permanente): reanuda cuando la preferencia es on y no hay running. */
  const onGesture = (): void => {
    if (enabled && (!ctx || ctx.state !== "running")) void unlock()
  }

  /** iOS/Safari suspenden al ocultar la página: suspender explícitamente ahorra batería
   *  y, al volver, se marca que hace falta un gesto en vez de reclamar readiness. */
  const onVisibility = (): void => {
    if (document.visibilityState === "hidden") {
      if (ctx && ctx.state === "running") void ctx.suspend().catch(() => undefined)
    } else if (ctx && ctx.state !== "running") {
      setState("idle")
    }
  }

  window.addEventListener("pointerdown", onGesture, { capture: true })
  window.addEventListener("keydown", onGesture, { capture: true })
  document.addEventListener("visibilitychange", onVisibility)

  return {
    get on() {
      return enabled
    },
    get running() {
      return ctx !== null && ctx.state === "running"
    },
    set(value: boolean) {
      enabled = value
      try {
        localStorage.setItem(SOUND_KEY, value ? "on" : "off")
      } catch {
        /* sin persistencia: el estado vive solo en esta página */
      }
    },
    unlock,
    play(name: SoundVoice) {
      if (!enabled) return
      try {
        if (!ctx || ctx.state !== "running") {
          // reanudación fire-and-forget: sin un gesto real el resume falla y queda blocked
          if (ctx) void unlock()
          return
        }
        const now = performance.now()
        if (now - (last[name] ?? 0) < 40) return
        last[name] = now
        voices[name]()
      } catch {
        /* el sonido nunca rompe la página */
      }
    },
    /** Ciclo de vida: desmonta los listeners de página. En producción los listeners
     *  viven toda la página; la suite de tests lo usa entre escenarios. */
    teardown(): void {
      window.removeEventListener("pointerdown", onGesture, { capture: true })
      window.removeEventListener("keydown", onGesture, { capture: true })
      document.removeEventListener("visibilitychange", onVisibility)
    },
  }
}

export const sound = createSound()
export const teardownSound = sound.teardown

// Sin intento aún: idle hasta el click del switch o el primer gesto real.
document.documentElement.dataset.audio = "idle"
