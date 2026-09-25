import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import {
  buildOgSvg,
  OG_HEIGHT,
  OG_LOCALES,
  OG_WIDTH,
  resolveOgLocale,
  resolveOgTitle,
} from "../src/lib/og-image";

function readPngDimensions(buffer: Buffer): { width: number; height: number } {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  expect(buffer.subarray(0, 8)).toEqual(signature);
  expect(buffer.subarray(12, 16).toString("ascii")).toBe("IHDR");

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

describe("OG social image fallback", () => {
  it("defaults og:image and twitter:image to a static crawler-safe PNG per locale", async () => {
    const layout = await readFile("src/layouts/Layout.astro", "utf8");

    expect(layout).toContain("`/og/${locale}.png`");
    expect(layout).not.toMatch(/\.svg\?title=/);
    expect(layout).toContain('"1200"');
    expect(layout).toContain('"630"');
  });

  it("ships a 1200x630 PNG fallback for every OG locale", async () => {
    expect(OG_LOCALES).toEqual(["es", "en"]);

    for (const locale of OG_LOCALES) {
      const buffer = await readFile(`public/og/${locale}.png`);

      expect(buffer.length).toBeGreaterThan(1024);
      expect(readPngDimensions(buffer)).toEqual({ width: 1200, height: 630 });
    }
  });

  it("keeps the dynamic SVG endpoint cache in parity with the vercel /og rule", async () => {
    const [route, vercel] = await Promise.all([
      readFile("src/pages/og/[locale].svg.ts", "utf8"),
      readFile("vercel.json", "utf8"),
    ]);

    expect(route).toContain("public, max-age=31536000, immutable");
    expect(vercel).toContain('"/og/(.*)"');
    expect(vercel).toContain("public, max-age=31536000, immutable");
  });
});

describe("vercel static-asset cache parity", () => {
  it("mirrors the certifications immutable rule for versioned CV pdfs", async () => {
    const config = JSON.parse(await readFile("vercel.json", "utf8")) as {
      headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
    };
    const rule = (source: string) =>
      config.headers.find((entry) => entry.source === source);

    for (const source of ["/certifications/(.*\\.pdf)", "/cv/(.*\\.pdf)"]) {
      expect(rule(source)?.headers).toEqual([
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ]);
    }
  });
});

describe("og-image template unit contract", () => {
  it("advertises the crawler-required 1200x630 canvas", () => {
    expect(OG_WIDTH).toBe(1200);
    expect(OG_HEIGHT).toBe(630);
  });

  it("falls back to Spanish for unknown locales", () => {
    expect(resolveOgLocale("en")).toBe("en");
    expect(resolveOgLocale("fr")).toBe("es");
    expect(resolveOgLocale(undefined)).toBe("es");
  });

  it("caps titles at 100 chars and falls back to the locale label", () => {
    expect(resolveOgTitle("Hola", "es")).toBe("Hola");
    expect(resolveOgTitle("x".repeat(101), "es")).toContain("Portfolio");
    expect(resolveOgTitle(null, "en")).toContain("Portfolio");
  });

  it("escapes markup in titles and renders the 1200x630 canvas", () => {
    const svg = buildOgSvg("es", 'A&B <test> "q"');

    expect(svg).toContain("A&amp;B &lt;test&gt; &quot;q&quot;");
    expect(svg).not.toContain("A&B <test>");
    expect(svg).toContain('width="1200" height="630"');
    expect(buildOgSvg("en")).toContain("Frontend Developer");
  });
});
