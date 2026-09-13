# Proposal: Restore WCAG AA Contrast on Blog Routes

## Intent

Resolve the verified normal-text contrast failures on blog metadata and breadcrumbs across Spanish and English blog listing and article routes. This is the first coherent implementation slice for GitHub issue **#23**.

## Problem

Blog dates currently use low-alpha foreground utilities that render below the WCAG 2.1 AA 4.5:1 normal-text threshold, and breadcrumb text is similarly below threshold on the light canvas. Existing accessibility automation covers home routes only, so these regressions are not protected on blog routes.

## Goals

- Bring rendered breadcrumb and date text to WCAG AA 1.4.3 contrast compliance in light and dark themes.
- Preserve the existing visual hierarchy, layout, content, locale routing, and theme architecture while improving legibility.
- Add narrow automated contracts for the affected source and rendered Spanish/English blog routes.

## Scope

### In scope

1. Replace low-alpha foreground utilities for blog breadcrumbs and dates with the existing semantic `--muted-foreground` token in:
   - `src/components/BlogCard.astro`
   - `src/pages/blog/index.astro`
   - `src/pages/blog/[slug].astro`
   - `src/pages/en/blog/index.astro`
   - `src/pages/en/blog/[slug].astro`
2. Extend `tests/contrast.test.ts` with a source-level contract that blog metadata and navigation use the semantic muted foreground token.
3. Add a focused Playwright/Axe accessibility spec for Spanish and English blog list and article routes, executed with reduced motion.

### Explicitly deferred follow-up slices

- **Certification carousel keyboard pause:** provide a persistent pause/stop mechanism and pause automatic motion when keyboard focus enters the carousel (WCAG 2.2.2).
- **Privacy-policy mailto links:** correct malformed `mailto:{personalInfo.email}` destinations on Spanish and English privacy pages.

These defects remain separate follow-up slices and are not modified by this proposal.

## Non-goals

- Change the global palette, home-page components, hero colors, project cards, theme-toggle behavior, or blog copy.
- Redesign blog typography, breadcrumb hierarchy, or responsive layout.
- Expand this slice to privacy, 404, or carousel behavior.
- Modify prior artifacts under `openspec/changes/contact-card-email-overflow/`.

## Affected Areas

- Blog card metadata presentation.
- Spanish and English blog list and article breadcrumb/date presentation.
- Source-level contrast contract and browser accessibility coverage for blog routes.

## Acceptance Criteria

- On Spanish and English blog list and article routes, normal-size date and breadcrumb text meets WCAG 2.1 AA SC 1.4.3's 4.5:1 contrast ratio in both light and dark themes.
- The affected dates and breadcrumbs use the established semantic muted foreground token rather than low-alpha foreground utilities.
- Focused Axe scans of stable, reduced-motion Spanish and English blog list and article pages report no violations.
- Layout, locale routing, article content, and visual hierarchy remain unchanged except for improved text legibility.
- Existing home accessibility coverage remains intact; this slice adds blog-route coverage rather than replacing it.

## Risks and Mitigations

- **Visual hierarchy may become too prominent.** Use the existing semantic muted token, preserving the design system's intended secondary-text treatment rather than introducing new color values.
- **Browser checks can be flaky because of animation.** Run the new Axe contract with reduced motion and target stable routes.
- **Coverage could accidentally mask unrelated violations.** Keep the spec focused on the four affected route types and do not relax global Axe configuration.

## Rollback

Revert the five template/component class substitutions and the associated contrast and Playwright/Axe tests together. The change has no data migration, route migration, persisted state, or generated-content consequence.

## Issue Linkage

- Implements the first coherent accessibility slice for **#23**: verified low-contrast blog dates and breadcrumbs on Spanish and English list/article routes.
- Defers the certification carousel keyboard-pause and privacy `mailto` defects to separately scoped follow-up issues or slices.

## Review Workload

Estimated change size: **70–105 lines**, below the 400-line review budget.

- Approximately 10–15 lines of class substitutions across five blog files.
- Approximately 15–25 lines of source-level contrast coverage.
- Approximately 45–65 lines of focused Playwright/Axe coverage.

The work should remain one reviewable unit because the presentation fixes and their regression contracts jointly establish the accessibility outcome.

## Success Criteria

The first #23 slice is successful when blog date and breadcrumb contrast is demonstrably AA-compliant on both locales and both themes, and focused automated checks prevent the same class of regression on blog routes.
