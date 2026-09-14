# Apply progress: security-headers

## Status

```yaml
schemaName: spec-driven
changeName: security-headers
artifactStore: openspec
planningHome:
  root: /home/sebastian/Developer/portfolio
  changesDir: /home/sebastian/Developer/portfolio/openspec/changes
changeRoot: /home/sebastian/Developer/portfolio/openspec/changes/security-headers
artifacts:
  proposal: done
  specs: done
  design: done
  tasks: done
  applyProgress: done
  verifyReport: missing
  syncReport: missing
taskProgress:
  total: 14
  complete: 14
  remaining: 0
  unchecked: []
applyState: all_done
dependencies:
  apply: satisfied
  verify: ready
  sync: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: /home/sebastian/Developer/portfolio
  allowedEditRoots:
    - /home/sebastian/Developer/portfolio
  warnings: []
nextRecommended: sdd-verify
isNonAuthoritative: false
```

The user explicitly selected `security-headers` and confirmed native apply readiness with 13 of 14 tasks complete. This final verification run completed the remaining implementation-owned task without source edits.

## Completed tasks and checkbox evidence

The persisted `tasks.md` artifact has been updated to `[x]` for all 14 implementation rows. The final full-gates row was checked immediately after the dependency-ordered repository gates passed.

## Files changed

- `vercel.json` — added `script-src-attr 'none'` and removed ten stale SHA-256 authorizations shown unused by a fresh generated build; non-CSP headers, cache rules, and allowed script/connect/style sources remain unchanged.
- `scripts/verify-csp-hashes.ts` — added import-safe configuration validation, CSP parsing, executable-inline extraction, exact bidirectional parity, sorted diagnostics, and a guarded CLI.
- `tests/security-headers.test.ts` — added ten deterministic Node/Vitest contract, malformed-configuration, extraction, whitespace, and parity tests.
- `README.md` — documented Vercel header ownership, build/review workflow, exact parity, local-preview limits, and the post-release inspection route list.
- `openspec/changes/security-headers/tasks.md` — persisted all 14 completed implementation checkboxes.
- `openspec/changes/security-headers/apply-progress.md` — this cumulative progress artifact.

## TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1.1–1.4 | `tests/security-headers.test.ts` | Unit | N/A (new test file) | `pnpm test -- tests/security-headers.test.ts` failed with 10 absent-pure-API failures. | Exported pure helpers plus guarded CLI; focused command passed 56/56. | Checked-in policy, seven malformed configuration cases, and two distinct executable-script/parity paths passed. | Constants and helpers remain deterministic; focused command passed after cleanup. |
| 2.1–2.4 | `tests/security-headers.test.ts` | Unit | New coverage exercised no existing production API safely. | Contract test required `script-src-attr 'none'`; initial checked-in policy lacked it. | Added the directive and validation, then passed 56/56. | Fresh build exposed ten unused configured hashes; only those reviewed stale authorizations were removed and `verify:csp` passed at 10 unique hashes. | Importing the verifier no longer reads files or mutates process state. |
| 3.1–3.2 | `tests/security-headers.test.ts` | Build integration + Unit | Focused unit suite passed before build. | Initial `pnpm build` failed exact parity with ten separately listed unused hashes. | `pnpm verify:csp` passed after reconciling reviewed stale tokens. | Final `pnpm build` passed with 90 HTML files, 636 executable occurrences, and 10 unique matching hashes. | Tests remain independent of ignored `dist/` output and passed after the fresh build. |
| 4.1–4.2, 5.2 | `README.md` | Documentation | N/A (structural documentation) | N/A | Added required maintenance and observer guidance. | Triangulation skipped: documentation has one required operational outcome, while its referenced build behavior passed. | Kept the note concise and limited to deployment ownership. |

### Test summary

- **Tests written:** 10 focused security-header unit tests.
- **Focused/full unit result:** 56/56 passing.
- **Coverage result:** passing; 93.57% statements and lines, 76.01% branches, and 98.55% functions.
- **Pure functions created:** `validateVercelConfig`, `hashScript`, `extractExecutableScriptBodies`, and `compareCspHashParity`.
- **Approval tests:** None; the verifier contract intentionally changed after RED tests.

## Verification evidence

- PASS: `pnpm test -- tests/security-headers.test.ts` (56/56; Vitest command also ran the repository suite).
- PASS: `pnpm test` (13 files, 56 tests).
- PASS: `pnpm test:coverage` (13 files, 56 tests; thresholds met).
- PASS: `pnpm build`, including `astro check`, limits, static build, bundle check, and `verify:csp` exact parity.
- PASS: `pnpm validate:links` (six project links operational).
- PASS: `pnpm test:e2e` (84/84 passing in 4.9 minutes across Chromium, Firefox, and WebKit). The previously independent WebKit Wenuke screenshot timeout did not reproduce; `tests/capture-screenshots.spec.ts` was not modified.

## Deviations and remaining work

The design allowed fresh-build hash reconciliation. Exact parity found ten configured hashes with no generated executable body, so they were removed from only the global `script-src` value. No deployment probe, credential, workflow, cache rule, application source, or out-of-scope OpenSpec change was modified.

No implementation-owned tasks remain unchecked.

## Workload / PR boundary

The original implementation recorded 445 changed lines including mandatory SDD metadata and focused tests. The user confirmed native apply readiness for this final gates-only resume; it made no source edits and remains bounded to the four approved implementation files plus mandatory OpenSpec records. No commit was created.
