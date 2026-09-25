import { getImage } from "astro:assets"
import { getProjectSocialImage } from "./portfolio-images"

export async function getBlogImageUrl(key: string | undefined): Promise<string | undefined> {
  const image = getProjectSocialImage(key)
  if (!image) return undefined

  const optimized = await getImage({ src: image, width: Math.min(image.width, 1200), format: "webp", quality: 90 })
  return optimized.src
}
