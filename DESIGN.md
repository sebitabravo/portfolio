# Design System — Sebastian Bravo Portfolio
> Adapted from Superhuman's design language. Premium, confident, developer-forward.

## 1. Visual Theme & Atmosphere

A developer portfolio that feels like opening a precision tool — confident, restrained, every element intentional. The hero is a cinematic midnight gradient (`#1b1938` → `#0d0d1a`), overlaid with compressed white typography that hits like a statement. Below, the site dissolves into pristine white canvas with warm charcoal text.

The typography is the voice: headlines compress into dense, powerful blocks (line-height 0.92–0.96), while body text breathes at 1.60. This tension — compressed authority vs. generous readability — defines the portfolio's rhythm.

Maximum confidence through minimum decoration. Warm cream buttons instead of bright CTAs. Lavender accent as the sole color departure. Projects sell themselves through screenshots and clean cards.

**Key Characteristics:**
- Midnight gradient hero (`#1b1938`) with white compressed headlines
- Pure white content canvas with charcoal ink text
- Warm cream CTAs (`#e9e5dd`) — understated luxury
- Lavender glow (`#cbb7fb`) as the singular accent
- Only 2 border radii: 8px (buttons), 16px (cards)
- Project screenshots as primary visual content
- Generous whitespace, progressive density

## 2. Color Palette

### Dark Mode First (Hero / Dark Sections)
| Name | Hex | Role |
|---|---|---|
| Midnight | `#1b1938` | Hero gradient base, dark surfaces |
| Midnight Deep | `#0d0d1a` | Hero gradient end |
| Translucent White 95% | `rgba(255,255,255,0.95)` | Primary text on dark |
| Translucent White 70% | `rgba(255,255,255,0.70)` | Secondary text on dark |
| Lavender Glow | `#cbb7fb` | Accent, highlights, badges on dark |

### Light Mode (Content Sections)
| Name | Hex | Role |
|---|---|---|
| Pure White | `#ffffff` | Page canvas |
| Charcoal Ink | `#292827` | Headlines, primary text |
| Body Muted | `#5c5955` | Running body text |
| Caption | `#8a8580` | Captions, metadata, labels |
| Warm Cream | `#e9e5dd` | Button backgrounds, subtle surfaces |
| Parchment Border | `#dcd7d3` | Card borders, dividers |
| Surface Soft | `#f7f5f2` | Alternating section backgrounds |
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
- **Display & Headlines**: `Inter`, system-ui, sans-serif (weight 500–700, tight tracking)
- **Body & UI**: `Inter`, system-ui, sans-serif (weight 400–500, normal tracking)
- **Code / Accent**: `'JetBrains Mono'`, monospace (used for tech labels, inline code, role badges)

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| Display Hero | 56px | 700 | 0.92 | -2px | Hero headline — name |
| Display Section | 40px | 600 | 0.96 | -1.5px | Section headings |
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
- Display headlines at tight line-height create dense typographic blocks — architectural confidence
- Body at 1.60 line-height ensures comfortable reading after headline impact
- Negative letter-spacing on headlines only — body stays at 0
- Monospace for tech/role labels adds developer identity without decoration

## 4. Components

### Buttons
- **Warm Cream Primary**: `#e9e5dd` bg, `#292827` text, 8px radius, no border — the signature CTA
- **Dark Primary**: `#292827` bg, white text, 8px radius — inverse variant
- **Ghost**: No background, underline decoration, Amethyst color
- **Hero CTA**: Warm Cream on midnight gradient — pops dramatically
- Height: 44px, Padding: 12px 24px

### Cards
- **Content Card**: White bg, 1px `#dcd7d3` border, 16px radius, 24px padding
- **Project Card**: White bg, 1px `#dcd7d3` border, 16px radius, screenshot-dominant
- **Feature Card**: Surface Soft bg, no border, 16px radius
- **Dark Card**: Night Surface bg, Night Border, 16px radius
- Hover: Subtle translateY(-2px) + shadow increase — no color transformations

### Navigation
- Fixed top, transparent on hero → white/translucent on scroll
- Nav links: Inter 14px, weight 500
- Active indicator: Lavender Glow underline
- CTA: Warm Cream pill, 8px radius
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
- Hero: Full-width gradient, content centered
- Feature grids: 2–3 columns desktop, 1 column mobile
- Projects: 2 columns desktop, 1 column mobile

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
- Use tight line-height (0.92–0.96) on all display text
- Use Warm Cream for primary buttons — not white, not gray
- Keep border-radius to 8px and 16px only
- Let project screenshots be the primary visual content
- Use Lavender Glow as the only accent color
- Maintain the hero gradient as a singular dramatic gesture
- Use monospace for tech/developer identity elements

### Don't
- Use saturated multi-color palettes — one accent only
- Apply shadows generously — depth from borders and contrast
- Use tight line-height on body text
- Add decorative illustrations or icons — let content speak
- Use pill-shaped buttons — 8px radius, not rounded
- Use pure black (`#000000`) — Charcoal Ink is warmer

## 8. Responsive

| Breakpoint | Width | Key Changes |
|---|---|---|
| Mobile | <768px | Single column, hero 36px, hamburger nav |
| Tablet | 768–1024px | 2-column projects, hero 48px |
| Desktop | 1024–1440px | Full layout, hero 56px |
| Wide | >1440px | Max-width 1200px centered |

## 9. Dark Mode Strategy

- Dark mode is a FIRST-CLASS citizen, not an afterthought
- Hero gradient serves as the natural dark anchor
- Light → Dark: Canvas becomes Night Canvas, borders become Night Border
- Warm Cream buttons become Warm Cream Dark
- Lavender Glow accent stays consistent across both modes
- No jarring transitions — smooth 300ms shifts on toggle
