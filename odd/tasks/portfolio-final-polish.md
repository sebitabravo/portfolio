# Portfolio final polish

## Goal
Close every remaining actionable finding from the latest audits so the portfolio is clean, idiomatic, and easy to maintain by hand, while preserving visual identity, ES/EN behavior, accessibility, SEO, responsive and reduced-motion behavior.

## Authorization and decisions
- The user explicitly asked to fix everything found (`/goal`: "solucioname todo lo que encuentres"). Continue on branch `refactor/portfolio-theme-tokens-01`, extending open PR #37 (user-accepted `size:exception`). Push task commits to PR #37; never merge.
- Previously settled decisions stay settled (see `portfolio-maintainability-pass-3.md`): keep the unreferenced certification PDFs, the optional `CertificationCarousel` logo API, the `rollup` security override, the `check`/`test:e2e` aliases, and candidate i18n keys with ambiguous consumers.
- Tailwind v4 rule (project skill `tailwind-4`): never put `var()` in class names; use named theme utilities. Every token already exists in `@theme inline` (`src/styles/portfolio-base.css`), so `bg-[hsl(var(--card))]` becomes `bg-card` and `bg-[hsl(var(--muted)/0.5)]` becomes `bg-muted/50`.
- Shadow tokens follow the existing color pattern: raw per-theme values live in the base layer, `@theme inline` maps them into Tailwind's `--shadow-*` namespace.

## Evidence (2026-09-24 audit)
- 103 arbitrary `*-[hsl(var(--token))]` classes across 17 files (components, both privacy pages, four blog MDX files) plus 3 `hover:shadow-[var(--shadow-card-hover)]`.
- `pnpm exec tsc --noEmit` fails: `tsconfig.json(12,5): error TS5101: Option 'baseUrl' is deprecated`.
- `lighthouse-scores.png` is tracked in git while `.gitignore:64` ignores it; `portfolio-audit-cleanup.md` and `portfolio-maintainability-pass-3.md` wrongly state it is absent.
- `components.json` is a shadcn CLI config pointing at a nonexistent `tailwind.config.ts`; `DESIGN.md` rejects shadcn as a tool. Only `.vercelignore` references it.
- `tests/pages-smoke.test.ts` and `tests/ui-copy-localization.test.ts` assert on raw `.astro` source text; harmless reformatting breaks them.
- `security-headers` OpenSpec change is complete (14/14) and ready to archive; the `sdd-archive` executor is now available.

## Workflow and verification
- TDD: strict (project mode recorded in `portfolio-audit-followup.md`). Record observed RED/GREEN per behavior change.
- Focused runners: `pnpm exec vitest run <paths>`, `pnpm exec playwright test <paths>`.
- Full verification: `git diff --check && pnpm build && pnpm test && pnpm exec playwright test`.
- One Conventional Commit per task on the feature branch; record hashes here.

## Tasks
- [ ] T1 — Replace every arbitrary `[hsl(var(--token)…)]` / `[var(--shadow-…)]` class with named theme utilities across components, pages, and MDX; map shadow tokens through `@theme inline`; add a contract test that rejects `var(` inside class attributes. Route: delegated writer (17 files, mapping + write triggers).
- [x] T2 — Remove deprecated `baseUrl` from `tsconfig.json` and make `paths` tsconfig-relative; `tsc --noEmit` must no longer report TS5101. Route: inline (one mechanical file). **Evidence:** before: `tsc --noEmit` failed TS5101; after: exit 0 with no output; `pnpm check` 162 files, 0 errors/warnings/hints. **Commit:** `206dec8`.
- [x] T3 — Repo hygiene: untrack gitignored `lighthouse-scores.png`, delete dead `components.json` and its `.vercelignore` entry, correct the stale ODD statements. Route: inline (mechanical). **Evidence:** no test/script/CI referenced either file; `git check-ignore` confirms the local PNG copy is now ignored. Also dropped two dead `.vercelignore` lines: `superhuman/` (directory no longer exists) and `DESIGN.md` (already covered by `*.md`). Stale "PNG absent" statements corrected in `portfolio-audit-cleanup.md` and `portfolio-maintainability-pass-3.md`.
- [ ] T4 — Replace source-text assertions in `tests/pages-smoke.test.ts` and `tests/ui-copy-localization.test.ts` with rendered-output checks; keep dictionary/data contracts; no coverage loss. Route: delegated writer.
- [ ] T5 — Archive the `security-headers` OpenSpec change through the native `sdd-archive` executor. Route: sdd-archive agent.
- [ ] T6 — Full verification, push to PR #37, watch hosted checks. Route: delegated verifier + parent.

## Progress
- 2026-09-24: Feature document created from the latest audit evidence. RDD is off (default), so no native review runs; ordinary checks apply.
