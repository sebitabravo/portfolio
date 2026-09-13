# Testing Capabilities

**Strict TDD:** Enabled. The repository has one discovered project and the root `pnpm test` command covers its unit-test suite.

| Layer | Available | Command | Tool / scope |
| --- | --- | --- | --- |
| Unit | Yes | `pnpm test` | Vitest; `tests/**/*.test.ts` |
| Integration | No | — | No dedicated integration layer detected |
| E2E | Yes | `pnpm test:e2e` | Playwright; `tests/**/*.spec.ts` |
| Coverage | Yes | `pnpm test:coverage` | Vitest v8; 90% statements/lines/functions, 70% branches |
| Type check | Yes | `pnpm check` | `astro check` |
| Linter | No | — | No linter configured |
| Formatter | No | — | No formatter configured |
| Build and gates | Yes | `pnpm build` | Astro build, source limits, bundle, and CSP checks |
| Link validation | Yes | `pnpm validate:links` | Project-link validation script |

CI also runs dependency installation/audit, type checking, unit coverage, production build, Playwright across Chromium/Firefox/WebKit, and link validation.
