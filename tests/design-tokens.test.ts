import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/styles/portfolio-base.css", "utf8");
const button = readFileSync("src/components/ui/Button.astro", "utf8");
const lightPalette = css.match(/:root\s*\{([^}]*)\}/)?.[1] ?? "";
if (!lightPalette) throw new Error("Missing light-theme palette");
const darkPalette = css.match(/\.dark\s*\{([^}]*)\}/)?.[1] ?? "";
if (!darkPalette) throw new Error("Missing dark-theme palette");

function token(name: string, palette = lightPalette): string {
  const declaration = palette.match(
    new RegExp(`(?:^|[;\\n])\\s*--${name}\\s*:\\s*([^;]+);`, "m"),
  )?.[1];
  if (!declaration) throw new Error(`Missing theme token: ${name}`);
  return declaration.trim().replace(/\/\*[\s\S]*?\*\//g, "").trim();
}

function hex(name: string, palette = lightPalette): string {
  const match = token(name, palette).match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!match) throw new Error(`Expected HSL channels for ${name}`);
  const [, hue, saturation, lightness] = match.map(Number);
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const segment = ((hue % 360) / 60 + 6) % 6;
  const secondary = chroma * (1 - Math.abs((segment % 2) - 1));
  const channels =
    segment < 1 ? [chroma, secondary, 0] :
    segment < 2 ? [secondary, chroma, 0] :
    segment < 3 ? [0, chroma, secondary] :
    segment < 4 ? [0, secondary, chroma] :
    segment < 5 ? [secondary, 0, chroma] : [chroma, 0, secondary];
  return `#${channels.map((value) => Math.round((value + l - chroma / 2) * 255).toString(16).padStart(2, "0")).join("")}`;
}

function luminance(color: string): number {
  const [red, green, blue] = color.slice(1).match(/../g)!.map((part) => {
    const channel = Number.parseInt(part, 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(foreground: string, background: string): number {
  const levels = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (levels[0] + 0.05) / (levels[1] + 0.05);
}

describe("documented light-theme semantic palette", () => {
  it("assigns identity colors to their semantic roles", () => {
    for (const [name, color] of Object.entries({
      background: "#ffffff",
      foreground: "#292827",
      card: "#ffffff",
      "card-foreground": "#292827",
      popover: "#ffffff",
      "popover-foreground": "#292827",
      primary: "#714cb6",
      "primary-foreground": "#ffffff",
      secondary: "#e9e5dd",
      "secondary-foreground": "#292827",
      muted: "#f4f3fa",
      "muted-foreground": "#5c5955",
      accent: "#cbb7fb",
      "accent-foreground": "#292827",
      border: "#dcd7d3",
      input: "#dcd7d3",
      ring: "#714cb6",
      "surface-soft": "#f4f3fa",
      parchment: "#dcd7d3",
      "warm-cream": "#e9e5dd",
      charcoal: "#292827",
      "caption-color": "#69645f",
    })) {
      expect(hex(name), name).toBe(color);
    }
  });

  it("keeps captions readable on every light-theme surface", () => {
    for (const background of ["background", "surface-soft", "warm-cream"]) {
      expect(contrast(hex("caption-color"), hex(background)), `caption-color on ${background}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps small interactive text on amethyst and text/surface pairs readable", () => {
    const link = css.match(/\.link-inline\s*\{([^}]*)\}/)?.[1];
    expect(link?.match(/\bcolor:\s*hsl\(var\(--([\w-]+)\)\)/)?.[1]).toBe("primary");
    for (const [foreground, background] of [
      ["foreground", "background"],
      ["muted-foreground", "background"],
      ["muted-foreground", "muted"],
      ["primary", "background"],
      ["primary-foreground", "primary"],
      ["accent-foreground", "accent"],
      ["secondary-foreground", "secondary"],
    ]) {
      expect(contrast(hex(foreground), hex(background)), `${foreground} on ${background}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("unused theme declarations", () => {
  it("does not define obsolete hero gradient or navigation tokens in either palette", () => {
    for (const palette of [lightPalette, darkPalette]) {
      for (const name of [
        "hero-gradient-start", "hero-gradient-mid", "hero-gradient-end",
        "nav-bg", "nav-bg-scrolled", "nav-border-color",
      ]) {
        expect(palette, `${name} must be absent from both palettes`).not.toMatch(
          new RegExp(`(?:^|[;\\n])\\s*--${name}\\s*:`),
        );
      }
    }
  });
});

describe("Button semantic color utilities", () => {
  const theme = css.match(/@theme inline\s*\{([^}]*)\}/)?.[1] ?? "";
  const variants = button.match(/const variantClasses = \{([^}]*)\}/)?.[1] ?? "";

  it("uses named utilities backed by the same HSL tokens in both themes", () => {
    const expected = {
      default: { "bg-primary": "primary", "text-primary-foreground": "primary-foreground" },
      secondary: { "bg-secondary": "secondary", "text-secondary-foreground": "secondary-foreground" },
      outline: { "border-parchment": "parchment", "hover:bg-muted": "muted" },
      ghost: { "hover:bg-muted": "muted" },
      link: { "text-primary": "primary" },
    };

    for (const [variant, utilities] of Object.entries(expected)) {
      const classes = variants.match(new RegExp(`(?:^|\\n)\\s*${variant}: '([^']+)'`))?.[1].split(/\s+/) ?? [];
      for (const [utility, name] of Object.entries(utilities)) {
        expect(classes, `${variant} ${utility}`).toContain(utility);
        expect(theme, `@theme inline ${name}`).toMatch(new RegExp(`--color-${name}:\\s*hsl\\(var\\(--${name}\\)\\);`));
        for (const palette of [lightPalette, darkPalette]) {
          expect(token(name, palette), `${variant} ${name} in both themes`).toMatch(/^[\d.]+\s+[\d.]+%\s+[\d.]+%$/);
        }
      }
    }
    expect(button).toContain("focus-visible:ring-ring");
    expect(theme).toMatch(/--color-ring:\s*hsl\(var\(--ring\)\);/);
    for (const palette of [lightPalette, darkPalette]) expect(token("ring", palette)).toBeTruthy();
  });

  it("transitions only interactive colors and active transform with the existing timing", () => {
    const base = button.match(/const baseClasses = '([^']+)'/)?.[1].split(/\s+/) ?? [];
    expect(base).toContain("transition-[color,background-color,border-color,transform]");
    expect(base).toContain("duration-200");
    expect(base).toContain("ease-in-out");
    expect(base).not.toContain("transition-colors");
    const styles = button.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
    expect(styles).not.toMatch(/\btransition\s*:/);
    expect(styles).toMatch(/a:active,\s*button:active\s*\{\s*transform:\s*scale\(0\.95\)/);
    expect(styles).toMatch(/a:focus-visible,\s*button:focus-visible\s*\{\s*outline:/);
  });

  it("keeps color classes semantic and applies valid opacity only on hover", () => {
    expect(button).not.toMatch(/(?:#(?:[0-9a-f]{3,8})\b|(?:rgb|rgba|oklch)\(|hsl\((?!var\(--))/i);
    for (const [variant, color, opacity] of [
      ["default", "primary", "88"],
      ["secondary", "secondary", "80"],
    ]) {
      const classes = variants.match(new RegExp(`(?:^|\\n)\\s*${variant}: '([^']+)'`))?.[1].split(/\s+/) ?? [];
      expect(classes, `${variant} full-opacity base`).toContain(`bg-${color}`);
      expect(classes, `${variant} hover opacity`).toContain(`hover:bg-${color}/${opacity}`);
      expect(classes, `${variant} opacity must be hover-only`).not.toContain(`bg-${color}/${opacity}`);
    }
    expect(button).not.toMatch(/(?:bg|text|border|ring)-\[hsl\(var\(--[\w-]+\)\)\/[\d.]+\]/);
    expect(variants).not.toMatch(/(?:bg|text|border|ring)-\[hsl\(var\(--[\w-]+\)\)\]/);
    expect(button.match(/const baseClasses = '([^']+)'/)?.[1]).not.toMatch(/ring-\[hsl\(var\(--ring\)\)\]/);
    expect(variants).toContain("bg-destructive text-destructive-foreground hover:bg-destructive/90");
  });
});

describe("documented dark-theme semantic palette", () => {
  it("renders dark primary as the documented lavender", () => {
    expect(hex("primary", darkPalette)).toBe("#cbb7fb");
  });

  it("keeps accent foreground WCAG AA readable on the dark accent surface", () => {
    expect(contrast(hex("accent-foreground", darkPalette), hex("accent", darkPalette))).toBeGreaterThanOrEqual(4.5);
  });

  it("assigns night canvas, surface, border, text, muted text and warm cream to their roles", () => {
    for (const [name, color] of Object.entries({
      background: "#0f0f14",
      foreground: "#e8e6e3",
      card: "#1a1a22",
      "card-foreground": "#e8e6e3",
      popover: "#1a1a22",
      "popover-foreground": "#e8e6e3",
      secondary: "#1a1a22",
      "secondary-foreground": "#e8e6e3",
      muted: "#1a1a22",
      "muted-foreground": "#8a8780",
      border: "#2a2a35",
      input: "#2a2a35",
      "surface-soft": "#1a1a22",
      parchment: "#2a2a35",
      "warm-cream": "#2a2826",
      charcoal: "#e8e6e3",
      "caption-color": "#8a8780",
    })) {
      expect(hex(name, darkPalette), name).toBe(color);
    }
  });

  it("keeps primary and muted text WCAG AA readable on night canvas and surface", () => {
    for (const foreground of ["foreground", "muted-foreground"]) {
      for (const background of ["background", "card", "muted"]) {
        expect(
          contrast(hex(foreground, darkPalette), hex(background, darkPalette)),
          `${foreground} on ${background}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
