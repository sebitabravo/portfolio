# Portfolio architecture PR chain

## Tracker
- Approved issue: #35 — https://github.com/sebitabravo/portfolio/issues/35
- Strategy: feature-branch chain; this tracker targets `main` and remains draft/no-merge until its child PRs are integrated.
- Review budget: 400 changed lines (additions plus deletions) per child PR.
- Start: `main` at `a6f27da`.
- End: integrated portfolio architecture, accessibility, motion, security/CI, and maintainability slices.

## Scope
This tracker coordinates independently reviewable child PRs for the portfolio architecture and maintenance work. Each child must carry its implementation with the tests and documentation needed to review that slice. Child branches target the tracker/preceding child in order; only this tracker targets `main`.

The first planned child is the semantic theme-token and Button/CSS cleanup slice. Follow-up slices cover project data and route contracts, shared localized pages, menu and motion behavior, CSP/security and CI, and the remaining documentation/audit records. Exact boundaries are confirmed from each child diff before publication; no child may exceed the 400-line budget without a maintainer-approved exception.

## Completion conditions
- Every child PR links approved issue #35 and has exactly one `type:*` label.
- Each child diff is focused, verified, and at most 400 changed lines.
- The tracker remains draft until all child slices are integrated and the final verification is reported.
- Do not merge this tracker automatically; merge remains the user's decision.
