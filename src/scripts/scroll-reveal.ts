let revealObserver: IntersectionObserver | null = null

export function initScrollReveal(): void {
  revealObserver?.disconnect()

  const targets = Array.from(document.querySelectorAll("[data-animate]"))
  if (!("IntersectionObserver" in window)) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return

        const element = entry.target
        element.classList.add("reveal-pending")
        requestAnimationFrame(() => element.classList.add("animate-in"))
        observer.unobserve(element)
      })
    },
    { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
  )

  targets.forEach((element) => {
    element.classList.remove("animate-in", "reveal-pending")

    // Keep the first viewport polished, but do not hide the entire
    // document: full-page captures and JS-off users must still see it.
    const rect = element.getBoundingClientRect()
    if (rect.top <= window.innerHeight * 1.1) {
      element.classList.add("reveal-pending")
    }

    observer.observe(element)
  })

  revealObserver = observer
}
