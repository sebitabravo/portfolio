import { setupProjectCards, teardownProjectCards } from "./motion/cards"

export function setupProjects(): void {
  setupProjectCards()
}

export function teardownProjects(): void {
  teardownProjectCards()
}
