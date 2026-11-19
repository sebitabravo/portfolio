# Resolución — design proposal

**Status: proposal.** Lives in `design/resolucion/` only. Nothing under `src/` was touched; the uncommitted WIP stays as it is. The prototype is `index.html` plus five more views (`blog.html`, `post.html`, `privacidad.html`, `404.html`, `links.html`) and the social card template `og.html`; shared code lives in `resolucion.css`, `views.css`, `boot.js` and `common.js` (serve the repo root, e.g. `python3 -m http.server 4173`, then open `/design/resolucion/index.html`). The brief from the owner overrides `POSITIONING.md` §5 and `DESIGN.md` v3.0 for this exercise: black canvas, very minimal, Geist Pixel for display and Geist Mono for everything else, spectacular product presentation, brutal animation and sound, optimized, senior.

## 1. Why this exists

A recruiter said the site looks saturated and junior. The history confirms the root cause: seven eras since Oct 2025 (shadcn blue, Syne/indigo, Monument amber, SB-OS 2.6 with magenta + rainbow + windows + boot + WebGL, v3.0 WIP), and each one added a visual language instead of replacing the last. SB-OS 2.6 ended with eight surface languages. The six `design/portfolio-2026/` mockups (B&W + khaki + Syne/Manrope) were rejected.

References analysed (v1.1 reviewed all three local clones in depth; v1.0 only cited the first two): `midudev/porfolio.dev` (one column, one accent, same header per section, motion only on entry and hover: seniority comes from discipline), `midudev/minimalist-portfolio-json` (two-column CV grid, `light-dark()`, `tabular-nums` dates, print stylesheet) and `mouredev/portafolio-template` (everything a recruiter needs in the first screen, one row schema for experience / education / certifications).

### Adopted

| Pattern | Source | In Resolución |
|---|---|---|
| Recruiter data in the first screen, as text | mouredev `portafolio/views/header.py`, `components/media.py`; midudev `src/components/Hero.astro:51-67` | Hero row with `email`, `github`, `linkedin` as text links next to the two buttons (before they only existed in contact) |
| Tech listed with each case | midudev `src/components/Projects.astro:46-51`; mouredev `components/info_detail.py:22-33` | `stack` per project, plain faint mono under the tagline (same style as `.row .stack`). No chips, no devicons |
| One row schema, dates in one column | mouredev `components/info_detail.py:8-86`; minimalist `src/components/Entry.astro` | Dates in the label column as `<time datetime>`, `tabular-nums`, month + year visible (the minimalist repo hides them in a hover tooltip) |
| Visible "current" marker | midudev `src/components/ExperienceItem.astro:29-32` | Filled 8px square, blinks in `steps(2)` twice on enter, static after, off under reduced motion. No experience entry is current today (MIMASOFT ended abr 2026), so it sits on INACAP (en curso) |
| Active-section indicator | midudev `src/components/Header.astro:51-80` | 8px square before the active link plus `aria-current="location"`; one `IntersectionObserver` (band 40%–45% of the viewport), disconnected on `pagehide` and re-created on bfcache restore (midudev never disconnects). `sobre mí` and `formación` light up `experiencia` |
| Print as a deliverable | minimalist `src/layouts/Layout.astro:210-241` | See §6.1: the page is a printable CV |
| Metric-matched font fallback | minimalist `src/styles/fonts.css:34-41` | `@font-face` fallbacks for Geist Mono, see §8 |
| SEO head parity | midudev `src/layouts/Layout.astro:24-80` (JSON-LD `Person`, canonical, OG) | Checklist in §8 |

### Rejected (and why)

- Avatar with glow ring (midudev, mouredev): competes with the pixel name; the ASCII portrait was cut for the same reason.
- Brand-colored tech chips, devicons, spinning conic badge, gradient `h1`, noise grain, amber glow: saturation is exactly what the recruiter flagged. The work is the only color.
- Icon-only actions (mouredev's main weakness): every action keeps a text label.
- Bezier `view()` scroll reveals (midudev): the motion grammar stays `steps()` only.
- `⌘K` command palette (minimalist, hotkeypad): new dependency and extra JS for a feature recruiters do not use.

## 2. The idea: Resolución

Everything on the site goes from low resolution to sharp. It is the honest metaphor for the work (idea → code → production) and the thing Geist Pixel does best. One rule for space and time:

- **Quantized space.** 8px base grid; line heights in multiples of 4.
- **Quantized time.** Motion advances in `steps()`, never in bezier curves. It behaves like a low-frequency display "coming into focus". This is what separates it from a generic fade-up.
- **The work is the only color.** The UI is 100% monochrome. Color exists only inside the product screenshots, so the products are what glows. Magenta, rainbow, amber and ASCII green are gone.

### Three signed moments (the audacity is spent here and nowhere else)

1. **The name resolves (hero, on load).** "Sebastián Bravo" in Geist Pixel at up to 15rem. Each letter cycles Line → Triangle → Grid → Circle → Square in 80ms steps and settles on Square, staggered left to right. With sound on, one `tick` per settled letter. The `h1` is real text, visible without JS; the animation is additive and the DOM returns to plain text when it ends.
2. **Products come into focus (work).** Index of four projects on the left (sticky), 16:10 screenshot on the right. Changing project runs the screenshot through four resolutions (24px → 96px → 384px → original) with `image-rendering: pixelated`, 80ms each, plus a `shutter` sound. Below: decision, trade-off (omitted when null, never empty) and metrics that count up in 8 steps.
3. **The email copies (contact).** The address in Geist Pixel, split at `@` into two lines, is the CTA. Click: copies, the text re-resolves to "Copiado" (~0.9s), `chirp` plays, then it resolves back. A `role="status"` line announces it.

Section headings (`trabajo`, `experiencia`, …) reuse the same resolve engine once on entering the viewport, together with one 8-step entry of the section body. That is the only reveal per section; there is no per-card animation.

Ambient (desktop, fine pointer, no reduced motion, no Save-Data): a dot field behind the hero that lights up near the cursor in 4 quantized levels. Canvas, ~1.5KB of JS, redraws only when the pointer changes grid cell, paused off-screen. It stayed after critique because it reads as texture and does not compete with the name; cut it first if a reviewer disagrees.

## 3. Tokens

### Color

| Token | Dark (default) | Light | Use |
|---|---|---|---|
| `--bg` | `#000000` | `#ffffff` | Canvas. True black / pure white, never tinted |
| `--fg` | `#ffffff` | `#000000` | Primary text, display |
| `--fg-muted` | `#a1a1a1` | `#5c5c5c` | Secondary text |
| `--fg-faint` | `#8a8a8a` | `#6b6b6b` | Meta, dates, labels |
| `--line` | `#262626` | `#e5e5e5` | Row dividers (structure, not decoration) |
| `--fill` | `#141414` | `#f2f2f2` | Row hover, toggle hover, image placeholder |

Implemented with `light-dark()` and `color-scheme`. **Dark is the default regardless of the OS preference** (brand decision from the brief); the toggle persists in `localStorage` (`sb-theme`) and a head script applies it before paint. Focus: 2px `--fg` outline, 2px offset, appears instantly.

Measured contrast (script in the session scratchpad, WCAG 2.x):

| Pair | Dark | Light |
|---|---|---|
| `fg` / `bg` | 21.00 | 21.00 |
| `fg-muted` / `bg` | 8.13 | 6.69 |
| `fg-faint` / `bg` | 6.08 | 5.33 |
| `fg-muted` / `fill` | 7.13 | 5.97 |
| `fg-faint` / `fill` | 5.34 | 4.76 |

All text pairs are ≥ 4.5:1. `--line` against `--bg` is 1.39 / 1.26: dividers only, never the sole carrier of meaning (every tab and row has text).

### Typography

| Family | Role | Sizes |
|---|---|---|
| Geist Pixel Square | Display: name, section titles, project titles, contact email | hero `min(15rem, (100vw − 2·gutter)/5.3, (100svh − 22rem)/1.8)`; h2 `clamp(2.5rem, 6vw, 5rem)`; project `2rem`; index `1.5rem` |
| Geist Pixel Line / Triangle / Grid / Circle | Only the frames of the resolve animation | same as the element being resolved |
| Geist Mono 400/500 | Everything else | body 15/24, small 13/20, metrics `clamp(1.5rem, 6vw, 2rem)` |

No serif, no Geist Sans. Lowercase labels (no spaced uppercase), no middle dots, no arrows glued to text, no numbering except real sequences. The selection indicator in the index is an 8×8 square, not a `▸` glyph (the glyph is outside the Geist Mono range Google serves, and it is a typographic tell).

**Font spike results (these change the implementation plan):**

- Google Fonts serves `Geist Pixel` as **one** 806KB TTF containing only the Square shape. The other four shapes are not on Google.
- The `GeistPixelVF` file in `geist@1.9.2` (39KB) does **not** morph between shapes via `ELSH`: values 0 to 4 and 2.5 render identically in Chromium. Do not build the animation on the variable font.
- The five static shapes in `geist@1.9.2/dist/fonts/geist-pixel/*.woff2` are visually distinct and have an **identical advance (0.5776em)**, so swapping the shape per letter causes no layout shift. Sizes: Line 18KB, Triangle 29KB, Grid 28KB, Circle 28KB, Square 29KB.
- Therefore the prototype vendors the woff2 files from `geist@1.9.2` into `fonts/` with the OFL `LICENSE.txt` (instead of the Google Fonts links the plan assumed). Geist Mono Regular/Medium are the full 50KB files; production must subset to Latin (~15KB each).

### Layout

- 8px grid. Page frame `90rem` with a 32px gutter (16px under 720px). Text sections use the CV grid: label `10rem` + content `40rem`, collapsing to one column under 720px. Everything is left-aligned.
- Deviation from the plan: the project stage uses the full page frame (not a 72rem cap). Capped at 72rem and left-aligned it left a dead strip against the 32px gutter; at 1440 the screenshot column is ~910px, which is not oversized.
- Home goes from ten chapters to six: hero, trabajo, experiencia, sobre mí, formación, contacto. `HeroStory` and `SignalStrip` are absorbed (the idea → production story lives in the screenshot resolution; the stack becomes plain text in "sobre mí").
- Header: 64px, `--bg`, 1px `--line` bottom, no glass. Sticky ≥ 720px; on mobile the nav is a second row and the header scrolls away. Nav links reserve 20px of left padding for the active-section square (absolute, so it never changes the row width: an in-flow square made the mobile nav overflow to 394px).
- Hero meta: `disponible para trabajar` + `chile <hora>`, then a text row `email · github · linkedin` (no icon-only buttons), then `ver proyectos` / `descargar cv`.

```
┌ sebastián bravo   trabajo experiencia blog contacto        sonido: off  es/en  ◧ ┐
│ desarrollador full-stack                                                          │
│ Sebastián                                  (Geist Pixel, up to 15rem, 2 lines)    │
│ Bravo                                                                             │
│ intro · ■ disponible   chile 08:58 · email github linkedin · [proyectos] [cv]     │
├───────────────────────────────────────────────────────────────────────────────────┤
│ trabajo                                                                           │
│ ■ Copiloto de Recepción   ┌─────────────────────────────┐                         │
│   Werken-mapu             │ screenshot (resolves)       │  (index is sticky)      │
│   Vulcania                └─────────────────────────────┘                         │
│   ManttoAI                decision / trade-off · metrics · [leer caso] [código]   │
├───────────────────────────────────────────────────────────────────────────────────┤
│ experiencia · sobre mí · formación        (label | content rows, --line dividers) │
│ hablemos      sebitabravocontacto / @gmail.com  (click copies)   github linkedin  │
└ © 2026 sebastián bravo   privacidad ──────────────────────────────────────────────┘
```

## 4. Motion grammar (one only)

| Token | Value | Use |
|---|---|---|
| feedback | `80ms steps(4, end)` | hover, color change, indicator |
| transition | `240ms steps(6, end)` | view transitions (root dissolve) |
| enter | `480ms steps(8, end)`, 8px | one reveal per section |
| frame | `80ms` | resolve ticks and screenshot focus frames |

No bezier curves in the UI. Metric numbers count in 8 steps (60ms each) only when the value starts with a digit ("94.1% F1-Score" counts, "Llama 3.1 70B" does not). Row hover is an instant `--fill` background plus the 8px indicator appearing in one step. Anchor jumps are instant (`scroll-behavior` stays `auto`).

**Reduced motion** (verified): no `motion` class on `<html>`, so no resolve, no focus sequence, no counters, no reveals, no dot field; everything renders in its final state. Sound does not depend on reduced motion.

## 5. Sound

Web Audio synthesized in vanilla JS (0.9KB gzip measured), no assets, no fetch, so `connect-src 'self'` is untouched.

- **Off by default**, persisted in `localStorage` (`sb-sound`, wrapped in try/catch). Header toggle is a `role="switch"` reading `sonido: off/on`.
- The `AudioContext` is created or resumed inside a user gesture: the toggle click, or the first `pointerdown`/`keydown` when the persisted state is `on`. `<html data-audio>` is `idle` until then and `ready` after. Verified in the prototype: reload with sound on keeps the label and stays `idle` until the first key press.
- Voices: `tick` (triangle 1.6kHz → 900Hz, 18ms, gain 0.04: index hover and settled letters), `press` (square 600Hz, 30ms: buttons and toggles), `shutter` (band-passed noise 60ms: project change), `chirp` (880Hz then 1320Hz: email copy). 40ms rate limit per voice. Never on passive scroll.

## 6. Components

| Component | Spec |
|---|---|
| Button | 40px high, 1px `--fg` border, 13px/500, square corners. `primary` is filled; hover inverts in a 4-step color transition. `sm` (32px, `--line` border) for secondary links in the stage |
| Index row (`role="tab"`) | ≥ 64px, Pixel 1.5rem title + 13px status, 8px indicator (40% on hover, 100% selected), roving `tabindex`, ↑ ↓ Home End |
| Stage panel (`role="tabpanel"`) | screenshot, title, tagline, decision / trade-off (two columns only when both exist), metrics, links (demo only when `liveUrl` exists) |
| CV row | label 13px `--fg-faint` with `<time datetime>` and `tabular-nums` + content; top divider `--line`; no hover. `.current` rows get an 8px filled square before the dates |
| Stage stack line | `p-stack`, 13/20 `--fg-faint`, under the tagline; plain text from the project's tags |
| Nav active link | `aria-current="location"`, `--fg` text plus 8px square |
| Contact email | `<button>` with an `aria-label` carrying the full address; two Pixel lines; hover `--fill` |
| Header toggles | `sonido` switch, `es/en`, theme (16px SVG half-square); 8px padding hit areas |

### 6.1 Print

`@page { size: A4; margin: 14mm }` and `@media print`: forced light (`:root[data-theme]` also overridden, otherwise a stored dark theme wins on specificity), header toggles / nav / dot field / screenshots / CTA buttons / live clock hidden, reveals forced visible. The interactive stage is replaced by a static list of the four projects with stack and **full URLs printed** (relative `/blog/...` are expanded to `https://sebita.dev/...`); hero and contact links print their `href`. Rows do not split across pages and section titles do not orphan at a page bottom. Verified with `emulateMedia({ media: "print" })` and `page.pdf({ format: "A4" })` (`screens/desktop-print.pdf`, 5 pages, light, no images).

## 7. Accessibility

Skip link; one `h1`; landmarks; `aria-label` on the nav and on the resolving elements (cells are `aria-hidden`, the real text sits in an `sr` span while animating); tabs follow the WAI-ARIA tabs pattern with automatic activation; visible focus in both themes (verified light); `role="status"` for the copy confirmation; reduced motion honored; all text pairs ≥ 4.5:1; no horizontal scroll at 390px (verified, `scrollWidth` = 390).

## 8. Performance budgets (production targets)

Astro static, no new runtime dependency. LCP element is the `h1` text in Geist Pixel Square, so the Square woff2 (29KB) and Mono Regular (subset, ~15KB) are the only preloaded fonts. The four shape fonts (~103KB) load after idle via `FontFace`/`document.fonts.load`; the hero animation starts only if they arrive within 1.2s, otherwise the name simply stays final. No WebGL. Screenshot focus frames are build-time variants from `getImage` (~24px/96px/384px, well under 20KB together) instead of the client-side canvas downscale the prototype uses. JS target for the whole module (resolve + sound + stage + counters + field): ≤ 8KB gzip (the prototype's entire inline script, project data included, measures 6.5KB gzip). Font total in the critical path ≤ 50KB.

**Font fallback (production requirement).** Geist Mono swaps in with `font-display: swap`, so the stack carries two metric-matched fallbacks (`Geist Mono Fallback` over local Menlo, `Geist Mono Fallback CN` over local Courier New) with `size-adjust` / `ascent-override` / `descent-override` / `line-gap-override` computed from the real file (Geist Mono advance 0.6em, ascent 1.005, descent 0.295; Menlo 0.60205 / 0.92822 / 0.23583; Courier New 0.60010 / 0.83252 / 0.30030 → 99.66% / 100.84% / 29.6% and 99.98% / 100.52% / 29.5%). Measured with fontTools; re-measure if the subset changes the metrics. Geist Pixel needs none: only display text uses it and the four shape fonts are metric-identical by design.

**SEO head parity checklist for the Astro phase.** Checked against `src/layouts/Layout.astro`: it already ships JSON-LD (`application/ld+json`, line 142), canonical (`canonicalUrl`), `alternates` for hreflang and a static 1200×630 PNG for `og:image`. Resolución must keep all four; to verify per page type (home, blog index, post, privacy, 404): `Person` JSON-LD only on home, `BlogPosting` on posts, hreflang pairs es/en, `og:image` at its real size, `noindex` on 404.

## 9. Mapping to the current Astro code

| Now | In Resolución |
|---|---|
| `Layout.astro`, `Header.astro`, `ThemeToggle.astro`, `LanguageToggle.astro` | Rewritten: flat header, sound switch added |
| `Hero.astro` | Rewritten around the resolving `h1` |
| `ProjectTile.astro`, `Projects.astro` | Replaced by the index + stage |
| `Experience.astro`, `ExperienceItem.astro`, `Education.astro`, `Certifications.astro` | Collapse into CV rows (certification carousel goes away) |
| `Contact.astro` | Email-as-CTA |
| `AboutMe.astro` | Text + stack as plain text. The ASCII portrait is removed (see §10) |
| `HeroStory`, `SignalStrip`, `SectionBand`, `RoundSeal`, `RetroTv`, `OsWindowBar`, `HeroScreen`, `HeroWallpaper`, `BrandMark` | Delete candidates once the new home ships |
| `src/scripts/motion/*` | Keep `controller.ts` as the lifecycle host; add a `resolve` module and `src/scripts/sound/` |
| `src/pages/blog/index.astro`, `[slug].astro`, `privacy.astro`, `404.astro` and the `en/` mirrors | Restyled to `blog.html`, `post.html`, `privacidad.html`, `404.html`. The English views are not drawn: they reuse the same layout with the `en.json` strings |
| (new) `src/pages/links.astro` | `links.html`, see §12 |
| `src/lib/data/personal.ts` `description` / `descriptionEn` | Still say "Desarrollador Full-Stack junior" / "Junior Full-Stack Developer" (used for meta and JSON-LD). Same copy fix as `busco` |
| i18n | Reused; fix the tells (role without " · ", no italic accented surname, lowercase labels). **Copy fix:** `busco` currently says "Mi primer rol full-time como Desarrollador Full-Stack Junior…", which contradicts the brief (the site must not read junior). Replace in `src/lib/i18n/es.json` / `en.json` with "Rol full-time como desarrollador full-stack, en equipos que resuelven problemas concretos con tecnología bien aplicada. Inglés C1." (EN equivalent without "first" / "Junior"). Facts unchanged, self-label gone |

## 10. Critique and what changed

Review against the frontend-design tells ("would any black dev portfolio come out the same?"):

- Black + mono + big type alone would. What is specific here: the quantized-time motion, the shape-cycling name that is native to the typeface, the focus-resolve on real product screenshots, and the email as a sound-backed interaction.
- **Cut:** the ASCII portrait. At 84 columns the photo's busy background made it illegible (checked on screen), so it was removed rather than shipped as noise.
- **Changed from the plan:** vendored fonts instead of Google Fonts (spike); stage at page width; indicator square instead of `▸`; hover on the index only ticks, click selects (hover-select caused constant re-focusing); email stagger 0.3 tick/letter so the confirmation lasts ~0.9s instead of 2.6s; mobile gutter 16px; muted dark contrast is 8.13:1, not the 8.6 estimated in the plan.
- **Content decision (owner):** Rápido Sur is left out of the design (home stage, blog index and sample post) because its screenshot is still a generic purple title card. In Astro keep the entry in `src/lib/data/projects.ts` but hide it (e.g. `featured`/visibility flag, or filter on the slug) and its blog post `rapido-sur-erp-mantenimiento-flotas`, until a real UI capture exists; then restore both.
- **v1.1 critique:** the three references showed what v1.0 lacked for a recruiter (contact and tech buried, dates in a tooltip-like place, no print, no current marker) and what it must not import (avatars, chips, bezier reveals, palette). The "current" marker found a content fact: no job is current, only the degree. A print list needed its own markup because the stage shows one project at a time. The in-flow nav indicator broke mobile (394px) and was replaced by an absolute one.
- **Prototype-only gaps:** `en` is inert, internal links such as `/blog/...` are not served, and the Chile clock/time are live.
- **Prose decision (delegated to the agent):** article body goes to `17px/30px`. Not 15px, which at 44rem ran ~78 characters per line (past the readable range), and not a sans, which would add a third family and ~40KB for one surface and contradict the "Geist Mono for everything else" rule that gives the system its discipline. 17px mono lands at ~69 characters and keeps the identity. The three treatments stay comparable in `08-post-prosa.html`; the loser variants are deleted at the Astro port.

## 11. Out of this phase

Astro implementation (local fonts with `LICENSE.txt`, token rewrite in `src/styles/portfolio-base.css`, `src/scripts/sound/`, a resolve module on `motion/controller.ts`, the decision about the current WIP). `tests/design-tokens.test.ts` and `tests/css-contracts.test.ts` pin Instrument Serif/Geist, the 120/240/520ms bezier grammar and the magenta; changing them needs explicit authorization per the testing rule.

## 12. All views, and the creator kit (v1.2)

The owner is also a content creator, so the site has to work as the destination of a YouTube description or a bio link. v1.2 draws every route that exists in `src/pages` (Spanish; English mirrors reuse the layout) and adds one new route.

| View | File | Notes |
|---|---|---|
| Home | `index.html` | v1.1 |
| Blog index | `blog.html` | Same CV-row schema (date label, title, description, stack line, reading time). Filter `todos / casos / educacional` with `aria-pressed` and a `role="status"` count; 40 real posts from `src/content/blog` (41 minus the hidden Rápido Sur post) |
| Post | `post.html` | Real MDX body (Vulcania) through pandoc. Sticky "en esta página" TOC ≥ 960px, 44rem measure, tables / code / lists restyled with tokens (the Tailwind card markup in the MDX collapses to ruled rows), newer / older rows, `copiar enlace` with `chirp`. Fixed `post-title` size (`clamp(1.75rem, 4vw, 3rem)`) instead of a resolve animation: a 100-character title would take 8 s to resolve |
| Privacidad | `privacidad.html` | The eight sections of `LocalizedPrivacy.astro` as CV rows, text unchanged |
| 404 | `404.html` | `404` resolving, a ramp of the four resolve shapes, `noindex`. The SMPTE color bars are gone (UI is monochrome) |
| Links | `links.html` | Linktree-style hub, see below |
| Social cards | `og.html?v=home|links|blog` → `og/*.png` (1200×630) | Name in Geist Pixel over the dot field |

**Links hub (`/links`).** One narrow column, left aligned like the rest, 64px tappable rows with the same 8px indicator as the project index: portafolio, proyectos, blog, cv, github, linkedin, agenda (Cal.com 15 min, taken from the privacy page), email (copies, `chirp`), youtube (`@sebitabravo`). Below it a "para youtube" block with two plain-text snippets (full description; one line for a pinned comment) and copy buttons. Each line carries the full `https://` URL because YouTube only auto-links complete URLs. The page also shows its own social preview. The YouTube row points to `https://www.youtube.com/@sebitabravo` (supplied by the owner). UTM or `?ref=` parameters were left out on purpose.

**Head parity per view** (prototype heads already carry them): `canonical`, `hreflang`, `og:title/description/url/image` with `1200×630` and `twitter:card`. Real `og:image` generation stays in `src/pages/og/[locale].svg.ts` (`pnpm generate:og`); the Resolución cards need that generator to embed Geist Pixel. In the Astro phase JSON-LD is `Person` on home, `BlogPosting` on posts.

**Structure.** `index.html` was split: tokens, header, rows, footer and print in `resolucion.css`; interior-page components in `views.css`; theme and motion flags before first paint in `boot.js`; sound, resolve engine, section reveal and the nav observer in `common.js` (exposed as `window.R`). Every view loads the same four files, so a change to a token or to the header is made once.

**Verified (Playwright, Chromium):** no console or network errors on any view; `scrollWidth` 1440 / 390 on all six views (the 404 overflowed at 401px until its size divisor was corrected); blog filters 41 → 29 / 12; copy buttons write the expected text to the clipboard; every TOC link resolves to a heading; Tab focus ring is 2px solid; print emulation is light; reduced motion leaves `404` static. Screenshots: `screens/{desktop,mobile}-{dark,light}-{blog,post,privacidad,404,links}.png` plus `-full` for dark.

## 13. Prototype close (v1.3)

The design is complete and verified. What changed after v1.2:

- **English mirrors** (`en/`): six files, same markup and classes as the Spanish views. Every string that already exists in production comes verbatim from `src/lib/i18n/en.json` (and `LocalizedPrivacy.astro` for the policy); the rest was translated. Each head carries `lang="en"`, its own canonical and the `es`/`en`/`x-default` hreflang triple; the five Spanish interior pages gained the matching alternates. The language control is now a real link pair everywhere, with `aria-current="true"` on the active language — the `title="Fuera del prototipo"` and `aria-disabled` are gone. English was worth drawing because the `h2` rule is `white-space: pre`: it holds at 390px, but only because it was measured.
- **States board** (`09-estados.html`): 20 specimens per theme. Two states did not exist before and were specified here: **press** (`translateY(2px)` on the same `steps(4)` 80ms easing — the control moves, it never changes colour) and **disabled** (`--fg-faint` plus `--line`; never intermediate opacity, because the palette has no off-scale greys). Both live in `resolucion.css` under "Estados que faltaban". Every forced demo class on the board mirrors a real shared-CSS rule; there are no orphan classes.
- **Article prose** is `17px/30px` (§10): ~69 characters per line at 44rem, measured.
- **Two runtime defects fixed** in `common.js`: the sound label is now derived from `document.documentElement.lang` instead of being hardcoded in Spanish on every page, and the header-control lookups are guarded so boards without `#sound`/`#theme` no longer throw a pageerror.
- **Evidence regenerated** from the current design: 46 captures in `screens/` (including two new English hero shots), the three OG cards re-rendered at exactly 1200×630, and the printable CV at **4 A4 pages** (it was 5 on the old SB-OS design). The home prints as 2 pages.
- **Manifest**: 16 artboards over 15 HTML files (`index.html` is listed twice, desktop and 390×844), 46 screens, 3 OG cards, 4 shared files. Nothing on disk is unlisted and nothing listed is missing.

Independent audit (17 documents: 6 ES views, 6 EN views, 2 boards, `og.html`, plus the states board): zero console errors, zero pageerrors, `scrollWidth` equal to the viewport at 1440 and 390 on every document, every contrast pair passing AA, keyboard order clean with the skip link first and a working roving tabindex, no raw hex outside `:root`, no third font family, and no external URL, CDN or remote asset in any document.

One measured non-defect worth knowing before the port: Chromium refuses `crossorigin` woff2 preloads over `file://` (origin `null`), so a double-clicked file logs font CORS noise and renders fallbacks. The fonts load correctly over http and in production; the canvas serves over http for exactly this reason.
