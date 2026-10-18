# Design System — Sebastian Bravo Portfolio

Local, gitignored record of the shipped redesign on `feat/visual-shader-overhaul`. Values below come from the built CSS and components; where `.impeccable/visual-direction.md` differs, the build is normative.

## 1. Concept and Shader reference

**Creative North Star: "Monument in the dark."** A near-black stage holds one lit object: the name in Boska, a grayscale portrait, and a wireframe amber instrument. The page reads as a lit control room; each project is an exhibit, not a card.

Shader (Mobbin) is the binding reference: the near-black stage, large editorial serif over a scene, chromatic aberration instead of gradient, small uppercase navigation with one bordered action, and sections that alternate dark exhibits with one inverted chapter.

- About hero: <https://mobbin.com/sites/sections/55940443-b601-4f42-a9ff-1c31f5b48885>
- CRT / light chapter: <https://mobbin.com/sites/sections/db7ca27c-ff93-4469-9cb3-2a965439b122>
- Contact: <https://mobbin.com/sites/sections/b3a90496-c0c1-4123-b206-d5fda20f0c42>
- Footer: <https://mobbin.com/sites/sections/90f14e56-2133-4493-8249-8c4b284c06d8>

The build diverges from the direction draft in four places: hero type is `clamp(4rem, 15vw, 12.5rem)`; project media uses a 1.03 image scale and 2.5° tilt rather than a clip-path shutter; there is no 12-column wall, only a two-column grid with one full-width featured exhibit; the footer closes with a full-width wordmark cropped by the bottom edge. No dashed rules ship.

**Key characteristics:** dark-first canvas; warm bone ink; one amber signal; Boska display against Switzer text; flat exhibits separated by air and hairlines; an inverted contact chapter; quiet, deferred motion.

## 2. Colors

Dark is the primary theme. Light is a complete alternate. The only structural inversion is the contact chapter.

### Dark (primary)

| Token | HSL | Hex | Role |
|---|---|---|---|
| `--canvas` | `60 4% 3%` | `#080807` | Page background, footer |
| `--surface-raised` | `45 5% 8%` | `#151513` | Portrait shell, media fallback, cards/popovers |
| `--surface-soft` | `45 5% 6%` | `#10100f` | Tinted bands and signal strip |
| `--ink` | `39 29% 93%` | `#f2efe8` | Headings and primary text |
| `--ink-muted` | `37 9% 60%` | `#a29b90` | Descriptions, metadata, tags |
| `--caption-color` | `37 9% 65%` | `#aea89e` | Footer captions and legal line |
| `--hairline` | `43 8% 15%` | `#292823` | Borders and dividers |
| `--signal` | `36 78% 57%` | `#e7a23c` | Primary action, status, metrics, focus |
| `--signal-ink` | `45 10% 4%` | `#0b0b09` | Text on amber |

### Light

| Token | HSL | Hex | Role |
|---|---|---|---|
| `--canvas` | `40 20% 93%` | `#f1eeea` | Page background, footer |
| `--surface-raised` | `40 16% 89%` | `#e7e4de` | Portrait shell, media fallback, tinted bands |
| `--surface-soft` | `40 16% 89%` | `#e7e4de` | Tinted bands and signal strip |
| `--ink` | `45 10% 6%` | `#11100e` | Headings and primary text |
| `--ink-muted` | `40 6% 34%` | `#5c5851` | Descriptions, metadata, tags |
| `--caption-color` | `40 6% 34%` | `#5c5851` | Footer captions and legal line |
| `--hairline` | `40 8% 82%` | `#d5d2cd` | Borders and dividers |
| `--signal` | `36 72% 31%` | `#885a16` | Primary action, status, metrics, focus |
| `--signal-ink` | `40 20% 93%` | `#f1eeea` | Text on amber |

`card`/`popover` are `#f7f5f3` light and `#151513` dark; `muted` is `#e4e2dd` light and `#1b1a18` dark. Tailwind utilities are aliases over these HSL channels in `@theme inline`.

### Inverted contact chapter

| Theme | `--inverted-bg` | `--inverted-ink` | `--inverted-accent` |
|---|---|---|---|
| Light theme (dark chapter) | `40 9.677419% 6.078431%` / `#11100e` | `42 27.777778% 92.941176%` / `#f2efe8` | `35.789474 78.082192% 57.058824%` / `#e7a23c` |
| Dark theme (light chapter) | `42 27.777778% 92.941176%` / `#f2efe8` | `40 9.677419% 6.078431%` / `#11100e` | `35.172414 72.5% 31.372549%` / `#8a5a16` |

Header glass is `rgb(241 238 234 / 0.82)` light and `rgb(8 8 7 / 0.78)` dark, with a `rgb(242 239 232 / 0.12)` dark border and `rgb(242 239 232 / 0.95)` dark text. The header CTA is a hairline-bordered ink action (transparent background, `--hairline` border, `--ink` text) in both themes; the hero CTA carries the amber signal. Hero CTA: `#885a16` on light, hover `#744c13`, label `#f1eeea`; `#e7a23c` on dark, hover `#efb45a`, label `#0b0b09`.

**The No Violet Rule.** The interface uses no violet or purple: no violet tokens, purple gradients, or gradient blobs. Project screenshots are evidence and may contain any color; never sample them into UI chrome.

**The Signal Scarcity Rule.** Amber is a signal, not a surface. Use it for the primary action, availability/status dots, metric values, active indicators, and focus. Never fill a large panel with it.

**The Inverted Chapter Rule.** Only contact inverts the theme: dark theme gets the bone field, light theme gets near-black. Footer returns to `--canvas`.

## 3. Typography

- **Display:** Boska 400/500, normal and italic, Fontshare provider, fallback Georgia/serif, `--font-boska`, loaded with `font-display: swap` and metric-matched fallbacks; not preloaded (keeps the LCP image from competing with font requests). Weight 500 carries display.
- **Text:** Switzer 400/500/600, Fontshare provider, fallback system-ui/-apple-system/sans-serif, `--font-switzer`, loaded with `font-display: swap` and metric-matched fallbacks; not preloaded.
- **Code:** JetBrains Mono 400/500, Fontsource provider, fallback monospace, `--font-jetbrains-mono`, not preloaded.

| Step | Size | Use |
|---|---|---|
| Display | `clamp(4rem, 15vw, 12.5rem)` (64–200px), weight 500, leading 0.82 | Hero name only; line breaks as "Sebastian" / "Bravo" |
| Section | `clamp(2.75rem, 6vw, 5.375rem)` (44–86px), leading 0.95 | Section titles; contact uses `clamp(2.75rem, 8vw, 5.375rem)` italic; footer name `clamp(2.5rem, 6vw, 5.375rem)` |
| 43px | `2.6875rem` (`--text-3xl`) | Project outcomes title; contact links at `md` |
| 21px | `1.3125rem` (`--text-lg`/`xl`/`2xl`) | Project titles, experience role/company, blog titles, about lede/signature, contact links at base, timeline note |
| 17px | `1.0625rem` (`--text-base`) | Body, descriptions, metric values, certification names, blog descriptions, prose |
| 13px | `0.8125rem` (`--text-xs`) | Nav, meta, tags, buttons, status, dates, certification organization/link, footer |
| Code | `0.8125rem` | `code` and `pre` only |

Display tracking is `-0.03em`; nav and header CTA are uppercase at `0.12em`; all other labels and body stay at normal tracking. Leading: hero 0.82; section/contact/footer 0.95; project titles and outcomes 1.05; experience role and blog title 1.25; body 1.6; about copy 1.65; article prose 1.75.

**The Two-Family Rule.** Boska is the only display face and Switzer the only text face. JetBrains Mono appears only on `code`/`pre`; project tags, metrics, labels, nav, and buttons are Switzer.

**The Surface Scale Rule.** Public surfaces resolve to 13/17/21/43/86/200. Article prose may step to 20/28 for `h3`/`h2`; do not introduce new display sizes elsewhere.

## 4. Layout

- **Columns:** shared sections and header/footer max `1200px`; hero inner max `90rem` (1440px); blog index `900px`; signal strip `1280px`.
- **Band rhythm:** `SectionBand` is full width with `16px` side padding and `clamp(4.25rem, 7vw, 7rem)` (68–112px) vertical padding. Section titles have `48px` bottom margin. Anchors reserve `scroll-margin-top: 6–7rem` for the fixed header.
- **Section order:** Hero → Projects (canvas) → Signal strip (`surface-soft`) → Experience (tinted `surface-soft`) → Education (canvas) → Certifications (tinted) → About (canvas) → Contact (inverted) → Footer (canvas).
- **Hero:** `92svh` minimum on mobile, `100svh` from `768px`; single column below `768px`, then `1.6fr / 1fr` with `2rem` gap. Inner padding `8rem` top, `6rem` bottom, `clamp(1.25rem, 4vw, 4rem)` sides. Copy sits left; portrait is a `4/5` frame, right-aligned, max `26rem`, grayscale at contrast 1.08. Decorative layers: `88px` grid at 3.5% ink, 2.5% grain, an amber glow of `min(45vw, 36rem)` blurred `100px` at 8%, an orbit ellipse at 20% signal, and a 24px crosshair at 35% signal. All are `aria-hidden` and pointer-transparent. A CRT scanline overlay and a slow glitch on the chromatic pseudo-layers sit above the stage; the `<h1>` itself never animates.
- **Work wall:** one column below `768px`, two columns above with `48px` gaps. The featured exhibit spans both columns. Media is `8/5`; featured media is `8/5` on mobile and `2/1` at `md`. No 12-column grid ships.
- **Contact:** inverted band; content grid is one column, then `0.85fr / 1.15fr` with `48px` gap and `70svh` minimum height. The right link column adds `80px` top padding at `md`; the resume row spans both columns.
- **Footer:** `1200px`, `64px` top margin, `48px` vertical padding, name link above a wrapping row of 13px legal, social, and nav links.
- **Breakpoints:** `768px` (hero split, work wall, contact split, certifications two columns), `1024px` (desktop nav), `1200px` container. Verify at 375, 768, 1024, and 1440.

**The Flat Exhibit Rule.** Work, experience, certifications, blog, and about sit directly on the canvas with no card box, border, or resting shadow. The fixed header and transient menus are the only boxed surfaces.

## 5. Components

**Header and navigation.** Fixed, pointer-transparent shell; nav max `1200px`, `min-height: 56px`, `8/12px` top margin, `13.6px`/`16px` radius, glass background, `1px` hairline border at 85–90%, `blur(16px)` and `saturate(1.35)`, no resting shadow. Brand is a `1.9rem` SB mark plus the name from `sm`; links are 13px uppercase at `0.12em`, `8px` radius, with a moving primary-tinted indicator (`primary/9%` fill, `primary/16%` inset ring). Route links use a `2px` signal underline. Header CTA is a 13px uppercase hairline-bordered ink action; LinkedIn shows at `xl` and CV at `sm`, both 13px on `card/45`; theme/language buttons are `44px`. Below `1024px`, a dropdown holds the mobile links with `8px` radius, card background, and a transient shadow.

**Buttons and links.** Hero CTA: 13px/600, `min-height: 44px`, `12px 24px`, `2px` radius, amber with `#f1eeea`/`#0b0b09` label, `180ms` background transition. Header CTA: 13px/600 uppercase, `8px` radius, `12px 8px`, amber `#e7a23c`/`#0b0b09`, with a `6px` dot. Text actions are 13px underlined with `4px` offset and `44px` minimum height: case-study links use `--primary`, external project links `--ink-muted`, certificate links `--signal`. The shared `Button` primitive is reserved for inner pages: 44px height, `8px` radius, semantic token variants, active scale 0.95.

**Project exhibits.** No box, border, or shadow. Title is Boska 21px/1.05 at `-0.03em`; status is a 13px muted line with a `6px` amber dot; description is 17px, max `60ch`; metrics pair a 13px muted label with a 17px amber value; tags are 13px separated by middots. Media is AVIF/WebP at 800/1600 widths, lazy, `object-top`; the project title sits behind the screenshot as a fallback. Hover/focus-within scales the image 1.03 over `700ms ease-out`, turns the title amber, and adds a `2.5°` pointer tilt on fine pointers.

**Experience rows.** Timeline note 21px, max `60ch`; list has `24px` left padding and a `2px` signal progress line. Each row is `minmax(10rem, 1fr) / 3fr` with `48px` gap and `48px` bottom padding. Meta is 13px muted; role is Boska 21px; company is 21px `--primary`; description 17px, max `60ch`; highlights pair 13px labels with 17px amber values; skills are 13px middot-separated. No card-in-card.

**Certifications grid.** One column, two columns from `md`, `48px` column gap and `40px` row gap. Category is 13px muted; name is 17px semibold; organization is 13px muted; certificate link is 13px `--signal` underlined. Flat presentation, no category badge or colored chip.

**Blog cards.** Index is `900px`, one column then two from `md`, `40px` gap. Each card is one link with no box: 16:9 grayscale image, 13px tags/date, Boska 21px title at `-0.03em`, 17px description; hover/focus turns the title amber. Article prose is 17px/1.75; `h2` is Boska 21→28px, `h3` Boska 20px, code 13px mono. Keep a 60–70ch measure.

**Contact and footer.** Contact heading is italic Boska `clamp(2.75rem, 8vw, 5.375rem)` with an `8px` availability dot in the inverted accent. Links are Switzer 21px, 43px from `md`, in the inverted accent with an arrow; descriptions are 17px. The CV row uses a 44px target. Footer puts the legal line, social links, and nav row above the wordmark; the name is the last element at `clamp(3.5rem,12.5vw,11rem)`, `white-space: nowrap`, leading 0.78, cropped by the footer's bottom edge. No dashed rules.

## 6. Motion

- **Baseline reveal:** `[data-animate]` starts at `opacity: 0`, `translateY(1.4rem)`, and resolves over `650ms cubic-bezier(0.16, 1, 0.3, 1)` once, via `IntersectionObserver` at threshold 0.08 and `-8%` bottom margin. Only elements within 1.1 viewport heights are pre-hidden.
- **Deferred enhancement:** GSAP/ScrollTrigger and Three.js load after `load`, two animation frames, and an idle callback (timeout 1500ms; 200ms fallback). Activation starts when the hero is within 200px or on pointer/focus/touch. Startup is bounded at 3s inline / 4s controller.
- **Hero handoff:** only `.hero-art-frame`, `.hero-actions`, and `.hero-meta` move; they translate to `-3.25rem` and opacity 0, scrubbed 0.5 from hero top to 30% viewport. The `<h1>` is excluded.
- **Work wall:** cards start at `--motion-y: 1.2rem`, `scale: 0.985`, then resolve with `0.9s power2.out`, `0.09` stagger, scrubbed 0.75 between section top at 88% and 36% viewport. Card transform transition is `350ms` with the same cubic-bezier.
- **Pointers:** hero frame tilts ±4.5° (`0.55s power3.out`); cards tilt ±2.5° (`0.45s power3.out`); the hero CTA magnetizes up to `7px`. Fine pointers only.
- **WebGL:** one Three.js scene: 78 points desktop / 42 compact, amber points and wireframe icosahedron (`#e7a23c`), warm-white lines (`#f2efe8`), plus an isometric wireframe workstation (floor grid, desk, monitor, chair, floating cubes) in amber and bone, additive blending, 30fps cap, pixel ratio ≤1.5/1.2, paused offscreen and on hidden tabs. Eligibility: WebGL2 available, no touch points, no Save-Data/2G, `deviceMemory >= 2`, reduced motion off. The canvas is `aria-hidden`, pointer-transparent, opacity 0.5, screen blend.
- **Signal strip:** static stack band; technologies wrap in a flex row with no animation and no pause control.
- **Reduced motion:** no GSAP, ScrollTrigger, Flip, or WebGL chunks are fetched; CSS forces all reveals visible, removes transforms/transitions, hides the WebGL canvas, and leaves the static stack band unchanged. Theme icons and nav indicators become instantaneous.

**The LCP Stillness Rule.** The hero `<h1>` never animates and never receives inline opacity, filter, transform, or animation styles. It is the LCP; motion starts after it can paint.

**The LCP Competition Rule.** The portrait is `loading="eager"`, `fetchpriority="high"` and `decoding="sync"`; fonts are not preloaded and the frame transform applies on hover only, so the LCP image does not compete with font requests or enhancement work.

**The Enhancement Rule.** Content is complete without JS. Motion may decorate reading, never gate it.

## 7. Accessibility

- **Contrast:** dark `#f2efe8` on `#080807` 17.45:1; dark muted `#a29b90` 7.28:1; dark amber `#e7a23c` 9.19:1. Light `#11100e` on `#f1eeea` 16.44:1; light muted `#5c5851` 6.11:1; light amber `#885a16` 5.16:1. Inverted dark chapter: `#f2efe8` on `#11100e` 16.56:1, `#e7a23c` 8.72:1. Inverted light chapter: `#11100e` on `#f2efe8` 16.56:1, `#8a5a16` 5.14:1. Header CTA `#0b0b09` on `#e7a23c` 9.03:1.
- **Focus:** `2px` solid `--primary`, `2px` offset, via the `focus-ring` utility. The inverted contact chapter overrides the ring to `--inverted-accent`.
- **Keyboard:** skip link visible on focus; `aria-current="page"` on route links; mobile dropdown uses `aria-expanded`/`aria-controls` and returns focus; all actions have a `44px` minimum target.
- **Semantics:** nav and section labels are localized; the hero `<h1>` carries an explicit "Sebastian Bravo" label; decorative canvas, glyph arrows, dots, and grain are `aria-hidden`; the surname chromatic layers are decorative pseudo-elements.
- **Reduced motion:** honored in CSS, in the deferred loader, and in the signal strip; static content is always visible.
- **i18n:** Spanish is default at `/`, English mirrored at `/en`; all translatable copy comes from `getTranslations(locale)` with key parity in `src/lib/i18n/es.json` and `en.json`. Dates, mail subject, and sr-only labels localize. Proper nouns and the name stay literal.
- **Theme:** dark is the default when no preference is stored; light and system are complete, with an inline pre-paint bootstrap to prevent a theme flash.

## 8. Constraints

- **CSP:** `font-src 'self' data:`; `style-src 'self' 'unsafe-inline'`; `script-src 'self'` plus exact hashes; `script-src-attr 'none'`. Never edit hashes in `vercel.json` by hand. Review reported changes, then run `pnpm update:csp:write`; `pnpm build` verifies parity.
- **Fonts:** all self-hosted through the Astro Fonts API. Boska/Switzer use Fontshare, JetBrains Mono uses Fontsource. Manrope and Syne were removed after the redesign; only Boska, Switzer, and JetBrains Mono are configured. Do not add a remote font.
- **Stylesheets:** `global.css` imports exactly five: `portfolio-base.css`, `portfolio-hero.css`, `portfolio-content.css`, `portfolio-responsive.css`, `header.css`. Put global tokens in `portfolio-base.css`, header tokens in `header.css`; do not add a sixth global stylesheet. Scoped component `<style>` blocks remain allowed.
- **Bundle:** every JS chunk in `dist/_astro` must stay ≤600 KiB raw and ≤150 KiB gzip. The lazy WebGL chunk is about 523 KiB raw / 129 KiB gzip. Keep `three@0.185.1` and `gsap@3.15.0`; do not add a new visual dependency.
- **Source limits:** `.astro` 250 lines, `.ts` 300, `.css` 1500. Exceptions in `scripts/check-source-limits.ts`: `src/layouts/Layout.astro` and `src/components/LocalizedPrivacy.astro`.
- **Copy:** no hardcoded translatable strings. Use `getTranslations(locale)` and keep `es.json`/`en.json` key parity. Code comments are Spanish; identifiers, commits, and documentation are English.
- **Assets:** project screenshots are the only saturated color fields; use the existing optimized image pipeline. Icons are inline SVG or typographic arrows, never emoji or an icon font.

## 9. Do's and Don'ts

**Do**
- Use the dark canvas as the primary world and keep light a complete alternate.
- Use Boska 500 for display and Switzer for all text; keep the six-step surface scale.
- Keep the hero `<h1>` static and let the portrait, grid, and amber glow carry the stage.
- Keep amber as a small signal and shift its lightness per surface to preserve 4.5:1.
- Let project screenshots supply color and let whitespace separate exhibits.
- Keep surfaces flat, borders hairline, and depth limited to the header and transient menus.
- Keep all interactive targets at least 44px and visible focus rings.
- Route every translatable string through i18n and preserve reduced motion.

**Don't**
- Don't introduce violet or purple into UI chrome, gradients, or accents; screenshots are exempt.
- Don't use decorative gradient fills or gradient blobs; functional grid lines and mask gradients are allowed.
- Don't wrap content in cards, add resting shadows, or nest card-in-card.
- Don't use JetBrains Mono outside code, and don't use it for nav, labels, tags, or metrics.
- Don't use emoji, icon fonts, or glyph icons; use inline SVG or the existing typographic arrows.
- Don't add eyebrow labels, kickers, or decorative numbering above headings.
- Don't animate, filter, transform, or inline-style the hero LCP heading.
- Don't add a sixth global stylesheet, a remote font, or a new visual dependency.
- Don't hand-edit CSP hashes or hardcode translatable copy.

## 10. Verification and current gates

```bash
pnpm check          # astro check
pnpm test           # vitest run
pnpm build          # check + verify:limits + build:static + verify:bundle + verify:csp
pnpm test:e2e       # Playwright, including accessibility checks
pnpm format:check   # Prettier contract
pnpm validate:links # project link validation
```

- `tests/design-tokens.test.ts` pins the semantic hex values and 4.5:1 pairs; `tests/contrast.test.ts` pins the hero faint/accent tokens. Do not change either contract without explicit approval.
- `verify:limits` enforces the source line limits; `verify:bundle` enforces 600/150 KiB per JS chunk; `verify:csp` enforces hash parity.
- Motion and WebGL contracts live in `tests/hero-webgl.test.ts`, `tests/motion-environment.test.ts`, `tests/motion-load-order.test.ts`, and the motion Playwright specs. Localization parity is covered by `tests/ui-copy-localization.test.ts` and its spec.
- CI runs the same check/test/build gates. Visual changes require a real-browser look at 375, 768, 1024, and 1440 in both themes.
