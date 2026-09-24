# Portfolio audit follow-up

## Goal
Close the remaining actionable findings from the architecture/quality, accessibility/performance, and best-practices reports, preserving the site's identity, bilingual behavior, accessibility, SEO, responsive behavior, and static-site deployment.

## Authorization and decisions
- The user explicitly authorized implementing all proposed follow-up groups and asked that no actionable item be left pending.
- Extend existing PR #37 on branch `refactor/portfolio-theme-tokens-01`. It is the user's approved single-PR `size:exception`; keep it open and do not merge.
- Asset decision: this is a static portfolio, so migrate screenshot images to `src/assets` and allow Astro-generated image URLs. Update every repository reference; the old `/screenshots/...` paths are not treated as a stable public API. Preserve the original source image content, alt text, and visual crop/quality as closely as Astro allows.
- Security-headers OpenSpec archive is explicitly out of this implementation scope: native `sdd-archive` is unavailable, and no manual archive is authorized.
- The user's report calls the ExperienceItem 14-prop observation a non-urgent nice-to-have, not part of the ordered implementation groups; do not widen scope into a component API redesign without a concrete need.

## Workflow and verification
- Strict TDD is the previously selected project mode. Record observed RED/GREEN for each behavior change; do not infer test evidence.
- Focused runners: `pnpm exec vitest run <focused test paths>` and `pnpm exec playwright test <focused spec paths>`.
- Full verification: `git diff --check && pnpm build && pnpm test && pnpm exec playwright test`.
- Use one delegated writer per bounded multi-file implementation task and a separate `gentle-ai-verify` pass; parent owns integration and commits.
- After each task: update this file, its Engram mirror, and the visible todo projection; create a Conventional Commit on the existing feature branch. Push task commits to update PR #37. No merge.

## Tasks
- [x] Add a localized accessible region name/role to CertificationCarousel and regression assertions; keep existing keyboard/focus behavior. **Evidence:** RED 2/2 failed as expected; GREEN 2/2 passed after safe build; independent build/limits/bundle/CSP verification passed; full Chromium carousel spec 5/5 passed. **Commit:** `60faeba`.
- [x] Make hero motion/WebGL lifecycle respond to live `prefers-reduced-motion` changes in both directions, including initial reduced-motion and teardown; preserve animation/resource cleanup. **Evidence:** RED 2 live-transition tests failed before implementation; later coarse-pointer RED reproduced fallback; final Vitest 31/31, Chromium 5/5, Astro check, source limit, build, bundle and CSP all passed. In-flight loads are invalidated before GSAP/WebGL activation, active scenes are reverted, preference listeners are removed; `portfolio-motion.ts` is 294 lines. **Commit:** `01b57eb`.
- [x] Centralize static hreflang alternate construction and reuse the exported `Locale` type in BlogCard and other local duplicate unions; preserve alternate URL ordering, x-default, and current route behavior. **Evidence:** RED 4 helper tests failed before implementation; GREEN Vitest 15/15; independent route tests 34/34. Astro check, source limits, 90-page build, bundle, CSP, and diff checks passed. Preserved locale-first ordering and Spanish x-default. **Commit:** pending.
- [ ] Move the referenced portfolio screenshots from `public/screenshots` to Astro-managed assets and use `astro:assets` Image for the affected visual components; update project/blog image mapping and tests after checking direct-reference hazards repository-wide.
- [ ] Replace brittle source-text/line-count assertions in JSON-LD and CSS contract tests with rendered output, compiled CSS, and observable behavior contracts; retain only structural assertions that cannot be expressed behaviorally.
- [ ] Run full verification, review the complete PR diff and size, update PR #37's body with truthful checks and scope, push, and confirm hosted checks pass.

## Baseline
- Existing PR #37 targets `main`, carries all prior portfolio work under explicit `size:exception`, and latest checks passed at `25999a2`.
- Existing local checks: build 90 pages/CSP parity 90 HTML, 636 executable inline scripts, 10 hashes; Vitest 23 files/151 tests; Playwright 276/276.
- Read-only mapping confirmed existing screenshot URLs in project/blog code and tests; no `/screenshots` reference was found in `src/pages/og/[locale].svg.ts`. External consumers cannot be proven by repository search; the user accepted changing URLs for this static portfolio.
