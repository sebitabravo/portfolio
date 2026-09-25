let progressFrame: number | null = null
let progressScrollHandler: (() => void) | null = null

export function initReadingProgress(): void {
  const progress = document.querySelector("[data-reading-progress]")
  if (!(progress instanceof HTMLElement)) return

  const bar = progress
  if (progressScrollHandler) {
    window.removeEventListener("scroll", progressScrollHandler)
  }
  if (progressFrame !== null) {
    cancelAnimationFrame(progressFrame)
    progressFrame = null
  }

  const update = () => {
    if (progressFrame !== null) return
    progressFrame = requestAnimationFrame(() => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const ratio = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0
      bar.style.transform = `scaleX(${ratio})`
      progressFrame = null
    })
  }

  progressScrollHandler = update
  window.addEventListener("scroll", update, { passive: true })
  update()
}
