# Design System — Sebastian Bravo Portfolio
> Adapted from Superhuman's design language. Premium, confident, developer-forward.

## 1. Visual Theme & Atmosphere

A developer portfolio that feels like opening a precision tool — confident, restrained, every element intentional. By default, the hero uses a pale lavender gradient (`#f6f5ff` → `#eef0ff` → `#fbfcff`) with dark ink; `.dark` switches it to a dark-indigo gradient (`#10143a` → `#090d29` → `#050713`) with light text. Below, the same language continues through full-bleed lavender-neutral bands, glass surfaces and technical section markers instead of reverting to a flat resume canvas.

The typography is the voice: the hero title compresses to line-height 0.82 on desktop (0.84 on mobile) and section headings to 0.98, while body text breathes at 1.60. This tension — compressed authority vs. generous readability — defines the portfolio's rhythm.

The current experience layer adds controlled character instead of generic decoration: a floating glass navigation, orbital profile visual, technical signal strip, WebGL constellation and asymmetric project index. These elements are progressive enhancement; the content and routes remain usable without motion or WebGL support.

**Key Characteristics:**
- Light-first lavender grid hero with compressed dark-ink headlines; dark-indigo gradient and light text under `.dark`
- Cool white content canvas with charcoal ink text and alternating `#f4f3fa` bands
- Lavender glow (`#c7b7ff`) as the primary hero accent
- Floating glass navigation that resolves to a readable surface on scroll
- Orbital profile visual and ambient layers, disabled under reduced motion
- Optional Three.js constellation behind the portrait, loaded progressively when eligible with WebGL fallback
- GSAP/ScrollTrigger choreography, dynamically imported after hero proximity or interaction, for project entry, card tilt and project-scroll meter; native scroll remains authoritative
- Signal marquee for stack context and an asymmetric featured-project grid
- Project screenshots as primary visual content
- Generous whitespace, progressive density and recruiter-first CTAs

## 2. Color Palette

### Hero (Light by Default; Dark with `.dark`)
| Name | Hex | Role |
|---|---|---|
| Lavender Mist | `#f6f5ff` | Default hero gradient start |
| Lavender Haze | `#eef0ff` | Default hero gradient middle |
| Cool White | `#fbfcff` | Default hero gradient end |
| Dark Ink | `#171329` | Default hero text |
| Dark Indigo | `#10143a` | `.dark` hero gradient start |
| Indigo Night | `#090d29` | `.dark` hero gradient middle |
| Deep Night | `#050713` | `.dark` hero gradient end |
| Light Ink | `#f7f8ff` | `.dark` hero text |
| Lavender Glow | `#c7b7ff` | `.dark` hero accent |

### Light Mode (Content Sections)
| Name | Hex | Role |
|---|---|---|
| Pure White | `#ffffff` | Page canvas |
| Charcoal Ink | `#292827` | Headlines, primary text |
| Body Muted | `#5c5955` | Running body text |
| Caption | `#69645f` | Captions, metadata, labels on light surfaces (WCAG AA small text) |
| Warm Cream | `#e9e5dd` | Button backgrounds, subtle surfaces |
| Parchment Border | `#dcd7d3` | Card borders, dividers |
| Surface Soft | `#f4f3fa` | Alternating section background |
| Lavender Glow | `#cbb7fb` | Accent (consistent across modes) |
| Amethyst | `#714cb6` | Link text, interactive elements |
| Emerald Muted | `#4a9d6e` | "Available" badge, success states |

### Dark Mode (Full Dark Variant)
| Name | Hex | Role |
|---|---|---|
| Night Canvas | `#0f0f14` | Page background |
| Night Surface | `#1a1a22` | Card surfaces |
| Night Border | `#2a2a35` | Card borders |
| Night Text | `#e8e6e3` | Primary text |
| Night Muted | `#8a8780` | Secondary text |
| Warm Cream Dark | `#2a2826` | Button surfaces (dark variant) |

## 3. Typography

### Font Stack
- **Display & Headlines**: `Syne`, system-ui, sans-serif (weight 600–700, tight tracking)
- **Body & UI**: `Manrope`, system-ui, sans-serif (weight 400–700, normal tracking)
- **Code / Accent**: `'JetBrains Mono'`, monospace (used for tech labels, inline code, role badges)

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| Display Hero | `clamp(3.7rem, 8vw, 8rem)` | 700 | 0.82 | `-0.085em` | Hero headline — name |
| Display Section | `clamp(2.25rem, 4.5vw, 3.75rem)` | 600 | 0.98 | `-0.065em` | Section headings |
| Display Card | 24px | 600 | 1.10 | -0.5px | Card titles, project names |
| Title Large | 20px | 600 | 1.20 | 0 | Subsection headings |
| Title | 18px | 500 | 1.30 | 0 | Card subtitles |
| Body | 16px | 400 | 1.60 | 0 | Running text |
| Body Small | 14px | 400 | 1.55 | 0 | Secondary text, descriptions |
| Caption | 13px | 500 | 1.30 | 0.5px | Labels, metadata |
| Button | 14px | 600 | 1.00 | 0.3px | CTA labels |
| Nav Link | 14px | 500 | 1.20 | 0 | Navigation items |
| Monospace | 13px | 500 | 1.40 | 0 | Tech badges, code references |

### Principles
- Hero title line-height is 0.82 on desktop and 0.84 on mobile; section headings use 0.98 — component-specific compression creates architectural confidence
- Body at 1.60 line-height ensures comfortable reading after headline impact
- Negative letter-spacing on headlines only — body stays at 0
- Monospace for tech/role labels adds developer identity without decoration

## 4. Components

### Buttons
- **Warm Cream Primary**: `#e9e5dd` bg, `#292827` text, 8px radius, no border — the signature CTA
- **Dark Primary**: `#292827` bg, white text, 8px radius — inverse variant
- **Ghost**: No background, underline decoration, Amethyst color
- **Hero CTA**: Amethyst on the pale hero; `.dark` adapts its contrast on the indigo gradient
- Height: 44px, Padding: 12px 24px

### Cards
- **Content Card**: White bg, 1px `#dcd7d3` border, 16px radius, 24px padding
- **Project Card**: White bg, 1px `#dcd7d3` border, 16px radius, screenshot-dominant
- **Feature Card**: Surface Soft bg, no border, 16px radius
- **Dark Card**: Night Surface bg, Night Border, 16px radius
- Hover: Subtle lift/spotlight; fine pointers may add a bounded 2.5° tilt, never replacing focus or readable actions

### Navigation
- Fixed top, glass on hero → readable card surface on scroll
- Nav links: Manrope 14px, weight 500
- Active indicator: Lavender Glow underline
- CTA: Lavender primary action with explicit contact destination
- Mobile: Hamburger with slide-down panel

### Section Container
- Max-width: 1200px centered
- Section padding: 80px–96px vertical (desktop), 48px (mobile)
- Card internal padding: 24px–32px

### Badges / Tags
- Tech badges: Monospace 13px, Parchment Border bg, 8px radius, tight padding
- "Available" badge: Emerald Muted dot + text, no background
- Lavender accent badges for featured/highlighted items

## 5. Layout

### Spacing
- Base unit: 8px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 80, 96
- Section rhythm: 80px–96px between major bands

### Grid
- Max content: 1200px
- Hero: Full-width light lavender gradient by default, dark indigo under `.dark`; content centered
- Feature grids: 2–3 columns desktop, 1 column mobile
- Projects: 12-column desktop index with one featured card, 1 column mobile

### Whitespace
- Confident emptiness between sections
- Projects fill space with screenshots, not decoration
- Progressive density: spacious hero → denser content → open CTAs

## 6. Elevation

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow | Primary canvas, most surfaces |
| Border | 1px `#dcd7d3` | Card containment |
| Hover | Subtle shadow increase | Interactive card states |
| Hero Depth | Gradient + translucent borders | Hero elements |

## 7. Do's and Don'ts

### Do
- Keep the hero title at 0.82 line-height on desktop (0.84 on mobile) and section headings at 0.98
- Use Warm Cream for primary buttons — not white, not gray
- Keep radii bounded and purposeful; use larger rounding only for circular/orbital visual elements
- Let project screenshots be the primary visual content
- Use Lavender Glow as the primary accent; reserve emerald/blue for status or telemetry cues
- Maintain the hero gradient as a singular dramatic gesture
- Use monospace for tech/developer identity elements

### Don't
- Use saturated multi-color palettes — one accent only
- Apply shadows generously — depth from borders and contrast
- Use tight line-height on body text
- Add decorative layers only when they reinforce the technical narrative and remain non-blocking
- Do not use ornamental motion as a substitute for content or focus states
- Use pure black (`#000000`) — Charcoal Ink is warmer

## 8. Responsive

| Breakpoint | Width | Key Changes |
|---|---|---|
| Mobile | <768px | Single column, hamburger nav; hero `clamp(3.45rem, 17vw, 5.3rem)` (`3.35rem` at ≤420px) |
| Tablet | 768–1023px | 2-column projects; hero `clamp(3.6rem, 8vw, 6rem)` |
| Desktop | 1024–1440px | Full layout; hero `clamp(3.7rem, 8vw, 8rem)` |
| Wide | >1440px | Max-width 1200px centered; desktop hero clamp continues |

## 9. Dark Mode Strategy

- Dark mode is a FIRST-CLASS citizen, not an afterthought
- Light lavender hero is the default; `.dark` gives the hero its dark-indigo anchor
- Light → Dark: Canvas becomes Night Canvas, borders become Night Border
- Warm Cream buttons become Warm Cream Dark
- Lavender Glow accent stays consistent across both modes
- No jarring transitions — smooth 300ms shifts on toggle

## 10. Motion Architecture

Motion is layered, not required for understanding the page:

1. **CSS baseline:** hero reveal, orbital rings, marquee and reduced-motion fallback.
2. **GSAP layer:** GSAP and ScrollTrigger are dynamically imported only after hero proximity (within 200px of the viewport) or pointer, focus or touch interaction. `matchMedia()` gates fine-pointer and `prefers-reduced-motion`, while `ScrollTrigger` follows the native document scroll instead of replacing it.
3. **Three.js layer:** an optional, progressively loaded small deterministic point/line constellation with no external model or texture. It is skipped for Save-Data/2G/low-memory or reduced-motion preferences, pauses offscreen/hidden tabs, caps its pixel ratio and disposes renderer resources on Astro navigation.

The canvas is `aria-hidden`, pointer-transparent and decorative. The portrait, availability link, CTAs and project content remain HTML. If WebGL2 is unavailable, the existing CSS orbital visual is the fallback.

## 11. Maintainability & delivery limits

The source surface has explicit size gates so visual iteration does not turn
into unreviewable files:

| Extension | Limit | Gate |
|---|---:|---|
| `.astro` | 250 lines | `pnpm verify:limits` |
| `.ts` | 300 lines | `pnpm verify:limits` |
| `.css` | 1500 lines | `pnpm verify:limits` |

The documented exceptions are the shared `Layout` shell, the content-heavy
certification carousel and privacy documents, plus the canonical technology
color registry. The former monolithic stylesheet is split into base, hero,
content, responsive and header layers. Repeated icons use the immutable
`public/icons/sprite.svg` instead of embedding the same paths in every page.

No general formatter or linter is currently configured. The size, test and
build gates do not replace lint or format rules. Defer new tooling and
dependencies until a concrete recurring formatting or lint gap justifies them.

## 12. Reference Decisions

The visual direction borrows interaction principles—not copied layouts—from the reviewed Chinese, Korean and Japanese references:

- **Chinese:** Chang Liu's unified carousel/menu and restrained distortion; Du Haihang's WebGL typography that still supports drag, swipe and scroll on mobile; Lan Zhang's people-centered work index; Lyfar Studio's Astro/Three.js approach that keeps the stack small.
- **Korean:** Portfoli-oh's bilingual/theme-aware onboarding and measurable performance; VibeLabs' description of a 3D world where projects become the narrative instead of a decorative resume.
- **Japanese:** Koh Fukuzawa's explicit performance/accessibility discipline; Tao Tajima's shader illusion that creates depth without a heavy 3D model.

### Tool selection

- `three@0.185.1` + `@types/three@0.185.1`: selected for one bounded WebGL scene, not a 3D model or full-screen takeover.
- `gsap@3.15.0`: selected for deterministic pointer/scroll interpolation and cleanup through `matchMedia()`.
- **ScrollXUI:** audited as a Next.js/TypeScript/Tailwind/Motion registry. Its cursor, spotlight, stagger and parallax patterns are useful references, but importing its React-oriented registry would widen this Astro static site's runtime unnecessarily.
- **shadcn CLI:** audited as Astro-compatible, but it is a component source/registry rather than an animation system. The repo already has native Astro `Button` and `DropdownMenu` primitives; adding a React integration or remote registry component would add surface without improving this home.
