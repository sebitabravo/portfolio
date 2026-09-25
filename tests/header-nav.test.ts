// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { setupHeaderNav, teardownHeaderNav } from "../src/scripts/header-nav"

class FakeIntersectionObserver {
  callback: IntersectionObserverCallback
  options: IntersectionObserverInit | undefined
  observe = vi.fn()
  disconnect = vi.fn()

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.options = options
    intersectionInstances.push(this)
  }
}

let intersectionInstances: FakeIntersectionObserver[]

function renderHeader(home: boolean) {
  document.body.innerHTML = `
    <header class="site-header" data-home="${home ? "true" : "false"}">
      <nav class="site-nav">
        <a class="nav-link" data-section="home" href="/">Home</a>
        <a class="nav-link" data-section="projects" href="/#projects">Projects</a>
      </nav>
    </header>
    <section id="home"></section>
    <section id="projects"></section>
  `
}

function setPath(path: string) {
  window.history.pushState({}, "", path)
}

describe("header nav lifecycle", () => {
  beforeEach(() => {
    teardownHeaderNav()
    intersectionInstances = []
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver)
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" })
    setPath("/")
  })

  afterEach(() => {
    teardownHeaderNav()
    document.body.innerHTML = ""
    vi.unstubAllGlobals()
  })

  it("activates the link whose section has the highest intersection ratio, only on the home page", () => {
    renderHeader(true)
    setupHeaderNav()
    const [observer] = intersectionInstances

    observer.callback(
      [
        {
          isIntersecting: true,
          intersectionRatio: 0.2,
          target: document.getElementById("home"),
        } as unknown as IntersectionObserverEntry,
        {
          isIntersecting: true,
          intersectionRatio: 0.8,
          target: document.getElementById("projects"),
        } as unknown as IntersectionObserverEntry,
      ],
      observer as unknown as IntersectionObserver,
    )

    const projectsLink = document.querySelector('[data-section="projects"]')!
    const homeLink = document.querySelector('[data-section="home"]')!
    expect(projectsLink.classList.contains("nav-active")).toBe(true)
    expect(projectsLink.getAttribute("aria-current")).toBe("page")
    expect(homeLink.classList.contains("nav-active")).toBe(false)
    expect(homeLink.hasAttribute("aria-current")).toBe(false)
  })

  it("never observes sections when the header is not on the home page", () => {
    renderHeader(false)
    setupHeaderNav()

    expect(intersectionInstances[0].observe).not.toHaveBeenCalled()
  })

  it("activates the link matching the current path off the home page", () => {
    renderHeader(false)
    setPath("/blog")
    document.querySelector('[data-section="projects"]')!.setAttribute("href", "/blog")

    setupHeaderNav()

    const projectsLink = document.querySelector('[data-section="projects"]')!
    expect(projectsLink.classList.contains("nav-active")).toBe(true)
    expect(projectsLink.getAttribute("aria-current")).toBe("page")
  })

  it("toggles the scrolled class once the page passes the 36px threshold", () => {
    renderHeader(true)
    setupHeaderNav()
    const nav = document.querySelector(".site-nav")!

    Object.defineProperty(window, "scrollY", { configurable: true, value: 40 })
    window.dispatchEvent(new Event("scroll"))
    expect(nav.classList.contains("scrolled")).toBe(true)

    Object.defineProperty(window, "scrollY", { configurable: true, value: 10 })
    window.dispatchEvent(new Event("scroll"))
    expect(nav.classList.contains("scrolled")).toBe(false)
  })

  it("teardown aborts the scroll listener and disconnects the observer", () => {
    renderHeader(true)
    setupHeaderNav()
    const nav = document.querySelector(".site-nav")!
    const [observer] = intersectionInstances

    teardownHeaderNav()
    expect(observer.disconnect).toHaveBeenCalledTimes(1)

    Object.defineProperty(window, "scrollY", { configurable: true, value: 100 })
    window.dispatchEvent(new Event("scroll"))
    expect(nav.classList.contains("scrolled")).toBe(false)
  })

  it("re-running setup does not stack scroll listeners", () => {
    renderHeader(true)
    setupHeaderNav()
    setupHeaderNav()
    const nav = document.querySelector(".site-nav")!
    const toggleSpy = vi.spyOn(nav.classList, "toggle")

    Object.defineProperty(window, "scrollY", { configurable: true, value: 40 })
    window.dispatchEvent(new Event("scroll"))

    expect(toggleSpy).toHaveBeenCalledTimes(1)
  })

  it("disconnects the observer when hidden and re-observes sections once visible again", () => {
    renderHeader(true)
    setupHeaderNav()
    const [observer] = intersectionInstances
    observer.observe.mockClear()

    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" })
    document.dispatchEvent(new Event("visibilitychange"))
    expect(observer.disconnect).toHaveBeenCalledTimes(1)

    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" })
    document.dispatchEvent(new Event("visibilitychange"))
    expect(observer.observe).toHaveBeenCalledTimes(2)
  })
})
