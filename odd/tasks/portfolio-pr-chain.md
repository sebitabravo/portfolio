# Portfolio architecture PR publication

## Delivery decision
- Approved issue: #35 — https://github.com/sebitabravo/portfolio/issues/35
- The user explicitly approved publishing the accumulated portfolio work as one PR and accepted `size:exception` because the 400-line slicing budget is infeasible for this integrated refactor.
- Final PR: #37, retargeted to `main`; keep open for review and do not merge without a separate user decision.
- Superseded tracker PR #36 is to be closed after #37 contains the complete branch diff.

## Scope
The single PR includes the accumulated portfolio architecture and maintenance work: shared ES/EN page/data contracts; keyboard, focus, carousel, and motion fixes; CSP/security/CI/dependency/Lighthouse updates; Button/theme-token and CSS cleanup; tests and documentation.

## Verification and exception record
- Keep tests and documentation with their behavior changes.
- Record the exact additions/deletions shown by GitHub in PR #37 and state `size:exception` in the PR body.
- Report all checks truthfully; the native `security-headers` archive remains separately pending until its SDD archive executor is available. Do not hand-archive.
- Do not merge the PR automatically.
