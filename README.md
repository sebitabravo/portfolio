# Portfolio - Sebastian Bravo

> Modern, fast, and accessible portfolio built with Astro, TailwindCSS, and TypeScript

[![Astro](https://img.shields.io/badge/Astro-7-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

## Quality evidence

El build y los checks locales son la fuente de verdad de cada cambio. Lighthouse
audita el build del checkout en CI para `/` y `/en/`; si no se cumplen los
umbrales, puede fallar el job del workflow. Que ese fallo impida un merge depende
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
- **Progressive Motion** - CSS baseline plus deferred GSAP/Three.js enhancements with reduced-motion and WebGL fallbacks
- **SEO Ready** - Automatic sitemap + robots + JSON-LD schema
- **Quality Gates** - Astro check, Vitest with coverage, three-browser Playwright E2E, build and project-link validation in CI
- **Security Gates** - Production dependency audit, security-header contract and exact CSP hash parity, and source/bundle-size limits

## Tech Stack

- **Framework:** Astro 7
- **Styling:** Tailwind CSS v4 (CSS-first config)
- **Language:** TypeScript
- **Images:** Sharp
- **Content:** MDX (blog)
- **Motion:** GSAP 3 + Three.js 0.185 (optional, deferred)

## Quick Start

```bash
pnpm install
pnpm dev
```

## Testing

```bash
pnpm audit --prod
pnpm astro check
pnpm test
pnpm test:coverage
pnpm build:ci # source limits, static build, bundle budget, exact CSP hash parity
pnpm exec playwright test # Chromium, Firefox, WebKit; requires a built site
pnpm validate:links
```

`pnpm test:coverage` enforces 90% for statements, lines and functions, plus
70% for branches across `src/lib` and `src/scripts`. `pnpm build` also runs
Astro check before the same build gates; `pnpm build:ci` runs those gates after
the separate CI check step. The source/bundle/CSP gates are not general lint or
format checks.

## CI/CD

- **Primary quality workflow:** `.github/workflows/ci.yml` on PRs and pushes to `main` runs a production dependency audit, Astro check, Vitest and coverage, `pnpm build:ci` (source limits, static build, bundle budget and CSP parity), Playwright on Chromium/Firefox/WebKit, and project-link validation.
- **Lighthouse audit:** `.github/workflows/lighthouse.yml` audits the checked-out build on PRs, pushes to `main`, and manual `workflow_dispatch` runs. Failing thresholds fail the job; whether that blocks a merge depends on external branch protection.
- **Official deployment source:** Vercel native GitHub integration (no GitHub Actions deploy workflow).

### Deployment security headers

`vercel.json` is the authority for Vercel response headers; Astro application code and
`pnpm preview` neither apply nor prove those deployed headers. After changing an
executable inline script, inspect the generated change and run `pnpm build`: it
regenerates `dist/` and verifies exact CSP hash parity in both directions. Review a
reported hash before updating the global `script-src` policy; never blindly authorize
unknown generated output.

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
│   ├── icons/          # Icon components backed by public/icons/sprite.svg
│   └── ui/             # Button and DropdownMenu
├── content/blog/       # Blog MDX entries
├── content.config.ts   # Astro/Zod schema for the blog collection
├── layouts/            # Shared page layout
├── lib/
│   ├── data.ts         # Public facade for portfolio domain data
│   ├── data/           # Typed projects, work, certifications and other domains
│   └── i18n/           # Spanish and English dictionaries
├── pages/              # Spanish default and /en routes, blog, privacy, 404, OG
├── scripts/            # Deferred motion, optional WebGL and UI behavior
├── styles/             # Base, hero, content, responsive and header CSS layers
└── types/              # TypeScript type definitions
scripts/                 # Source/bundle/CSP checks and link validation
tests/                   # Vitest and Playwright suites
public/                  # Static files, including icons/sprite.svg
```

## Build

```bash
pnpm build
pnpm preview
```

## Contact

- **GitHub:** [@sebitabravo](https://github.com/sebitabravo)
- **Email:** <sebitabravocontacto@gmail.com>
- **LinkedIn:** [Sebastian Bravo](https://linkedin.com/in/sebitabravo)
