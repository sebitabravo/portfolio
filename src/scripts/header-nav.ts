let headerController: AbortController | null = null
let headerObserver: IntersectionObserver | null = null

export function setupHeaderNav(): void {
  headerController?.abort()
  headerObserver?.disconnect()

  const controller = new AbortController()
  headerController = controller
  const { signal } = controller
  const navLinks = Array.from(document.querySelectorAll(".site-nav .nav-link"))
  const navigableIds = new Set(navLinks.map((link) => link.getAttribute("data-section")))
  const sections = document.querySelector('.site-header[data-home="true"]')
    ? Array.from(document.querySelectorAll("section[id]")).filter((section) => navigableIds.has(section.id))
    : []
  const siteNav = document.querySelector(".site-nav")

  if (!siteNav) return

  const setActive = (sectionId: string) => {
    if (document.querySelector(".site-header")?.getAttribute("data-home") !== "true" || !navigableIds.has(sectionId))
      return
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("data-section") === sectionId
      link.classList.toggle("nav-active", isActive)
      if (isActive) {
        link.setAttribute("aria-current", "page")
      } else {
        link.removeAttribute("aria-current")
      }
    })
  }

  const currentPath = window.location.pathname.replace(/\/$/, "") || "/"
  navLinks.forEach((link) => {
    const href = link.getAttribute("href") ?? ""
    const linkPath = href.split("#")[0].replace(/\/$/, "") || "/"
    if (!href.includes("#") && linkPath === currentPath) {
      link.classList.add("nav-active")
      link.setAttribute("aria-current", "page")
    }
  })

  headerObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActive(visible.target.id)
    },
    { threshold: [0.15, 0.35, 0.6], rootMargin: "-15% 0px -55% 0px" },
  )
  sections.forEach((section) => headerObserver?.observe(section))

  const onScroll = () => siteNav.classList.toggle("scrolled", window.scrollY > 36)
  onScroll()
  window.addEventListener("scroll", onScroll, { passive: true, signal })

  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      headerObserver?.disconnect()
    } else {
      sections.forEach((section) => headerObserver?.observe(section))
    }
  }
  document.addEventListener("visibilitychange", onVisibilityChange, { signal })
}

export function teardownHeaderNav(): void {
  headerController?.abort()
  headerObserver?.disconnect()
}
