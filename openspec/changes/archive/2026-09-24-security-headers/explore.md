# Exploration: Security Headers (Issue #24)

## Status

Ready for a focused configuration-and-verification change. No product code or pre-existing OpenSpec artifact was modified during exploration.

## Context and evidence limits

- Current checkout is `feat/security-headers` at `863eae8358da289aef91bbeffde2a6f945abf7ef`; `.git/HEAD` confirms the branch.
- The available checkout has no GitHub issue client or issue body, so issue #24 acceptance criteria and live state cannot be verified. This exploration therefore treats the requested audit areas as the scope source.
- The accessibility work is not in this branch: `.git/logs/HEAD` records `12f0076b...` (`fix(accessibility): improve blog text contrast`) on `feat/accessibility-wcag`, followed by checkout to the current branch at `863eae...`. Do not include that commit or `openspec/changes/accessibility-wcag/` in this change.
- Command execution and live deployment inspection are unavailable in this phase. Findings about emitted output come from the checked-in `dist/` snapshot, not an HTTP response from Vercel.

## Current deployment and header configuration

`vercel.json` is the deployment authority. It invokes `pnpm build:ci`, defines immutable cache rules for Astro assets, certification PDFs, screenshots/experience images, Open Graph output, and the SVG sprite, then applies the following headers with the `/(.*)` rule:

- `Content-Security-Policy`: `default-src 'self'`; self-hosted and Vercel Analytics scripts plus SHA-256 hashes; `style-src 'self' 'unsafe-inline'`; self/data images and fonts; restricted connections; `worker-src 'self'`; `frame-ancestors 'none'`; `base-uri 'self'`; `form-action 'self'`; `object-src 'none'`; `manifest-src 'self'`; and `upgrade-insecure-requests`.
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive `Permissions-Policy`, HSTS for two years with `includeSubDomains; preload`, `Cross-Origin-Opener-Policy: same-origin`, and `Cross-Origin-Resource-Policy: same-origin`.

This is already a substantial baseline. The smallest evidence-supported improvement is not a wholesale policy redesign; it is to close the remaining executable-script attribute gap and make the configuration/build contract reject drift.

## CSP and generated-output audit

### Evidence

- `src/layouts/Layout.astro` emits four executable inline scripts (theme selection, reveal lifecycle, post-transition hash scrolling, and reading progress) and one non-executable JSON-LD script. Home pages additionally receive Hero's inline fallback in `src/components/Hero.astro`.
- Component scripts without `is:inline` in `Header.astro`, `Projects.astro`, `ThemeToggle.astro`, `LanguageToggle.astro`, `CertificationCarousel.astro`, `SignalStrip.astro`, and `components/ui/DropdownMenu.astro` are bundled module scripts. The `dist/` snapshot shows the corresponding `/_astro/` module assets.
- Blog page templates also emit JSON-LD in `src/pages/blog/[slug].astro` and `src/pages/en/blog/[slug].astro`; it is data, not executable JavaScript.
- `dist/` contains the localized home, 404, privacy, blog-index, and individual blog documents. It contains local `/_astro/fonts/*.woff2`, images, PDFs, sprite, and screenshots. The emitted snapshot has no external `script src` match. Vercel Analytics and Speed Insights are conditionally rendered by `import.meta.env.VERCEL` in `Layout.astro`, and the CSP explicitly allows Vercel's script and connection origins.
- `scripts/verify-csp-hashes.ts` recursively scans every generated HTML document, hashes executable inline scripts, excludes `src` scripts and JSON-LD, and fails if any generated hash is absent from the CSP. `package.json` invokes it from both `build` and `build:ci`; CI invokes `pnpm build` before Playwright.

### Gaps

1. The verifier is one-directional: it detects generated hashes missing from the policy but accepts unused hashes already in `vercel.json`. The current CSP contains 20 SHA-256 entries, so stale authorizations can survive indefinitely.
2. The verifier silently treats a missing CSP as an empty string and does not require the global Vercel security-header rule, required headers, policy directives, or their values. No test references `vercel.json` or validates security headers.
3. `script-src` does not set `script-src-attr 'none'`. Source inspection found no inline event-handler attributes, so this can be explicitly prohibited without changing current behavior. This blocks future `onclick=`-style script execution even though the existing hash policy covers script elements.
4. `style-src 'unsafe-inline'` remains necessary for Astro-generated inline styles, including font-face/critical component styles shown in `dist/`. Removing it is not a safe header-only change.
5. Local `astro preview` used by `playwright.config.ts` does not apply Vercel's `vercel.json` response headers. Existing browser tests prove page behavior but cannot prove deployed HTTP header delivery.

## Astro, workflow, test, and documentation audit

- `astro.config.mjs` is static output for `https://sebita.dev`, uses local built font assets in the generated output, and has no server middleware/header hook. `src/pages/og/[locale].svg.ts` is prerendered and supplies cache metadata; Vercel's global rule remains the appropriate delivery mechanism for response security headers. No Astro-config change is needed.
- `.github/workflows/ci.yml` runs production dependency audit, checks, tests, coverage, build (including CSP verification), three-browser Playwright, and link validation. It has no Vercel response-header probe.
- `.github/workflows/lighthouse.yml` audits the live production URLs but is not a deterministic configuration test; it is inappropriate as the sole security-header guard. README describes it as informational although the workflow currently sets `continue-on-error: false`; that inconsistency is unrelated to this header slice.
- `README.md` documents the CSP verification command and broad security gates, but not the Vercel header authority, the hash-maintenance rule, or limitations of local preview.
- `public/.well-known/security.txt` exists with contact, expiry, languages, and canonical URL. Its expiry is 2027-05-25. This is unrelated to HTTP header enforcement and should remain untouched.

## Smallest safe security-header slice

**Change name:** `security-headers`

### In scope

1. In `vercel.json`, add `script-src-attr 'none'` to the existing CSP while retaining the current restrictive directives, necessary `style-src 'unsafe-inline'`, Vercel Analytics allowances, cache rules, and all present non-CSP headers.
2. Strengthen `scripts/verify-csp-hashes.ts` so build verification fails when the global CSP/header configuration is missing or malformed, when an executable emitted inline script lacks authorization, and when a configured SHA-256 hash is unused by emitted executable scripts. Extract small pure helpers if needed to make these assertions testable.
3. Add a focused configuration/verifier test (for example `tests/security-headers.test.ts`) that asserts the complete required Vercel header set, safe CSP directives including `script-src-attr 'none'`, and exact generated hash parity after a build fixture or emitted-output scan.
4. Add a concise README operational note identifying `vercel.json` as the deployment-header authority and requiring `pnpm build` after executable inline-script changes.

### Non-goals

- Do not alter application behavior, page markup, Astro configuration, analytics integration, caching durations, routes, content, or `security.txt`.
- Do not remove `style-src 'unsafe-inline'`, replace hashes with nonces, eliminate Astro inline scripts, add Trusted Types, or introduce COEP. Each requires a broader compatibility/design decision.
- Do not add a Vercel API/deployment test, change GitHub workflow permissions, or change the Lighthouse workflow in this slice. A post-deploy HTTP probe needs a stable preview/production target and any required authorization.
- Do not incorporate PR #28 accessibility changes or touch its OpenSpec artifact.

## Compatibility and rollout risks

- Hash parity must be derived from a fresh `dist/` build. Astro/compiler, formatting, or inline-script changes alter hashes, and exact parity should intentionally fail until `vercel.json` is updated.
- The `VERCEL`-only Analytics and Speed Insights integrations need the existing Vercel hosts in `script-src`/`connect-src`. Do not tighten those allowlists without inspecting a deployment response and browser CSP violations.
- `script-src-attr 'none'` is compatible with current source evidence because there are no HTML `on*` event attributes; a future inline handler will be blocked and should instead be migrated to a bundled listener.
- `COOP: same-origin` and `CORP: same-origin` are already potentially incompatible with new popup integrations or third-party embedding of assets. They should be retained, not expanded, in this narrow change.
- Header behavior must be checked after deployment because `astro preview` and Playwright do not emulate Vercel's routing/header application.

## Exact files and symbols

| File | Relevant symbols/region | Planned action |
| --- | --- | --- |
| `vercel.json` | global `/(.*)` `headers` entry; `Content-Security-Policy` | Add only `script-src-attr 'none'`; retain baseline headers and cache rules. |
| `scripts/verify-csp-hashes.ts` | `collectHtml`, `hashScript`, CSP/header parsing, CLI assertions | Require configuration shape and exact generated-hash parity rather than missing-hash coverage alone. |
| `tests/security-headers.test.ts` (new) | Vercel config and verifier contract | Add focused regression coverage for required header/directive values and verification behavior. |
| `package.json` | `build`, `build:ci`, `verify:csp` | No planned change; existing invocation is sufficient. |
| `.github/workflows/ci.yml` | `Build project for E2E` | No planned change; it already reaches the verifier via `pnpm build`. |
| `src/layouts/Layout.astro` | inline theme/reveal/hash-scroll/progress scripts and conditional Analytics/SpeedInsights | Evidence only; do not modify. |
| `src/components/Hero.astro` | inline motion fallback | Evidence only; do not modify. |
| `src/pages/blog/[slug].astro`, `src/pages/en/blog/[slug].astro` | JSON-LD scripts | Evidence only; remain excluded as non-executable data. |
| `astro.config.mjs` | static-output configuration | Evidence only; no header setting belongs here. |
| `README.md` | Security Gates / Testing / CI-CD sections | Add brief operator guidance. |

## Verification plan

1. Run `pnpm test` including the new header contract test.
2. Run `pnpm build`; it must type-check, build static output, enforce bundle/source limits, and report exact CSP hash parity.
3. Run `pnpm test:e2e` against the new generated build to confirm the strict CSP still permits the home, privacy, 404, and blog behavior in Chromium, Firefox, and WebKit.
4. After Vercel deployment, inspect actual response headers for `/`, `/en`, a blog URL, `/.well-known/security.txt`, an `/_astro/` asset, and `/og/es.svg`; confirm the required headers coexist with each route-specific cache rule and observe no CSP console violations.

## Estimated review workload

Approximately **110-150 changed lines across four files** (`vercel.json`, `scripts/verify-csp-hashes.ts`, one focused test, and `README.md`), well below the 400-line review budget. The exact implementation size depends on whether the existing CLI script needs a small exported helper seam for unit testing.
