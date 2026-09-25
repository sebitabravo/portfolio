import { describe, expect, it, vi } from "vitest";
import { getBlogImageUrl } from "../src/lib/blog-image";

// Vitest treats image imports as URL strings; Astro supplies metadata in the site build.
vi.mock("../src/assets/screenshots/manttoai.webp", () => ({ default: { src: "manttoai.webp", width: 1200, height: 750, format: "webp" } }))
vi.mock("../src/assets/screenshots/vulcania.webp", () => ({ default: { src: "vulcania.webp", width: 1200, height: 750, format: "webp" } }))
vi.mock("../src/assets/screenshots/wenuke.webp", () => ({ default: { src: "wenuke.webp", width: 1710, height: 929, format: "webp" } }))
vi.mock("../src/assets/screenshots/rapido-sur.webp", () => ({ default: { src: "rapido-sur.webp", width: 1200, height: 750, format: "webp" } }))

vi.mock("astro:assets", () => ({
  getImage: vi.fn(async ({ src, width }: { src: { src: string }; width: number }) => ({
    src: `/_astro/${src.src.split('/').pop()}-${width}.webp`,
  })),
}));

describe("getBlogImageUrl", () => {
  it.each(["manttoai", "vulcania", "wenuke", "rapido-sur"])(
    "resolves a known key %s to an optimized image URL",
    async (key) => {
      const url = await getBlogImageUrl(key);
      expect(url).toMatch(/^\/_astro\/[^/]+\.webp$/);
      expect(url).not.toContain("/screenshots/");
    },
  );

  it.each([undefined, "", "bot-discord", "rioclaro", "missing-blog-screenshot", "__proto__", "../manttoai"])(
    "does not resolve an absent or unsafe key %s",
    async (key) => {
      expect(await getBlogImageUrl(key)).toBeUndefined();
    },
  );
});
