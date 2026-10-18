import {
  HEADER_NAV_CHANGE_EVENT,
  type HeaderNavChangeDetail,
  type MotionContext,
  type MotionFlip,
  type MotionGsap,
  type MotionModule,
} from "./types"

const INDICATOR_SELECTOR = "[data-nav-indicator]"
const LIST_SELECTOR = "[data-nav-list]"
const LINK_SELECTOR = ".nav-link"
const ACTIVE_CLASS = "nav-active"
const VISIBLE_CLASS = "nav-indicator-visible"

interface NavIndicatorState {
  readonly container: HTMLElement
  readonly indicator: HTMLElement
  readonly links: readonly HTMLAnchorElement[]
  activeLink: HTMLAnchorElement | null
  gsap: MotionGsap | null
  Flip: MotionFlip | null
  sync(animate: boolean): void
  destroy(): void
}

let activeState: NavIndicatorState | null = null

export function setupNavIndicator(scope: Document = document): void {
  teardownNavIndicator()

  const indicator = scope.querySelector<HTMLElement>(INDICATOR_SELECTOR)
  const container = indicator?.closest<HTMLElement>(LIST_SELECTOR) ?? indicator?.parentElement
  if (!indicator || !container) return

  const links = Array.from(container.querySelectorAll<HTMLAnchorElement>(LINK_SELECTOR))
  if (links.length === 0) return

  const controller = new AbortController()
  const { signal } = controller
  let state: NavIndicatorState

  const clearGeometry = () => {
    for (const property of ["width", "height", "transform", "left", "top", "right", "bottom"]) {
      indicator.style.removeProperty(property)
    }
  }

  const fitInstantly = (link: HTMLAnchorElement) => {
    const containerRect = container.getBoundingClientRect()
    const linkRect = link.getBoundingClientRect()
    indicator.style.width = `${linkRect.width}px`
    indicator.style.height = `${linkRect.height}px`
    indicator.style.transform = `translate3d(${linkRect.left - containerRect.left}px, ${
      linkRect.top - containerRect.top
    }px, 0)`
  }

  const fit = (link: HTMLAnchorElement | null, animate: boolean) => {
    state.activeLink = link
    if (!link || link.getClientRects().length === 0) {
      indicator.classList.remove(VISIBLE_CLASS)
      return
    }

    indicator.classList.add(VISIBLE_CLASS)
    if (animate && state.gsap && state.Flip) {
      state.gsap.killTweensOf(indicator)
      state.Flip.fit(indicator, link, { duration: 0.35, ease: "power3.out", absolute: true })
      return
    }

    fitInstantly(link)
  }

  const sync = (animate: boolean) => {
    const link = links.find((candidate) => candidate.classList.contains(ACTIVE_CLASS)) ?? null
    fit(link, animate)
  }

  state = {
    container,
    indicator,
    links,
    activeLink: null,
    gsap: null,
    Flip: null,
    sync,
    destroy() {
      controller.abort()
      observer?.disconnect()
      clearGeometry()
      indicator.classList.remove(VISIBLE_CLASS)
    },
  }

  const onNavChange = (event: Event) => {
    const detail = (event as CustomEvent<HeaderNavChangeDetail>).detail
    const link = detail?.link && links.includes(detail.link) ? detail.link : null
    fit(link, Boolean(state.gsap && state.Flip))
  }

  scope.addEventListener(HEADER_NAV_CHANGE_EVENT, onNavChange, { signal })
  const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => sync(false))
  observer?.observe(container)
  if (!observer) window.addEventListener("resize", () => sync(false), { signal })
  void document.fonts?.ready.then(() => {
    if (!signal.aborted) sync(false)
  })

  activeState = state
  sync(false)
}

export function teardownNavIndicator(): void {
  activeState?.destroy()
  activeState = null
}

export function createNavIndicatorModule(): MotionModule {
  let state: NavIndicatorState | null = null

  const release = () => {
    if (!state) return
    state.gsap?.killTweensOf(state.indicator)
    state.gsap = null
    state.Flip = null
    state.sync(false)
    state = null
  }

  return {
    id: "nav-indicator",
    init(context: MotionContext) {
      const indicator = context.scope.querySelector<HTMLElement>(INDICATOR_SELECTOR)
      if (!indicator || activeState?.indicator !== indicator) return

      state = activeState
      state.gsap = context.libraries.gsap
      state.Flip = context.libraries.Flip
      state.sync(false)
    },
    refresh() {
      state?.sync(false)
    },
    destroy: release,
    cleanup: release,
  }
}
