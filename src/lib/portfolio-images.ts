import type { ImageMetadata } from "astro"
import manttoaiCard from "../assets/screenshots/manttoai-1600.webp"
import rapidoSurCard from "../assets/screenshots/rapido-sur-1600.webp"
import vulcaniaCard from "../assets/screenshots/vulcania-1600.webp"
import wenukeCard from "../assets/screenshots/wenuke-1600.webp"
import manttoaiSocial from "../assets/screenshots/manttoai.webp"
import rapidoSurSocial from "../assets/screenshots/rapido-sur.webp"
import vulcaniaSocial from "../assets/screenshots/vulcania.webp"
import wenukeSocial from "../assets/screenshots/wenuke.webp"

// Explicit imports keep the project key lookup safe and visible to Astro's image pipeline.
const cardImages: Record<string, ImageMetadata> = {
  manttoai: manttoaiCard,
  "rapido-sur": rapidoSurCard,
  vulcania: vulcaniaCard,
  wenuke: wenukeCard,
}

const socialImages: Record<string, ImageMetadata> = {
  manttoai: manttoaiSocial,
  "rapido-sur": rapidoSurSocial,
  vulcania: vulcaniaSocial,
  wenuke: wenukeSocial,
}

export function getProjectScreenshot(slug: string): ImageMetadata | undefined {
  return Object.hasOwn(cardImages, slug) ? cardImages[slug] : undefined
}

export function getProjectSocialImage(key: string | undefined): ImageMetadata | undefined {
  return key && Object.hasOwn(socialImages, key) ? socialImages[key] : undefined
}
