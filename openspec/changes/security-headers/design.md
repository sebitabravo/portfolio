# Design: Harden Vercel Security Headers and CSP Verification

## Decision summary

This change keeps `vercel.json` as the single deployment-time owner of response headers, adds `script-src-attr 'none'` to the existing global CSP, and turns `scripts/verify-csp-hashes.ts` into a deterministic validator for both the header contract and generated inline-script hashes. A focused Vitest suite will exercise the pure validation logic and the checked-in Vercel configuration. `pnpm build` remains the integration point that validates the real generated `dist/` output.

No application source, Astro configuration, workflow, package script, cache rule, or prior OpenSpec artifact changes are required.

## Constraints and invariants

- Preserve current application behavior and generated markup.
- Preserve the existing `script-src` Vercel Analytics allowance and `connect-src` Analytics/Speed Insights endpoints.
- Preserve `style-src 'unsafe-inline'`; Astro's generated critical and component styles currently require it.
- Continue hashing the exact bytes between executable inline `<script>` tags.
- Continue excluding scripts with `src` and `type="application/ld+json"` from generated executable-script hashes.
- Keep all existing non-CSP security headers and all route-specific cache rules unchanged.
- Keep the existing `build`, `build:ci`, and `verify:csp` commands unchanged; they already place verification after static generation.
- Keep the implementation below the 400-line review budget. If the test seam expands the change beyond that budget, pause for an `ask-on-risk` delivery decision.

## Architecture and data flow

```text
vercel.json ── parse/validate global /(.*) headers ──┐
                                                      ├─ compare unique hash sets ── pass/fail
fresh dist/**/*.html ── select executable inline ────┘
                         scripts and SHA-256 hash
```

The verifier has two layers:

1. **Pure contract layer:** validates an unknown configuration value, parses CSP directives without depending on directive order, identifies executable inline script bodies, and compares configured and generated hash sets.
2. **CLI adapter:** reads `vercel.json` and `dist/**/*.html`, calls the pure layer, prints actionable diagnostics, and sets a failing exit status when any contract check fails.

The checked-in configuration test imports only the pure layer. Importing the verifier must not execute the CLI. The CLI entry point therefore runs only when the module is the process entry module.

## Exact file changes

### `vercel.json`

Modify only the `Content-Security-Policy` value in the global `source: "/(.*)"` header rule:

- Add `script-src-attr 'none';` immediately after the existing `script-src` directive.
- Leave every current `script-src` source and SHA-256 token unchanged except for any hash updates proven necessary by a fresh build.
- Leave `style-src 'self' 'unsafe-inline'`, the Vercel connection sources, and every other CSP directive unchanged.
- Leave the seven existing non-CSP security headers and their values unchanged:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=(), browsing-topics=()`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Resource-Policy: same-origin`
- Do not change `buildCommand`, header route ordering, or any route-specific `Cache-Control` rule.

The final CSP's fixed directive contract is:

| Directive | Required values |
| --- | --- |
| `default-src` | `'self'` |
| `script-src` | `'self'`, `https://va.vercel-scripts.com`, and the exact generated SHA-256 hash set |
| `script-src-attr` | `'none'` |
| `style-src` | `'self'`, `'unsafe-inline'` |
| `img-src` | `'self'`, `data:` |
| `font-src` | `'self'`, `data:` |
| `connect-src` | `'self'`, `https://vitals.vercel-insights.com`, `https://va.vercel-scripts.com` |
| `worker-src` | `'self'` |
| `frame-ancestors` | `'none'` |
| `base-uri` | `'self'` |
| `form-action` | `'self'` |
| `object-src` | `'none'` |
| `manifest-src` | `'self'` |
| `upgrade-insecure-requests` | no values |

Directive and source ordering is not semantically significant. Validation compares normalized names and token sets so harmless reordering does not fail, while missing directives, duplicate directives, missing values, or additional values in the fixed directives do fail. `script-src` is the only variable directive: its non-hash sources are fixed, and its hashes are governed by generated-output parity.

### `scripts/verify-csp-hashes.ts`

Refactor the current top-level script into exported pure helpers plus a guarded CLI, without adding a dependency.

#### Configuration model and parsing

- Extend `VercelConfig` header entries to include `source` and treat parsed JSON as `unknown` until its required shape has been checked.
- Find exactly one global header rule whose source is `/(.*)`. Do not accept a CSP found on a cache-only route.
- Build a case-insensitive header-name map and reject duplicate header names, missing values, a missing CSP, or any missing/incorrect required non-CSP header value.
- Parse CSP by semicolon-separated directives and whitespace-separated tokens. Normalize directive names, preserve source tokens exactly, reject duplicate directives, and reject malformed empty entries where a value is required.
- Validate the fixed directive token sets shown above. For `script-src`, require exactly the two fixed non-hash sources and syntactically valid quoted `'sha256-…'` tokens; reject unsafe or unexpected non-hash sources.
- Extract configured executable-script hashes from `script-src` only, rather than matching SHA-256 text anywhere in the full CSP.

The pure configuration validator returns a normalized policy containing the configured hash set. It reports all discovered contract errors together so maintainers can repair a malformed policy in one pass.

#### Generated HTML and hash parity

- Keep recursive `collectHtml`, but fail clearly when `dist/` cannot be read or contains no HTML documents.
- Export `hashScript(content)` and an HTML extraction helper for focused tests.
- Match `src` attributes case-insensitively and continue excluding `application/ld+json` type values case-insensitively. Inline classic and inline module scripts remain executable and therefore remain hashable.
- Hash the raw captured script body without trimming, decoding, or HTML-parser normalization. CSP hashes are byte-sensitive.
- Track both total executable script occurrences and the unique generated hash set. Duplicate inline bodies across routes count in the summary but require only one CSP token.
- Compare sets in both directions:
  - `generated - configured` is **missing authorization**;
  - `configured - generated` is **unused authorization**.
- Fail if either difference is non-empty. Print each missing hash and each unused hash under separate labels, in stable sorted order, so the required edit is reviewable.
- On success, report the HTML file count, executable script occurrence count, and unique matching hash count.

Expose a pure parity function that accepts configured hashes and HTML strings (or extracted script bodies) and returns a structured result such as `{ generated, missing, unused, executableScripts }`. The CLI converts validation errors or a non-empty difference into `process.exitCode = 1`; helpers do not call `process.exit`.

Guard CLI execution by comparing the resolved entry-module URL with `import.meta.url`. This prevents filesystem reads and process mutation when Vitest imports the module.

### `tests/security-headers.test.ts`

Add a Node-environment Vitest file with three focused groups.

1. **Checked-in deployment contract**
   - Read and parse the real `vercel.json`.
   - Assert the pure validator accepts it.
   - Assert the global rule is the source of the policy.
   - Assert every required non-CSP header value and fixed CSP directive/token set, including `script-src-attr 'none'`.
   - Assert `script-src` retains the Vercel script host and contains only valid SHA-256 tokens beyond its fixed sources.

2. **Malformed configuration rejection**
   - Clone a minimal valid fixture and use table-driven mutations to cover a missing global rule, missing CSP, duplicate header/directive, missing required security header, incorrect required header value, missing required CSP directive/value, and an unexpected unsafe script source.
   - Assert errors identify the relevant header or directive rather than only returning a generic failure.

3. **Executable-script selection and parity**
   - Use small in-memory HTML fixtures containing a classic inline script, an inline module script, a duplicate inline body, a `src` script, and JSON-LD.
   - Assert only the executable inline bodies are hashed and raw whitespace changes the hash.
   - Assert exact matching sets pass.
   - Assert a generated-only hash is reported as missing.
   - Assert a configured-only hash is reported as unused.
   - Assert missing and unused hashes can be reported in the same result.

Unit tests must not depend on `dist/`, because CI runs `pnpm test` before `pnpm build` and `dist/` is ignored. Real generated-output parity is instead covered by the existing `pnpm build` invocation of the CLI. Tests should use explicit fixture objects and strings, not snapshots or checked-in generated files.

### `README.md`

Add a short **Deployment security headers** subsection near `CI/CD` or `Build` with the following operational contract:

- Vercel response headers are owned by `vercel.json`; Astro application code and `pnpm preview` do not apply or prove those deployed headers.
- After changing an executable inline script, run `pnpm build`. The build regenerates `dist/` and runs exact CSP hash verification.
- If verification reports a new hash, inspect the generated script change before replacing the corresponding CSP hash; do not blindly authorize unknown output.
- A deployed response must still be inspected after release because repository tests prove configuration and generated-hash consistency, not Vercel's actual HTTP delivery.

Also update the existing Security Gates wording from one-way “CSP hash coverage” to “security-header contract and exact CSP hash parity.” Do not alter unrelated Lighthouse, deployment, or project documentation.

## CSP compatibility

`script-src-attr 'none'` controls JavaScript in HTML event-handler attributes such as `onclick`. It does not disable executable `<script>` elements already authorized by `script-src`, bundled `src` scripts, or JSON-LD data blocks. Current source inspection found no inline event-handler attributes, so the directive should not change present behavior. A future handler will be intentionally blocked and must be replaced with a bundled `addEventListener` path rather than weakening the policy.

Browsers that implement CSP Level 3 enforce the new directive. Older browsers may ignore it and continue falling back to the existing `script-src` behavior; the change therefore improves capable clients without introducing a new dependency. No `unsafe-hashes` fallback will be added.

The policy deliberately retains:

- Vercel Analytics in `script-src` and Analytics/Speed Insights endpoints in `connect-src`;
- `'unsafe-inline'` in `style-src` for Astro-generated styles;
- existing COOP and CORP values, which must not be expanded without assessing popup and cross-origin asset integrations.

## Test and verification strategy

| Layer | Command/evidence | Responsibility |
| --- | --- | --- |
| Pure unit contract | `pnpm test` | Header shape, CSP parser, executable-script selection, missing/unused parity behavior |
| Generated integration | `pnpm build` | Fresh Astro output and exact parity between all generated executable inline scripts and `vercel.json` |
| Browser regression | `pnpm test:e2e` | Existing page behavior remains functional in Chromium, Firefox, and WebKit |
| Deployment observation | Manual response and browser inspection after Vercel deploy | Actual route header delivery and absence of CSP console violations |

Recommended implementation verification order:

1. Run `pnpm test`.
2. Run `pnpm build` and reconcile only reviewed hash differences.
3. Run `pnpm test:e2e` against the fresh build.
4. After deployment, inspect `/`, `/en`, one blog page, `/.well-known/security.txt`, one `/_astro/` asset, and `/og/es.svg`. Confirm the global security headers are present, route-specific cache headers remain present where applicable, and the browser reports no CSP violations.

Local Playwright uses Astro preview and therefore cannot assert Vercel-applied response headers. This limitation is explicit rather than hidden behind a false local HTTP-header test.

## Deployment ownership and rollout

- **Source ownership:** `vercel.json` owns Vercel response-header declarations.
- **Build ownership:** `scripts/verify-csp-hashes.ts` owns static validation and generated-hash parity.
- **Regression ownership:** `tests/security-headers.test.ts` owns the deterministic contract tests.
- **Runtime ownership:** Vercel applies the configured headers; only a deployed response proves delivery.

Land the four file changes atomically so the policy, verifier, tests, and operator guidance cannot drift. Deploy through the existing Vercel GitHub integration. No workflow permission, secret, API token, data migration, feature flag, or staged application rollout is needed.

## Rollback

The preferred rollback is a single revert of the four-file change. This restores the previous CSP, one-directional verifier, test inventory, and README wording with no data or state migration.

For an urgent production compatibility incident attributable to an unexpected inline event handler:

1. Remove `script-src-attr 'none'` and its matching validator/test requirement together.
2. Redeploy through the existing Vercel integration.
3. Confirm response headers and restored behavior on the affected route.
4. In a separate scoped change, replace the handler with a bundled listener before reintroducing the directive.

Do not respond by adding `'unsafe-inline'`, `'unsafe-eval'`, `unsafe-hashes`, wildcard script sources, or broad third-party origins. Verifier-only failures do not affect runtime and should be corrected by reviewing generated output and restoring exact parity rather than bypassing the build gate.

## Non-goals

- No changes to `src/`, page markup, inline script implementations, routes, content, analytics components, or application behavior.
- No nonce migration, Trusted Types, COEP, cross-origin isolation redesign, or removal of `style-src 'unsafe-inline'`.
- No changes to Astro configuration, `package.json`, lockfiles, CI or Lighthouse workflows, Vercel project settings, cache durations, or `public/.well-known/security.txt`.
- No Vercel API integration, authenticated deployment probe, or claim that local preview reproduces Vercel headers.
- No accessibility work, PR #28 content, unrelated issue work, or edits to `explore.md` and `proposal.md`.

## Review plan

Review in this order:

1. The one-directive CSP delta and preservation of existing header/cache behavior in `vercel.json`.
2. Configuration validation and exact two-way hash semantics in the verifier.
3. Failure-mode coverage and `dist/` independence in the focused tests.
4. Deployment ownership and maintenance instructions in the README.

Expected implementation size remains approximately 110–150 changed lines across the four files, below the configured review budget.
