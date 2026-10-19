# Design System — Sebastian Bravo Portfolio (SB-OS 2.6)

Record of the shipped rebrand on `feat/visual-shader-overhaul`. Values come from the built CSS and components; the build is normative.

## 1. Concept and references

**Creative North Star: "A 1986 workstation that ships to production in 2026."** The portfolio boots like a retro computer, then becomes a dark, precise desktop whose screen tells one story while you scroll: an idea becomes code and the code reaches production. CRT phosphor, rainbow-stripe corporate branding and large serif type carry the identity.

**Visitor mode: Experience.** The work leads from the first viewport and the interface recedes: a plain bar, chapter titles without labels, and one authored scroll sequence instead of the same entrance on every section.

Two Mobbin references are binding:

- **Shader** — BIOS boot screen, CRT curvature and chromatic aberration, rainbow stripes, cream paper chapters, large serif headlines, the name returning at full width in the footer, humorous copy ("Had enough reading?").
  - Boot: <https://mobbin.com/sites/sections/acc902bb-ea91-4876-ad44-a2378a7c778e>
  - Paper chapter with stripes: <https://mobbin.com/sites/sections/db7ca27c-ff93-4469-9cb3-2a965439b122>
  - Footer seals: <https://mobbin.com/sites/sections/90f14e56-2133-4493-8249-8c4b284c06d8>
- **Save.design** — near-black canvas, app windows over a 3D landscape, hot magenta accent, accordion rows.
  - Hero: <https://mobbin.com/sites/sections/91bc03ad-15c4-44df-b93c-710288796d65>
  - Grid cards: <https://mobbin.com/sites/sections/d4edc1a9-1dc4-459e-bd9d-c1d6574aa618>
  - Membership grid: <https://mobbin.com/sites/sections/8310aad8-6473-4310-9b07-85251a7623b5>

**Key characteristics:** dark canvas; cream paper as the light theme and the inverted contact chapter; one phosphor-magenta signal; rainbow stripes as the brand ornament; Instrument Serif display against Geist text; monospace only where the OS shows real interface or code; screens, windows and seals instead of text blocks.

**The Distill Rules** (adopted from the `impeccable` and `design-taste-frontend` skills):

- No eyebrow or kicker above a heading, and no section or item numbering (01 / [EDU-01]) where order carries no information.
- No uppercase letter-spaced monospace labels outside the SB-OS interface; secondary data uses `.meta-label` (Geist 14px, tabular numbers).
- No hairline guides, crop-mark nodes or 1px outlined boxes; surfaces separate by a step in tone (`--muted`, `--surface-soft`). Real tables and list rows keep their rules.
- No custom cursor and no loops that mean nothing (pulsing dots, idle seal rotation, infinite glitch).
- Say it once: the header carries navigation and one action; profiles and the CV live in the hero, contact and footer.
- Brand exception: the italic serif surname ("Sebastian *Bravo*") is the logotype and stays styled in the hero, header and footer.

## 2. Colors

Dark is the default theme. Light ("paper") is a complete alternate. Tokens are HSL channels consumed through `hsl(var(--token))` and Tailwind aliases in `@theme inline`.

### Dark (default)

| Token | Hex | Role |
|---|---|---|
| `--background` / `--canvas` | `#0b0b0d` | Page canvas |
| `--surface-soft` | `#101013` | Tinted bands, cards |
| `--card` | `#141417` | Menus |
| `--muted` | `#1c1c21` | Chips, highlight cells, hover fills |
| `--border` / `--hairline` | `#26262c` | Table and list rules |
| `--line-strong` | `#36363e` | Ghost buttons |
| `--foreground` / `--ink` | `#f3efe6` | Text |
| `--muted-foreground` | `#a6a29a` | Secondary text, meta labels |
| `--primary` / `--signal` | `#ff4fd8` | Signal: actions, status, focus, story progress |
| `--primary-foreground` | `#0b0b0d` | Text on signal |

### Light (paper)

| Token | Hex | Role |
|---|---|---|
| `--background` | `#f2ece0` | Cream paper |
| `--surface-soft` | `#e9e2d4` | Tinted bands, cards |
| `--card` | `#f7f3ea` | Menus |
| `--border` | `#d2c9b8` | Table and list rules |
| `--foreground` | `#17140f` | Ink |
| `--muted-foreground` | `#5a5246` | Secondary text |
| `--primary` | `#a3127a` | Signal on paper |

### Inverted contact chapter

Dark theme → paper chapter (`#efe6d2` / ink `#17140f` / accent `#a3127a`). Light theme → screen chapter (`#0b0b0d` / ink `#f3efe6` / accent `#ff4fd8`). `.section-band-inverted` re-points `--background`, `--foreground`, `--border` and `--signal` so every child component adapts.

### Theme-independent identity

| Token | Hex | Use |
|---|---|---|
| `--r1`…`--r6` | `#e5483a` `#f08a2b` `#f2c12e` `#4fb35a` `#3f8ee0` `#8e62e8` | Rainbow stripes, project stages, seal glows, code tokens |
| `--bios` / `--bios-ink` | `#2b30c4` / `#ece6d2` | Boot screen |
| `--screen` | `#07070a` | Screens and windows (dark in both themes) |
| `--sticky` | `#f6d365` | Sticky notes, `idea.txt` |

**The Signal Scarcity Rule.** Magenta marks action, status, focus and story progress. Never fill large surfaces with it; screens, stages and stripes carry the color.

**The Screen Rule.** Screens (hero desktop, project stages, TV, 404 card, blog windows) stay dark in both themes, like CRT monitors on a cream desk.

## 3. Typography

- **Display:** Instrument Serif 400 normal/italic (`--font-instrument`). Hero name, chapter titles, story captions, statements, project titles, stats, footer wordmark.
- **Text:** Geist 400/500/600 (`--font-geist`). Body, navigation, buttons, chips, meta labels.
- **Interface and code:** Geist Mono 400/500 (`--font-geist-mono`). Only the SB-OS interface (menubar, window titles, terminal, shortcuts) and the story's code window.
- **Pixel:** VT323 400 (`--font-vt323`). Boot screen, TV on-screen display, 404 code only.

All fonts are self-hosted through the Astro Fonts API (Fontsource provider) with metric-matched fallbacks and `font-display: swap`; none is preloaded.

| Role | Size |
|---|---|
| Hero name | `clamp(4.25rem, 24vw, 6.5rem)` below 640, `16vw` to 1023, `clamp(4.25rem, 13.4vw, 12.5rem)` from 1024; leading 0.82 |
| Chapter title | `clamp(2.75rem, 6.6vw, 6rem)`, leading 0.9, balanced |
| Story caption | `clamp(1.75rem, 3.2vw, 3rem)` |
| Statement / contact headline | `clamp(2rem, 3.5vw, 3.25rem)` / `clamp(3.25rem, 8.5vw, 8rem)` |
| Footer wordmark | `clamp(3.5rem, 17vw, 15.5rem)`, one line |
| Body | 16–17px, leading 1.5–1.65 |
| Meta label / chip | 14px / 13px Geist, sentence case |

## 4. Layout

- **Frame:** blueprint frame max `1440px` (`.frame`, `90rem`); the grid reads through alignment and space, with no drawn guides or nodes. Chapter padding `clamp(5rem, 10vw, 9rem)` vertical, `clamp(1rem, 4vw, 3.5rem)` horizontal.
- **Chapter head:** the serif title alone (`TitleSection`). The contact chapter opens with its own headline, so its `h2` is screen-reader only (`srOnly`).
- **Order:** Boot → Hero copy → Pinned story (SB-OS screen) → Projects (proof band + bento) → Stack marquee → Experience (accordion table, tinted) → Education (cards) → Certifications (seals, tinted) → About (TV + statement) → Contact (inverted paper) → Footer (full-width name).
- **Breakpoints:** 640 (screen 4:3, sticky note), 768 (two-column grids, story list in three columns), 1024 (hero split, desktop nav, screen 16:9), 1100 (five seals, three blog columns). Verify at 375, 768, 1024 and 1440 in both themes.

## 5. Components

- **Boot screen (`BootScreen`).** BIOS-blue CRT with logo, version, 24-segment loader and copyright in VT323. Armed by an inline `<head>` script only on the home, once per session, with `(min-width: 1024px) and (hover: hover) and (pointer: fine)`, without reduced motion and never under automation (`navigator.webdriver`); `?boot` forces it. Any key, pointer, wheel or touch skips it; a CSS failsafe hides it after 4.2s. Without JS it never appears.
- **Header.** Full-width frosted bar: striped mark + italic serif wordmark, four plain links in Geist with the moving indicator, icon-only theme and language toggles, one solid "Hablemos" action. The mobile menu repeats the links and contact only.
- **Hero (`Hero`).** Static LCP `<h1>` with chromatic layers on the italic surname that flicker once on load. The aside answers who and what in the text voice (role and location), then the thesis, two actions (contact, CV) and one availability line.
- **Pinned story (`HeroStory`, `HeroScreen`, `HeroWallpaper`, `OsWindowBar`).** A 360svh track whose sticky stage holds the SB-OS screen while three acts play: _the problem_ (an `idea.txt` note with Vulcania's tagline), _the code_ (an `alertas.ts` editor typed line by line by the scroll) and _production_ (a browser window with the real Vulcania screenshot and an "In production" toast). Captions sit under the screen as subtitles with a three-step progress bar; intro windows dim; story windows live in their own layer above the desktop icons. The screen shows the menubar with the live Chile clock, pixel-art shortcuts (real links), draggable portrait and terminal windows and a sticky note; the wallpaper is a build-time SVG the WebGL terrain replaces when available.
- **Projects (`Projects`, `ProjectTile`).** A proof band of three outcomes, then a bento: featured tile spans both columns, a GitHub archive tile closes the grid. Each tile is a dark stage tinted by its rainbow stripe (`--stage`), a tilted OS window with the screenshot (AVIF/WebP 800/1600) that straightens on hover, solid metric plates, text chips and actions; the case link reads "Leer el caso" with the project name for assistive technology.
- **Stack marquee (`SignalStrip`).** Rainbow stripes frame a looping italic-serif marquee with signal diamonds; hover/focus pause and an explicit pause/resume button (WCAG 2.2.2). Reduced motion wraps the list statically and hides the clone and the button.
- **Experience.** `<details name>` rows in a five-column table (period, role, company, type, toggle); the first row is open; highlights sit on tone-step cells; a 1px signal progress line scrubs with scroll.
- **Education / certifications.** Tone-step cards; certifications are SVG seals (`RoundSeal`) whose orbit text is a build-time image painted with `currentColor` through a mask, a serif monogram and a rainbow glow. The issuer and category sit under the name; the seal turns only under the pointer or focus.
- **About (`AboutMe`, `RetroTv`).** Beige CSS TV with three channels switched by native radios (`:has()`): grayscale portrait, a build-time ASCII portrait delivered as an SVG image (sharp + `pixelsToAscii` + `asciiToSvg`) and SMPTE bars ("Sin señal"). A sticky note carries the signature; the statement turns from grey to ink word by word with a CSS scroll timeline.
- **Contact.** Inverted paper chapter with a rainbow band, giant headline ("¿Suficiente lectura? Hagamos algo juntos."), serif link rows with text descriptions, a clipboard button (hidden without the Clipboard API), the CV action and a TV bezel that closes the chapter.
- **Footer.** Tagline, then the name at full width as the close (`Sebastian *Bravo*` linking home), and one legal row: rights, LinkedIn/GitHub, blog/privacy and the Astro + Three.js credit.
- **Inner pages.** Blog index as "Bitácora" with the post count under the intro and window-framed grayscale thumbnails that color on hover; articles with date and reading time, chips and a window-framed hero image; 404 as a TV test card.

## 6. Motion

**Motion thesis.** One focal moment: the pinned story. Everything else is feedback (hover, press, focus), continuity (view transitions, accordion) or a single meaningful scrub (experience progress, About words).

- **Pinned story (CSS scroll-driven).** `.hero-story` declares `view-timeline: --story` with `view-timeline-inset` equal to the header; every act uses `animation-range: contain …` on that timeline. The screen scales 0.9 → 1 on entry, the desktop layer drifts under 4% (parallax), captions cross-fade with a clip mask, code lines type with `steps()`, the browser opens from an inset clip. It runs without JS and never hijacks scrolling (sticky positioning).
- **The Longhand Rule.** Scroll-driven animations declare `animation-name`, `animation-duration: auto`, `animation-timing-function`, `animation-fill-mode` and `animation-timeline` as longhands. Lightning CSS (Tailwind v4's minifier) merges `animation` + `animation-timeline` into an invalid shorthand and the browser drops the whole rule.
- **Deferred controller.** GSAP/ScrollTrigger and Three.js load after `load`, two animation frames and an idle callback, once the hero is within 200px or receives input. Startup is bounded at 3s inline / 4s controller. Modules: cards, hero, nav indicator, experience timeline, terminal, counters.
- **WebGL terrain (`hero-webgl.ts`, `hero-shaders.ts`, `hero-camera.ts`).** Faceted fBm ridged terrain with a flat valley, neon ridge/contour lines, fog to the horizon and a striped sun in the sky dome, rendered to a target and composited by a CRT pass (barrel, RGB split, cheap bloom, rolling band, vignette, grain). The flight is scrubbed by the story progress (`storyProgress`): scrolling forward flies forward and lifts the camera, scrolling back flies back. Pointer steers, holding the landscape engages turbo. 30fps cap, DPR ≤ 1.5 (1 on compact), paused offscreen and on hidden tabs, disposed on swap. Eligibility: WebGL2, no touch, no Save-Data/2G, `deviceMemory ≥ 2`, no reduced motion.
- **Micro-interactions.** Draggable windows (pointer events, bounded to the screen), terminal typing, stat counters (only for counters still offscreen, hidden from assistive technology behind a static value), magnetic hero CTA, glass glare following the pointer, tilted project windows, seals turning under the pointer, TV static on channel change.
- **Reduced motion and unsupported browsers.** No GSAP, ScrollTrigger or WebGL chunk is fetched under reduced motion; the story track collapses and the three acts read as a static list; reveals and scroll timelines are disabled; the marquee wraps; the terminal is written in full.

**The LCP Stillness Rule.** The hero `<h1>` never animates and never receives inline styles, and it stays the largest contentful paint at every width: the mobile title scale keeps it larger than the portrait window, and the portrait loads eagerly without high fetch priority. `tests/hero-story.spec.ts` asserts the LCP element at 390×844 and 430×932.

**The Enhancement Rule.** Content is complete without JS: shortcuts are links, channels are radios, accordions are `<details>`, the wallpaper is SVG, the story is CSS.

## 7. Accessibility

- Text pairs meet WCAG AA: dark `#f3efe6`/`#0b0b0d` 17.1:1, muted 7.7:1, magenta 6.9:1; paper `#17140f`/`#f2ece0` 15.6:1, muted 6.5:1, magenta 6.1:1; inverted chapters ≥ 5.7:1. Scroll-driven text never starts below AA: About words go from `--muted-foreground` to ink, captions start fully transparent.
- Focus: 2px `--ring` outline with 2px offset; knobs, summaries and media links have visible focus.
- Decorative layers (boot, desktop and story windows, wallpaper, seals, bezel) are `aria-hidden`; shortcuts and the TV radios are real controls with localized names. The story's acts are an ordered list under a screen-reader heading.
- Accessible names contain the visible text (WCAG 2.5.3): certificate links take their name from their content; the theme label is screen-reader only.
- Decorative glyphs are images, not text: the ASCII portrait and the seal orbit text are build-time SVGs, so legible-text audits measure real copy.
- All copy comes from `src/lib/i18n/{es,en}.json` with key parity.

## 8. Constraints

- **CSP:** `script-src 'self'` plus exact hashes for the inline theme, boot and startup scripts. Run `pnpm update:csp:write` after editing inline scripts; `pnpm build` verifies parity.
- **Stylesheets:** `global.css` imports exactly five files: `portfolio-base.css` (tokens, primitives, prose), `portfolio-hero.css` (boot, hero and pinned story), `portfolio-content.css` (chapters, projects, experience, credentials), `portfolio-chapters.css` (about, contact, footer, motion layer), `header.css`.
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
