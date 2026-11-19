# Design System — sebastianbravo.dev (Resolución, shipped state)

> **Status note.** This file now captures the system **actually shipped in `src/styles/`** — the Resolución port. The frozen design record stays in [`design/resolucion/DESIGN.md`](resolucion/DESIGN.md) §3 plus `design/resolucion/resolucion.css`; `src/styles/tokens.css` is the only token source. Values are copied verbatim; nothing here is proposed or invented, and every row cites `path:line`.

Record of the tokens and rules that exist in the sources today. Dark is the default theme (`color-scheme: dark` on `:root`, `data-theme="dark"` on `<html>`); both themes are the same palette, black and white, resolved through `light-dark()`. There is no accent colour: identity is carried by the pixel faces, the 8px squares and the `steps()` motion.

## 1. Colours (`src/styles/tokens.css`)

The whole palette is six `light-dark()` pairs, resolved by `color-scheme`. Dark is the default independent of the OS preference; `data-theme="light"` / `data-theme="dark"` re-point `color-scheme` (`src/styles/tokens.css:88-92`), and a head script applies the persisted value before paint (`src/layouts/Layout.astro:69-73,147`).

| Token | Value | Usage | Source |
|---|---|---|---|
| `color-scheme` | `dark` (`:root` default), `light` on `[data-theme="light"]`, `dark` on `[data-theme="dark"]` | Which side of each `light-dark()` pair resolves | `src/styles/tokens.css:63,88-92` |
| `--bg` | `light-dark(#ffffff, #000000)` — light `#ffffff`, dark `#000000` (the default) | Canvas. True black / pure white, never tinted | `src/styles/tokens.css:64` |
| `--fg` | `light-dark(#000000, #ffffff)` — light `#000000`, dark `#ffffff` | Primary text, display | `src/styles/tokens.css:65` |
| `--fg-muted` | `light-dark(#5c5c5c, #a1a1a1)` — light `#5c5c5c`, dark `#a1a1a1` | Secondary text | `src/styles/tokens.css:66` |
| `--fg-faint` | `light-dark(#6b6b6b, #8a8a8a)` — light `#6b6b6b`, dark `#8a8a8a` | Meta, dates, labels | `src/styles/tokens.css:67` |
| `--line` | `light-dark(#e5e5e5, #262626)` — light `#e5e5e5`, dark `#262626` | Row dividers (structure, not decoration) | `src/styles/tokens.css:68` |
| `--fill` | `light-dark(#f2f2f2, #141414)` — light `#f2f2f2`, dark `#141414` | Row hover, toggle hover, image placeholder, code fill | `src/styles/tokens.css:69` |

The system is flat: disabled states switch to `--fg-faint`/`--line` instead of using opacity, because opacity would invent greys that do not exist in the palette (`src/styles/components.css:189-197,207-221`). `::selection` is inverted fg on bg (`src/styles/base.css:58-61`).

## 2. Typography (`src/styles/tokens.css`, `src/styles/base.css`, `src/styles/prose.css`)

### Vendored font faces

All self-hosted as woff2 under `public/fonts/`, declared in `src/styles/tokens.css:4-43`.

| Family | Weights / styles | Role | Source |
|---|---|---|---|
| `Geist Pixel` (Square) | 400 | Display: name, section titles, project titles, contact email | `src/styles/tokens.css:4-8` |
| `GP Line` | 400 | Resolve shape 1 (s0), only during the resolve animation | `src/styles/tokens.css:10-14` |
| `GP Triangle` | 400 | Resolve shape 2 (s1) | `src/styles/tokens.css:16-20` |
| `GP Grid` | 400 | Resolve shape 3 (s2) | `src/styles/tokens.css:22-26` |
| `GP Circle` | 400 | Resolve shape 4 (s3) | `src/styles/tokens.css:28-32` |
| `Geist Mono` | 400, 500 | Everything that is not display | `src/styles/tokens.css:34-43` |

No serif, no Geist Sans. Every Geist Pixel shape has the identical advance (0.5776em), so swapping shape per letter never moves the cell (`src/styles/base.css:107-118`).

### Metric-matched fallbacks

Two `@font-face` overrides keep the swap from moving layout, with values measured with fontTools over `fonts/GeistMono-Regular.woff2` and each local face:

| Family | src | Overrides | Source |
|---|---|---|---|
| `Geist Mono Fallback` | `local("Menlo"), local("Menlo-Regular")` | `size-adjust: 99.66%`, `ascent-override: 100.84%`, `descent-override: 29.6%`, `line-gap-override: 0%` | `src/styles/tokens.css:46-52` |
| `Geist Mono Fallback CN` | `local("Courier New"), local("CourierNewPSMT")` | `size-adjust: 99.98%`, `ascent-override: 100.52%`, `descent-override: 29.5%`, `line-gap-override: 0%` | `src/styles/tokens.css:54-60` |

### Family tokens

| Token | Value | Usage | Source |
|---|---|---|---|
| `--mono` | `"Geist Mono", "Geist Mono Fallback", "Geist Mono Fallback CN", ui-monospace, "SF Mono", Menlo, monospace` | Body, UI, prose | `src/styles/tokens.css:71` |
| `--pixel` | `"Geist Pixel", ui-monospace, "SF Mono", Menlo, monospace` | Display faces | `src/styles/tokens.css:72` |

### Type scale

| Token | Value | Usage | Source |
|---|---|---|---|
| `--fs-body` | `15px` (line height `24px`) | Body default: `font: 400 var(--fs-body)/24px var(--mono)` | `src/styles/tokens.css:84`; `src/styles/base.css:17` |
| `--fs-small` | `13px` (line height `20px` via `.small`) | Buttons, chips, labels, meta | `src/styles/tokens.css:85`; `src/styles/base.css:90-94` |
| `--fs-h2` | `clamp(2.5rem, 6vw, 5rem)` (line height `1`) | Section titles, Pixel, `white-space: pre` | `src/styles/tokens.css:86`; `src/styles/base.css:124-133` |

Off-scale sizes live in the components, not in tokens: h1 `min(15rem, calc((100vw - 2 * var(--gutter)) / 5.3), calc((100svh - 22rem) / 1.8))` with line-height `0.9` (`src/styles/layout.css:46-58`); index/hub rows Pixel `1.5rem`/`32px` (`src/styles/layout.css:145-149`; `src/styles/components.css:421-424`); metrics `clamp(1.5rem, 6vw, 2rem)` (`src/styles/components.css:338-341`); contact email `min(8rem, calc((100vw - 2 * var(--gutter)) / 11.6))` (`src/styles/components.css:346-355`).

### Prose override

The long-reading surface is the only place with its own scale: at 44rem, 15px mono gave ~78 characters per line, 17px lands at ~69 and keeps the mono identity (`src/styles/prose.css:114-116`).

| Token | Value | Usage | Source |
|---|---|---|---|
| `.prose` size / leading | `font-size: 17px`, `line-height: 30px` | Articles, privacy, long reading | `src/styles/prose.css:117-120` |

## 3. Spacing and layout devices (`src/styles/tokens.css`, `src/styles/base.css`, `src/styles/layout.css`)

| Token / device | Value | Usage | Source |
|---|---|---|---|
| `--gutter` | `16px`, `32px` at `min-width: 720px` | Wrap padding, column gaps | `src/styles/tokens.css:75,98-101` |
| `--page` | `90rem` (1440px) | Page frame max width | `src/styles/tokens.css:76` |
| `--header` | `64px` | Header min-height and every sticky/scroll offset (`calc(var(--header) + 24px)`) | `src/styles/tokens.css:77`; `src/styles/base.css:11`; `src/styles/layout.css:104-108` |
| `.wrap` | `max-width: var(--page)`, `margin-inline: auto`, `padding-inline: var(--gutter)` | Every section | `src/styles/base.css:84-89` |
| Section rhythm | `padding-block: 64px` (96px ≥720px), `--line` top border | Sections | `src/styles/layout.css:9-20` |
| CV row grid | `10rem minmax(0, 40rem)` columns, `32px` column gap ≥720px; one column below | Label + content rows | `src/styles/components.css:222-236` |
| 8px unit | `--u: 8px` is declared but never referenced (see report) | Declared nominal unit | `src/styles/tokens.css:74` |

The 8px grid governs the small geometry everywhere: 8px squares (nav indicator `src/styles/components.css:67-76`, row mark `src/styles/components.css:245-252`, index indicator `src/styles/layout.css:130-136`, `.dot` `src/styles/components.css:105-110`), 8px hit-area padding, 8px gaps.

## 4. Radius

None. There is no `border-radius` declaration in `src/styles/` (verified: zero matches across all seven files). Every corner is square — buttons, chips, tabs, rows, screenshots, code blocks. The radius section of the retired system has no successor and no token.

## 5. Shadows

None. There is no `box-shadow` declaration in `src/styles/` (verified: zero matches across all seven files). Depth is carried by `--line` dividers and `--fill` hovers, not by elevation. The retired system's window shadows have no successor and no token.

## 6. Motion (`src/styles/tokens.css`, `src/styles/components.css`, `src/styles/layout.css`)

One grammar only, all `steps()`, no bezier curves in the UI.

| Token | Value | Usage | Source |
|---|---|---|---|
| `--t-feedback` | `80ms steps(4, end)` | Hover, colour change, indicator | `src/styles/tokens.css:79` |
| `--t-transition` | `240ms steps(6, end)` | Declared; view transitions consume the same values literally (see report) | `src/styles/tokens.css:80`; `src/styles/layout.css:403-406` |
| `--t-enter` | `480ms steps(8, end)` | One reveal per section | `src/styles/tokens.css:81` |
| `--dist` | `8px` | Reveal travel distance | `src/styles/tokens.css:82`; `src/styles/layout.css:391-398` |
| Press | `transform: translateY(2px)` on `:active`, shared by every boxed control (buttons, chips, tabs, nav, header controls, hub rows, email) | The control drops 2px; it does not darken | `src/styles/components.css:198-206` |
| View transitions | `@view-transition { navigation: auto }`, root group `240ms steps(6, end)` | Page-to-page dissolve | `src/styles/layout.css:400-406` |
| Reduced motion | `transition: none !important; animation: none !important` on everything under `prefers-reduced-motion: reduce` | Everything renders in its final state | `src/styles/layout.css:407-415` |

## 7. Component rules (`src/styles/components.css`, `src/styles/layout.css`, `src/styles/prose.css`, `src/styles/print.css`)

- **Header (`.site-header`, `src/styles/components.css:6-103`).** `--bg` background, 1px `--line` bottom, no glass, no blur. 64px min-height; sticky ≥720px, on mobile the nav is a second row and the header scrolls away. Nav links and header controls rest at `--fg-muted`, hover to `--fg` on `--fill`; the active link (`aria-current`) reserves an 8px square in absolute left padding so the row never shifts. Header toggles: sound switch (8px dot fills when checked), `es/en`, theme (16px SVG half-square).
- **Buttons (`.btn`, `src/styles/components.css:131-165`).** 40px high, 1px `--fg` border, 13px/500, square corners, `--t-feedback` transitions. `primary` is filled fg-on-bg inverted; `ghost` inverts only on hover; `sm` is 32px with a `--line` border that turns `--fill` on hover. Five states: rest, hover (invert or `--fill`), press (`translateY(2px)`, `src/styles/components.css:198-206`), disabled (`--fg-faint` text, `--line` border, `--fill` background for `primary`, `pointer-events: none`, `src/styles/components.css:207-221`), focus (`:focus-visible` 2px `--fg` outline, 2px offset, `src/styles/base.css:54-57`).
- **Chip (`.chip`, `src/styles/components.css:168-196`).** 32px high, 1px `--line` border, 13px; hover to `--fill` with `--fg` border; `[aria-pressed="true"]` fills fg-on-bg; press and disabled as buttons.
- **CV row (`.row`, `src/styles/components.css:222-287`).** Top divider `--line`, `24px` block padding, label `13px` `--fg-faint` with `tabular-nums`, no hover. `.current` rows carry an 8px filled square before the dates (`src/styles/components.css:245-252`); the mark blinks in `480ms steps(2, end)` twice under `html.motion` (`src/styles/components.css:253-260`).
- **Tabs (`.index [role="tab"]`, `src/styles/layout.css:110-155`).** ≥64px rows, Pixel `1.5rem` title + 13px status, 8px square indicator at 40% opacity on hover and 100% when `aria-selected`; press `translateY(2px)`.
- **Prose (`.prose`, `src/styles/prose.css:117-216`).** 17px/30px, `--fg-muted` body text, Pixel h2 at `1.75rem`/`36px`, square 6px list markers and `--fg-faint` counters, code in `--fill`, `1px solid --fg` blockquote rule, `--fg` links.
- **Print (`src/styles/print.css:4-132`).** `@page { size: A4; margin: 14mm }`; light theme forced (`:root[data-theme]` overridden too); body `10pt`/`15pt`; nav, controls, screenshots, CTA and dot field hidden; the interactive stage replaced by a static list with full URLs printed; rows do not split across pages.

Signal scarcity: there is no signal colour. The only "accent" states are the inverted fg/bg fill and the 8px squares.
