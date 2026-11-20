# sebita.dev — portfolio

Static, bilingual portfolio built with Astro and TypeScript. The visual layer is
the Resolución system (`src/styles/`, `src/components/`): pixel display type,
mono body, 8px grid, monochrome palette, `steps()` motion.

## Stack

- **Astro 7** with static output, MDX content collections and `i18n` (Spanish default, `/en` mirror)
- **TypeScript** strict; vanilla scripts only, no UI framework, no CSS framework
- **astro:assets + Sharp** for AVIF/WebP with `srcset`
- **Vitest** for unit contracts, **Playwright** (chromium, firefox, webkit) for the browser suite

## Requirements

- **Bun 1.4.4** (`packageManager`) — install and scripts
- **Node 24.22.3** (`.nvmrc`) — `bun run` executes the Astro binary with Node

## Commands

| Command | What it does |
| --- | --- |
| `bun install` | Install with the release-age cooldown from `bunfig.toml` |
| `bun run dev` | Dev server on `localhost:4321` |
| `bun run build` | Type check → source limits → static build → bundle budget → CSP parity |
| `bun run check` | `astro check` only |
| `bun run test` | Vitest unit contracts |
| `bun run test:e2e` | Playwright suite (serves `dist/`, so build first) |
| `bun run format` / `format:check` | Prettier |
| `bun run update:csp:write` | Rewrite the CSP script hashes from `dist/` (after changing an inline script) |
| `bun run generate:og` | Regenerate `public/og/{es,en}.png` |
| `bun run verify:bundle` / `verify:limits` / `verify:csp` | Individual build gates |

## Structure

```
src/
  components/   Astro components (home sections, blog, hub, dialogs-free states)
  content/blog/ 44 MDX posts, one `topic` per post (web · ia-datos · apps · infra)
  layouts/      Document shell: SEO, JSON-LD, hreflang, theme bootstrap
  lib/          Typed domain data, i18n dictionaries, SEO/OG helpers
  pages/        es (default) and /en routes, blog, links, privacy, 404, OG endpoints
  scripts/      Vanilla TS interactions (resolve, stage, sound, nav, filters, compat)
  styles/       tokens · base · layout · components · prose · print
public/         Fonts (subset), CV, certifications, OG images
scripts/        Build gates (CSP, bundle, limits), link check, font subsetter
tests/          Vitest contracts + Playwright specs
```

## Deployment

Static output on Vercel; `vercel.json` owns the security headers and the CSP.
The policy pins every executable inline script by SHA-256, so **run
`bun run update:csp:write` and rebuild after touching an inline script** — the
build fails otherwise.

The site is served through Cloudflare, which by default rewrites any `<a>` whose
text is a full address into `[email protected]` — and its decoder script is blocked
by our CSP, so the placeholder would stay visible. Email addresses are therefore
rendered **split into spans** (user / @ / domain), like the contact CTA, which
Cloudflare leaves alone. Keep that markup; the alternative is to disable Email
Obfuscation in the Cloudflare zone.

## Quality gates

CI runs `astro check`, the Vitest contracts, the three-engine Playwright suite,
project-link validation, the production dependency audit and a Lighthouse audit
of the checked-out build over `/`, `/en/`, `/blog/`, `/en/blog/`, `/links/` and
`/privacy/`. Failing thresholds fail the job; whether that blocks a merge
depends on branch protection configured outside this repository, so no static
score is claimed here.

## Browser and network support

No horizontal scroll from 320 px to 1920 px; content readable with JavaScript
disabled; every modern API guarded and documented in `src/styles/resolucion.css`.

- Theme colours: static tokens, `light-dark()` only inside `@supports`
- Hero sizing: `100vh` before `100svh`; image boxes: `aspect-ratio` plus a `padding-top` fallback
- Flex rows: `gap` plus margin fallbacks for Safari 14-class engines
- `IntersectionObserver`, `document.fonts`, `Intl`, clipboard, `requestIdleCallback`: guarded, degrade silently
- Motion and `Save-Data` skip the animation work; shape fonts download on idle only when motion is on
- Build target: `chrome87`, `edge88`, `firefox78`, `safari13.1`

Measured on mobile (CPU 4×, Slow 4G): LCP ~0.8 s, CLS 0, total transfer ~180 KiB.
Pinned by `tests/compat-contract.test.ts`, `tests/responsive.spec.ts`,
`tests/no-js.spec.ts`, `tests/prose-overflow.spec.ts`, `tests/footer.spec.ts`
and `tests/fonts.spec.ts`.

## Content

- **Post:** add `src/content/blog/<slug>.mdx` with `title`, `description`, `publishDate`, `tags`, `topic` and an optional `translationKey` for the `/en` pair.
- **Page:** add a route under `src/pages/` (and `src/pages/en/`), compose `Layout` with the locale.
- **Locale string:** add the key to both `src/lib/i18n/es.json` and `en.json`; the dictionary parity test fails otherwise.

## Third-party assets

Icons are copied inline (no package, no runtime request); only the glyphs in use live in `src/lib/glyphs/`.

- **UI icons:** [Tabler Icons](https://tabler.io/icons) v3.52.0, MIT. Notice in `third-party/LICENSE-tabler.txt`.
- **Technology logos:** [Simple Icons](https://simpleicons.org) v16.38.0, CC0. AWS is not in Simple Icons and uses Tabler's `brand-aws`.
- **Fonts:** Geist Mono and Geist Pixel, license in `public/fonts/LICENSE.txt`.

## License

See [LICENSE](LICENSE). Contact: sebitabravocontacto@gmail.com.
