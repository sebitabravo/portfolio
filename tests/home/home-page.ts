import { expect, type Locator, type Page } from "@playwright/test"
import { BasePage } from "../base-page"

export class HomePage extends BasePage {
  readonly projectsHeading: Locator
  readonly contactHeading: Locator
  readonly projectCards: Locator

  constructor(page: Page) {
    super(page)
    this.projectsHeading = page.getByRole("heading", { name: /Proyectos|Projects/ })
    this.contactHeading = page.getByRole("heading", { name: /Contacto|Contact/ })
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
    const count = await this.projectCards.count()
    expect(count).toBeGreaterThan(0)
    await expect(this.projectCards.first()).toBeVisible()
  }
}
