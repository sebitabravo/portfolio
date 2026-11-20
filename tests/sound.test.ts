// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Espejo del DOM que produce Header.astro (es): el switch de sonido.
function renderHeader(): void {
  document.documentElement.lang = "es"
  document.body.innerHTML = `
    <header class="site-header">
      <div class="controls">
        <button id="sound" type="button" role="switch" aria-checked="false">
          <span class="dot" aria-hidden="true"></span><span id="sound-label">sonido: off</span>
        </button>
      </div>
    </header>
  `
}

const soundButton = () => document.getElementById("sound")!
const soundLabel = () => document.getElementById("sound-label")!
const audioState = () => document.documentElement.dataset.audio
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

// Modo de resume del fake: "resolve" llega a running, "defer" espera el release
// y "stuck" simula la política de autoplay que nunca deja reanudar.
let resumeMode: "resolve" | "defer" | "stuck" = "resolve"
let releaseResume: (() => void) | null = null

class FakeAudioContext {
  static instances: FakeAudioContext[] = []
  state: AudioContextState = "suspended"
  sampleRate = 44100
  currentTime = 0
  destination = {}
  resumeCalls = 0
  suspendCalls = 0
  private listeners = new Map<string, Array<() => void>>()

  constructor() {
    FakeAudioContext.instances.push(this)
  }

  resume = (): Promise<void> => {
    this.resumeCalls++
    if (resumeMode === "resolve") {
      this.state = "running"
      return Promise.resolve()
    }
    if (resumeMode === "stuck") return Promise.resolve()
    return new Promise<void>((resolve) => {
      releaseResume = () => {
        this.state = "running"
        resolve()
      }
    })
  }

  suspend = async (): Promise<void> => {
    this.suspendCalls++
    this.state = "suspended"
    this.emit("statechange")
  }

  addEventListener = (type: string, listener: () => void): void => {
    const list = this.listeners.get(type) ?? []
    list.push(listener)
    this.listeners.set(type, list)
  }

  emit(type: string): void {
    for (const listener of this.listeners.get(type) ?? []) listener()
  }

  createGain = () => ({
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  })

  createOscillator = () => {
    const osc = {
      type: "",
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }
    oscillators.push(osc)
    return osc
  }

  createBuffer = (_channels: number, length: number) => ({ getChannelData: () => new Float32Array(length) })

  createBufferSource = () => ({ buffer: null, connect: vi.fn(), start: vi.fn() })

  createBiquadFilter = () => ({
    type: "",
    frequency: { value: 0 },
    Q: { value: 0 },
    connect: vi.fn(),
  })
}

const oscillators: Array<{ type: string }> = []
const lastContext = () => FakeAudioContext.instances.at(-1)!

type SoundModule = typeof import("../src/scripts/sound/engine")

let soundModule: SoundModule | null = null

// Importa el motor con el registro de módulos limpio: los listeners viven a
// nivel de módulo, así que cada test ve una instancia nueva y el afterEach
// desmonta la del test anterior.
async function loadSound(): Promise<SoundModule["sound"]> {
  vi.resetModules()
  const engine = await import("../src/scripts/sound/engine")
  soundModule = engine
  return engine.sound
}

async function loadToggle(): Promise<typeof import("../src/scripts/sound/toggle")> {
  return import("../src/scripts/sound/toggle")
}

beforeEach(() => {
  vi.stubGlobal("AudioContext", FakeAudioContext)
  localStorage.clear()
  oscillators.length = 0
  FakeAudioContext.instances.length = 0
  renderHeader()
})

afterEach(() => {
  soundModule?.teardownSound?.()
  soundModule = null
  resumeMode = "resolve"
  releaseResume = null
  delete (document as unknown as { visibilityState?: string }).visibilityState
  document.body.innerHTML = ""
  vi.unstubAllGlobals()
})

describe("switch de sonido", () => {
  it("ON: pinta de inmediato y toca press solo cuando el contexto llega a running", async () => {
    resumeMode = "defer"
    const sound = await loadSound()
    const { initSoundToggle } = await loadToggle()
    initSoundToggle()

    soundButton().click()

    // Pintura inmediata de la preferencia; sin ready mientras resume no resuelve.
    expect(soundButton().getAttribute("aria-checked")).toBe("true")
    expect(soundLabel().textContent).toBe("sonido: on")
    expect(audioState()).toBe("idle")
    expect(oscillators.filter((o) => o.type === "square")).toHaveLength(0)

    releaseResume!()
    await flush()

    const ctx = lastContext()
    expect(ctx.state).toBe("running")
    expect(audioState()).toBe("ready")
    expect(oscillators.filter((o) => o.type === "square")).toHaveLength(1)
    expect(sound.on).toBe(true)
    expect(localStorage.getItem("sb-sound")).toBe("on")
  })

  it("OFF: press suena mientras el sonido sigue habilitado, después desactiva", async () => {
    const sound = await loadSound()
    const { initSoundToggle } = await loadToggle()
    initSoundToggle()

    soundButton().click()
    await flush()
    expect(sound.on).toBe(true)
    expect(lastContext().state).toBe("running")

    oscillators.length = 0
    // Dos clicks humanos están a más de 40ms: salir del límite por voz.
    await new Promise((resolve) => setTimeout(resolve, 50))
    soundButton().click()

    expect(oscillators.filter((o) => o.type === "square")).toHaveLength(1)
    expect(sound.on).toBe(false)
    expect(soundButton().getAttribute("aria-checked")).toBe("false")
    expect(soundLabel().textContent).toBe("sonido: off")
    expect(localStorage.getItem("sb-sound")).toBe("off")
  })

  it("ON bloqueado: sin audio real la preferencia vuelve a off en vez de contradecirse", async () => {
    resumeMode = "stuck"
    const sound = await loadSound()
    const { initSoundToggle } = await loadToggle()
    initSoundToggle()

    soundButton().click()
    await flush()

    // Un switch encendido con la etiqueta "off" se contradice: si el navegador no
    // puede arrancar el audio, el estado vuelve a off y se persiste.
    expect(sound.on).toBe(false)
    expect(localStorage.getItem("sb-sound")).toBe("off")
    expect(lastContext().state).toBe("suspended")
    expect(audioState()).toBe("blocked")
    expect(soundButton().getAttribute("aria-checked")).toBe("false")
    expect(soundLabel().textContent).toBe("sonido: off")
  })
})

describe("motor de sonido", () => {
  it("play() con contexto suspendido intenta reanudar y no suena", async () => {
    resumeMode = "stuck"
    localStorage.setItem("sb-sound", "on")
    const sound = await loadSound()

    const ok = await sound.unlock()
    expect(ok).toBe(false)
    const ctx = lastContext()
    expect(ctx.resumeCalls).toBe(1)
    expect(audioState()).toBe("blocked")

    sound.play("tick")
    expect(ctx.resumeCalls).toBe(2)
    expect(oscillators).toHaveLength(0)
  })

  it("play() sin contexto creado no crea uno ni lanza", async () => {
    localStorage.setItem("sb-sound", "on")
    const sound = await loadSound()

    expect(FakeAudioContext.instances).toHaveLength(0)
    expect(() => sound.play("tick")).not.toThrow()
    expect(FakeAudioContext.instances).toHaveLength(0)
    expect(oscillators).toHaveLength(0)
  })

  it("data-audio: idle → ready solo cuando running, y vuelve a idle en el statechange", async () => {
    resumeMode = "defer"
    localStorage.setItem("sb-sound", "on")
    const sound = await loadSound()

    expect(audioState()).toBe("idle")
    const pending = sound.unlock()
    await flush()

    // Crear el contexto no reclama readiness (defecto 2): solo el running real.
    expect(lastContext().state).toBe("suspended")
    expect(audioState()).toBe("idle")

    releaseResume!()
    expect(await pending).toBe(true)
    expect(audioState()).toBe("ready")

    // Cayó de running (iOS al ocultar): hace falta un gesto nuevo.
    const ctx = lastContext()
    ctx.state = "suspended"
    ctx.emit("statechange")
    expect(audioState()).toBe("idle")
  })

  it("un pointerdown posterior reanuda el contexto cuando está habilitado y no running", async () => {
    resumeMode = "stuck"
    localStorage.setItem("sb-sound", "on")
    const sound = await loadSound()
    await sound.unlock()

    const ctx = lastContext()
    expect(audioState()).toBe("blocked")
    expect(ctx.resumeCalls).toBe(1)

    resumeMode = "resolve"
    window.dispatchEvent(new Event("pointerdown"))
    await flush()

    expect(ctx.resumeCalls).toBe(2)
    expect(ctx.state).toBe("running")
    expect(audioState()).toBe("ready")
  })

  it("visibilitychange a hidden suspende el contexto y vuelve data-audio a idle", async () => {
    localStorage.setItem("sb-sound", "on")
    const sound = await loadSound()
    await sound.unlock()

    const ctx = lastContext()
    expect(ctx.state).toBe("running")
    expect(audioState()).toBe("ready")

    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true })
    try {
      document.dispatchEvent(new Event("visibilitychange"))
    } finally {
      delete (document as unknown as { visibilityState?: string }).visibilityState
    }

    expect(ctx.suspendCalls).toBe(1)
    expect(ctx.state).toBe("suspended")
    expect(audioState()).toBe("idle")
  })
})

describe("escenario del home", () => {
  it("el hover del índice suena tick solo con puntero mouse; un tap táctil no suena", async () => {
    localStorage.setItem("sb-sound", "on")
    vi.resetModules()
    const engine = await import("../src/scripts/sound/engine")
    soundModule = engine
    const { setupStage } = await import("../src/scripts/stage")
    const sound = engine.sound

    document.body.innerHTML = `
      <main>
        <div role="tablist">
          <button role="tab" data-slug="a" aria-selected="true">A</button>
          <button role="tab" data-slug="b">B</button>
        </div>
        <div role="tabpanel" data-panel="a"></div>
        <div role="tabpanel" data-panel="b" hidden></div>
      </main>
    `
    setupStage()
    sound.set(true)
    await sound.unlock()
    expect(lastContext().state).toBe("running")

    const tabB = document.querySelector('[role="tab"][data-slug="b"]')!
    const enter = (pointerType: string): void => {
      const event = new Event("pointerenter") as Event & { pointerType: string }
      Object.defineProperty(event, "pointerType", { value: pointerType })
      tabB.dispatchEvent(event)
    }

    enter("touch")
    expect(oscillators).toHaveLength(0)

    enter("mouse")
    expect(oscillators.filter((o) => o.type === "triangle")).toHaveLength(1)
  })
})
