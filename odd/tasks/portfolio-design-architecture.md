# Portfolio design and architecture cleanup

## Goal
Improve visual consistency across all portfolio pages and make the Astro architecture easier to understand and extend, while preserving the existing Sebastian Bravo identity, content, locale behavior, routes, accessibility, and progressive-enhancement guarantees.

## Accepted direction
- Preserve the established midnight/lavender editorial design language; refine rather than replace it.
- Audit every existing route and reuse components/templates where that reduces duplication without obscuring route-specific behavior.
- Keep Spanish/English copy, metadata, blog fallback rules, dark mode, responsive behavior, reduced-motion support, SEO, and security contracts intact.
- Use Organic Driven Development (ODD), with review/check gates between implementation slices. SDD automation is unavailable in this runtime; no SDD artifacts or review claims will be fabricated.

## Tasks
- [x] Extract shared localized homepage composition; preserve thin locale route modules and localized data. (Route: delegated direct; trigger: 2+ non-trivial files.)
- [x] Extract shared localized blog index/post templates while preserving locale-specific content and fallback rules. (Route: delegated direct; trigger: 2+ non-trivial files.)
- [x] Finish light-theme semantic palette alignment and make all small-text roles meet WCAG AA; update the design reference and contrast contract. (Route: delegated direct; trigger: multi-file source/test/doc write.)
- [x] Update route-structure tests to follow canonical shared templates and keep full Vitest green. (Route: delegated direct; trigger: multi-file test updates.)
- [x] Align and test documented dark-theme tokens without changing motion or layout behavior. (Route: delegated direct; trigger: CSS plus regression tests.) Corrected dark primary to actual `#cbb7fb`, set dark accent foreground to charcoal, and added conversion/contrast assertions.
- [x] Improve route-wide accessibility coverage for fallback content language and full blog surfaces. (Route: delegated direct; trigger: multiple components/styles/tests.)
- [x] Review remaining page-family styles (privacy/404 and shared shell) against the identity without a blanket rewrite. (Route: read-only mapping followed by bounded writer for 404 reuse and shell alignment.)
- [x] Replace the JSON-LD noindex source-shape assertion with a behavior-level contract. Both rendered 404 routes assert noindex and emitted graph excludes `WebPage`, retaining `Person` and `WebSite`.
- [x] Correct blog localized alternates using actual translation relationships; never emit `hreflang` URLs for routes that do not exist. Added optional explicit `translationKey` to the two verified pairs, constrained locales to `es`/`en`, and covered matched, unmatched, fallback, unsupported, same-locale, and mismatched-key cases.
- [x] Run focused and repository quality checks; review each slice before continuing and record all remaining limitations. (Route: delegated verification; native risk assessment unavailable.)

## Acceptance criteria
- Existing routes, translated content, metadata, and blog locale fallback behavior remain correct.
- Repeated page structure is expressed through appropriately named shared templates/components rather than duplicated markup.
- All pages use coherent visual tokens and responsive layout while retaining the documented brand identity.
- Keyboard/focus, semantic structure, reduced-motion, dark mode, and static-build behavior do not regress.
- Tests and checks run with results recorded; no unsupported review/SDD gate is claimed.

## Risks and scope controls
- The request spans many routes and may exceed the 400-line review budget; keep slices focused and pause for a scope decision before producing an oversized slice.
- Avoid broad rewrites of motion/WebGL, security headers, content, or route semantics unless a concrete defect requires it.
- Preserve pre-existing repository state; do not commit, push, or publish without an explicit request.

## Progress evidence
- Initial exploration: `gentle-ai-explore` mapped Astro routes, shared shell/components, localization duplication, design token drift, and checks. Worktree was clean on `main` before the feature branch was created.
- Branch: `odd/portfolio-design-architecture`.
- Work-unit commits: none (not authorized).
- TDD: strict, explicitly selected by the user for this feature; source: current-session choice; focused homepage runner: `pnpm test:e2e -- tests/home/home.spec.ts` (Playwright, user-approved after confirming the page spec is not Vitest).
- Environment preparation: `pnpm install --frozen-lockfile`, `pnpm build`, and `pnpm exec playwright install chromium firefox webkit` succeeded. Initial test attempts exposed missing `dist/` and browser executables; both prerequisites are now prepared.
- Baseline: `pnpm test:e2e -- tests/home/home.spec.ts` passed all 24 tests across Chromium, Firefox, and WebKit before source edits; this is baseline, not RED evidence.
- Strict TDD evidence for homepage slice: the architecture assertion failed before the shared template existed; then the fresh-build Playwright suite passed 27/27 and `pnpm check` passed with no diagnostics.
- Homepage review: independent read-only review found no concrete preservation/accessibility regression. It noted the architecture assertion is intentionally narrow; fresh-build verification was subsequently run independently and passed.
- Native risk assessment was unavailable (`native-assess-unavailable`) and returned risk `unassessable`; fail-closed plan required writer verification plus independent verification. Writer checks and separate `gentle-ai-verify` build/E2E checks completed successfully.
- Blog slice: `pnpm build` passed and then fresh-build `pnpm test:e2e -- tests/blog-accessibility.spec.ts` passed 27/27; `pnpm check` passed without diagnostics.
- Initial blog review found pre-existing fallback-language semantics and narrow Axe scope; comparison with `main` confirmed they were not refactor regressions. Both were later fixed with explicit content-language markup and full-main Axe checks.
- Route/style audit: Astro HTML routes are `/`, `/en`, blog index/post in both locales, privacy in both locales, 404 in both locales; `/og/[locale].svg` is an SVG endpoint. Projects are a homepage section, not separate Astro routes. Home, blog, and 404 now share localized templates; legal privacy documents remain explicit.
- Initial design-token drift was resolved: light tokens now match the documented white/charcoal/lavender/amethyst/cream/soft-surface roles; caption text is darker for WCAG contrast. Dark tokens now also match documented Night Canvas/Surface/Border/Text/Muted and Warm Cream Dark roles.
- Token implementation added semantic light-palette tokens and passed focused token/contrast tests; the caption value is now `#69645f` in CSS and DESIGN.md. Strict TDD RED measured the old caption at 3.65:1; the updated contract requires at least 4.5:1 on white, soft surface, and warm cream.
- Route-structure test migration now points smoke/JSON-LD assertions at the shared homepage/blog templates; full Vitest initially passed 72/72, then 73/73 after the caption regression test was added.
- Independent review found no defect in the caption fix; it confirmed the three tested surfaces and matching CSS/docs values. Independent `pnpm test` and `pnpm check` passed (73/73; Astro 140 files, 0 diagnostics).
- Dark-theme alignment was completed separately without altering light values.
- JSON-LD noindex behavior is now asserted from rendered `/404` and `/en/404` output (noindex, self-canonical, Person/WebSite retained, WebPage omitted); the weak noindex source-expression test was removed.
- Dark palette strict-TDD evidence: before CSS correction, primary rendered `#c0a5e9` instead of `#cbb7fb` and accent contrast was 2.14:1; after correction, `pnpm test` passed 77/77 and `pnpm check` reported 140 files with no diagnostics.
- Independent dark-token review confirmed the corrected HSL renders as `#cbb7fb`, lavender accent foreground now meets >=4.5:1, documented light values match tests, and no concrete defect remains in the reviewed slice.
- Blog accessibility follow-up: English fallback cards now expose Spanish content language separately from English UI/date language, and Axe scans the full blog main region for both themes.
- Blog accessibility strict-TDD RED: fresh build passed, then the expanded Playwright suite failed 15/30; fallback card-language assertions failed across browsers and full-main Axe found light-theme contrast violations including muted 3.92:1 and body/link 3.5:1.
- Blog accessibility GREEN: cards now distinguish content language from UI/date language; fallback article language and translated notice/date language are explicit; low-contrast light text uses accessible semantic colors. No Axe rules were suppressed.
- Independent fresh-build verification passed `pnpm build`, 33/33 focused blog E2E cases (11 per Chromium/Firefox/WebKit; both themes, no Axe violations), and `pnpm check` (140 files, no diagnostics). Independent review found no defects and confirmed dark prose remains theme-scoped.
- Before implementation, page-family mapping found privacy legal content/order differs by jurisdiction and should remain explicit; 404 composition was duplicated, Header used 1280px vs Footer/design guidance 1200px, and route accessibility coverage was missing. The implementation extracted 404 and aligned shell width; full privacy/404 Axe tests now pass.
- The 404 template/shell slice passed fresh `pnpm build`, 24/24 privacy/404 accessibility E2E cases, 80/80 Vitest cases, and Astro check (142 files, no diagnostics); route/theme Axe found no violations.
- Independent review found 404 canonical metadata defaulted to `/` or `/en`; strict-TDD RED was captured and fixed. The component now supplies `/404` and `/en/404` canonicals while retaining `noindex`; fresh-build E2E and review confirmed route metadata.
- Strict-TDD RED for the 404/shell slice: `pnpm test` failed only the new shared-template route assertions and header/footer 1200px contract (77/80 passed); a fresh `pnpm build` passed; new route/theme Axe E2E passed 24/24 before implementation, with no violations. Source changes are limited to two 404 route wrappers, a shared template, and Header width.
- An attempted Vitest file filter unexpectedly ran the entire suite and exposed five stale page-source assertions after template extraction; smoke and JSON-LD tests were updated to inspect canonical shared templates. Full Vitest passes.
- Privacy legal content remains explicit because section order/content is locale/jurisdiction-specific; both rendered routes pass light/dark Axe checks.
- Full E2E initially found one stale expected foreground in `tests/home/home.spec.ts:114` across three browsers. The assertion now expects the documented token `rgb(41, 40, 39)`; the final full E2E suite passes 162/162.
- Integration review found invalid blog alternate links: the shared post template built both localized URLs from the current post ID, but native EN/ES translations use different IDs and English fallback content is Spanish. Original page code had the same assumption, so this predates the refactor. Inventory found 41 posts: 39 Spanish-only plus two clear native EN/ES pairs (ManttoAI and Vulcania) with no pairing metadata.
- Alternate writer added optional `translationKey` metadata to both pair members, key-based counterpart resolution, and `createBlogAlternates` behavior for matched, unmatched, and fallback routes. User approved updating stale JSON-LD route-prop assertions; full build/E2E/Vitest/check subsequently passed (162 browser tests, 84 unit tests, 144 files checked).
- Final integration review found the schema/resolver could accept unsupported or same-locale pairs. Strict-TDD RED was captured; schema now permits only `es`/`en`, counterpart resolution requires the exact matching key and opposite locale, and tests reject mismatched keys. Independent final build/E2E/tests/check passed: 90 pages, 162/162 E2E, 88/88 Vitest, 144-file Astro check, bundle/CSP pass. Native assess remains unassessable; independent review and separate verification were used.
- Strict-TDD RED for alternates: `pnpm test` failed only because the new helper was not yet implemented (79 other tests passed); `pnpm build:ci` produced 90 pages; blog E2E showed 9 failures across three browsers for translation IDs and fallback hreflang. Implementation surfaces are the content schema, four matched MDX entries, both post route generators, shared post component, helper, and the new unit/E2E tests.
