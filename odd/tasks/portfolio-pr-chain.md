# Portfolio architecture PR publication

## Delivery decision
- Approved issue: #35 — https://github.com/sebitabravo/portfolio/issues/35
- The user explicitly approved publishing the accumulated portfolio work as one PR and accepted `size:exception` because the 400-line slicing budget is infeasible for this integrated refactor.
- Final PR: #37, retargeted to `main`, open for review, and not merged: https://github.com/sebitabravo/portfolio/pull/37
- PR #37 contains 5,158 changed lines across 84 files (3,966 additions + 1,192 deletions); the user explicitly accepted `size:exception`.
- Superseded tracker PR #36 is closed; no merge was performed.

## Scope
The single PR includes the accumulated portfolio architecture and maintenance work: shared ES/EN page/data contracts; keyboard, focus, carousel, and motion fixes; CSP/security/CI/dependency/Lighthouse updates; Button/theme-token and CSS cleanup; tests and documentation.

## Verification and exception record
- Keep tests and documentation with their behavior changes.
- GitHub's exact additions/deletions and the `size:exception` acceptance are recorded in the PR #37 body.
- Report all checks truthfully; the native `security-headers` archive remains separately pending until its SDD archive executor is available. Do not hand-archive.
- Do not merge the PR automatically.
