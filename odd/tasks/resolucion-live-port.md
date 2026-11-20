# Resolución live port

Bring `design/resolucion/` from frozen prototype to the shipped portfolio on the Astro stack, then harden it for old/small/slow clients. `main` already holds the last shipped Resolución implementation (`backup/resolucion-port-shipped` == `main`); the skeleton branch stripped it to semantic markup. Restore, reconcile with the skeleton's tooling wins, then optimise.

## Specs

- **S1** — "pasar @design/ a ser mi portafolio real": `design/resolucion/` is the visual source of truth. Every artboard route is live with the same layout, tokens, states and interactions: `index`, `blog`, `post`, `privacidad`, `404`, `links`, `en/*` mirrors, `og`. `design/resolucion/09-estados.html` and `08-post-prosa.html` are boards, not routes.
- **S2** — "borrar y modificar todos los companentes de astro y que quede limpio": every `src/components`, `src/styles`, `src/scripts` and `src/lib/i18n` entry has a live consumer; no file, rule, token or key survives that the design does not render.
- **S3** — "para que funcione en mi stack ... de manera limpia y optimizada": Astro static output, existing CSP with exact script-hash parity, bundle/source budgets, sitemap, i18n (es default, en mirrored, hreflang triple), OG images, content collections.
- **S4** — "que funcione perfecto en cualquier tipo de interenet y en cualquier tipo de dispositivo sea viejo y pequeño o grande o rapido": no horizontal overflow from 320px to 1920px; content readable and navigable without JS; every modern CSS/JS API (`light-dark()`, `svh`, `aspect-ratio`, `@view-transition`, `IntersectionObserver`, `ResizeObserver`, `Intl` timeZone, `document.fonts`, flex `gap`, `Clipboard`) guarded or gracefully degraded; build target downlevelled below `esnext`; fonts/images budgeted for slow links (no render-blocking font chain, responsive `srcset`, `loading`/`decoding`/`fetchpriority`), `prefers-reduced-motion` and `saveData` respected.
- **S5** — "levanta todos los agentes que queieras y ve realizando los cambios y revisando los cambios y realizando los commits": parallel writers on disjoint surfaces, independent verification, Conventional Commits per work unit on a feature branch.

## Tasks

| ID | S# | Work | Route | Commit |
| --- | --- | --- | --- | --- |
| T1 | S1,S2 | Restore the Resolución stylesheet layer (`src/styles/**`) onto the skeleton and reconcile with current tooling | parent inline | `feat(styles): restore resolucion css layer` |
| T2 | S1,S2 | Restore interaction scripts (`src/scripts/**`, sound engine) and wire them to components | worker | `feat(scripts): restore resolucion interactions` |
| T3 | S1,S2 | Restore layout, header/footer, hero, sections, theme/sound controls, blog and not-found components | worker | `feat(components): restore resolucion components` |
| T4 | S1,S3 | Restore routes and OG generator (`src/pages/**`) for index/blog/post/privacy/404/links in both locales | worker | `feat(pages): restore resolucion routes` |
| T5 | S1,S2,S3 | Restore i18n, hub copy, data and content edits; remove keys/rules with no consumer | worker | `feat(content): restore resolucion copy and data` |
| T6 | S3,S5 | Restore the design-era test suite and make `vitest` + `playwright` green on chromium | worker | `test: restore resolucion suite` |
| T7 | S4 | CSS robustness: static theme fallbacks for `light-dark()`, `vh` before `svh`, `aspect-ratio` fallback, flex `gap` fallback, overflow fixes 320-1920 | worker | `fix(css): add legacy fallbacks and small-screen overflow guards` |
| T8 | S4 | Asset pipeline: responsive `srcset`/`sizes`, `loading`/`decoding`/`fetchpriority`, font preload discipline and subset, no render-blocking font chain | worker | `perf(assets): responsive images and font budget` |
| T9 | S4 | JS robustness + build target: `IntersectionObserver`/`ResizeObserver`/`Intl`/`document.fonts` guards, no-JS reveals, `es2020`-class target | worker | `fix(scripts): guard modern APIs and lower build target` |
| T10 | S3,S4 | Tooling: regenerate CSP hashes, keep source/bundle budgets green, sync `design/system.md` + README | parent inline | `chore(tooling): refresh csp hashes and docs` |
| T11 | S4,S5 | Independent verification: build, `astro check`, unit+e2e suites, 320px/1920px sweep, no-JS pass, budget report | verifier | — |

## Log

- **L1** (owner, verbatim): "ya mira revisa en engram llego el momento en pasar @design/ a ser mi portafolio real eso que hay que borrar y modificar todos los companentes de astro y que quede limpio para pasar lo que tengo en desing para que funcione en mi stack porfavor y de manera limpia y optimizada ya que la idea es que funcione perfecto en cualquier tipo de interenet y en cualquier tipo de dispositivo sea viejo y pequeño o grande o rapido porfavor dale. levanta todos los agentes que queieras y ve realizando los cambios y revisando los cambios y realizando los commits porfavor."
- **L2** (parent, decision): `main` and `backup/resolucion-port-shipped` are the same commit (bbc42d9) and contain the previously shipped Resolución implementation. `chore/skeleton-for-manual-port` (HEAD 113b385) is that implementation with the visual layer stripped. Restoration is therefore mechanical (`git diff HEAD main`: 88 files, 5042+/711-), and the work is reconciliation plus the S4 hardening, not a rewrite.
- **L3** (parent, decision): keep the skeleton branch's tooling wins (`package.json` pins, `astro.config.mjs`, `.prettierrc.json`, CSP parity scripts, budgets); take `src/`, `public/`, `tests/` and CSP hashes from `main`.
- **L4** (parent, evidence): chromium + headless shell installed locally; firefox/webkit binaries absent at start.
