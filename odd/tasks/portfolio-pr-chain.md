# Portfolio architecture PR publication

## Delivery decision
- Approved issue: #35 — https://github.com/sebitabravo/portfolio/issues/35
- The user explicitly approved publishing the accumulated portfolio work as one PR and accepted `size:exception` because the 400-line slicing budget is infeasible for this integrated refactor.
- Final PR: #37, retargeted to `main`, open for review, and not merged: https://github.com/sebitabravo/portfolio/pull/37
- The current local three-dot diff to `main` is 6,168 changed lines across 116 files (4,752 additions + 1,416 deletions). GitHub's prior API on head `b19d453` reported 6,175 lines across 116 files (4,754 additions + 1,421 deletions); refresh after the latest push. The PR body is still stale at 5,158/84. The user explicitly accepted `size:exception`.
- Superseded tracker PR #36 is closed; no merge was performed.

## Scope
The single PR includes the accumulated portfolio architecture and maintenance work: shared ES/EN page/data contracts; keyboard, focus, carousel, and motion fixes; CSP/security/CI/dependency/Lighthouse updates; Button/theme-token and CSS cleanup; tests and documentation.

## Verification and exception record
- Keep tests and documentation with their behavior changes.
- GitHub's exact additions/deletions and the `size:exception` acceptance are recorded in the PR #37 body.
- Report all checks truthfully; the native `security-headers` archive remains separately pending until its SDD archive executor is available. Do not hand-archive.
- Do not merge the PR automatically.
