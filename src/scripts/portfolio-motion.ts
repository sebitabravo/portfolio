import { createMotionBootstrap } from "./motion/bootstrap"
import { createCardsModule } from "./motion/cards"
import { createMotionController } from "./motion/controller"
import { createCountersModule } from "./motion/counters"
import { createCursorModule } from "./motion/cursor"
import { shouldLoadWebGLEnhancement } from "./motion/environment"
import { createExperienceTimelineModule } from "./motion/experience-timeline"
import { createHeroModule } from "./motion/hero"
import { createNavIndicatorModule } from "./motion/nav-indicator"
import { createTerminalModule } from "./motion/terminal"

export { shouldLoadWebGLEnhancement }

const bootstrap = createMotionBootstrap(() =>
  createMotionController({
    modules: [
      createCardsModule(),
      createHeroModule(),
      createNavIndicatorModule(),
      createExperienceTimelineModule(),
      createTerminalModule(),
      createCountersModule(),
      createCursorModule(),
    ],
  }),
)

/**
 * Progressive motion layer for the home page.
 *
 * The HTML/CSS experience remains complete without this module. WebGL and
 * GSAP are loaded only after hero interaction or 200px viewport proximity.
 * The bootstrap owns the router lifecycle: it releases every listener,
 * ScrollTrigger and WebGL resource before a view swap and builds a fresh
 * controller for the page mounted after navigation.
 */
export function setupPortfolioMotion(): void {
  bootstrap.start()
}

export function teardownPortfolioMotion(): void {
  bootstrap.stop()
}
