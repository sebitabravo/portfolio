# Exploration: WCAG Accessibility First Slice

## Status

Ready for proposal. This exploration made no product-code changes.

## Context and evidence boundary

- Requested context: issue #23 on `feat/accessibility-wcag`.
- The checkout contains the branch ref but no issue title, body, acceptance criteria, or GitHub client. The WCAG/accessibility scope in the request is therefore the only issue context available locally.
- `openspec/config.yaml` and `openspec/project-context.md` still name the prior `fix/contact-card-email-overflow` branch. They are stale project metadata, not evidence that this exploration should modify the prior change.
- Existing untracked artifacts in `openspec/changes/contact-card-email-overflow/` were read for context and were not modified.

## Current accessibility baseline

### Positive evidence

- `src/layouts/Layout.astro` provides a localized document language, one `main#main-content` per route, and a visible-on-focus skip link.
- Both home routes use named sections through `SectionBand` and `SectionContainer`; section headings are linked with `aria-labelledby`.
- All source image sites have explicit alternatives: project screenshots have title-based alternatives, company logos use their supplied alternatives, certification logos use organization alternatives, and the hero portrait is deliberately empty-alt inside an `aria-hidden` decorative composition.
- Reusable SVG icon components consistently declare `aria-hidden="true"` and `focusable="false"`.
- `ThemeToggle`, `LanguageToggle`, and the mobile navigation preserve `aria-expanded`; theme and language controls implement Arrow/Home/End/Escape keyboard navigation, and `tests/theme-toggle.test.ts` covers theme keyboard focus movement.
- Reduced-motion CSS stops CSS loops and reveals content; browser coverage verifies this. The home Axe suite scans Spanish and English home pages, while Lighthouse sets a 0.95 accessibility threshold for deployed `/` and `/en`.

### Findings

1. **High — blog metadata and breadcrumb text fail normal-text contrast in both themes.**
   - `src/components/BlogCard.astro:26` uses `text-foreground/45` for 12px card dates; on the light card surface its composited contrast is approximately 2.9:1.
   - `src/pages/blog/[slug].astro:70` and `src/pages/en/blog/[slug].astro:82` use `text-foreground/40` for article dates; the light composited contrast is approximately 2.5:1.
   - Both list and article breadcrumb containers use `text-foreground/55` (`src/pages/blog/index.astro:28`, `src/pages/blog/[slug].astro:52`, `src/pages/en/blog/index.astro:31`, `src/pages/en/blog/[slug].astro:59`), approximately 4.0:1 on the light canvas.
   - These are normal-size text and fall below WCAG 2.1 AA success criterion 1.4.3 (4.5:1). Existing `tests/contrast.test.ts` covers only hero colors, and home-only Axe/Lighthouse runs do not reach these routes.

2. **Medium — the automatic certification carousel does not reliably pause for keyboard users and has no persistent pause mechanism.**
   - `src/components/CertificationCarousel.astro:276-286` continues request-animation-frame scrolling unless `container.matches(':hover')`; focus inside a certificate link or arrow button is not a pause condition.
   - The component provides previous/next buttons, but neither represents a pause/stop control. The duplicated links are correctly hidden from assistive technology and removed from tab order.
   - This requires a separate, focused WCAG 2.2.2 keyboard-and-motion slice, ideally mirroring `SignalStrip`'s explicit pressed pause control. It is intentionally not included in the first contrast slice.

3. **Medium — privacy-policy email anchors are literal, invalid mailto destinations.**
   - `src/pages/privacy.astro:55,219` and `src/pages/en/privacy.astro:55,208` render `href="mailto:{personalInfo.email}"` instead of Astro interpolation.
   - The visible email text is correct but activating it cannot reliably open the stated address. This is a functional link defect, not part of the narrow first contrast slice.

4. **Coverage gap — automated accessibility checks are confined to home pages.**
   - `tests/home/home-accessibility.spec.ts` scans only `/` and `/en`; `lighthouserc.json` collects only their deployed equivalents.
   - Blog lists, blog articles, privacy routes, 404 routes, keyboard focus visibility, and carousel motion behavior are not covered by an accessibility-specific browser contract.

## Narrow first slice: `blog-text-contrast`

### Scope

Restore AA contrast for standard blog navigation and metadata without altering hierarchy, layout, copy, theme architecture, or visual design:

1. Replace low-alpha foreground utilities on blog breadcrumbs and timestamps with the existing semantic `--muted-foreground` token in:
   - `src/components/BlogCard.astro`
   - `src/pages/blog/index.astro`
   - `src/pages/blog/[slug].astro`
   - `src/pages/en/blog/index.astro`
   - `src/pages/en/blog/[slug].astro`
2. Extend `tests/contrast.test.ts` with a source-level semantic-token contract for blog metadata/navigation.
3. Add a focused Playwright Axe contract for Spanish and English blog list and article routes, so rendered contrast regressions are caught outside the home-page-only suite.

### Acceptance criteria

- Given Spanish or English blog listing and article routes in light or dark theme, when normal-size breadcrumb and date text is rendered, then it MUST use a foreground/background combination meeting WCAG AA 4.5:1 contrast.
- Given those routes, when Axe scans the stable rendered page with reduced motion, then it MUST report no violations.
- Given the change, then blog layout, locale routing, article content, and visual hierarchy MUST remain unchanged apart from improved text legibility.

### Non-goals

- No changes to home-page components, hero colors, project cards, global palette, or theme-toggle behavior.
- No carousel pause-control implementation; retain it as the next isolated keyboard/motion slice.
- No privacy link correction, content rewrite, SEO change, external-link disclosure, or visual redesign.
- Do not modify `openspec/changes/contact-card-email-overflow/` artifacts.

### Verification

- `pnpm test -- tests/contrast.test.ts`
- `pnpm test:e2e -- tests/blog-accessibility.spec.ts`
- `pnpm test`
- `pnpm check`
- `pnpm build`

### Estimated review workload

Approximately 70-105 changed lines: 10-15 product CSS-class substitutions across five blog templates/components, 15-25 unit-contract lines, and 45-65 focused Playwright lines. This is well below the 400-line review budget.

### Rollback

Revert the class substitutions and new test file as one unit. No route, data, persisted preference, or generated-content migration is involved.
