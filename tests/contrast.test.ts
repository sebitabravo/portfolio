import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const heroCss = readFileSync("src/styles/portfolio-hero.css", "utf8");
const heroMarkup = readFileSync("src/components/Hero.astro", "utf8");
const blogCardMarkup = readFileSync("src/components/BlogCard.astro", "utf8");
const spanishBlogIndexMarkup = readFileSync(
  "src/pages/blog/index.astro",
  "utf8",
);
const englishBlogIndexMarkup = readFileSync(
  "src/pages/en/blog/index.astro",
  "utf8",
);
const spanishBlogArticleMarkup = readFileSync(
  "src/pages/blog/[slug].astro",
  "utf8",
);
const englishBlogArticleMarkup = readFileSync(
  "src/pages/en/blog/[slug].astro",
  "utf8",
);

function channel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const values = hex
    .slice(1)
    .match(/../g)
    ?.map((part) => Number.parseInt(part, 16));
  if (!values || values.length !== 3) throw new Error(`Invalid color: ${hex}`);
  return (
    0.2126 * channel(values[0]) +
    0.7152 * channel(values[1]) +
    0.0722 * channel(values[2])
  );
}

function contrast(foreground: string, background: string): number {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

describe("hero contrast contract", () => {
  it("keeps the faint hero token above WCAG AA on both base canvases", () => {
    expect(heroCss).toContain("--hero-faint: #4c527b");
    expect(heroCss).toContain("--hero-faint: #bac5ef");
    expect(contrast("#4c527b", "#f6f5ff")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#bac5ef", "#10143a")).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the surname gradient readable and availability as one copy-level status", () => {
    expect(heroCss).toContain("#3730a3");
    expect(heroCss).toContain("#312e81");
    expect(heroMarkup).toContain("hero-meta-status");
    expect(heroMarkup).not.toContain("available-badge");
    expect(heroMarkup).not.toContain("hero-art-status");
    expect(contrast("#3730a3", "#f6f5ff")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#312e81", "#f6f5ff")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#8873e8", "#10143a")).toBeGreaterThanOrEqual(4.5);
  });
});

describe("blog text contrast contract", () => {
  it("uses the muted foreground token for the BlogCard publication date", () => {
    expect(blogCardMarkup).toMatch(
      /<time\b[^>]*class="[^"]*\btext-muted-foreground\b[^"]*"/,
    );
    expect(blogCardMarkup).not.toMatch(
      /<time\b[^>]*class="[^"]*\btext-foreground\/45\b[^"]*"/,
    );
  });

  it("uses the muted foreground token for Spanish and English list breadcrumbs", () => {
    for (const markup of [spanishBlogIndexMarkup, englishBlogIndexMarkup]) {
      expect(markup).toMatch(
        /<ol\b[^>]*class="[^"]*\btext-muted-foreground\b[^"]*"/,
      );
      expect(markup).not.toMatch(
        /<ol\b[^>]*class="[^"]*\btext-foreground\/55\b[^"]*"/,
      );
    }
  });

  it("uses the muted foreground token for Spanish and English article breadcrumbs and dates", () => {
    for (const markup of [spanishBlogArticleMarkup, englishBlogArticleMarkup]) {
      expect(markup).toMatch(
        /<ol\b[^>]*class="[^"]*\btext-muted-foreground\b[^"]*"/,
      );
      expect(markup).not.toMatch(
        /<ol\b[^>]*class="[^"]*\btext-foreground\/55\b[^"]*"/,
      );
      expect(markup).toMatch(
        /<time\b[^>]*class="[^"]*\btext-muted-foreground\b[^"]*"/,
      );
      expect(markup).not.toMatch(
        /<time\b[^>]*class="[^"]*\btext-foreground\/40\b[^"]*"/,
      );
    }
  });
});
