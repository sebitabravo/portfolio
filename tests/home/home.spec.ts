import { readFile } from "node:fs/promises"
import { expect, test } from "@playwright/test"
import { HomePage } from "./home-page"

test.describe("Home Page", () => {
  for (const { locale, route, navigation, brand, profiles, links, toggle, option, nextRoute, nextToggle } of [
    { locale: "Spanish", route: "/", navigation: "Navegación principal", brand: "Inicio — Sebastian Bravo", profiles: "Perfiles profesionales", links: "Enlaces del pie", toggle: "Cambiar idioma (actual: ES)", option: "English", nextRoute: "/en/", nextToggle: "Toggle language (current: EN)" },
    { locale: "English", route: "/en/", navigation: "Main navigation", brand: "Home — Sebastian Bravo", profiles: "Professional profiles", links: "Footer links", toggle: "Toggle language (current: EN)", option: "Español", nextRoute: "/", nextToggle: "Cambiar idioma (actual: ES)" },
  ]) {
    test(`${locale} home renders site-shell accessible names from localized copy`, async ({ page }) => {
      await page.goto(route)
      const navigationLandmark = page.getByRole("navigation", { name: navigation, exact: true })
      await expect(navigationLandmark).toBeVisible()
      await expect(navigationLandmark.getByRole("link", { name: brand, exact: true })).toBeVisible()
      await expect(page.getByRole("navigation", { name: profiles, exact: true })).toBeVisible()
      await expect(page.getByRole("navigation", { name: links, exact: true })).toBeVisible()
      const languageToggle = page.locator("#language-toggle")
      await expect(languageToggle).toHaveAttribute("aria-label", toggle)
      await languageToggle.click()
      await page.getByRole("menuitemradio", { name: option, exact: true }).click()
      await page.waitForURL(nextRoute)
      await expect(languageToggle).toHaveAttribute("aria-label", nextToggle)
    })
  }

  for (const { locale, route, cardLabel, projectEvidence, technologies, workEvidence, mailSubject, responseTime, linkedin, github, cvHelper } of [
    {
      locale: "Spanish", route: "/", cardLabel: "PROYECTO", projectEvidence: "Evidencia del proyecto",
      technologies: "Tecnologías", workEvidence: "Evidencia del trabajo", mailSubject: "Contacto desde tu portfolio",
      responseTime: "Te respondo en menos de 24h", linkedin: "Conectemos profesionalmente",
      github: "Mirá mi código abierto", cvHelper: "CV disponible para revisar mi experiencia completa.",
    },
    {
      locale: "English", route: "/en/", cardLabel: "PROJECT", projectEvidence: "Project evidence",
      technologies: "Technologies", workEvidence: "Work evidence", mailSubject: "Contact from your portfolio",
      responseTime: "I'll reply within 24h", linkedin: "Let's connect professionally",
      github: "Check my open source code", cvHelper: "Download the CV for the full experience overview.",
    },
  ]) {
    test(`${locale} home renders localized project, work, and contact UI labels`, async ({ page }) => {
      await page.goto(route)
      const regularProject = page.locator(".project-card:not(.project-card-featured)").first()
      await expect(regularProject.locator(".project-media-kicker")).toHaveText(cardLabel)
      const metrics = page.locator(".project-metrics")
      expect(await metrics.count()).toBeGreaterThan(0)
      await expect(metrics.first()).toHaveAttribute("aria-label", projectEvidence)
      await expect(regularProject.locator(".project-tags")).toHaveAttribute("aria-label", technologies)
      const highlights = page.locator(".experience-highlights")
      expect(await highlights.count()).toBeGreaterThan(0)
      await expect(highlights.first()).toHaveAttribute("aria-label", workEvidence)

      const contact = page.locator(".contact-resume-row").locator("..")
      const mail = contact.locator("a[href^='mailto:']")
      await expect(mail).toContainText(responseTime)
      await expect(contact.locator("a[href*='linkedin.com']")).toContainText(linkedin)
      await expect(contact.locator("a[href*='github.com']")).toContainText(github)
      await expect(contact.locator(".contact-resume-row p")).toHaveText(cvHelper)
      const mailHref = await mail.getAttribute("href")
      expect(mailHref).not.toBeNull()
      expect(new URL(mailHref!).searchParams.get("subject")).toBe(mailSubject)
    })
  }

  test("both locale routes delegate composition to LocalizedHomePage", async () => {
    for (const [path, locale] of [["index.astro", "es"], ["en/index.astro", "en"]] as const) {
      const route = await readFile(new URL(`../../src/pages/${path}`, import.meta.url), "utf8")
      expect(route).toMatch(/import LocalizedHomePage from ["']@\/components\/LocalizedHomePage\.astro["']/)
      expect(route).toMatch(new RegExp(`<LocalizedHomePage\\s+locale=["']${locale}["']\\s*/>`))
    }
  })

  for (const [locale, route] of [["Spanish", "/"], ["English", "/en/"]] as const) {
    test(`${locale} home fragment links have exactly one destination`, async ({ page }) => {
      await page.goto(route)

      const groups = [
        ".site-nav .nav-link[href*='#']",
        ".site-nav .header-cta[href*='#']",
        "[data-dropdown-menu] a[href*='#']",
        "main a[href*='#']",
        "footer nav a[href*='#']",
      ]
      for (const group of groups) {
        const links = page.locator(group)
        expect(await links.count(), `${group} should include an in-page link`).toBeGreaterThan(0)
        for (const link of await links.all()) {
          const href = await link.getAttribute("href")
          const target = new URL(href!, page.url())
          expect(target.pathname.replace(/\/$/, "") || "/", href!).toBe(route.replace(/\/$/, "") || "/")
          expect(target.hash, href!).not.toBe("")
          const destinationCount = await page.locator("[id]").evaluateAll(
            (elements, id) => elements.filter((element) => element.id === id).length,
            decodeURIComponent(target.hash.slice(1)),
          )
          expect(destinationCount, `${href} must resolve once`).toBe(1)
        }
      }
    })

    test(`${locale} active nav survives non-navigable and inner-page sections`, async ({ page }) => {
      await page.addInitScript(() => {
        const NativeObserver = window.IntersectionObserver
        window.IntersectionObserver = class extends NativeObserver {
          constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
            super(callback, options)
            if (options?.rootMargin === "-15% 0px -55% 0px") {
              const observer = this
              Object.assign(window, {
                emitHeaderSection(id: string) {
                  const target = document.getElementById(id)
                  if (!target) throw new Error(`Missing section ${id}`)
                  const bounds = target.getBoundingClientRect()
                  callback([{
                    target, isIntersecting: true, intersectionRatio: 1,
                    boundingClientRect: bounds, intersectionRect: bounds, rootBounds: null, time: performance.now(),
                  }], observer)
                },
              })
            }
          }
        }
      })
      await page.goto(route)
      const nav = page.locator(".site-nav")
      const projects = nav.locator(".nav-link[href$='#" + (route === "/" ? "proyectos" : "projects") + "']")
      const nonNavigableId = route === "/" ? "certificaciones" : "certifications"
      await expect.poll(() => page.evaluate(() => typeof (window as typeof window & { emitHeaderSection?: (id: string) => void }).emitHeaderSection)).toBe("function")
      await page.evaluate((id) => (window as typeof window & { emitHeaderSection: (id: string) => void }).emitHeaderSection(id), route === "/" ? "proyectos" : "projects")
      await expect(projects).toHaveAttribute("aria-current", "page")
      await page.evaluate((id) => (window as typeof window & { emitHeaderSection: (id: string) => void }).emitHeaderSection(id), nonNavigableId)
      await expect(projects).toHaveAttribute("aria-current", "page")

      await page.goto(route === "/" ? "/blog" : "/en/blog")
      const blog = nav.locator(".nav-link[data-section='blog']")
      await expect(blog).toHaveAttribute("aria-current", "page")
      await page.evaluate((id) => {
        const section = document.createElement("section")
        section.id = id
        document.body.append(section)
        document.dispatchEvent(new Event("astro:page-load"))
        ;(window as typeof window & { emitHeaderSection: (id: string) => void }).emitHeaderSection(id)
      }, route === "/" ? "proyectos" : "projects")
      await expect(blog).toHaveAttribute("aria-current", "page")
    })
  }

  test(
    "core sections and project filters work",
    { tag: ["@critical", "@e2e", "@home", "@HOME-E2E-001"] },
    async ({ page }) => {
      const homePage = new HomePage(page)

      await homePage.gotoSpanishHome()
      await homePage.verifyCoreSections()
      await homePage.verifyProjectFiltering()
    },
  )

  test("radio menus open with ArrowDown and Tab exits the theme menu to the language toggle", async ({ page }) => {
    await page.goto("/")

    const themeToggle = page.locator("#theme-toggle")
    const themeMenu = page.getByRole("menu").filter({ has: page.getByRole("menuitemradio", { name: "Claro", exact: true }) })
    const themeOptions = themeMenu.getByRole("menuitemradio")
    const languageToggle = page.locator("#language-toggle")
    const languageMenu = page.getByRole("menu").filter({ has: page.getByRole("menuitemradio", { name: "Español", exact: true }) })

    await themeToggle.focus()
    await page.keyboard.press("ArrowDown")
    await expect(themeMenu).toBeVisible()
    await expect(themeOptions.first()).toBeFocused()
    await page.keyboard.press("Tab")
    await expect(languageToggle).toBeFocused()
    await expect(themeMenu).toBeHidden()
    await expect(themeToggle).toHaveAttribute("aria-expanded", "false")

    await page.keyboard.press("ArrowDown")
    await expect(languageMenu).toBeVisible()
    await expect(languageMenu.getByRole("menuitemradio", { name: "Español", exact: true })).toBeFocused()
    await page.keyboard.press("Shift+Tab")
    await expect(languageToggle).toBeFocused()
    await expect(languageMenu).toBeHidden()
    await expect(languageToggle).toHaveAttribute("aria-expanded", "false")
  })

  test("selecting the current radio options closes each menu and restores trigger focus without navigation", async ({ page }) => {
    await page.goto("/")
    const startingUrl = page.url()
    await page.evaluate(() => { document.documentElement.dataset.sameOptionPage = "original" })

    const themeToggle = page.locator("#theme-toggle")
    const themeMenu = page.locator("#theme-menu")
    await themeToggle.focus()
    await page.keyboard.press("ArrowDown")
    await themeMenu.getByRole("menuitemradio", { name: "Sistema", exact: true }).click()
    await expect(themeMenu).toBeHidden()
    await expect(themeToggle).toBeFocused()
    await expect(page).toHaveURL(startingUrl)

    const languageToggle = page.locator("#language-toggle")
    const languageMenu = page.locator("#language-menu")
    await languageToggle.focus()
    await page.keyboard.press("ArrowDown")
    await languageMenu.getByRole("menuitemradio", { name: "Español", exact: true }).click()
    await expect(languageMenu).toBeHidden()
    await expect(languageToggle).toBeFocused()
    await expect(page).toHaveURL(startingUrl)
    await expect(page.locator("html")).toHaveAttribute("data-same-option-page", "original")
  })

  test("Astro swaps reinitialize the cloned language radio menu without duplicate handlers", async ({ page }) => {
    await page.goto("/")
    await page.evaluate(() => {
      const wrapper = document.querySelector("#language-toggle-wrapper")!
      wrapper.replaceWith(wrapper.cloneNode(true))
      document.dispatchEvent(new Event("astro:after-swap"))
      document.dispatchEvent(new Event("astro:after-swap"))
    })

    const languageToggle = page.locator("#language-toggle")
    const languageMenu = page.locator("#language-menu")
    await languageToggle.click()
    await expect(languageMenu.getByRole("menuitemradio", { name: "Español", exact: true })).toBeVisible()
    await expect(languageToggle).toHaveAttribute("aria-expanded", "true")
    await languageToggle.click()
    await expect(languageMenu).toBeHidden()
    await expect(languageToggle).toHaveAttribute("aria-expanded", "false")
  })

  test("mobile navigation outside click preserves focus while Escape restores trigger focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")

    const mobileTrigger = page.locator("[data-dropdown-trigger='mobile-nav-es']")
    await mobileTrigger.click()
    await expect(mobileTrigger).toHaveAttribute("aria-expanded", "true")

    await page.evaluate(() => {
      const outsideInput = document.createElement("input")
      outsideInput.type = "text"
      outsideInput.id = "outside-mobile-nav-input"
      outsideInput.setAttribute("aria-label", "Outside mobile navigation")
      outsideInput.placeholder = "Outside mobile navigation"
      outsideInput.style.cssText = "position: fixed; top: 50%; left: 50%; z-index: 2147483647; padding: 12px; border: 1px solid black; background: white; color: black"
      document.body.append(outsideInput)
    })
    const outsideInput = page.locator("#outside-mobile-nav-input")
    await expect(outsideInput).toBeVisible()
    await outsideInput.click()
    await expect(mobileTrigger).toHaveAttribute("aria-expanded", "false")
    await expect(outsideInput).toBeFocused()

    await mobileTrigger.click()
    await expect(mobileTrigger).toHaveAttribute("aria-expanded", "true")
    await page.keyboard.press("Escape")
    await expect(mobileTrigger).toHaveAttribute("aria-expanded", "false")
    await expect(mobileTrigger).toBeFocused()
  })

  test(
    "mobile navigation, theme, language and reading progress work",
    { tag: ["@critical", "@e2e", "@home", "@HOME-E2E-002"] },
    async ({ page }) => {
      test.setTimeout(60_000)
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto("/")

      const mobileMenu = page.locator("[data-dropdown-menu='mobile-nav-es']")
      const mobileTrigger = page.locator("[data-dropdown-trigger='mobile-nav-es']")
      await mobileTrigger.click()
      await expect(mobileMenu.getByRole("link", { name: "Contacto", exact: true })).toBeVisible()
      await expect(mobileTrigger).toHaveAttribute("aria-expanded", "true")
      await page.keyboard.press("Escape")
      await expect(mobileTrigger).toHaveAttribute("aria-expanded", "false")

      await page.locator("#theme-toggle").click()
      await expect(page.locator("#theme-menu")).toBeVisible()
      await page.getByRole("menuitemradio", { name: "Oscuro", exact: true }).click()
      await expect(page.locator("html")).toHaveClass(/dark/)

      await page.locator("#proyectos").scrollIntoViewIfNeeded()
      await expect
        .poll(
          () => page.locator("[data-reading-progress]").evaluate((element) => {
            const match = element.getAttribute("style")?.match(/scaleX\(([^)]+)\)/)
            return Number(match?.[1] ?? 0)
          }),
          { timeout: 5000 },
        )
        .toBeGreaterThan(0)

      await expect(page.locator("#contacto").getByText("Descargar CV", { exact: true })).toBeVisible()

      await page.locator("#language-toggle").click()
      await page.getByRole("menuitemradio", { name: "English", exact: true }).click()
      await page.waitForURL("**/en/")
      await expect(page).toHaveURL(/\/en\/?$/)
        },
      )

      test(
        "switching from English restores Spanish navigation anchors",
        { tag: ["@e2e", "@home", "@HOME-E2E-008"] },
        async ({ page }) => {
          await page.goto("/en/")

          await page.locator("#language-toggle").click()
          await page.getByRole("menuitemradio", { name: "Español", exact: true }).click()
          await page.waitForURL("**/")
          await expect(page).toHaveURL(/\/$/)

          const navigation = page.getByRole("navigation", { name: "Navegación principal" })
          await expect(navigation.locator("[data-section='blog']")).toHaveAttribute("href", "/blog")
          await expect(navigation.locator("[data-section='proyectos']")).toHaveAttribute("href", "/#proyectos")
          await expect(navigation.locator("[data-section='experiencia']")).toHaveAttribute("href", "/#experiencia")
          await expect(navigation.locator("[data-section='educacion']")).toHaveAttribute("href", "/#educacion")
        },
      )

      test(
        "light theme keeps hero and navigation coherent",
    { tag: ["@critical", "@e2e", "@a11y", "@HOME-E2E-006"] },
    async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("theme", "light"))
      await page.goto("/")

      const colors = await page.evaluate(() => {
        const hero = document.querySelector(".hero-gradient")
        const nav = document.querySelector(".site-nav")
        const status = document.querySelector(".hero-meta-status")

        if (!hero || !nav || !status) return null

        return {
          htmlClass: document.documentElement.className,
          heroColor: getComputedStyle(hero).color,
          heroBackground: getComputedStyle(hero).backgroundImage,
          navColor: getComputedStyle(nav).color,
          navBackground: getComputedStyle(nav).backgroundColor,
          statusColor: getComputedStyle(status).color,
        }
      })

      expect(colors).not.toBeNull()
      expect(colors?.htmlClass).not.toMatch(/\bdark\b/)
      expect(colors?.heroColor).toBe("rgb(23, 19, 41)")
      expect(colors?.heroBackground).not.toContain("rgb(16, 20, 58)")
      expect(colors?.navColor).toBe("rgb(41, 40, 39)")
      expect(colors?.navBackground).toContain("255")
      expect(colors?.statusColor).toBe("rgb(76, 82, 123)")
    },
  )

  test(
    "reduced motion keeps content visible and stops loops",
    { tag: ["@critical", "@e2e", "@a11y", "@HOME-E2E-003"] },
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" })
      await page.goto("/")
      await page.waitForTimeout(900)

      const state = await page.evaluate(() => {
        const animatedSelectors = [".hero-orbit", ".hero-orbit-dot", ".hero-ambient", ".signal-marquee"]
        const hiddenElements = Array.from(document.querySelectorAll("[data-animate], .hero-reveal"))
          .filter((element) => Number.parseFloat(getComputedStyle(element).opacity) < 0.99)
        const activeLoops = animatedSelectors.flatMap((selector) =>
          Array.from(document.querySelectorAll(selector)).filter((element) => getComputedStyle(element).animationName !== "none"),
        )

        return { hiddenCount: hiddenElements.length, activeLoopCount: activeLoops.length }
      })

      expect(state.hiddenCount).toBe(0)
      expect(state.activeLoopCount).toBe(0)
      await expect(page.locator("[data-hero-webgl]")).toHaveAttribute("data-webgl-status", "reduced")
    },
  )

  test(
    "progressive motion layer falls back safely and follows project scroll",
    { tag: ["@e2e", "@home", "@HOME-E2E-004"] },
    async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto("/")

      await expect(page.locator("[data-portfolio-motion]")).toHaveAttribute(
        "data-motion-status",
        /^(active|fallback)$/,
        { timeout: 10000 },
      )
      const motionStatus = await page.locator("[data-portfolio-motion]").getAttribute("data-motion-status")
      await expect(page.locator("[data-hero-webgl]")).toHaveAttribute(
        "data-webgl-status",
        /^(ready|fallback)$/,
        { timeout: 10000 },
      )

      // ScrollTrigger is an optional enhancement. A bounded fallback is a
      // valid terminal state, so its decorative meter is not expected to move.
      if (motionStatus !== "active") return

      await page.locator("#proyectos").scrollIntoViewIfNeeded()
      await expect
        .poll(
          () => page.locator("[data-project-scroll-meter] span").evaluate((element) => {
            const match = element.getAttribute("style")?.match(/scaleX\(([^)]+)\)/)
            return Number(match?.[1] ?? 0)
          }),
          { timeout: 5000 },
        )
        .toBeGreaterThan(0)
    },
  )

  test("deferred motion startup settles to fallback when observer never activates", async ({ page }) => {
    await page.addInitScript(() => {
      const getBoundingClientRect = Element.prototype.getBoundingClientRect
      Element.prototype.getBoundingClientRect = function () {
        if (this.matches("[data-portfolio-motion]")) {
          return new DOMRect(0, window.innerHeight + 400, 100, 100)
        }
        return getBoundingClientRect.call(this)
      }

      const NativeObserver = window.IntersectionObserver
      window.IntersectionObserver = class extends NativeObserver {
        constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
          super((entries, observer) => {
            if (options?.rootMargin !== "200px") return callback(entries, observer)
            const otherEntries = entries.filter((entry) => !entry.target.matches("[data-portfolio-motion]"))
            if (otherEntries.length) callback(otherEntries, observer)
          }, options)
        }

        observe(target: Element) {
          if (target.matches("[data-portfolio-motion]")) {
            ;(window as typeof window & { heroMotionObserved?: boolean }).heroMotionObserved = true
          }
          super.observe(target)
        }
      }
    })
    await page.goto("/")
    await expect.poll(() => page.evaluate(() => (window as typeof window & { heroMotionObserved?: boolean }).heroMotionObserved)).toBe(true)
    await expect(page.locator("[data-portfolio-motion]")).toHaveAttribute("data-motion-status", "fallback", { timeout: 5000 })
  })

  test(
    "availability stays a single hero status instead of covering the visual",
    { tag: ["@e2e", "@home", "@HOME-E2E-005"] },
    async ({ page }) => {
      await page.goto("/")

      await expect(page.locator(".hero-meta-status")).toHaveCount(1)
      await expect(page.locator(".hero-art-status")).toHaveCount(0)
      await expect(page.locator(".hero-art-tag")).toHaveCount(0)
      await expect(page.locator(".hero-art-caption")).toHaveCount(0)
    },
  )

  test(
    "section bands keep one stack signal and add About conversion",
    { tag: ["@e2e", "@home", "@HOME-E2E-007"] },
    async ({ page }) => {
      await page.goto("/")

      await expect(page.locator("[data-section-band='tinted']")).toHaveCount(2)
      await expect(page.locator(".signal-strip")).toHaveCount(1)
      await expect(page.locator(".about-focus a")).toHaveAttribute("href", "#contacto")
      await expect(page.locator("#sobre-mi")).not.toContainText("Stack Tecnológico")
      await expect(page.locator("#sobre-mi .tech-item")).toHaveCount(0)
    },
  )
})
