import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectsMarkup = readFileSync("src/components/Projects.astro", "utf8");
const carouselMarkup = readFileSync(
  "src/components/CertificationCarousel.astro",
  "utf8",
);

describe("performance contracts", () => {
  it("lazy-loads project screenshots without dropping responsive image attributes", () => {
    expect(projectsMarkup).toContain('loading="lazy"');
    expect(projectsMarkup).not.toContain(
      'loading={i === 0 ? "eager" : "lazy"}',
    );
    expect(projectsMarkup).toContain(
      "srcset={`/screenshots/${slug}-800.webp 800w, /screenshots/${slug}-1600.webp 1600w`}",
    );
    expect(projectsMarkup).toContain('width="800"');
    expect(projectsMarkup).toContain('height="500"');
    expect(projectsMarkup).toContain('decoding="async"');
  });

  it("runs carousel auto-scroll only while the carousel is in the viewport", () => {
    expect(carouselMarkup).toContain(
      "const intersectionObserver = new IntersectionObserver",
    );
    expect(carouselMarkup).toContain("intersectionObserver.observe(container)");
    expect(carouselMarkup).toContain("intersectionObserver.disconnect()");
    const startGuard = carouselMarkup.match(
      /function startAutoScroll\(\)\s*\{\s*if \(([^\n]+)\) return/,
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
      /function handleMotionChange\(\)\s*\{[^}]*stopAutoScroll\(\)[^}]*startAutoScroll\(\)/s,
    );
    expect(carouselMarkup).not.toMatch(
      /if \(window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches\) return/,
    );
    expect(carouselMarkup).toMatch(
      /addEventListener\('scrollend',[\s\S]*?\}, \{ once: true, signal \}\)/,
    );
  });
});
