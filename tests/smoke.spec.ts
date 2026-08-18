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
  test("Wenuke tiene imagen de screenshot", async ({ page }) => {
    await page.goto("/")
    const wenukeCard = page.locator("[data-project='wenuke']")
    await wenukeCard.scrollIntoViewIfNeeded()
    const img = wenukeCard.locator("img").first()
    await expect(img).toHaveAttribute("src", "/screenshots/wenuke-800.webp")
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
