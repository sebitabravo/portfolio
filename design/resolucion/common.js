/* Resolución: comportamiento común a todas las vistas (sonido, tema, motor de resolución, nav). */
(() => {
  const root = document.documentElement
  const $ = (s, r = document) => r.querySelector(s)
  const $$ = (s, r = document) => [...r.querySelectorAll(s)]
  const motion = () => root.classList.contains("motion")
  const FRAME = 80

  /* ---------- Sonido: Web Audio sintetizado, sin assets ni fetch ---------- */
  const Sound = (() => {
    let ctx = null
    let on = false
    const last = {}
    try { on = localStorage.getItem("sb-sound") === "on" } catch (e) {}
    const noiseBuf = () => {
      const n = Math.floor(ctx.sampleRate * 0.06)
      const b = ctx.createBuffer(1, n, ctx.sampleRate)
      const d = b.getChannelData(0)
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1
      return b
    }
    const env = (t, dur, gain) => {
      const g = ctx.createGain()
      g.gain.setValueAtTime(gain, t)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      g.connect(ctx.destination)
      return g
    }
    const osc = (type, f0, f1, dur, gain, at = 0) => {
      const t = ctx.currentTime + at
      const o = ctx.createOscillator()
      o.type = type
      o.frequency.setValueAtTime(f0, t)
      if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur)
      o.connect(env(t, dur, gain))
      o.start(t)
      o.stop(t + dur + 0.02)
    }
    const voices = {
      tick: () => osc("triangle", 1600, 900, 0.018, 0.04),
      press: () => osc("square", 600, 600, 0.03, 0.03),
      chirp: () => { osc("sine", 880, 880, 0.07, 0.05); osc("sine", 1320, 1320, 0.1, 0.05, 0.08) },
      shutter: () => {
        const t = ctx.currentTime
        const s = ctx.createBufferSource()
        const f = ctx.createBiquadFilter()
        s.buffer = noiseBuf()
        f.type = "bandpass"; f.frequency.value = 2400; f.Q.value = 0.8
        s.connect(f); f.connect(env(t, 0.06, 0.06))
        s.start(t)
      },
    }
    const unlock = () => {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext
        if (!AC) return false
        ctx = new AC()
        root.dataset.audio = "ready"
      }
      if (ctx.state === "suspended") ctx.resume()
      return true
    }
    return {
      get on() { return on },
      set(v) {
        on = v
        try { localStorage.setItem("sb-sound", v ? "on" : "off") } catch (e) {}
        if (v) unlock()
      },
      unlock,
      play(name) {
        if (!on || !ctx || ctx.state !== "running") return
        const now = performance.now()
        if (now - (last[name] || 0) < 40) return
        last[name] = now
        voices[name]()
      },
    }
  })()
  root.dataset.audio = "idle"

  const soundBtn = $("#sound")
  const soundLabel = $("#sound-label")
  /* Etiqueta según el idioma del documento; las vistas sin header no tienen nada que pintar. */
  const es = (root.getAttribute("lang") || "es").toLowerCase().startsWith("es")
  const soundText = (on) => es ? (on ? "sonido: on" : "sonido: off") : (on ? "sound: on" : "sound: off")
  const paintSound = () => {
    if (soundBtn) soundBtn.setAttribute("aria-checked", String(Sound.on))
    if (soundLabel) soundLabel.textContent = soundText(Sound.on)
  }
  paintSound()
  if (soundBtn) soundBtn.addEventListener("click", () => {
    Sound.set(!Sound.on)
    paintSound()
    Sound.play("press")
  })
  /* Sonido persistido en "on": el contexto se crea recién en el primer gesto real. */
  const firstGesture = () => { if (Sound.on) Sound.unlock() }
  addEventListener("pointerdown", firstGesture, { once: true, capture: true })
  addEventListener("keydown", firstGesture, { once: true, capture: true })

  /* ---------- Tema ---------- */
  const themeBtn = $("#theme")
  if (themeBtn) themeBtn.addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light"
    root.dataset.theme = next
    try { localStorage.setItem("sb-theme", next) } catch (e) {}
    Sound.play("press")
    dispatchEvent(new Event("themechange"))
  })

  /* ---------- Motor de resolución: baja resolución a nítido, en pasos ---------- */
  const SHAPES = ["s0", "s1", "s2", "s3"]
  const buildCells = (el, text) => {
    const sr = document.createElement("span")
    sr.className = "sr"
    sr.textContent = text
    const cells = document.createElement("span")
    cells.setAttribute("aria-hidden", "true")
    el.textContent = ""
    el.append(sr, cells)
    return cells
  }

  /* targets: [{ el, from, to }]. Cada celda recorre Line, Triangle, Grid, Circle y se asienta en Square. */
  const resolve = (targets, { stagger = 1, settle = false } = {}) => new Promise((done) => {
    const plan = []
    let idx = 0
    for (const t of targets) {
      const len = Math.max(t.from.length, t.to.length)
      const cells = buildCells(t.el, t.to)
      const spans = []
      for (let i = 0; i < len; i++) {
        const s = document.createElement("span")
        s.className = "cell"
        s.textContent = t.from[i] ?? " "
        cells.append(s)
        spans.push({ s, from: t.from[i] ?? " ", to: t.to[i] ?? " ", start: idx++ * stagger })
      }
      plan.push({ t, spans })
    }
    const total = Math.ceil(idx * stagger) + SHAPES.length
    let tick = 0
    const step = () => {
      for (const { spans } of plan) {
        for (const c of spans) {
          const k = Math.floor(tick - c.start)
          if (k < 0) continue
          if (k < SHAPES.length) {
            c.s.className = "cell " + SHAPES[k]
            c.s.textContent = c.to
          } else if (k === SHAPES.length) {
            c.s.className = "cell"
            c.s.textContent = c.to
            if (c.to.trim()) Sound.play("tick")
          }
        }
      }
      if (++tick > total) {
        clearInterval(timer)
        for (const { t } of plan) t.el.textContent = t.to
        done()
      }
    }
    const timer = setInterval(step, FRAME)
    step()
  })

  const fontsReady = () => {
    const loads = ["GP Line", "GP Triangle", "GP Grid", "GP Circle", "Geist Pixel"].map((f) => document.fonts.load(`1em "${f}"`, "Sebastián Bravo trabajo"))
    return Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, 1200))]).then(() => document.fonts.check('1em "GP Line"') && document.fonts.check('1em "GP Circle"'))
  }

  const R = (window.R = { $, $$, motion, FRAME, Sound, resolve, shapes: false })
  R.ready = fontsReady().then((ok) => (R.shapes = ok))

  R.copy = async (text) => {
    try { await navigator.clipboard.writeText(text); return true } catch (e) {}
    const ta = document.createElement("textarea")
    ta.value = text; ta.style.cssText = "position:fixed;opacity:0"
    document.body.append(ta); ta.select()
    let ok = false
    try { ok = document.execCommand("copy") } catch (e) {}
    ta.remove()
    return ok
  }

  /* Títulos de vistas interiores: el h1 se resuelve una vez al cargar. */
  R.ready.then((ok) => {
    if (!ok || !motion()) return
    const els = $$("[data-load-resolve]")
    if (els.length) resolve(els.map((el) => ({ el, from: el.textContent, to: el.textContent })), { stagger: 1 })
  })

  /* Una revelación por sección: el título se resuelve y el bloque entra en pasos. */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      io.unobserve(e.target)
      const sec = e.target
      const h = $("[data-resolve]", sec)
      if (h && motion() && R.shapes) resolve([{ el: h, from: h.textContent, to: h.textContent }], { stagger: 1 })
      $$(".reveal", sec).forEach((r) => r.classList.add("in"))
    }
  }, { threshold: 0.12 })
  $$("main > section:not(.hero)").forEach((s) => io.observe(s))



  /* Botones y enlaces destacados suenan con press. */
  document.addEventListener("click", (e) => {
    if (e.target.closest(".btn, .lk")) Sound.play("press")
  })

  /* ---------- Sección activa en el nav: un solo observer, se desconecta al salir ---------- */
  const navLinks = new Map($$(".nav-main a[href^='#']").map((a) => [a.getAttribute("href").slice(1), a]))
  const navSections = $$("main > section[data-nav]")
  const inBand = new Set()
  let navIo = null
  const paintNav = () => {
    const active = navSections.filter((s) => inBand.has(s)).pop()
    const key = active ? active.dataset.nav : null
    navLinks.forEach((a, id) => {
      if (id === key) a.setAttribute("aria-current", "location")
      else a.removeAttribute("aria-current")
    })
  }
  const startNav = () => {
    if (navIo) return
    navIo = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? inBand.add(e.target) : inBand.delete(e.target)
      paintNav()
    }, { rootMargin: "-40% 0px -55% 0px" })
    navSections.forEach((s) => navIo.observe(s))
  }
  const stopNav = () => { if (navIo) { navIo.disconnect(); navIo = null; inBand.clear() } }
  startNav()
  addEventListener("pagehide", stopNav)
  addEventListener("pageshow", (e) => { if (e.persisted) startNav() })
})()
