# Design System — Sebastian Bravo Portfolio (SB-OS 2.6)

Record of the shipped rebrand on `feat/visual-shader-overhaul`. Values come from the built CSS and components; the build is normative.

## 1. Concept and references

**Creative North Star: "A 1986 workstation that ships to production in 2026."** The portfolio boots like a retro computer, then becomes a dark, precise technical desktop. Every chapter is a "program" in the OS: CRT phosphor, rainbow-stripe corporate branding and a hairline blueprint grid.

Two Mobbin references are binding:

- **Shader** — BIOS boot screen, CRT curvature and chromatic aberration, rainbow stripes, cream paper chapters, large serif headlines, retro corporate seals in the footer, humorous copy ("Had enough reading?").
  - Boot: <https://mobbin.com/sites/sections/acc902bb-ea91-4876-ad44-a2378a7c778e>
  - Paper chapter with stripes: <https://mobbin.com/sites/sections/db7ca27c-ff93-4469-9cb3-2a965439b122>
  - Footer seals: <https://mobbin.com/sites/sections/90f14e56-2133-4493-8249-8c4b284c06d8>
- **Save.design** — near-black canvas, monospace interface voice, hairline grid with diamond nodes, app windows over a 3D landscape, hot magenta accent, accordion rows.
  - Hero: <https://mobbin.com/sites/sections/91bc03ad-15c4-44df-b93c-710288796d65>
  - Grid cards: <https://mobbin.com/sites/sections/d4edc1a9-1dc4-459e-bd9d-c1d6574aa618>
  - Membership grid: <https://mobbin.com/sites/sections/8310aad8-6473-4310-9b07-85251a7623b5>

**Key characteristics:** dark technical canvas; cream paper as the light theme and the inverted contact chapter; one phosphor-magenta signal; rainbow stripes as the brand ornament; Instrument Serif display against Geist text and Geist Mono labels; screens, windows and seals instead of text blocks; motion that decorates reading and never gates it.

## 2. Colors

Dark is the default theme. Light ("paper") is a complete alternate. Tokens are HSL channels consumed through `hsl(var(--token))` and Tailwind aliases in `@theme inline`.

### Dark (default)

| Token | Hex | Role |
|---|---|---|
| `--background` / `--canvas` | `#0b0b0d` | Page canvas |
| `--surface-soft` | `#101013` | Tinted bands |
| `--card` | `#141417` | Cards, menus |
| `--muted` | `#1c1c21` | Hover fills |
| `--border` / `--hairline` | `#26262c` | Grid lines, dividers |
| `--line-strong` | `#36363e` | Nodes, ghost buttons |
| `--foreground` / `--ink` | `#f3efe6` | Text |
| `--muted-foreground` | `#a6a29a` | Secondary text, mono labels |
| `--primary` / `--signal` | `#ff4fd8` | Signal: actions, status, focus, indices |
| `--primary-foreground` | `#0b0b0d` | Text on signal |

### Light (paper)

| Token | Hex | Role |
|---|---|---|
| `--background` | `#f2ece0` | Cream paper |
| `--surface-soft` | `#e9e2d4` | Tinted bands |
| `--card` | `#f7f3ea` | Cards, menus |
| `--border` | `#d2c9b8` | Grid lines |
| `--foreground` | `#17140f` | Ink |
| `--muted-foreground` | `#5a5246` | Secondary text |
| `--primary` | `#a3127a` | Signal on paper |

### Inverted contact chapter

Dark theme → paper chapter (`#efe6d2` / ink `#17140f` / accent `#a3127a`). Light theme → screen chapter (`#0b0b0d` / ink `#f3efe6` / accent `#ff4fd8`). `.section-band-inverted` re-points `--background`, `--foreground`, `--border` and `--signal` so every child component adapts.

### Theme-independent identity

| Token | Hex | Use |
|---|---|---|
| `--r1`…`--r6` | `#e5483a` `#f08a2b` `#f2c12e` `#4fb35a` `#3f8ee0` `#8e62e8` | Rainbow stripes, project stages, seal glows |
| `--bios` / `--bios-ink` | `#2b30c4` / `#ece6d2` | Boot screen |
| `--screen` | `#07070a` | Screens and windows (dark in both themes) |
| `--sticky` | `#f6d365` | Sticky notes |

**The Signal Scarcity Rule.** Magenta marks action, status, indices and focus. Never fill large surfaces with it; screens, stages and stripes carry the color.

**The Screen Rule.** Screens (hero desktop, project stages, TV, 404 card, blog windows) stay dark in both themes, like CRT monitors on a cream desk.

## 3. Typography

- **Display:** Instrument Serif 400 normal/italic (`--font-instrument`). Hero name, chapter titles, statements, project titles, stats.
- **Text:** Geist 400/500/600 (`--font-geist`). Body, descriptions, prose.
- **Interface:** Geist Mono 400/500 (`--font-geist-mono`). Navigation, labels, chips, buttons, metadata, code.
- **Pixel:** VT323 400 (`--font-vt323`). Boot screen, TV on-screen display, 404 code only.

All fonts are self-hosted through the Astro Fonts API (Fontsource provider) with metric-matched fallbacks and `font-display: swap`; none is preloaded.

| Role | Size |
|---|---|
| Hero name | `clamp(4.25rem, 13.4vw, 12.5rem)`, leading 0.82, tracking -0.035em |
| Chapter title | `clamp(3.5rem, 10vw, 9rem)`, leading 0.86 |
| Statement / contact headline | `clamp(2rem, 3.5vw, 3.25rem)` / `clamp(3.25rem, 8.5vw, 8rem)` |
| Project title | `clamp(2.125rem, 3.6vw, 3.25rem)` |
| Body | 16–17px, leading 1.5–1.65 |
| Mono label | 11px uppercase, tracking 0.08em |

## 4. Layout

- **Blueprint frame:** blueprint frame max `1440px` (`.frame`, `90rem`) with hairline side guides from `768px` and diamond nodes (`.frame-node`) where chapters meet the guides. Chapter padding `clamp(4.5rem, 9vw, 8.5rem)` vertical, `clamp(1rem, 4vw, 3.5rem)` horizontal.
- **Chapter head:** mono row `[NN] kicker ——— meta` above a giant serif title (`TitleSection`).
- **Order:** Boot → Hero (SB-OS desktop) → Projects (stats + bento) → Stack marquee → Experience (accordion table, tinted) → Education (cards) → Certifications (seals, tinted) → About (TV + statement) → Contact (inverted paper) → Footer (seals).
- **Breakpoints:** 640 (screen 4:3, sticky note), 768 (frame guides, two-column grids), 1024 (hero split, desktop nav, TV sticky), 1100 (five seals, three blog columns). Verify at 375, 768, 1024 and 1440 in both themes.

## 5. Components

- **Boot screen (`BootScreen`).** BIOS-blue CRT with logo, version, 24-segment loader and copyright in VT323. Armed by an inline `<head>` script only on the home, once per session, with `(min-width: 1024px) and (hover: hover) and (pointer: fine)`, without reduced motion and never under automation (`navigator.webdriver`); `?boot` forces it. Any key, pointer, wheel or touch skips it; a CSS failsafe hides it after 4.2s. Without JS it never appears.
- **Header.** Full-width glass bar, hairline bottom, striped mark + italic serif wordmark, mono nav with signal indices and the moving indicator, ghost LinkedIn/CV, theme/language toggles and a solid "Hablemos" button.
- **Hero (`Hero`, `HeroScreen`, `HeroWallpaper`).** Static LCP `<h1>` with decorative chromatic layers on the italic surname. A CRT screen hosts the SB-OS desktop: menubar with live Chile clock, pixel-art shortcuts (real links), draggable portrait and terminal windows, a sticky note and a scroll cue. The wallpaper is a build-time SVG (striped sun + noise ridgelines) that the WebGL terrain replaces when available.
- **Projects (`Projects`, `ProjectTile`).** Stats band with count-up numbers, then a bento: featured tile spans both columns, a GitHub archive tile closes the grid. Each tile is a dark stage tinted by its rainbow stripe (`--stage`), a giant outline index, a tilted OS window with the screenshot (AVIF/WebP 800/1600) that straightens on hover, floating metric chips, mono tags and three mono actions.
- **Stack marquee (`SignalStrip`).** Rainbow stripes frame a looping italic-serif marquee with signal diamonds; hover/focus pause and an explicit pause/resume button (WCAG 2.2.2). Reduced motion wraps the list statically and hides the clone and the button.
- **Experience.** `<details name>` rows in a five-column table (period, role, company, type, toggle); the first row is open; highlights become bordered stat cells; a 1px signal progress line scrubs with scroll.
- **Education / certifications.** Hairline cards with diamond nodes; certifications are rotating SVG seals (`RoundSeal`) with organization and category in orbit, a serif monogram and a rainbow glow.
- **About (`AboutMe`, `RetroTv`).** Beige CSS TV with three channels switched by native radios (`:has()`): grayscale portrait, a build-time ASCII portrait (sharp + `pixelsToAscii`) and SMPTE bars ("Sin señal"). A sticky note carries the signature; the statement lights up word by word with a CSS scroll timeline.
- **Contact.** Inverted paper chapter with a rainbow band, giant headline ("¿Suficiente lectura? Hagamos algo juntos."), rotating availability seal, serif link rows with mono descriptions, a clipboard button (hidden without the Clipboard API) and a TV bezel that closes the chapter.
- **Footer.** Globe seal ("Hecho en Chile · Remoto mundial"), centered wordmark and tagline, laurel seal linking to privacy, mono legal row.
- **Inner pages.** Blog index as "Bitácora" with window-framed grayscale thumbnails that color on hover; articles with mono meta, reading time, chips and a window-framed hero image; 404 as a TV test card.

## 6. Motion

- **Deferred controller.** GSAP/ScrollTrigger and Three.js load after `load`, two animation frames and an idle callback, once the hero is within 200px or receives input. Startup is bounded at 3s inline / 4s controller. Modules: cards, hero, nav indicator, experience timeline, terminal, counters, cursor.
- **WebGL terrain (`hero-webgl.ts`, `hero-shaders.ts`).** Faceted fBm ridged terrain with a flat valley, neon ridge/contour lines, fog to the horizon and a striped sun in the sky dome, rendered to a target and composited by a CRT pass (barrel, RGB split, cheap bloom, rolling band, vignette, grain). Pointer moves the camera, scroll lifts it, holding the landscape engages turbo. 30fps cap, DPR ≤ 1.5 (1 on compact), paused offscreen and on hidden tabs, disposed on swap. Eligibility: WebGL2, no touch, no Save-Data/2G, `deviceMemory ≥ 2`, no reduced motion.
- **CSS scroll timelines.** Chapter titles wipe in, the hero screen scales 0.92 → 1, the contact chapter wipes, and About words light up. Browsers without scroll timelines show final states.
- **Micro-interactions.** Draggable windows (pointer events, bounded to the screen), terminal typing, stat counters (only for counters still offscreen), cursor pill on projects (fine pointer only), magnetic hero CTA, glass glare following the pointer, tilted project windows, spinning seals, TV static on channel change.
- **Reduced motion.** No GSAP, ScrollTrigger or WebGL chunk is fetched; reveals and scroll timelines are disabled; the marquee wraps; seals stop; the terminal is written in full.

**The LCP Stillness Rule.** The hero `<h1>` never animates and never receives inline styles; only its decorative pseudo-layers glitch.

**The Enhancement Rule.** Content is complete without JS: shortcuts are links, channels are radios, accordions are `<details>`, the wallpaper is SVG.

## 7. Accessibility

- Text pairs meet WCAG AA: dark `#f3efe6`/`#0b0b0d` 17.1:1, muted 7.7:1, magenta 6.9:1; paper `#17140f`/`#f2ece0` 15.6:1, muted 6.5:1, magenta 6.1:1; inverted chapters ≥ 5.7:1.
- Focus: 2px `--ring` outline with 2px offset; knobs, summaries and media links have visible focus.
- Decorative layers (boot, desktop windows, wallpaper, seals, bezel, cursor pill) are `aria-hidden`; shortcuts and the TV radios are real controls with localized names.
- All copy comes from `src/lib/i18n/{es,en}.json` with key parity.

## 8. Constraints

- **CSP:** `script-src 'self'` plus exact hashes for the inline theme, boot and startup scripts. Run `pnpm update:csp:write` after editing inline scripts; `pnpm build` verifies parity.
- **Stylesheets:** `global.css` imports exactly five files: `portfolio-base.css` (tokens, primitives, prose), `portfolio-hero.css` (boot + hero), `portfolio-content.css` (chapters, projects, experience, credentials), `portfolio-chapters.css` (about, contact, footer, motion layer), `header.css`.
- **Bundle:** every JS chunk ≤ 600 KiB raw / 150 KiB gzip; Three.js stays the only 3D dependency and GSAP the only motion dependency.
- **Source limits:** `.astro` 250 lines, `.ts` 300, `.css` 1500 (exceptions in `scripts/check-source-limits.ts`).
- **Copy:** no hardcoded translatable strings; code comments in Spanish, identifiers/docs/commits in English.

## 9. Verification

```bash
pnpm check
pnpm test && pnpm test:coverage
pnpm build
pnpm exec playwright test
pnpm format:check
```
