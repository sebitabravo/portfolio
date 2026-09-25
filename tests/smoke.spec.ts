import { test, expect } from "@playwright/test"

test.describe("Hero — mensaje y conversión", () => {
  test("concentra identidad, tesis y una sola CTA", async ({ page }) => {
    await page.goto("/")
    const hero = page.locator(".hero-gradient")

    await expect(hero.locator(".hero-title-role")).toContainText("Full-Stack Developer")
    await expect(hero.locator(".hero-role")).toContainText("Web en producción")
    await expect(hero.locator(".hero-role")).toContainText("ML aplicado")
    const roleStyles = await hero.locator(".hero-role").evaluate((element) => {
      const styles = getComputedStyle(element)
      return { textTransform: styles.textTransform, fontFamily: styles.fontFamily }
    })
    expect(roleStyles.textTransform).toBe("none")
    expect(roleStyles.fontFamily).not.toContain("JetBrains")
    await expect(hero.locator(".hero-lede")).toContainText("plataformas web en producción")
    await expect(hero.locator(".hero-proof")).toHaveCount(0)
    await expect(hero).not.toContainText("94.1%")
    await expect(hero.locator(".hero-meta")).toContainText("Full-Stack Junior")
    await expect(hero.locator(".hero-actions > a")).toHaveCount(1)
    await expect(hero.getByRole("link", { name: "Contactar", exact: true })).toBeVisible()
    await expect(hero.locator(".hero-wins")).toHaveCount(0)
    await expect(hero.locator(".hero-art-tag, .hero-art-caption")).toHaveCount(0)
    await expect(hero).not.toContainText("46°S")
    await expect(hero).not.toContainText("Descargar CV")
  })

  test("mueve los resultados al inicio de proyectos y las redes al footer", async ({ page }) => {
    await page.goto("/")
    const outcomes = page.locator("[data-project-outcomes] li")
    await expect(outcomes).toHaveCount(3)
    await expect(outcomes.first()).toContainText("94.1%")
    await expect(outcomes.last()).toContainText("2 demos públicas")

    const linkedinBtn = page.locator("footer a[data-track-social='linkedin']")
    await expect(linkedinBtn).toBeVisible()
    await expect(linkedinBtn).toHaveAttribute("href", /linkedin\.com/)
    const contact = page.locator("#contacto")
    await expect(contact.locator("a[href*='linkedin.com']")).toBeVisible()
    await expect(contact.locator("a[href*='github.com']")).toBeVisible()
    await expect(page.locator("header .header-social[data-track-social='linkedin']")).toBeVisible()
    await expect(page.locator(".hero-gradient a[data-track-social]")).toHaveCount(0)
    await expect(page.locator(".projects-contact-cta a")).toHaveAttribute("href", "#contacto")
  })
})

test.describe("Projects — screenshots con fallback", () => {
  test("rendered project pictures offer responsive AVIF with a responsive WebP img fallback", async ({ page }) => {
    for (const route of ["/", "/en/"]) {
      await page.goto(route)
      for (const slug of ["vulcania", "wenuke", "manttoai", "rapido-sur"]) {
        const picture = page.locator(`[data-project="${slug}"] .project-media picture`)
        await expect(picture).toHaveCount(1)
        await expect(picture.locator('source[type="image/avif"]')).toHaveAttribute("srcset", /\/_astro\/[^,]+\.avif 800w, \/_astro\/[^,]+\.avif 1600w/)
        const fallback = picture.locator("img.project-image")
        await expect(fallback).toHaveAttribute("src", /\/_astro\/[^/]+\.webp$/)
        await expect(fallback).toHaveAttribute("srcset", /\/_astro\/[^,]+\.webp 800w, \/_astro\/[^,]+\.webp 1600w/)
        await expect(fallback).toHaveAttribute("width", "800")
        await expect(fallback).toHaveAttribute("height", "500")
        await expect(fallback).toHaveAttribute("data-img-fallback", /^(|true)$/)
        await expect(fallback).toHaveAttribute("loading", "lazy")
        await expect(fallback).toHaveAttribute("decoding", "async")
        await expect(fallback).toHaveAttribute("alt", /screenshot$/)
      }
    }
  })
  test("a browser without the AVIF candidate loads the WebP picture fallback", async ({ page }) => {
    await page.goto("/")
    const picture = page.locator('[data-project="vulcania"] picture')
    const image = picture.locator("img.project-image")
    await image.scrollIntoViewIfNeeded()
    await picture.locator('source[type="image/avif"]').evaluate((source) => source.remove())
    await expect.poll(() => image.evaluate((img) => (img as HTMLImageElement).currentSrc)).toMatch(/\/_astro\/[^/]+\.webp$/)
    await expect.poll(() => image.evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  })

  test("Wenuke tiene imagen de screenshot", async ({ page }) => {
    await page.goto("/")
    const wenukeCard = page.locator("[data-project='wenuke']")
    await wenukeCard.scrollIntoViewIfNeeded()
    const img = wenukeCard.locator("img").first()
    await expect(img).toHaveAttribute("src", /\/_astro\/[^/]+\.webp$/)
    await expect(img).toHaveAttribute("srcset", /800w.*1600w/)
    await expect(img).toHaveAttribute("alt", /screenshot$/)
    await expect(img).toHaveAttribute("loading", "lazy")
    await expect(img).toHaveAttribute("decoding", "async")
    await expect.poll(() => img.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  })

  test("all localized project cards render Astro-generated responsive images", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    for (const route of ["/", "/en/"]) {
      await page.goto(route)
      for (const slug of ["vulcania", "wenuke", "manttoai", "rapido-sur"]) {
        const image = page.locator(`[data-project="${slug}"] .project-image`)
        await expect(image).toHaveAttribute("src", /\/_astro\/[^/]+\.webp$/)
        await expect(image).toHaveAttribute("srcset", /800w.*1600w/)
        await expect(image).toHaveAttribute("sizes", "(max-width: 767px) 100vw, (max-width: 1280px) 50vw, 800px")
        await expect(image).toHaveAttribute("alt", /screenshot$/)
        await expect(image).toHaveAttribute("loading", "lazy")
        await image.scrollIntoViewIfNeeded()
        await expect.poll(() => image.evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
      }
    }
  })

  test("valid blog images use optimized social and JSON-LD URLs; missing keys retain OG fallback", async ({ page }) => {
    await page.goto("/blog/rapido-sur-erp-mantenimiento-flotas")
    const social = await page.locator('meta[property="og:image"]').getAttribute("content")
    expect(social).toMatch(/^https:\/\/sebita\.dev\/_astro\/[^/]+\.webp$/)
    const article = await page.locator('script[type="application/ld+json"]').last().textContent()
    expect(JSON.parse(article!).image).toBe(social)

    await page.goto("/blog/bot-discord-moderacion-musica")
    const missing = await page.locator('script[type="application/ld+json"]').last().textContent()
    expect(JSON.parse(missing!)).not.toHaveProperty("image")
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\/es\.png/)
  })

  test("failed optimized screenshots still reveal the card gradient", async ({ page }) => {
    await page.goto("/")
    const card = page.locator('[data-project="vulcania"]')
    const image = card.locator(".project-image")
    await card.scrollIntoViewIfNeeded()
    await image.evaluate((element: HTMLImageElement) => {
      // Remove source candidates so the intentionally broken WebP fallback is selected.
      element.closest("picture")?.querySelectorAll("source").forEach((source) => { source.srcset = "" })
      element.srcset = ""
      element.src = "/missing-optimized-screenshot.webp"
    })
    await expect(image).toHaveCSS("display", "none")
    await expect(card.locator(".project-media")).toHaveAttribute("style", /linear-gradient/)
  })

  test("4 project cards renderizados", async ({ page }) => {
    await page.goto("/")
    const cards = page.locator("[data-project-card]")
    await expect(cards).toHaveCount(4)
  })

  test("cada card tiene gradiente de fondo", async ({ page }) => {
    await page.goto("/")
    const cards = page.locator("[data-project-card]")
    const count = await cards.count()
    for (let i = 0; i < count; i++) {
      const bgDiv = cards.nth(i).locator("[style*='linear-gradient']").first()
      await expect(bgDiv).toBeVisible()
    }
  })
})

test.describe("Experience — Astro-managed logos", () => {
  test("rendered experience pictures offer AVIF sources with WebP img fallbacks", async ({ page }) => {
    for (const route of ["/", "/en/"]) {
      await page.goto(route)
      const logos = page.locator(".experience-item a:has(picture)")
      await expect(logos).toHaveCount(3)
      for (const logo of await logos.all()) {
        const picture = logo.locator("picture")
        await expect(picture.locator('source[type="image/avif"]')).toHaveAttribute("srcset", /\/_astro\/[^,]+\.avif 1x, \/_astro\/[^,]+\.avif 2x/)
        const fallback = picture.locator("img")
        await expect(fallback).toHaveAttribute("src", /\/_astro\/[^/]+\.webp$/)
        await expect(fallback).toHaveAttribute("srcset", /\/_astro\/[^,]+\.webp 1x, \/_astro\/[^,]+\.webp 2x/)
        await expect(fallback).toHaveAttribute("width", "48")
        await expect(fallback).toHaveAttribute("height", "48")
        await expect(fallback).toHaveAttribute("loading", "lazy")
        await expect(fallback).toHaveAttribute("decoding", "async")
        expect(await fallback.getAttribute("alt")).toBe(await logo.getAttribute("aria-label"))
      }
    }
  })
  test("renders the three linked logos with generated local images in both locales", async ({ page }) => {
    for (const route of ["/", "/en/"]) {
      await page.goto(route)
      const logos = page.locator(".experience-item a:has(img)")
      await expect(logos).toHaveCount(3)
      for (const logo of await logos.all()) {
        const image = logo.locator("img")
        await expect(image).toHaveAttribute("src", /\/_astro\/[^/]+\.webp$/)
        await expect(image).toHaveAttribute("loading", "lazy")
        await expect(image).toHaveAttribute("decoding", "async")
        expect(await image.getAttribute("alt")).toBe(await logo.getAttribute("aria-label"))
        await image.scrollIntoViewIfNeeded()
        await expect.poll(() => image.evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
      }
    }
  })
})

test.describe("Temutel — descripción reducida", () => {
  test("descripción corta sin detalles extensos", async ({ page }) => {
    await page.goto("/")
    const experiencia = page.locator("#experiencia")
    await experiencia.scrollIntoViewIfNeeded()
    // No debe contener la descripción larga anterior
    await expect(experiencia).not.toContainText("decodificadores")
    await expect(experiencia).not.toContainText("sistemas telefónicos")
    await expect(experiencia.locator("[data-experience-timeline]")).toContainText("2023–2026")
    await expect(experiencia.locator(".experience-employment-type")).toHaveCount(2)
  })

  test("muestra una voz propia en Sobre mí y etiquetas honestas de acceso", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("#sobre-mi")).toContainText("No hago tutoriales de Todo List.")
    await expect(page.locator("[data-project='manttoai'] .project-eyebrow")).toContainText("Código disponible")
    await expect(page.locator("[data-project='rapido-sur'] .project-eyebrow")).toContainText("Código disponible")
    await expect(page.locator("[data-project='rapido-sur']")).toContainText("45 vehículos")
  })

  test("el email de contacto se ajusta sin desbordar su tarjeta", async ({ page }) => {
    for (const viewport of [
      { width: 1349, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport)
      await page.goto("/")

      const emailCard = page.locator("#contacto a[href^='mailto:']")
      await emailCard.scrollIntoViewIfNeeded()

      const metrics = await emailCard.evaluate((card) => {
        const label = card.querySelector("span")
        if (!label) return null

        const cardRect = card.getBoundingClientRect()
        const labelRect = label.getBoundingClientRect()
        return {
          cardRight: cardRect.right,
          labelRight: labelRect.right,
          cardClientWidth: card.clientWidth,
          cardScrollWidth: card.scrollWidth,
        }
      })

      expect(metrics).not.toBeNull()
      expect(metrics!.labelRight).toBeLessThanOrEqual(metrics!.cardRight + 1)
      expect(metrics!.cardScrollWidth).toBeLessThanOrEqual(metrics!.cardClientWidth + 1)
    }
  })
})

test.describe("Layout general", () => {
  test("no hay sección de testimonios", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("#testimonios")).not.toBeAttached()
  })

  test("5 certificaciones", async ({ page }) => {
    await page.goto("/")
    const certSection = page.locator("#certificaciones")
    await certSection.scrollIntoViewIfNeeded()
    // El carousel debería tener los certs
    const certs = page.locator(".cert-item")
    const count = await certs.count()
    // El carrusel duplica los certs para el loop infinito, así que contamos la mitad
    expect(count).toBe(10) // 5 certs × 2 (loop infinito)
  })

  test("página carga sin errores de consola", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))
    await page.goto("/")
    await page.waitForTimeout(2000)
    expect(errors).toHaveLength(0)
  })

  test("el reveal no deja contenido fuera del viewport oculto", async ({ page }) => {
    await page.goto("/")
    await page.waitForTimeout(1100)

    const hiddenCount = await page.locator("[data-animate]").evaluateAll((elements) =>
      elements.filter((element) => Number.parseFloat(getComputedStyle(element).opacity) < 0.99).length,
    )

    expect(hiddenCount).toBe(0)
  })
})
