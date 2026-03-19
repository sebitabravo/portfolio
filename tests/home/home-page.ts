import { expect, type Locator, type Page } from "@playwright/test"
import { BasePage } from "../base-page"

export class HomePage extends BasePage {
  readonly projectsHeading: Locator
  readonly contactHeading: Locator
  readonly allFilterTab: Locator
  readonly reactFilterTab: Locator
  readonly projectCards: Locator

  constructor(page: Page) {
    super(page)
    this.projectsHeading = page.getByRole("heading", { name: /Proyectos|Projects/ })
    this.contactHeading = page.getByRole("heading", { name: /Contacto|Contact/ })
    this.allFilterTab = page.getByRole("tab", { name: /Todas|All/ })
    this.reactFilterTab = page.getByRole("tab", { name: "React" })
    this.projectCards = page.locator("[data-project-card]")
  }

  async gotoSpanishHome(): Promise<void> {
    await this.goto("/")
  }

  async verifyCoreSections(): Promise<void> {
    await expect(this.projectsHeading).toBeVisible()
    await expect(this.contactHeading).toBeVisible()
  }

  async verifyProjectFiltering(): Promise<void> {
    await expect(this.allFilterTab).toHaveAttribute("aria-selected", "true")
    const allCardsCount = await this.projectCards.count()
    await expect(this.reactFilterTab).toBeVisible()

    await this.reactFilterTab.click()
    await expect(this.reactFilterTab).toHaveAttribute("aria-selected", "true")

    const visibleCards = this.page.locator("[data-project-card]:not(.hidden)")

    await expect(visibleCards.first()).toBeVisible()
    const filteredCount = await visibleCards.count()
    expect(filteredCount).toBeGreaterThan(0)
    expect(filteredCount).toBeLessThanOrEqual(allCardsCount)
  }
}
