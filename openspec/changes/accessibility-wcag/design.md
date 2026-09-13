# Technical Design: Restore Blog Text Contrast

## Decision

Implement the `blog-text-contrast` first slice by replacing only the failing breadcrumb and publication-date alpha utilities with Tailwind's existing `text-muted-foreground` semantic utility. Protect the change with a source-level Vitest contract and a focused rendered Playwright/Axe matrix covering Spanish and English blog list and article routes in explicit light and dark themes.

No global color token, component API, route, content, layout, or client-side behavior changes are required. Certification-carousel motion and privacy-policy `mailto:` defects remain deferred.

## Scope boundary

### In scope

- Blog-card publication dates.
- Blog-list breadcrumbs in both locales.
- Blog-article breadcrumbs and publication dates in both locales.
- Source-level assertions that those elements use `text-muted-foreground`.
- Focused Axe scans of the affected rendered elements on four stable routes in light and dark themes.
- Responsive and theme verification that the class-only color correction does not alter layout.

### Explicitly deferred

- `src/components/CertificationCarousel.astro`, including keyboard-focus pause behavior and a persistent pause control.
- `src/pages/privacy.astro` and `src/pages/en/privacy.astro`, including the malformed `mailto:{personalInfo.email}` destinations.
- Full-site or full-blog accessibility certification beyond the affected breadcrumb and date surfaces.
- Unrelated low-emphasis blog text such as tags, descriptions, empty states, or footer navigation unless a separately scoped change establishes a failure and acceptance criteria.
- Any artifact under `openspec/changes/contact-card-email-overflow/`.

## Affected paths

| Path | Exact change |
| --- | --- |
| `src/components/BlogCard.astro` | Change the card `<time>` utility from `text-foreground/45` to `text-muted-foreground`. Keep its `text-xs`, `font-mono`, responsive flex placement, and all card markup unchanged. |
| `src/pages/blog/index.astro` | Change the breadcrumb `<ol>` utility from `text-foreground/55` to `text-muted-foreground`. |
| `src/pages/en/blog/index.astro` | Apply the same breadcrumb `<ol>` substitution as the Spanish list route. |
| `src/pages/blog/[slug].astro` | Change the breadcrumb `<ol>` from `text-foreground/55` and the article `<time>` from `text-foreground/40` to `text-muted-foreground`. |
| `src/pages/en/blog/[slug].astro` | Apply the same breadcrumb and article-date substitutions as the Spanish article template. |
| `tests/contrast.test.ts` | Add a `blog text contrast contract` suite that reads the five Astro sources and asserts semantic-token use on the targeted `<ol>` and `<time>` elements without banning unrelated alpha utilities elsewhere in those files. |
| `tests/blog-accessibility.spec.ts` | Add the focused Playwright/Axe route-and-theme matrix described below. |

## Styles and token choice

### Utility substitution

The implementation changes class applications in Astro markup; it does not add or edit a stylesheet.

| Surface | Current utility | Replacement | Rendered background |
| --- | --- | --- | --- |
| `BlogCard` date | `text-foreground/45` | `text-muted-foreground` | `--card` |
| Spanish and English list breadcrumbs | `text-foreground/55` | `text-muted-foreground` | `--background` |
| Spanish and English article breadcrumbs | `text-foreground/55` | `text-muted-foreground` | `--background` |
| Spanish and English article dates | `text-foreground/40` | `text-muted-foreground` | `--background` |

`src/styles/portfolio-base.css` remains read-only. It already exposes `--muted-foreground` through Tailwind v4's `@theme inline` mapping:

```css
--color-muted-foreground: hsl(var(--muted-foreground));
```

The existing theme values are intentionally reused:

- Light: `--muted-foreground: 240 4% 32%`, documented by the design system as approximately `#50505a` and 7.2:1.
- Dark: `--muted-foreground: 30 5% 58%`, documented as 5.3:1 on the dark canvas.
- High-contrast preference: the existing `prefers-contrast: high` overrides strengthen the same semantic token in both themes.

### Rationale

`muted-foreground` is the established design-system role for secondary readable text. Dates and ancestor breadcrumb items are secondary information, so the token preserves hierarchy without introducing a blog-only color or changing the global palette. Unlike foreground opacity, the token has independently selected light and dark values and remains above WCAG 2.1 AA's 4.5:1 threshold on the affected canvas and card surfaces.

No new token is justified because:

1. the existing token already represents readable secondary text;
2. a numeric blog-only color would duplicate theme logic;
3. changing `--foreground` or `--muted-foreground` globally would broaden visual impact beyond this slice; and
4. retaining alpha with a larger percentage would keep compliance coupled to every underlying surface.

The current-page breadcrumb child keeps `text-foreground/80`, which overrides the inherited breadcrumb color and preserves its stronger hierarchy. Existing hover states continue to move ancestor links to `text-foreground`.

## Component and route contracts

### `BlogCard.astro`

The component interface and data flow remain unchanged:

```ts
interface Props {
  id: string
  title: string
  description: string
  publishDate: Date
  tags: string[]
  locale: 'es' | 'en'
  fallbackLabel?: string
}
```

`publishDate` continues through `Intl.DateTimeFormat` with `es-CL` or `en-US`, and the `<time datetime>` value remains the ISO timestamp. Only the computed text color changes. Card links, headings, tags, fallback labels, responsive direction, hover transform, and card surfaces remain unchanged.

### Blog list routes

- `/blog` continues to render Spanish posts through `src/pages/blog/index.astro`.
- `/en/blog` continues to render English posts and Spanish fallback cards through `src/pages/en/blog/index.astro`.

Both templates continue to pass post data to `BlogCard`. The breadcrumb list inherits `text-muted-foreground`; each card date receives the same semantic treatment inside `BlogCard`.

### Blog article routes

- `/blog/manttoai-ml-iot-random-forest` is the stable Spanish article fixture.
- `/en/blog/manttoai-ml-iot-random-forest-en` is the stable native-English article fixture.

The dynamic templates, `getStaticPaths`, canonical and alternate URLs, JSON-LD, MDX rendering, locale handling, and fallback-language behavior remain unchanged. The fixtures are existing committed content entries, not test-only routes.

### Data flow

1. Astro's content collection supplies each post and publication date.
2. List templates render `BlogCard`; dynamic templates render their article headers directly.
3. Tailwind compiles `text-muted-foreground` to the existing CSS custom-property mapping.
4. `Layout.astro` establishes the root theme before paint from the `theme` local-storage key and applies or removes `.dark`.
5. The browser resolves the theme-specific `--muted-foreground` against the existing `--background` or `--card` surface.
6. Axe evaluates the final computed foreground/background pair after navigation and fonts are stable.

No runtime state, API request, hydration boundary, schema, or persistence contract is added.

## Test strategy

### 1. Source-level Vitest contract

Extend `tests/contrast.test.ts` rather than creating another unit-test file. Read the five affected Astro sources with `readFileSync`, following the file's existing source-contract pattern.

Add targeted assertions that:

- `BlogCard.astro`'s `<time>` contains `text-muted-foreground` and does not contain `text-foreground/45` on that element;
- each list template's breadcrumb `<ol>` contains `text-muted-foreground` and not `text-foreground/55` on that element; and
- each article template's breadcrumb `<ol>` and header `<time>` contain `text-muted-foreground`, replacing the targeted `/55` and `/40` utilities.

Assertions MUST be element-scoped regular expressions or equally targeted source fragments. They MUST NOT assert that an entire file contains no `text-foreground/55`, because unrelated empty-state or footer styles are outside this slice. The source contract proves semantic-token adoption; it does not substitute for rendered contrast analysis.

Focused command:

```sh
pnpm test -- tests/contrast.test.ts
```

### 2. Focused Playwright/Axe contract

Create `tests/blog-accessibility.spec.ts` using `@axe-core/playwright` and `@playwright/test`. Set reduced motion for the test context, matching the existing home accessibility suite, so transitional frames cannot create contrast false positives.

Use this route matrix:

| Case | Route | Stable page assertion |
| --- | --- | --- |
| Spanish list | `/blog` | `main#main-content h1` has the exact text `Blog`; at least one `article time` is present. |
| English list | `/en/blog` | `main#main-content h1` has the exact text `Blog`; at least one `article time` is present. |
| Spanish article | `/blog/manttoai-ml-iot-random-forest` | The article heading starts with `Lo que aprendí construyendo`; exactly one article-header date is present. |
| English article | `/en/blog/manttoai-ml-iot-random-forest-en` | The article heading starts with `ManttoAI: building`; exactly one article-header date is present. |

Run every route for `light` and `dark`, producing eight logical cases per configured browser project. Before `page.goto`, install an init script that writes the explicit theme to `localStorage.theme`; do not rely on the operating-system color scheme. After navigation:

1. wait for `networkidle`;
2. await `document.fonts.ready`;
3. assert `.dark` is present for dark and absent for light;
4. assert the expected heading and date targets so a 404 or empty route cannot produce a false pass; and
5. run Axe against the affected rendered contexts.

The Axe context selector is:

```css
main#main-content nav[aria-label="Breadcrumb"], main#main-content article time
```

This includes every affected breadcrumb and rendered date while keeping the first slice isolated from unrelated blog copy and footer navigation. Run Axe's normal rule set and assert `results.violations` is empty; do not disable `color-contrast`, suppress impact levels, or filter violations after analysis.

This focused result MUST be reported as a contract for the affected surfaces, not as proof that every element on every blog route conforms to WCAG. Existing full-page home Axe coverage remains unchanged. A later broad blog audit may add a separate full-page suite without weakening this contract.

Focused command:

```sh
pnpm test:e2e -- tests/blog-accessibility.spec.ts
```

`playwright.config.ts` remains unchanged. The new spec therefore runs against the production preview in Chromium, Firefox, and WebKit.

### 3. Strict TDD sequence

1. **RED:** Add the targeted Vitest and Axe contracts first. Confirm the source assertions fail on the old alpha classes and the rendered color-contrast checks identify the affected light/dark surfaces.
2. **GREEN:** Make only the seven class substitutions listed in this design.
3. **TRIANGULATE:** Run all four routes in both explicit themes across the configured browser projects, confirming both `--background` and `--card` contexts.
4. **REFACTOR:** Keep the route/theme cases table-driven inside the test file. Do not create a product abstraction merely to deduplicate classes across otherwise distinct page templates.

If RED exposes an unrelated violation outside the Axe selector, record it separately rather than broadening this change. If a targeted surface still fails after the substitution, inspect its computed foreground, background, opacity, and inherited class before considering any token change.

### 4. Regression gates

Run the narrow checks before the broader repository gates:

```sh
pnpm test -- tests/contrast.test.ts
pnpm test:e2e -- tests/blog-accessibility.spec.ts
pnpm test
pnpm check
pnpm test:e2e
pnpm build
```

`pnpm build` includes the repository's source-limit, static-build, bundle, and CSP checks. No link destination changes are planned, so `pnpm validate:links` is not a required acceptance gate for this slice, though it may still run in the normal delivery workflow.

## Responsive and theme considerations

### Responsive behavior

No spacing, sizing, display, breakpoint, or typography utility changes. At widths below `sm` (640px), `BlogCard` continues to stack tags and date vertically; at `sm` and above it continues to place them in a row. Breadcrumbs retain `flex-wrap`, and article dates retain their existing inline-block placement.

Because the replacement changes only `color`, it must not affect line wrapping, intrinsic width, card dimensions, breadcrumb wrapping, or article flow. Perform a visual spot check at 390×844 and 1280×720 on the four route fixtures. Verify that dates and breadcrumbs remain visible, wrap exactly as their available width requires, and do not introduce horizontal scrolling. Any geometry change is a regression, not expected behavior.

### Theme behavior

The test matrix explicitly covers light and dark rather than `system`. `system` resolves to one of those two effective themes through `Layout.astro`, so testing both resolved states exercises the relevant token values without making the result dependent on the test host.

For visual review, inspect each route at least once in both themes. The hierarchy passes when the date and ancestor breadcrumb text is visibly secondary to headings and current-page breadcrumbs but no longer faint. High-contrast mode needs no new branch because it already overrides `--muted-foreground` with stronger values; a manual smoke check may confirm the override remains effective.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Secondary text appears too prominent. | Reuse the existing semantic muted token rather than foreground or a new arbitrary value; preserve current-page and heading colors. |
| A theme appears compliant while the other regresses. | Force and scan both explicit themes on every route fixture. |
| Axe scans a 404 or an empty list and passes. | Assert stable headings and required date counts before analysis. |
| Animation or font loading creates transient computed styles. | Use reduced motion, wait for network idle, and await `document.fonts.ready`. |
| Source assertions become brittle or ban unrelated styles. | Scope assertions to breadcrumb `<ol>` and publication `<time>` elements only. |
| Focused Axe scope is mistaken for full-page conformance. | Name and report it as an affected-surface contract; retain existing home coverage and defer broader blog auditing. |
| Work expands into carousel or privacy fixes. | Reject edits to the deferred files and open separate slices for those findings. |

## Rollout

This is a static HTML/CSS output change with no feature flag, schema migration, content migration, cache key, API compatibility concern, or persisted user-state change. Deliver the five Astro substitutions and their two regression contracts as one reviewable unit after all focused and regression gates pass.

Review in this order:

1. `tests/contrast.test.ts` for precise source targets and RED evidence.
2. `tests/blog-accessibility.spec.ts` for route validity, explicit themes, reduced motion, and unsuppressed Axe results.
3. The five Astro files for exactly the seven class substitutions.
4. Focused and full gate results plus responsive/theme visual checks.
5. The final diff to confirm no carousel, privacy, global-token, content, route, or prior-change artifact edits entered the slice.

The expected 70–105 changed lines remains below the 400-line review budget and should ship as one review unit.

## Rollback

Rollback the five Astro class substitutions and both associated test changes together. This restores the previous rendered colors and removes contracts that would intentionally fail against them; no data, route, generated-content, or preference recovery is needed.

Do not roll back or edit `src/styles/portfolio-base.css`, because this slice does not change the semantic token definitions. Do not use rollback as an opportunity to modify the deferred carousel or privacy issues.

After rollback, run:

```sh
pnpm test
pnpm check
pnpm test:e2e
pnpm build
```

If only one browser engine reports a post-deployment rendering defect, first reproduce its computed foreground/background pair. Prefer reverting the complete slice over introducing an engine-specific color exception without a separate reviewed design.
