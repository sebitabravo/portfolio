# Harden Vercel Security Headers and CSP Verification

## Intent

Address the focused security-hardening scope linked to GitHub issue #24: prohibit inline script event-handler attributes, make CSP/header validation reject configuration drift, and document the deployment ownership and maintenance workflow. The implementation must preserve the current application behavior and the existing CSP allowances that the generated site requires.

Local repository evidence does not include the live body or state of issue #24. This proposal links the change to that issue based on the requested scope and does not claim that the issue is closed or fully satisfied until its current GitHub metadata is reviewed.

## Goals

1. Add `script-src-attr 'none'` to the global Content-Security-Policy in `vercel.json` to prohibit HTML inline event-handler attributes.
2. Strengthen CSP verification so it rejects a missing or malformed global Vercel security-header configuration, executable inline scripts without a configured hash, and configured SHA-256 script hashes not used by generated executable scripts.
3. Add focused regression coverage for the Vercel header contract, required safe CSP directives, and exact executable-script hash parity.
4. Document that `vercel.json` owns deployment response headers and that executable inline-script changes require a fresh `pnpm build`/CSP verification update.

## Non-goals

- Migrate CSP hashes to nonces or otherwise redesign inline-script authorization.
- Add Trusted Types, COEP, or other cross-origin isolation policy changes.
- Remove `style-src 'unsafe-inline'` or alter the current executable inline scripts, analytics integration, caching policy, routes, content, or application behavior.
- Probe Vercel deployment APIs, add post-deployment header probes, change CI permissions, or modify the Lighthouse workflow.
- Make unrelated application, accessibility, Astro configuration, security.txt, or prior OpenSpec artifact changes.

## Scope and affected areas

| Area | Proposed change |
| --- | --- |
| `vercel.json` | Add only `script-src-attr 'none'` to the existing global CSP; retain the current header baseline, analytics allowances, cache rules, and necessary `style-src 'unsafe-inline'`. |
| `scripts/verify-csp-hashes.ts` | Require a valid global header/CSP shape and exact generated executable-script SHA-256 hash parity in both directions. Small pure helper extraction is allowed only to support these assertions. |
| `tests/security-headers.test.ts` | Add focused regression tests for required Vercel headers, required CSP directive values, and verifier failure/success cases. |
| `README.md` | Add concise operational guidance naming `vercel.json` as the Vercel header authority and describing the build/hash-maintenance workflow and local-preview limitation. |

`package.json` and `.github/workflows/ci.yml` are evidence-only: their existing build path already invokes CSP verification and requires no change for this slice.

## Acceptance criteria

- [ ] The global Vercel CSP contains `script-src-attr 'none'` while retaining all current required script, analytics, style, cache, and non-CSP header behavior.
- [ ] The verifier fails if the global `/(.*)` Vercel header configuration, CSP header, required security headers, required CSP directives, or required directive values are absent or malformed.
- [ ] The verifier fails if an executable inline script emitted into generated HTML lacks a configured SHA-256 hash.
- [ ] The verifier fails if a SHA-256 hash configured for executable inline scripts is unused by generated HTML.
- [ ] JSON-LD and external/module script references remain excluded from executable inline-script hash calculation.
- [ ] Focused regression tests protect the header and hash-parity contract, including representative invalid configurations where practical.
- [ ] `pnpm build` succeeds with exact hash parity, and the existing build/CI integration continues to run the verifier.
- [ ] The README identifies `vercel.json` as the deployment-header authority, requires a build after executable inline-script changes, and states that local Astro preview does not prove Vercel-delivered response headers.
- [ ] No product code, prior change artifact, or explicitly excluded security initiative is modified.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Astro output or executable inline-script formatting changes alter script hashes. | Make exact hash parity intentionally fail; regenerate the build, review the changed script, and update only the corresponding approved CSP hash. |
| A future inline event handler is blocked by `script-src-attr 'none'`. | This is the intended hardening outcome; use a bundled event listener instead of weakening the directive. |
| Over-validating headers accidentally removes needed Vercel analytics allowances or Astro-required inline styles. | Treat the current approved header baseline as required in the test contract; retain Vercel script/connect hosts and `style-src 'unsafe-inline'`. |
| Local tests cannot establish Vercel response delivery. | Test configuration ownership deterministically in the repository and document a separate post-deploy response-header check; do not introduce deployment probing in this slice. |

## Rollback

Revert this change as one unit: remove `script-src-attr 'none'`, restore the prior verifier behavior, remove its focused regression tests, and restore the previous README wording. This has no data migration or persistent-state rollback. If a deployment blocks an unexpected inline event handler, first revert the directive and its matching contract assertion, then investigate and replace the handler with a bundled listener in a separate, scoped change.

## Issue linkage

- **GitHub issue:** #24
- **Relationship:** This proposal implements the requested security-header and CSP-verifier portion of #24 only.
- **Evidence boundary:** The issue body/state is not available in the checkout; verify current issue acceptance criteria before closing or claiming complete resolution.

## Review workload

Estimated change: **110–150 lines across four files** (`vercel.json`, `scripts/verify-csp-hashes.ts`, `tests/security-headers.test.ts`, and `README.md`). Review the header-policy delta first, then verifier semantics, regression cases, and documentation. The estimate is below the 400-line review budget. If test seams or validation requirements push the change over that budget, pause for an `ask-on-risk` delivery decision rather than expanding the slice.

## Success criteria

The deployed-header source configuration forbids script attributes, build-time verification catches both missing and stale executable-script authorizations plus header drift, focused tests prevent regression, and maintainers have a clear Vercel ownership and update workflow without changing application behavior.
