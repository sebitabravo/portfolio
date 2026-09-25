import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { getWorkExperience } from "../src/lib/data/work";

// Vitest does not apply Astro's image metadata loader to WebP imports.
vi.mock("../src/assets/experience/mimasoft.webp", () => ({ default: { src: "mimasoft.webp", width: 768, height: 166, format: "webp" } }))
vi.mock("../src/assets/experience/temutel.webp", () => ({ default: { src: "temutel.webp", width: 225, height: 225, format: "webp" } }))
vi.mock("../src/assets/experience/telsur.webp", () => ({ default: { src: "telsur.webp", width: 334, height: 151, format: "webp" } }))


const carouselMarkup = readFileSync(
  "src/scripts/cert-carousel.ts",
  "utf8",
);

const carouselWiring = readFileSync(
  "src/components/CertificationCarousel.astro",
  "utf8",
);

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

  it("runs carousel auto-scroll only while the carousel is in the viewport", () => {
    expect(carouselWiring).toContain('import { initCertCarousel } from "@/scripts/cert-carousel"');
    expect(carouselMarkup).toContain(
      "const intersectionObserver = new IntersectionObserver",
    );
    expect(carouselMarkup).toContain("intersectionObserver.observe(container)");
    expect(carouselMarkup).toContain("intersectionObserver.disconnect()");
    const startGuard = carouselMarkup.match(
      /function startAutoScroll\([^)]*\)(?:\s*:\s*void)?\s*\{\s*if \(([^\n]+)\) return/,
    )?.[1];
    expect(startGuard).toBeDefined();
    expect(startGuard).toContain("signal.aborted");
    expect(startGuard).toContain("animationId");
    expect(startGuard).toContain("!isInViewport");
    expect(startGuard).toContain("isHovered()");
    expect(startGuard).toContain("container!.contains(document.activeElement)");
    expect(startGuard).toContain("document.visibilityState === 'hidden'");
    expect(startGuard).toContain("motionPreference.matches");
    expect(carouselMarkup).toContain(
      "document.addEventListener('visibilitychange', handleVisibilityChange, { signal })",
    );
    expect(carouselMarkup).toContain("ac.abort()");
  });

  it("tracks live reduced-motion preference and aborts pending scrollend on teardown", () => {
    expect(carouselMarkup).toContain(
      "motionPreference.addEventListener('change', handleMotionChange, { signal })",
    );
    expect(carouselMarkup).toMatch(
      /function handleMotionChange\([^)]*\)(?:\s*:\s*void)?\s*\{[^}]*stopAutoScroll\(\)[^}]*startAutoScroll\(\)/s,
    );
    expect(carouselMarkup).not.toMatch(
      /if \(window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches\) return/,
    );
    expect(carouselMarkup).toMatch(
      /addEventListener\('scrollend',[\s\S]*?\}, \{ once: true, signal \}\)/,
    );
  });
});
