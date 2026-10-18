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
      background: "#f1eeea",
      foreground: "#11100e",
      card: "#f7f5f3",
      "card-foreground": "#11100e",
      popover: "#f7f5f3",
      "popover-foreground": "#11100e",
      primary: "#885a16",
      "primary-foreground": "#f1eeea",
      secondary: "#dbd8d1",
      "secondary-foreground": "#11100e",
      muted: "#e4e2dd",
      "muted-foreground": "#5c5851",
      accent: "#885a16",
      "accent-foreground": "#f1eeea",
      border: "#d5d2cd",
      input: "#d5d2cd",
      ring: "#885a16",
      "surface-soft": "#e7e4de",
      parchment: "#d5d2cd",
      "warm-cream": "#e7e4de",
      charcoal: "#11100e",
      "caption-color": "#5c5851",
    })) {
      expect(hex(name), name).toBe(color);
    }
  });

  it("keeps captions readable on every light-theme surface", () => {
    for (const background of ["background", "surface-soft", "warm-cream"]) {
      expect(contrast(hex("caption-color"), hex(background)), `caption-color on ${background}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps small interactive text on amber and text/surface pairs readable", () => {
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

describe("flat certification categories and retained theme tokens", () => {
  const carousel = readFileSync("src/components/CertificationCarousel.astro", "utf8");
  const themeInline = css.match(/@theme inline\s*\{([^}]*)\}/)?.[1] ?? "";

  it("uses plain category text while retaining named theme utilities", () => {
    expect(carousel).not.toMatch(/hsl\(144/);
    expect(carousel).toContain("cert-category text-sm text-muted-foreground");
    expect(carousel).not.toContain("bg-cert-pro-bg");
    expect(carousel).not.toContain("text-cert-pro-text");
    expect(carousel).not.toContain("border-cert-pro-border");
    expect(themeInline).toMatch(/--color-cert-pro-bg:\s*hsl\(var\(--cert-pro\) \/ 0\.12\);/);
    expect(themeInline).toMatch(/--color-cert-pro-text:\s*hsl\(var\(--cert-pro-text\)\);/);
    expect(themeInline).toMatch(/--color-cert-pro-border:\s*hsl\(var\(--cert-pro\) \/ 0\.25\);/);
    for (const palette of [lightPalette, darkPalette]) {
      expect(token("cert-pro", palette)).toMatch(/^[\d.]+\s+[\d.]+%\s+[\d.]+%$/);
      expect(token("cert-pro-text", palette)).toMatch(/^[\d.]+\s+[\d.]+%\s+[\d.]+%$/);
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
  it("renders dark primary as the documented amber", () => {
    expect(hex("primary", darkPalette)).toBe("#e7a23c");
  });

  it("keeps accent foreground WCAG AA readable on the dark accent surface", () => {
    expect(contrast(hex("accent-foreground", darkPalette), hex("accent", darkPalette))).toBeGreaterThanOrEqual(4.5);
  });

  it("assigns night canvas, surface, border, text, muted text and warm cream to their roles", () => {
    for (const [name, color] of Object.entries({
      background: "#080807",
      foreground: "#f2efe8",
      card: "#151513",
      "card-foreground": "#f2efe8",
      popover: "#151513",
      "popover-foreground": "#f2efe8",
      primary: "#e7a23c",
      "primary-foreground": "#0b0b09",
      secondary: "#292823",
      "secondary-foreground": "#f2efe8",
      muted: "#1b1a18",
      "muted-foreground": "#a29b90",
      accent: "#e7a23c",
      "accent-foreground": "#0b0b09",
      border: "#292823",
      input: "#292823",
      ring: "#e7a23c",
      "surface-soft": "#10100f",
      parchment: "#292823",
      "warm-cream": "#151513",
      charcoal: "#f2efe8",
      "caption-color": "#aea89e",
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
