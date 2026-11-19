// Resolución — motor de sonido: Web Audio sintetizado, sin assets ni fetch.
// Puerto de design/resolucion/common.js (§5 de DESIGN.md). Off por defecto,
// persistido en localStorage bajo la clave propia del diseño ("sb-sound").
// El AudioContext se crea o reanuda dentro de un gesto del usuario: el click
// del switch o el primer pointerdown/keydown cuando el estado persistido es on.
// Límite de 40ms por voz; nunca suena en scroll pasivo porque ninguna voz se
// dispara desde scroll.

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

  const oscillator = (
    type: OscillatorType,
    f0: number,
    f1: number,
    duration: number,
    gain: number,
    at = 0,
  ): void => {
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

  const unlock = (): boolean => {
    if (!ctx) {
      const AudioContextCtor: typeof AudioContext | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextCtor) return false
      ctx = new AudioContextCtor()
      root.dataset.audio = "ready"
    }
    if (ctx.state === "suspended") void ctx.resume()
    return true
  }

  return {
    get on() {
      return enabled
    },
    set(value: boolean) {
      enabled = value
      try {
        localStorage.setItem(SOUND_KEY, value ? "on" : "off")
      } catch {
        /* sin persistencia: el estado vive solo en esta página */
      }
      if (value) unlock()
    },
    unlock,
    play(name: SoundVoice) {
      if (!enabled || !ctx || ctx.state !== "running") return
      const now = performance.now()
      if (now - (last[name] ?? 0) < 40) return
      last[name] = now
      voices[name]()
    },
  }
}

export const sound = createSound()

// Sonido persistido en "on": el contexto se crea recién en el primer gesto real.
const firstGesture = (): void => {
  if (sound.on) sound.unlock()
}
window.addEventListener("pointerdown", firstGesture, { once: true, capture: true })
window.addEventListener("keydown", firstGesture, { once: true, capture: true })

document.documentElement.dataset.audio = "idle"
