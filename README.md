# Portfolio - Sebastian Bravo

> Modern, fast, and accessible portfolio built with Astro, TypeScript, and the Resolución design system

[![Astro](https://img.shields.io/badge/Astro-7-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

## Quality evidence

El build y los checks locales son la fuente de verdad de cada cambio. Lighthouse
audita el build del checkout en CI para `/`, `/en/`, `/blog/`, `/en/blog/`,
`/links/` y `/privacy/`; si no se cumplen los umbrales, puede fallar el job del
workflow. Que ese fallo impida un merge depende
además de la protección de rama configurada fuera del repositorio; no se presenta
un puntaje estático como garantía permanente.

## Features

- **Lightning Fast** - Static site generation with Astro
- **Internationalization** - Spanish & English (`/` and `/en`)
- **Dark Mode** - Light, dark, and system preference
- **Responsive** - Mobile-first design
- **Image Optimization** - Automatic WebP/AVIF via `astro:assets`
- **View Transitions** - Smooth page navigation
- **Direct Contact Links** - Email, LinkedIn, and GitHub destinations without a fake backend form
- **Progressive Motion** - CSS-only motion (`steps()` timing, View Transitions) with reduced-motion, Save-Data and pointer gating; no client-side animation framework
- **SEO Ready** - Automatic sitemap + robots + JSON-LD schema
- **Quality Gates** - Astro check, Vitest with coverage, three-browser Playwright E2E, build and project-link validation in CI
- **Security Gates** - Production dependency audit, security-header contract and exact CSP hash parity, and source/bundle-size limits

## Tech Stack

- **Framework:** Astro 7
- **Styling:** Resolución design system (vanilla CSS with custom properties, `src/styles/resolucion.css`)
- **Language:** TypeScript
- **Images:** Sharp
- **Content:** MDX (blog)
- **Motion:** CSS only (`steps()`, View Transitions) — no GSAP, no Three.js, no WebGL

## Prerequisites

- **Bun 1.4.4** — package manager, script runner, and dependency installer
  (`packageManager: "bun@1.4.4"`). The pin matches the version verified on
  the owner's machine; `brew upgrade bun` to 1.4.5 (a security release) plus
  bumping the pin is a recorded follow-up.
- **Node 24.22.3** — still required: `bun run <script>` executes `#!/usr/bin/env
  node` binaries such as `astro` with **Node**, not Bun, so the Astro build,
  `astro check`, and Vitest run on Node. `.nvmrc` and the CI matrix stay
  pinned to 24.22.3 while `engines.node` keeps the Astro 7 floor (`>=22.23.4`).

## Quick Start

```bash
bun install
bun run dev
```

## Testing

```bash
bun audit --prod
bunx astro check
bun run test
bun run test:coverage
bun run build:ci # source limits, static build, bundle budget, exact CSP hash parity
bunx playwright test # Chromium, Firefox, WebKit; requires a built site
bun run validate:links
```

`bun run test:coverage` enforces 90% for statements, lines and functions, plus
70% for branches across `src/lib` and `src/scripts`. `bun run build` also runs
Astro check before the same build gates; `bun run build:ci` runs those gates after
the separate CI check step. The source/bundle/CSP gates are not general lint or
format checks.

## Package manager and supply chain

The project uses **Bun** with `bun.lock` as the single source of truth for
installed versions. CI installs with `bun ci` (frozen lockfile, no resolution
drift) and caches `~/.bun/install/cache` across runs.

What Bun enforces directly (`bunfig.toml` + `package.json`):

- `minimumReleaseAge = 1209600` seconds (14 days): brand-new releases are
  blocked until they have been public for two weeks, without touching frozen
  pins. The same three excludes as before are carried over verbatim:
  `http-cache-semantics@4.3.0`, `undici@8.12.2`, `fast-uri@4.2.3`.
- `trustedDependencies` lists exactly `@tailwindcss/oxide`, `esbuild` and
  `sharp`: lifecycle scripts run only for that allowlist. Defining the key
  replaces Bun's built-in default list, so new packages needing a postinstall
  must be added here deliberately.
- `overrides` (top level, moved from `pnpm.overrides`) keeps the 16
  security pins verbatim, including exact pins such as `devalue 5.9.3` and
  `js-yaml 4.3.2`.

Two pnpm controls have no Bun equivalent and are now covered by executable
tests instead of the tool:

- **`blockExoticSubdeps`** — `tests/bun-config.test.ts` parses `bun.lock` and
  fails if any dependency resolves to a `git+`, `github:`, `file:`, `link:`,
  `workspace:` or `http(s)://` target instead of a registry tarball.
- **`trustPolicy: no-downgrade`** — no Bun equivalent exists. The remaining
  mitigations are dependabot's 7-day npm update cooldown and the CI
  `bun audit --prod` step, asserted by `tests/supply-chain.test.ts`.

Additional supply-chain tests in `tests/bun-config.test.ts` and
`tests/supply-chain.test.ts`: the 14-day cooldown and its excludes, the exact
`trustedDependencies` allowlist, the 16 overrides, the `bun@` packageManager
pin, and sha512 integrity on every locked package.

## CI/CD

- **Primary quality workflow:** `.github/workflows/ci.yml` on PRs and pushes to `main` runs a production dependency audit (`bun audit --prod`), Astro check, Vitest and coverage, `bun run build:ci` (source limits, static build, bundle budget and CSP parity), Playwright on Chromium/Firefox/WebKit, and project-link validation.
- **Lighthouse audit:** `.github/workflows/lighthouse.yml` audits the checked-out build on PRs, pushes to `main`, and manual `workflow_dispatch` runs. Failing thresholds fail the job; whether that blocks a merge depends on external branch protection.
- **Official deployment source:** Vercel native GitHub integration (no GitHub Actions deploy workflow).

### Deployment security headers

`vercel.json` is the authority for Vercel response headers; Astro application code and
`bun run preview` neither apply nor prove those deployed headers. After changing an
executable inline script, run `bun run update:csp` to preview the hash changes and
`bun run update:csp:write` to apply them. Review the `vercel.json` diff, then run `bun run build`: it regenerates `dist/` and verifies exact CSP hash parity in both
directions. Never blindly authorize unknown generated output.

After a Vercel release, a separate observer must inspect `/`, `/en`, one blog page,
`/.well-known/security.txt`, one `/_astro/` asset, and `/og/es.svg`. Confirm global
security headers coexist with route cache rules where applicable and that the browser
reports no CSP console violations. Local preview cannot prove Vercel-delivered headers.

## Architecture

Astro generates static output: `/` is the default Spanish route and `/en` is
English. Locale-specific routes compose shared localized pages and components.
The Astro/Zod collection schema in `src/content.config.ts` validates blog MDX
only; projects, work experience and certifications remain structured TypeScript
domain data behind the `src/lib/data.ts` facade.

## Project Structure

```
src/
├── assets/             # Astro-optimized assets
├── components/         # Shared localized Astro components
│   ├── blog/           # Shared localized blog pages
│   └── ui/             # Button
├── content/blog/       # Blog MDX entries
├── content.config.ts   # Astro/Zod schema for the blog collection
├── layouts/            # Shared page layout
├── lib/
│   ├── blog-alternates.ts    # translationKey pairing + hreflang alternates for posts
│   ├── blog-image.ts         # Blog OG/social image resolution
│   ├── config.ts             # Public site configuration
│   ├── data.ts               # Public facade for portfolio domain data
│   ├── data/                 # Typed projects, work, certifications and other domains
│   ├── home-sections.ts      # Localized home anchor IDs
│   ├── i18n/                 # Spanish/English dictionaries + Locale helpers
│   ├── portfolio-images.ts   # Project card/social image registry
│   ├── seo-structured-data.ts# JSON-LD builders
│   ├── tech-badges.ts        # Canonical tech badge colors + icons
│   └── utils.ts              # Date formatting helpers and cn() class merge
├── pages/              # Spanish default and /en routes, blog, links, privacy, 404, OG
├── scripts/            # Small client behaviors: header nav, theme, sound, copy, filters, reveals
├── styles/             # Resolución layers: tokens, base, layout, components, prose, print
└── types/              # TypeScript type definitions
scripts/                 # Source/bundle/CSP checks and link validation
tests/                   # Vitest and Playwright suites
public/                  # Static files, including icons/sprite.svg
```

## Types

Single source of truth lives in const-objects; types are derived from them:

| Const-object | Derived type | Home |
|---|---|---|
| `LOCALES` (`ES`/`EN`) | `Locale` | `src/lib/i18n/index.ts` |
| `PROJECT_STATUSES` | `ProjectStatus` | `src/lib/data/types.ts` |
| `CERTIFICATION_CATEGORIES` | `CertificationCategory` | `src/lib/data/types.ts` |
| `THEMES` | `ThemePreference` | `src/types/index.ts` |

`CarouselCertification` keeps its `{ data }` shape (carousel contract) but the
payload is a flat `CarouselCertificationData` interface, not an inline object.
Import domain types from `@/lib/data`, UI/carousel types from `@/types`, and
`Locale` helpers from `@/lib/i18n`. `THEMES` lives in `@/types` on purpose:
the theme type is shared with the client scripts without importing runtime
code; the only CSP-hashed inline script is the theme/motion bootstrap in
`src/layouts/Layout.astro`.

## Adding a language, page, or translated post

### Add a translated blog post

1. Create the ES file (omit `locale`, it defaults to `es`) and the EN file
   (set `locale: "en"`), both with the same `translationKey`.
2. Verify: `bunx vitest run tests/blog-alternates.test.ts`.

Checklist:

- [ ] Both files share one `translationKey` (exactly one ES + one EN post).
- [ ] ES file omits `locale`; EN file sets `locale: "en"`.
- [ ] Opposite-direction alternates resolve (`getBlogTranslationId`).
- [ ] ES-only posts intentionally render as `/en/blog/<same-slug>` fallbacks.

### Add a page

- [ ] Create `src/pages/<page>.astro` and its mirror `src/pages/en/<page>.astro`.
- [ ] Add locale-first alternates with `x-default` pointing at the Spanish URL.
- [ ] Confirm the page renders in `bun run build` output for both locales.

### Add a language

- [ ] Add the dictionary (`src/lib/i18n/<locale>.json`) with full key parity.
- [ ] Extend `LOCALES` (+ `locales`, `defaultLocale` follows automatically).
- [ ] Extend every `Record<Locale, ...>` data module and the blog `locale` enum.
- [ ] Mirror `src/pages/` routes, alternates, OG route, and sitemap config.
- [ ] Update `tests/i18n.test.ts` expectations and run the full gate.

## Build

```bash
bun run build
bun run preview
```

## Contact

- **GitHub:** [@sebitabravo](https://github.com/sebitabravo)
- **Email:** <sebitabravocontacto@gmail.com>
- **LinkedIn:** [Sebastian Bravo](https://linkedin.com/in/sebitabravo)
