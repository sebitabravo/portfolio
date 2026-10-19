import { describe, expect, it, vi } from "vitest";
import { getWorkExperience } from "../src/lib/data/work";

// Vitest does not apply Astro's image metadata loader to WebP imports.
vi.mock("../src/assets/experience/mimasoft.webp", () => ({ default: { src: "mimasoft.webp", width: 768, height: 166, format: "webp" } }))
vi.mock("../src/assets/experience/temutel.webp", () => ({ default: { src: "temutel.webp", width: 225, height: 225, format: "webp" } }))
vi.mock("../src/assets/experience/telsur.webp", () => ({ default: { src: "telsur.webp", width: 334, height: 151, format: "webp" } }))


describe("performance contracts", () => {
  it("provides local image metadata rather than public URL strings for all experience logos", () => {
    for (const locale of ["es", "en"] as const) {
      const logos = getWorkExperience(locale).flatMap((experience) => experience.logos ?? []);
      expect(logos).toHaveLength(3);
      for (const logo of logos) {
        expect(logo.src).toEqual(expect.objectContaining({
          src: expect.any(String), width: expect.any(Number), height: expect.any(Number),
        }));
      }
    }
  });

});
