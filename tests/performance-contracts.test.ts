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
    expect(carouselMarkup).toContain(
      "if (animationId || !isInViewport || isHovered() || document.visibilityState === 'hidden') return",
    );
  });
});
