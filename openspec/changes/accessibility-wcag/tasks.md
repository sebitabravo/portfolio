# Implementation Tasks: Blog Text Contrast

## Review Workload Forecast

| Field | Value |
| ------- | ------- |
| Estimated changed lines | 70–105 lines |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR; four TDD work units |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Scope and review boundary

Deliver only the `blog-text-contrast` first slice in one PR. The permitted product paths are `src/components/BlogCard.astro`, `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`, `src/pages/en/blog/index.astro`, and `src/pages/en/blog/[slug].astro`; the permitted test paths are `tests/contrast.test.ts` and new `tests/blog-accessibility.spec.ts`. Do not alter global tokens, layout, routing, copy, responsive utilities, or artifacts under `openspec/changes/contact-card-email-overflow/`.

## Work Unit 1 — RED: targeted accessibility contracts

- [x] In `tests/contrast.test.ts`, add failing element-scoped source contracts for the `BlogCard.astro` publication `<time>`, Spanish/English list breadcrumb `<ol>`, and Spanish/English article breadcrumb `<ol>` plus header `<time>`; require `text-muted-foreground` on each target and reject only the target's existing alpha-45, alpha-55, or alpha-40 `text-foreground` utility. Run `pnpm test -- tests/contrast.test.ts` and record its expected pre-change failure. <!-- sdd-owner: implementation -->
- [x] Create `tests/blog-accessibility.spec.ts` with a failing table-driven Playwright/Axe contract for the origin-relative route segments `blog`, `en/blog`, `blog/manttoai-ml-iot-random-forest`, and `en/blog/manttoai-ml-iot-random-forest-en` in explicit `light` and `dark` themes; use reduced motion, set `localStorage.theme` before navigation, wait for `networkidle` and `document.fonts.ready`, assert the expected heading/date fixture and resolved `.dark` state, then scan only `main#main-content nav[aria-label="Breadcrumb"], main#main-content article time` with Axe's unmodified rule set. Run `pnpm test:e2e -- tests/blog-accessibility.spec.ts` and record the expected pre-change contrast failure. <!-- sdd-owner: implementation -->

**Finish and rollback boundary:** Both new contracts demonstrate the existing defect without scanning unrelated surfaces; deleting the new test additions restores the pre-slice test baseline.

## Work Unit 2 — GREEN: seven semantic-token substitutions

- [x] Replace only the targeted low-alpha text utilities with `text-muted-foreground`: the `<time>` in `src/components/BlogCard.astro`; breadcrumb `<ol>` elements in `src/pages/blog/index.astro` and `src/pages/en/blog/index.astro`; and breadcrumb `<ol>` plus article-header `<time>` elements in `src/pages/blog/[slug].astro` and `src/pages/en/blog/[slug].astro`. Preserve all markup, `text-xs`/`text-sm`, font, spacing, responsive, hover, locale, and current-page `text-foreground/80` utilities. <!-- sdd-owner: implementation -->
- [x] Re-run `pnpm test -- tests/contrast.test.ts` and `pnpm test:e2e -- tests/blog-accessibility.spec.ts`; both focused contracts must pass without disabled Axe rules, impact filtering, or broader selectors. <!-- sdd-owner: implementation -->

**Finish and rollback boundary:** The product diff contains exactly seven class substitutions across the five allowlisted Astro files; reverting those substitutions and their contracts together cleanly restores the former behavior.

## Work Unit 3 — TRIANGULATE: rendered theme and viewport evidence

- [x] Confirm the new browser contract executes all four stable routes in both explicit themes across Chromium, Firefox, and WebKit, covering `--card` for list-card dates and `--background` for breadcrumbs/article dates; investigate a remaining targeted violation by checking computed foreground, background, opacity, and inheritance before proposing any token change. <!-- sdd-owner: implementation -->
- [x] Visually spot-check the four route fixtures at 390×844 and 1280×720 in light and dark themes: dates and ancestor breadcrumbs must remain readable and secondary, wrapping and card/article geometry must be unchanged, and no horizontal scrolling may appear. <!-- sdd-owner: implementation -->

**Finish and rollback boundary:** The contrast correction is evidenced on both locales, effective themes, relevant surfaces, viewport classes, and configured browser engines; any geometry or hierarchy regression blocks this unit and requires reverting the class-only change rather than expanding scope.

## Work Unit 4 — REFACTOR and full regression verification

- [x] Refactor only `tests/contrast.test.ts` and `tests/blog-accessibility.spec.ts` as needed to keep source assertions element-scoped and route/theme cases table-driven; do not add product abstractions or broaden the Axe context to tags, descriptions, empty states, footer navigation, or full-blog conformance. <!-- sdd-owner: implementation -->
- [x] Run the final verification sequence: `pnpm test -- tests/contrast.test.ts`, `pnpm test:e2e -- tests/blog-accessibility.spec.ts`, `pnpm test`, `pnpm test:coverage`, `pnpm check`, `pnpm test:e2e`, and `pnpm build`; all commands must pass, including configured coverage thresholds. <!-- sdd-owner: implementation -->
- [x] Inspect the final diff against the allowlist and confirm it excludes `src/components/CertificationCarousel.astro`, `src/pages/privacy.astro`, `src/pages/en/privacy.astro`, `src/styles/portfolio-base.css`, global/theme behavior, content or route changes, and prior-change artifacts. <!-- sdd-owner: implementation -->

**Finish and rollback boundary:** Tests remain concise and the final diff is limited to the five approved Astro paths and two approved test paths; rollback is one revert of those substitutions and test contracts, followed by `pnpm test`, `pnpm check`, `pnpm test:e2e`, and `pnpm build`.

## Explicitly Deferred Work

- Certification-carousel keyboard-focus pause and persistent pause/stop control in `src/components/CertificationCarousel.astro` (WCAG 2.2.2).
- Malformed privacy-policy `mailto:{personalInfo.email}` destinations in `src/pages/privacy.astro` and `src/pages/en/privacy.astro`.
- Full-page blog, privacy, 404, and broad focus-visibility accessibility audits beyond the targeted breadcrumb and date surfaces.
