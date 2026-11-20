// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { setupHeaderNav, teardownHeaderNav } from "../src/scripts/header-nav"

class FakeIntersectionObserver {
  callback: IntersectionObserverCallback
  options: IntersectionObserverInit | undefined
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.options = options
    intersectionInstances.push(this)
  }
}

let intersectionInstances: FakeIntersectionObserver[]

// Espejo del DOM que produce Header.astro (es, home): la marca, cuatro enlaces
// (tres anclas + la ruta de blog) y las secciones del home bajo <main> con su
// data-nav (src/lib/home-sections.ts).
function renderHome() {
  document.body.innerHTML = `
    <header class="site-header">
      <nav class="nav-main">
        <a href="#trabajo">Trabajo</a>
        <a href="#experiencia">Experiencia</a>
        <a href="/blog">Blog</a>
        <a href="#contacto">Contacto</a>
      </nav>
    </header>
    <main>
      <section id="trabajo" data-nav="trabajo"></section>
      <section id="experiencia" data-nav="experiencia"></section>
      <section id="contacto" data-nav="contacto"></section>
    </main>
  `
}

// Espejo del DOM en una página de ruta (p. ej. /blog): los enlaces del nav
// apuntan a rutas, ninguno a un fragmento, y el enlace de ruta activo ya
// viene con aria-current="page" renderizado en el servidor.
function renderRoutePage() {
  document.body.innerHTML = `
    <header class="site-header">
      <nav class="nav-main">
        <a href="/#trabajo">Trabajo</a>
        <a href="/#experiencia">Experiencia</a>
        <a href="/blog" aria-current="page">Blog</a>
        <a href="/#contacto">Contacto</a>
      </nav>
    </header>
    <main><article></article></main>
  `
}

// Espejo del DOM que produce Header.astro en el home real: los enlaces ancla
// salen con ruta absoluta y fragmento ("/#proyectos" en es, "/en/#projects" en
// en), no con href^="#".
function renderHomeAbsoluteHrefs() {
  document.body.innerHTML = `
    <header class="site-header">
      <nav class="nav-main">
        <a href="/#trabajo">Trabajo</a>
        <a href="/#experiencia">Experiencia</a>
        <a href="/blog">Blog</a>
        <a href="/#contacto">Contacto</a>
      </nav>
    </header>
    <main>
      <section id="trabajo" data-nav="trabajo"></section>
      <section id="experiencia" data-nav="experiencia"></section>
      <section id="contacto" data-nav="contacto"></section>
    </main>
  `
}

function emit(
  observer: FakeIntersectionObserver,
  entries: Array<{ target: Element; isIntersecting: boolean }>,
) {
  observer.callback(
    entries.map(({ target, isIntersecting }) => ({ isIntersecting, target })) as unknown as IntersectionObserverEntry[],
    observer as unknown as IntersectionObserver,
  )
}

function dispatchPageEvent(type: "pagehide" | "pageshow", persisted?: boolean) {
  const event = new Event(type)
  if (persisted !== undefined) Object.defineProperty(event, "persisted", { value: persisted })
  window.dispatchEvent(event)
}

const anchorLink = (fragment: string) => document.querySelector(`a[href="#${fragment}"]`)!

describe("header nav section observer", () => {
  beforeEach(() => {
    teardownHeaderNav()
    intersectionInstances = []
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver)
  })

  afterEach(() => {
    teardownHeaderNav()
    document.body.innerHTML = ""
    vi.unstubAllGlobals()
  })

  it("observes every home section once, in document order, through a single observer in the design band", () => {
    renderHome()
    setupHeaderNav()

    expect(intersectionInstances).toHaveLength(1)
    const [observer] = intersectionInstances
    expect(observer.options?.rootMargin).toBe("-40% 0px -55% 0px")
    expect(observer.observe).toHaveBeenCalledTimes(3)
    expect(observer.observe).toHaveBeenCalledWith(document.getElementById("trabajo"))
    expect(observer.observe).toHaveBeenCalledWith(document.getElementById("experiencia"))
    expect(observer.observe).toHaveBeenCalledWith(document.getElementById("contacto"))
  })

  it("marks the last section sitting in the band with aria-current=location and clears the other anchors", () => {
    renderHome()
    setupHeaderNav()
    const [observer] = intersectionInstances

    emit(observer, [
      { target: document.getElementById("trabajo")!, isIntersecting: true },
      { target: document.getElementById("experiencia")!, isIntersecting: true },
    ])

    expect(anchorLink("experiencia").getAttribute("aria-current")).toBe("location")
    expect(anchorLink("trabajo").hasAttribute("aria-current")).toBe(false)
    expect(anchorLink("contacto").hasAttribute("aria-current")).toBe(false)
    // El enlace de ruta (blog) no es ancla: el observer no lo toca.
    expect(document.querySelector('a[href="/blog"]')!.hasAttribute("aria-current")).toBe(false)
  })

  it("marks the section whose absolute-href fragment matches, ignoring route links and other fragments", () => {
    renderHomeAbsoluteHrefs()
    setupHeaderNav()
    const [observer] = intersectionInstances
    expect(intersectionInstances).toHaveLength(1)

    emit(observer, [{ target: document.getElementById("experiencia")!, isIntersecting: true }])

    const experiencia = document.querySelector('a[href="/#experiencia"]')!
    expect(experiencia.getAttribute("aria-current")).toBe("location")
    expect(document.querySelector('a[href="/#trabajo"]')!.hasAttribute("aria-current")).toBe(false)
    expect(document.querySelector('a[href="/#contacto"]')!.hasAttribute("aria-current")).toBe(false)
    expect(document.querySelector('a[href="/blog"]')!.hasAttribute("aria-current")).toBe(false)
  })

  it("clears the indicator when the active section leaves the band", () => {
    renderHome()
    setupHeaderNav()
    const [observer] = intersectionInstances

    emit(observer, [{ target: document.getElementById("experiencia")!, isIntersecting: true }])
    expect(anchorLink("experiencia").getAttribute("aria-current")).toBe("location")

    emit(observer, [{ target: document.getElementById("experiencia")!, isIntersecting: false }])
    expect(anchorLink("experiencia").hasAttribute("aria-current")).toBe(false)
  })

  it("keeps the server-rendered route indicator and creates no observer when no anchor links exist", () => {
    renderRoutePage()
    setupHeaderNav()

    expect(intersectionInstances).toHaveLength(0)
    expect(document.querySelector('a[href="/blog"]')!.getAttribute("aria-current")).toBe("page")
    // pagehide sin observador ni listeners registrados no debe lanzar.
    dispatchPageEvent("pagehide")
    expect(intersectionInstances).toHaveLength(0)
  })

  it("disconnects the observer on pagehide and re-creates it from scratch on a persisted pageshow", () => {
    renderHome()
    setupHeaderNav()
    const [first] = intersectionInstances

    dispatchPageEvent("pagehide")
    expect(first.disconnect).toHaveBeenCalledTimes(1)

    dispatchPageEvent("pageshow", true)
    expect(intersectionInstances).toHaveLength(2)
    const second = intersectionInstances[1]!
    expect(second).not.toBe(first)
    expect(second.observe).toHaveBeenCalledTimes(3)
    // El primer observer queda desconectado para siempre: una vez por pagehide
    // y otra por el teardown interno del re-setup.
    expect(first.disconnect).toHaveBeenCalledTimes(2)
  })

  it("ignores pageshow without bfcache persistence", () => {
    renderHome()
    setupHeaderNav()

    dispatchPageEvent("pageshow", false)

    expect(intersectionInstances).toHaveLength(1)
  })

  it("teardown disconnects and detaches the page lifecycle listeners", () => {
    renderHome()
    setupHeaderNav()
    const [observer] = intersectionInstances
    const removeSpy = vi.spyOn(window, "removeEventListener")

    teardownHeaderNav()

    expect(observer.disconnect).toHaveBeenCalledTimes(1)
    expect(removeSpy.mock.calls.filter(([type]) => type === "pagehide")).toHaveLength(1)
    expect(removeSpy.mock.calls.filter(([type]) => type === "pageshow")).toHaveLength(1)

    dispatchPageEvent("pagehide")
    expect(observer.disconnect).toHaveBeenCalledTimes(1)

    removeSpy.mockRestore()
  })

  it("re-running setup does not stack pagehide listeners", () => {
    renderHome()
    setupHeaderNav()
    const addSpy = vi.spyOn(window, "addEventListener")
    const removeSpy = vi.spyOn(window, "removeEventListener")

    setupHeaderNav()

    // El segundo setup desmonta los listeners del primero antes de registrar
    // los suyos: una alta y una baja por página oculta.
    expect(addSpy.mock.calls.filter(([type]) => type === "pagehide")).toHaveLength(1)
    expect(removeSpy.mock.calls.filter(([type]) => type === "pagehide")).toHaveLength(1)

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })
})
