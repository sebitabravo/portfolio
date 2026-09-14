# Portfolio - Sebastian Bravo

> Modern, fast, and accessible portfolio built with Astro, TailwindCSS, and TypeScript

[![Astro](https://img.shields.io/badge/Astro-7-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

## Quality evidence

El build y los checks locales son la fuente de verdad de cada cambio. La
auditoría Lighthouse se ejecuta en CI como workflow informativo; no se presenta
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
- **Quality Gates** - Vitest smoke tests + link validation in CI
- **Security Gates** - Production dependency audit, security-header contract and exact CSP hash parity, and source-size limits

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
pnpm test
pnpm test:coverage
pnpm verify:limits
pnpm verify:csp # after pnpm build
pnpm validate:links
```

`pnpm test:coverage` enforces 90% for statements, lines and functions, plus
70% for branches across `src/lib` and `src/scripts`.

## CI/CD

- **Primary quality gate:** `.github/workflows/ci.yml` on PRs and pushes to `main` (unit tests, Playwright E2E, link validation, and build).
- **Lighthouse audit:** `.github/workflows/lighthouse.yml` runs as an informational workflow with `continue-on-error: true` and manual trigger support via `workflow_dispatch`.
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

## Project Structure

```
src/
├── assets/           # Images and files (optimized by Astro)
├── components/       # Astro components
│   ├── icons/        # SVG sprite-backed icon components
│   └── ui/           # Reusable UI components (Card, Button, Badge)
├── content/          # MDX blog posts
│   └── blog/         # Blog entries (.mdx)
├── data/             # Static data (technologies list)
├── layouts/          # Page layout
├── lib/
│   ├── data.ts       # Stable facade for split portfolio data modules
│   └── i18n/         # Translations (es.json, en.json)
├── pages/
│   ├── blog/         # Spanish blog (/blog)
│   ├── en/           # English routes (/en/*)
│   ├── index.astro   # Spanish home (/)
│   └── projects/     # Project case studies (/projects/*)
├── styles/           # Split base, hero, content, responsive and header CSS layers
├── scripts/           # Deferred GSAP lifecycle and optional Three.js scene
└── types/            # TypeScript type definitions
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
