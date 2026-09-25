let certCleanup: (() => void) | null = null

export function initCertCarousel(): void {
  // Clear rAF and listeners from a previous navigation
  certCleanup?.()
  certCleanup = null

  const container = document.getElementById('certCarouselContainer')
  const wrapper = document.getElementById('certCarouselWrapper')
  const carousel = document.getElementById('certCarousel')
  const prevBtn = document.getElementById('certNavPrev')
  const nextBtn = document.getElementById('certNavNext')

  if (!container || !wrapper || !carousel || !prevBtn || !nextBtn) return

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  const ac = new AbortController()
  const { signal } = ac

  let animationId: number | null = null
  let lastTime = 0
  let scrollPosition = wrapper.scrollLeft
  let isInViewport = false
  const scrollSpeed = 40 // px per second
  const navScrollAmount = 350
  let scrollEndPending = false

  function isHovered(): boolean {
    return container!.matches(":hover")
  }

  function autoScroll(timestamp: number): void {
    if (!lastTime) lastTime = timestamp
    const delta = (timestamp - lastTime) / 1000
    lastTime = timestamp

    if (!isHovered() && !container!.contains(document.activeElement)) {
      const w = wrapper!
      scrollPosition += scrollSpeed * delta
      w.scrollLeft = scrollPosition
      const halfWidth = w.scrollWidth / 2
      if (w.scrollLeft >= halfWidth) {
        w.scrollLeft = 0
        scrollPosition = w.scrollLeft
      }
    }

    animationId = requestAnimationFrame(autoScroll)
  }

  function startAutoScroll(): void {
    if (signal.aborted || animationId || !isInViewport || isHovered() || container!.contains(document.activeElement) || document.visibilityState === 'hidden' || motionPreference.matches) return
    lastTime = 0
    scrollPosition = wrapper!.scrollLeft
    animationId = requestAnimationFrame(autoScroll)
  }

  function stopAutoScroll(): void {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    scrollPosition = wrapper!.scrollLeft
  }

  function handleMotionChange(): void {
    if (motionPreference.matches) stopAutoScroll()
    else startAutoScroll()
  }
  motionPreference.addEventListener('change', handleMotionChange, { signal })

  prevBtn.addEventListener('click', () => {
    wrapper!.scrollBy({ left: -navScrollAmount, behavior: 'smooth' })
  }, { signal })

  nextBtn.addEventListener('click', () => {
    const w = wrapper!
    const halfWidth = w.scrollWidth / 2
    if (w.scrollLeft + navScrollAmount >= halfWidth && !scrollEndPending) {
      scrollEndPending = true
      w.addEventListener('scrollend', () => {
        w.scrollLeft = w.scrollLeft - halfWidth
        scrollEndPending = false
      }, { once: true, signal })
    }
    w.scrollBy({ left: navScrollAmount, behavior: 'smooth' })
  }, { signal })

  container.addEventListener('mouseenter', stopAutoScroll, { signal })
  container.addEventListener('mouseleave', startAutoScroll, { signal })
  container.addEventListener('focusin', stopAutoScroll, { signal })
  // Let focus settle before checking whether it moved to another descendant.
  container.addEventListener('focusout', () => queueMicrotask(startAutoScroll), { signal })

  function handleVisibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      stopAutoScroll()
    } else if (!isHovered()) {
      startAutoScroll()
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange, { signal })

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    isInViewport = entry?.isIntersecting ?? false
    if (isInViewport) {
      startAutoScroll()
    } else {
      stopAutoScroll()
    }
  })
  intersectionObserver.observe(container)

  // Register cleanup for the next navigation
  certCleanup = () => {
    ac.abort()
    intersectionObserver.disconnect()
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }
}

export function teardownCertCarousel(): void {
  certCleanup?.()
  certCleanup = null
}
