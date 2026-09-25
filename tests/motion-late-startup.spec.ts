import { expect, test } from "@playwright/test"

// When the load event arrives after the inline startup bound, the deferred claim must not leave the hero stuck loading.
test("a late deferred motion claim still settles to fallback when the observer never activates", async ({ page }) => {
  await page.route("**/perfil.*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 3500))
    await route.continue()
  })
  await page.addInitScript(() => {
    const getBoundingClientRect = Element.prototype.getBoundingClientRect
    Element.prototype.getBoundingClientRect = function () {
      if (this.matches("[data-portfolio-motion]")) return new DOMRect(0, window.innerHeight + 400, 100, 100)
      return getBoundingClientRect.call(this)
    }
    const NativeObserver = window.IntersectionObserver
    window.IntersectionObserver = class extends NativeObserver {
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        super((entries, observer) => {
          const others = entries.filter((entry) => !entry.target.matches("[data-portfolio-motion]"))
          if (others.length) callback(others, observer)
        }, options)
      }

      observe(target: Element) {
        if (target.matches("[data-portfolio-motion]")) {
          ;(window as typeof window & { heroMotionClaimedAt?: number }).heroMotionClaimedAt = performance.now()
        }
        super.observe(target)
      }
    }
  })

  await page.goto("/", { waitUntil: "load" })
  await expect
    .poll(() => page.evaluate(() => (window as typeof window & { heroMotionClaimedAt?: number }).heroMotionClaimedAt ?? 0))
    .toBeGreaterThan(3000)
  await expect(page.locator("[data-portfolio-motion]")).toHaveAttribute("data-motion-status", "fallback", {
    timeout: 5000,
  })
})
