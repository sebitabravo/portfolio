# Design System — sebastianbravo.dev (Resolución, shipped state)

> **Status note.** This file now captures the system **actually shipped in `src/styles/`** — the Resolución port. The frozen design record stays in [`design/resolucion/DESIGN.md`](resolucion/DESIGN.md) §3 plus `design/resolucion/resolucion.css`; `src/styles/tokens.css` is the only token source. Values are copied verbatim; nothing here is proposed or invented, and every row cites `path:line`.

Record of the tokens and rules that exist in the sources today. Dark is the default theme (`color-scheme: dark` on `:root`, `data-theme="dark"` on `<html>`); both themes are the same palette, black and white — declared statically per theme in `src/styles/tokens.css` and refined to `light-dark()` pairs inside one `@supports` block when the engine supports it. There is no accent colour: identity is carried by the pixel faces, the 8px squares and the `steps()` motion.

## 1. Colours (`src/styles/tokens.css`)

The palette is six tokens declared **statically per theme**: `:root` carries the dark values (`src/styles/tokens.css:67-72`), `:root[data-theme="light"]` the light ones (`src/styles/tokens.css:91-99`), and `:root[data-theme="dark"]` re-asserts dark (`src/styles/tokens.css:100-102`). One `@supports (color: light-dark(#ffffff, #000000))` block re-declares the six pairs with `light-dark()` in `:root`, so supported engines additionally follow the OS preference while `[data-theme="light"]` keeps winning by specificity (`src/styles/tokens.css:104-115`). Without that support the static layer is the whole story: dark by default, independent of the OS, light by attribute. A head script applies the persisted value before paint (`src/layouts/Layout.astro:69,144-162`).

| Token | Value | Usage | Source |
|---|---|---|---|
| `color-scheme` | `dark` (`:root` default), `light` on `[data-theme="light"]`, `dark` on `[data-theme="dark"]` | Which side of each `light-dark()` pair resolves | `src/styles/tokens.css:63,92,101` |
| `--bg` | dark `#000000` (static on `:root`), light `#ffffff`; refined to `light-dark(#ffffff, #000000)` inside `@supports` | Canvas. True black / pure white, never tinted | `src/styles/tokens.css:67,93,108` |
| `--fg` | dark `#ffffff`, light `#000000`; `light-dark(#000000, #ffffff)` | Primary text, display | `src/styles/tokens.css:68,94,109` |
| `--fg-muted` | dark `#a1a1a1`, light `#5c5c5c`; `light-dark(#5c5c5c, #a1a1a1)` | Secondary text | `src/styles/tokens.css:69,95,110` |
| `--fg-faint` | dark `#8a8a8a`, light `#6b6b6b`; `light-dark(#6b6b6b, #8a8a8a)` | Meta, dates, labels | `src/styles/tokens.css:70,96,111` |
| `--line` | dark `#262626`, light `#e5e5e5`; `light-dark(#e5e5e5, #262626)` | Row dividers (structure, not decoration) | `src/styles/tokens.css:71,97,112` |
| `--fill` | dark `#141414`, light `#f2f2f2`; `light-dark(#f2f2f2, #141414)` | Row hover, toggle hover, image placeholder, code fill | `src/styles/tokens.css:72,98,113` |

`::selection` is inverted fg on bg (`src/styles/base.css:65-68`), and disabled states switch to `--fg-faint`/`--line` instead of using opacity, because opacity would invent greys that do not exist in the palette (`src/styles/components.css:213-234`).

## 2. Typography (`src/styles/tokens.css`, `src/styles/base.css`, `src/styles/prose.css`)

### Vendored font faces

All self-hosted as woff2 under `public/fonts/`, declared in `src/styles/tokens.css:5-42`. The faces are **subsetted to the codepoints the site actually renders**: the ranges live in `scripts/font-subset.json:2-4` (ASCII + Latin-1 for Spanish, dashes, ellipsis, arrows, `≥`, `●` — emoji falls back to the system font) and the subset is reproducible with `scripts/subset-fonts.py:1-13`, which fails if it would drop a glyph or move an advance (0 drift, 0 dropped glyphs). The seven files went from 233,820 B to 87,352 B (-63%); bytes below are the subsetted files in `public/fonts/`.

| Family | Weights / styles | Bytes | Role | Source |
|---|---|---|---|---|
| `Geist Pixel` (Square) | 400 | 5,832 | Display: name, section titles, project titles, contact email | `src/styles/tokens.css:5-9` |
| `GP Line` | 400 | 7,580 | Resolve shape 1 (s0), only during the resolve animation | `src/styles/tokens.css:10-14` |
| `GP Triangle` | 400 | 14,444 | Resolve shape 2 (s1) | `src/styles/tokens.css:15-19` |
| `GP Grid` | 400 | 14,972 | Resolve shape 3 (s2) | `src/styles/tokens.css:20-24` |
| `GP Circle` | 400 | 14,764 | Resolve shape 4 (s3) | `src/styles/tokens.css:25-29` |
| `Geist Mono` | 400, 500 | 14,704 + 15,056 | Everything that is not display | `src/styles/tokens.css:30-41` |

No serif, no Geist Sans. The four `GP *` shape faces (51,760 B subsetted) are **not part of the first paint**: `shapesReady` (`src/scripts/resolve.ts:61-66`) only schedules the shape-font load through `idle` when motion is active — with reduced motion or Save-Data it resolves `false` and no shape font downloads. Every Geist Pixel shape has the identical advance (0.5776em), so swapping shape per letter never moves the cell (`src/styles/base.css:113-125`).

### Metric-matched fallbacks

Two `@font-face` overrides keep the swap from moving layout, with values measured with fontTools over `fonts/GeistMono-Regular.woff2` and each local face:

| Family | src | Overrides | Source |
|---|---|---|---|
| `Geist Mono Fallback` | `local("Menlo"), local("Menlo-Regular")` | `size-adjust: 99.66%`, `ascent-override: 100.84%`, `descent-override: 29.6%`, `line-gap-override: 0%` | `src/styles/tokens.css:45-52` |
| `Geist Mono Fallback CN` | `local("Courier New"), local("CourierNewPSMT")` | `size-adjust: 99.98%`, `ascent-override: 100.52%`, `descent-override: 29.5%`, `line-gap-override: 0%` | `src/styles/tokens.css:53-60` |

### Family tokens

| Token | Value | Usage | Source |
|---|---|---|---|
| `--mono` | `"Geist Mono", "Geist Mono Fallback", "Geist Mono Fallback CN", ui-monospace, "SF Mono", Menlo, monospace` | Body, UI, prose | `src/styles/tokens.css:74` |
| `--pixel` | `"Geist Pixel", ui-monospace, "SF Mono", Menlo, monospace` | Display faces | `src/styles/tokens.css:75` |

### Type scale

| Token | Value | Usage | Source |
|---|---|---|---|
| `--fs-body` | `15px` (line height `24px`) | Body default: `font: 400 var(--fs-body)/24px var(--mono)` | `src/styles/tokens.css:87`; `src/styles/base.css:17` |
| `--fs-small` | `13px` (line height `20px` via `.small`) | Buttons, chips, labels, meta | `src/styles/tokens.css:88`; `src/styles/base.css:97-100` |
| `--fs-h2` | `clamp(2.5rem, 6vw, 5rem)` (line height `1`) | Section titles, Pixel, `white-space: pre` | `src/styles/tokens.css:89`; `src/styles/base.css:130-137` |

Off-scale sizes live in the components, not in tokens: h1 `min(15rem, calc((100vw - 2 * var(--gutter)) / 5.3), calc((100svh - 22rem) / 1.8))` with line-height `0.9`, preceded by an identical `100vh` fallback declaration (`src/styles/layout.css:47-57`); index/hub rows Pixel `1.5rem`/`32px` (`src/styles/layout.css:147-153`; `src/styles/components.css:421-424`); metrics `clamp(1.5rem, 6vw, 2rem)` (`src/styles/components.css:341-346`); contact email `min(8rem, calc((100vw - 2 * var(--gutter)) / 11.6))` (`src/styles/components.css:372-381`).

### Prose override

The long-reading surface is the only place with its own scale: at 44rem, 15px mono gave ~78 characters per line, 17px lands at ~69 and keeps the mono identity (`src/styles/prose.css:148-150`).

| Token | Value | Usage | Source |
|---|---|---|---|
| `.prose` size / leading | `font-size: 17px`, `line-height: 30px` | Articles, privacy, long reading | `src/styles/prose.css:151-154` |

## 3. Spacing and layout devices (`src/styles/tokens.css`, `src/styles/base.css`, `src/styles/layout.css`)

| Token / device | Value | Usage | Source |
|---|---|---|---|
| `--gutter` | `16px`, `32px` at `min-width: 720px` | Wrap padding, column gaps | `src/styles/tokens.css:78,119-123` |
| `--page` | `90rem` (1440px) | Page frame max width | `src/styles/tokens.css:79` |
| `--header` | `64px` | Header min-height and every sticky/scroll offset (`calc(var(--header) + 24px)`) | `src/styles/tokens.css:80`; `src/styles/base.css:11`; `src/styles/layout.css:106-110` |
| `.wrap` | `max-width: var(--page)`, `margin-inline: auto`, `padding-inline: var(--gutter)` | Every section | `src/styles/base.css:91-96` |
| Section rhythm | `padding-block: 64px` (96px ≥720px), `--line` top border | Sections | `src/styles/layout.css:6-14` |
| CV row grid | `10rem minmax(0, 40rem)` columns, `32px` column gap ≥720px; one column below | Label + content rows | `src/styles/components.css:237-252` |
| 8px unit | No token: the 8px unit is literal across the 8px squares, hit-area padding and gaps | Nominal unit | `src/styles/components.css:71-81,260-267`; `src/styles/layout.css:132-140` |

The 8px grid governs the small geometry everywhere: 8px squares (nav indicator `src/styles/components.css:71-81`, row mark `src/styles/components.css:260-267`, index indicator `src/styles/layout.css:132-140`, `.dot` `src/styles/components.css:95-101`), 8px hit-area padding, 8px gaps.

## 4. Radius

None. There is no `border-radius` declaration in `src/styles/` (verified: zero matches across all seven files). Every corner is square — buttons, chips, tabs, rows, screenshots, code blocks. The radius section of the retired system has no successor and no token.

## 5. Shadows

None. There is no `box-shadow` declaration in `src/styles/` (verified: zero matches across all seven files). Depth is carried by `--line` dividers and `--fill` hovers, not by elevation. The retired system's window shadows have no successor and no token.

## 6. Motion (`src/styles/tokens.css`, `src/styles/components.css`, `src/styles/layout.css`)

One grammar only, all `steps()`, no bezier curves in the UI.

| Token | Value | Usage | Source |
|---|---|---|---|
| `--t-feedback` | `80ms steps(4, end)` | Hover, colour change, indicator | `src/styles/tokens.css:81` |
| `--t-enter` | `480ms steps(8, end)` | One reveal per section | `src/styles/tokens.css:82` |
| `--dist` | `8px` | Reveal travel distance | `src/styles/tokens.css:83`; `src/styles/layout.css:446-449` |
| Press | `transform: translateY(2px)` on `:active`, shared by every boxed control (buttons, chips, tabs, nav, header controls, hub rows, email) | The control drops 2px; it does not darken | `src/styles/components.css:213-221` |
| View transitions | `@view-transition { navigation: auto }`, root group `240ms steps(6, end)` | Page-to-page dissolve | `src/styles/layout.css:455-461` |
| Reduced motion | `transition: none !important; animation: none !important` on everything under `prefers-reduced-motion: reduce` | Everything renders in its final state | `src/styles/layout.css:462-469` |

## 7. Component rules (`src/styles/components.css`, `src/styles/layout.css`, `src/styles/prose.css`, `src/styles/print.css`)

- **Header (`.site-header`, `src/styles/components.css:6-143`).** `--bg` background, 1px `--line` bottom, no glass, no blur. 64px min-height; sticky ≥720px, on mobile the nav is a second row and the header scrolls away; below 360px the five links wrap to a third line instead of overflowing (`src/styles/components.css:27-36`). Nav links and header controls rest at `--fg-muted`, hover to `--fg` on `--fill`; the active link (`aria-current`) reserves an 8px square in absolute left padding so the row never shifts (`src/styles/components.css:67-87`). Header toggles: sound switch (8px dot fills when checked, `src/styles/components.css:95-107`), `es/en`, theme (16px SVG half-square).
- **Buttons (`.btn`, `src/styles/components.css:146-180`).** 40px high, 1px `--fg` border, 13px/500, square corners, `--t-feedback` transitions. `primary` is filled fg-on-bg inverted; `ghost` inverts only on hover; `sm` is 32px with a `--line` border that turns `--fill` on hover. Five states: rest, hover (invert or `--fill`), press (`translateY(2px)`, `src/styles/components.css:213-221`), disabled (`--fg-faint` text, `--line` border, `--fill` background for `primary`, `pointer-events: none`, `src/styles/components.css:222-234`), focus (`:focus-visible` 2px `--fg` outline, 2px offset, `src/styles/base.css:61-64`).
- **Chip (`.chip`, `src/styles/components.css:183-202`).** 32px high, 1px `--line` border, 13px; hover to `--fill` with `--fg` border; `[aria-pressed="true"]` fills fg-on-bg; press and disabled as buttons.
- **CV row (`.row`, `src/styles/components.css:237-303`).** Top divider `--line`, `24px` block padding, label `13px` `--fg-faint` with `tabular-nums`, no hover. `.current` rows carry an 8px filled square before the dates (`src/styles/components.css:260-267`); the mark blinks in `480ms steps(2, end)` twice under `html.motion` (`src/styles/components.css:268-275`).
- **Tabs (`.index [role="tab"]`, `src/styles/layout.css:112-162`).** ≥64px rows, Pixel `1.5rem` title + 13px status, 8px square indicator at 40% opacity on hover and 100% when `aria-selected`; press `translateY(2px`).
- **Prose (`.prose`, `src/styles/prose.css:151-225`).** 17px/30px, `--fg-muted` body text (`src/styles/prose.css:158-161`), Pixel h2 at `1.75rem`/`36px` (`src/styles/prose.css:166-176`), square 6px list markers and `--fg-faint` counters (`src/styles/prose.css:195-219`), code in `--fill` (`src/styles/prose.css:220-225`), `1px solid --fg` blockquote rule (`src/styles/prose.css:264-268`), `--fg` links.
- **Print (`src/styles/print.css:4-132`).** `@page { size: A4; margin: 14mm }`; light theme forced (`:root[data-theme]` overridden too, `src/styles/print.css:9-13`); body `10pt`/`15pt`; nav, controls, screenshots, CTA and dot field hidden; the interactive stage replaced by a static list with full URLs printed; rows do not split across pages.

Signal scarcity: there is no signal colour. The only "accent" states are the inverted fg/bg fill and the 8px squares.

## 8. Support floor and degradation

`src/styles/resolucion.css:4-22` documents the support floor at the top of the layer entry point, and `src/scripts/compat.ts:1-5` the JS side: every modern API below is guarded or degrades without throwing. The build target is `astro.config.mjs:37` — `["chrome87", "edge88", "firefox78", "safari13.1"]`.

| Capability | Mechanism | Degradation | Source |
|---|---|---|---|
| Theme colours | Static per-theme declarations (dark on `:root`, light on `[data-theme="light"]`), refined to six `light-dark()` pairs inside one `@supports` block | Engines without `light-dark()` render the static layer: dark by default, independent of the OS; light by attribute | `src/styles/tokens.css:67-72,91-99,106-115` |
| `svh` | Identical `100vh` declaration immediately before the `100svh` one in the same rule | Engines without small-viewport units use classic viewport height | `src/styles/layout.css:54-55` |
| `aspect-ratio` | `@supports not (aspect-ratio: 16 / 10)`: the 16/10 box is held by `height: 0; padding-top: 62.5%`, image absolute-filled in prose | Box keeps its 16/10 shape via padding | `src/styles/layout.css:180-187`; `src/styles/prose.css:75-87` |
| Flex `gap` | `@supports not (gap: 1px)`: negative container margin + right/bottom margin per child reproduce `gap` over `flex-wrap`. Documented no-fallback exceptions: `.og .f`, `.nav-main`, `.lang` | Old engines lose only inter-item separation, replaced by margins; footer gains an extra bottom margin | `src/styles/layout.css:229-233`; `src/styles/components.css:134-143,347-356`; `src/styles/prose.css:39-48`; `src/styles/resolucion.css:12-15` |
| `IntersectionObserver` / `ResizeObserver` | Literal existence check before construction — `!("IntersectionObserver" in window)` — in each module | No active-section tracking (`header-nav` returns), sections reveal synchronously (`reveal`), no offscreen pause for the dot field; `ResizeObserver` is not used in shipped scripts, and the compat contract test pins the guard pattern for both constructors | `src/scripts/header-nav.ts:23`; `src/scripts/reveal.ts:39-42`; `src/scripts/dot-field.ts:87-94`; `tests/compat-contract.test.ts:168,222` |
| `Intl` timeZone | Clock formatter tries `America/Santiago`, retries without `timeZone`, returns `null` if `Intl` is absent | Clock stays on the prototype placeholder `--:--` | `src/scripts/hero.ts:12-30` |
| Clipboard | `navigator.clipboard.writeText` only with the API present and a secure context; otherwise a hidden `textarea` + `execCommand` fallback | Copy still works without the async Clipboard API | `src/scripts/clipboard.ts:4-16` |
| `requestIdleCallback` / `matchMedia` | All `matchMedia` goes through `safeMatchMedia` (try/catch, no-op listener list); `requestIdle` falls back to `setTimeout(fn, 200)` | Idle work (shape fonts, dot field) runs on a 200ms timer instead | `src/scripts/compat.ts:21-36,39-43` |
| Motion / Save-Data | `motion()` requires the `html.motion` boot class AND not reduced-motion AND not Save-Data; the inline head script gates `motion`/`ambient` on `prefers-reduced-motion`, `navigator.connection.saveData` and fine pointer; CSS kills every transition/animation under the media query | Reduced motion or Save-Data: no animation, content in final state, shape fonts never download | `src/scripts/resolve.ts:14-19`; `src/layouts/Layout.astro:155-160`; `src/styles/layout.css:462-469` |
| Build target | Vite build `target: ["chrome87", "edge88", "firefox78", "safari13.1"]` | No `esnext`-only syntax ships to old engines | `astro.config.mjs:37` |
