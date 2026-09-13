# Tasks: Harden Vercel Security Headers and CSP Verification

## Review Workload Forecast

| Field | Value |
| ------- | ------- |
| Estimated changed lines | 110–150 across four in-scope files |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Scope guard

Only modify `vercel.json`, `scripts/verify-csp-hashes.ts`, `tests/security-headers.test.ts`, and `README.md`. Do not change application markup/configuration, package/workflow files, cache rules, or previous OpenSpec artifacts. The nested change spec is present at `openspec/changes/security-headers/specs/security-headers/spec.md`; apply work must use it together with the accepted proposal and design as scope authority.

## Implementation tasks

### 1. RED — specify the header and verifier contract

- [x] Create `tests/security-headers.test.ts` with failing Node/Vitest tests that import pure verifier helpers and assert the checked-in `vercel.json` global catch-all route rule has every required non-CSP header, the fixed CSP directive/token sets (including `script-src-attr 'none'`), and only the approved non-hash `script-src` sources plus valid SHA-256 tokens. <!-- sdd-owner: implementation -->
- [x] Add table-driven failing fixtures in `tests/security-headers.test.ts` for a missing global rule/CSP, duplicate header or CSP directive, a missing or incorrect required header/directive value, and an unexpected `script-src` source; assert diagnostics identify the violated contract. <!-- sdd-owner: implementation -->
- [x] Add failing in-memory HTML parity tests in `tests/security-headers.test.ts` proving that classic and module inline scripts are hashable, duplicate bodies share one authorization, `src` and JSON-LD scripts are excluded case-insensitively, raw whitespace changes hashes, and generated-only/configured-only hashes are separately reported. <!-- sdd-owner: implementation -->
- [x] Run `pnpm test -- tests/security-headers.test.ts` and record the expected RED failures caused by the absent pure API and `script-src-attr 'none'`. <!-- sdd-owner: implementation -->

### 2. GREEN — implement deterministic configuration and parity validation

- [x] Refactor `scripts/verify-csp-hashes.ts` into import-safe exported helpers and a guarded CLI adapter: validate unknown `vercel.json` input, locate exactly one global catch-all route rule, normalize header names/directives, enforce the required non-CSP header values and fixed CSP tokens, and return all actionable validation errors without helper-level process exits. <!-- sdd-owner: implementation -->
- [x] Implement executable inline-script extraction and exact set parity in `scripts/verify-csp-hashes.ts`: recursively collect generated HTML, fail clearly for unreadable/empty `dist/`, hash raw inline executable bodies, and report stable sorted missing and unused SHA-256 authorizations separately while retaining a useful success summary. <!-- sdd-owner: implementation -->
- [x] Update only the global `Content-Security-Policy` value in `vercel.json` to add `script-src-attr 'none'`; preserve all existing hashes, analytics/connect allowances, `style-src 'unsafe-inline'`, non-CSP headers, header ordering, and cache rules. <!-- sdd-owner: implementation -->
- [x] Run `pnpm test -- tests/security-headers.test.ts` until all RED contract, malformed-configuration, extraction, and parity tests pass. <!-- sdd-owner: implementation -->

### 3. TRIANGULATE — exercise real generated-output integration

- [x] Run `pnpm build` to generate fresh `dist/` and execute `verify:csp`; reconcile only reviewed executable-script hash differences in the global `script-src` policy, then rerun until exact generated/configured hash parity passes. <!-- sdd-owner: implementation -->
- [x] Re-run `pnpm test -- tests/security-headers.test.ts` after the fresh build to confirm its fixtures remain independent of ignored `dist/` output and the checked-in policy contract still passes. <!-- sdd-owner: implementation -->

### 4. REFACTOR — document the operational boundary

- [x] Update `README.md` Security Gates and add a concise deployment-security-headers note: name `vercel.json` as the Vercel response-header authority, require inspection plus `pnpm build` after executable inline-script changes, describe exact hash parity rather than one-way coverage, and state that `pnpm preview` cannot prove Vercel-delivered headers. <!-- sdd-owner: implementation -->
- [x] Keep `scripts/verify-csp-hashes.ts` helper names/types and `tests/security-headers.test.ts` fixtures concise and deterministic; remove duplication without weakening malformed-configuration diagnostics or two-way parity coverage. <!-- sdd-owner: implementation -->

### 5. Full verification and deployment observation note

- [x] Run the existing repository gates in dependency order: `pnpm test`, `pnpm test:coverage`, `pnpm build`, `pnpm test:e2e`, and `pnpm validate:links`; investigate any regression without expanding scope beyond the four approved files. <!-- sdd-owner: implementation -->
- [x] Include the README/runbook deployment verification note for a post-Vercel-release observer to inspect the homepage, English homepage, one blog page, the security.txt endpoint, one Astro static asset, and the Spanish OG SVG response for global headers, route cache coexistence, and absent CSP console violations; do not add deployment probes, workflows, or credentials. <!-- sdd-owner: implementation -->
