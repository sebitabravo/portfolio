# Portfolio perfection — limpieza, buenas prácticas y mantenibilidad

## Objective
Dejar el portfolio limpio, bien programado, funcional y fácil de mantener a mano, respetando buenas prácticas, sin cambiar identidad visual ni comportamiento ES/EN, accesibilidad, SEO, responsive y reduced-motion.

## Problem
Diagnóstico multi-agente 2026-09-25 (3 explorers read-only):
- Base sana (pipeline Astro static coherente, facade `data.ts` + `Localized*`), pero desorden acumulado + 4 críticos reales.
- Duplicado muerto `src/lib/tech-colors.ts` 311 líneas vs sistema vivo `tech-badges.ts`.
- Deriva es/en: `privacy.astro` duplicado ~300 líneas, `work.ts` duplica registros.
- Higiene: `odd/` infla PR #37 sin gitignore/vercelignore, basura local ignorada presente (`dist/`, `test-results/`, `playwright-report/`, `.astro/` logs, `lighthouse-scores.png`).
- Fragilidades funcionales: Analytics nunca renderiza pero paga deps+CSP, CSP 10 hashes exactos, WebGL al límite del budget, flake WebKit `animation-behavior.spec.ts:31`, OG SVG débil, coverage solo `src/lib`+`src/scripts`.

## Why
Usuario 2026-09-25: "dale nomas... realiza todo para que quede bien programado y que respete buenas practicas... para que este perfecto". Autoriza implementación completa local. Push/PR/merge siguen siendo decisión suya.

## Scope
- In: `src/`, `tests/`, `scripts/`, configs raíz, `.github/`, `.gitignore`, `.vercelignore`, `public/`, docs `README`/`DESIGN.md`/`docs/` mínimos para mantener.
- Out: `openspec/` (change `security-headers` completo, no tocar), historial git, `node_modules/`, publicar o mergear.

## Constraints
- No cambiar identidad visual ni copy sin autorización. Pixel-gate donde aplique.
- Preservar ES default sin prefijo + `/en/`, alternates, sitemap, JSON-LD, CSP verifier, budgets (limits/bundle/CSP).
- Un writer a la vez. Nada de 100 agentes en paralelo: un solo hilo de escritura para evitar conflictos. Exploración ya hecha, no repetir.
- Rama actual `refactor/portfolio-theme-tokens-01` con 6 archivos sucios (Header/toggles/header.css/base/hero). Primer paso: estabilizar eso antes de nueva deuda. Se continúa en esta rama extendiendo PR #37 que ya tiene `size:exception`.
- RDD off (default 2026-09-25: `gentle-ai review mode status` = off, assess medium/under_budget). No native review. Verificación ordinaria + assess por tier.
- 400 líneas es heurística de planificación, no cap de aceptación. No borrar espacios/comentarios útiles para ahorrar líneas. No omitir tests.

## TDD
- Resolved mode: STRICT ON. Source: `sdd-init/portfolio` Engram #1668 + `portfolio-audit-followup.md` + `portfolio-final-polish.md` (strict). Runner: `pnpm test` (`vitest run`), focused `pnpm exec vitest run <paths>`, E2E `pnpm exec playwright test <paths>`.
- Forward en cada delegación: modo + source + runner. Exigir RED observado antes de implementar, GREEN, luego REFACTOR. Nunca inventar evidencia.
- Full gate: `git diff --check && pnpm build && pnpm test && pnpm exec playwright test`. Gates rápidos por tarea según toque.

## Delivery
- Strategy: `ask-on-risk` (default). Forecast inicial >400 líneas acumuladas (solo P1+P4+P5 ya lo superan), pero se trabaja por slices en la misma rama/PR #37 que ya tiene `size:exception` autorizada. No se crea PR nuevo sin decisión explícita.
- Running count desde work-unit commits en esta rama. Registrar slice boundaries aquí.
- Skills: `work-unit-commits` + `chained-pr` resueltos por nombre de registry antes de planear/crear cualquier PR. Paths en registry Engram #1670.

## Authorized scope
- Cambio autorizado 2026-09-25 "dale nomas... realiza todo... para que este perfecto". Incluye editar tests protegidos (`lib-contracts`, `css-contracts`, `projects-script`) solo para mantener contratos tras mover código muerto a sistema canónico, con evidencia RED/GREEN.
- Commits work-unit en rama feature autorizados. Push, PR nuevo, merge: NO autorizados, decisión del usuario.

## Acceptance criteria
- `git status` limpio de basura trackeada, `git check-ignore` confirma ignorados.
- `pnpm build` verde (astro check 0, limits, bundle, CSP), `pnpm test` verde, Playwright relevante verde.
- Sin `tech-colors.ts`, sin duplicación privacy/work, Layout/Carousel dentro de presupuesto o con excepción documentada.
- Docs actualizados donde cambió convención (README lib/, translationKey, tokens).

## Applicable checks
- Per-task: `git diff --check` + runner enfocado (vitest o playwright según toque) + `pnpm build` cuando toque estilos/config/CSP.
- Full al cierre: `git diff --check && pnpm build && pnpm test && pnpm exec playwright test` + `gentle-ai review assess --cwd <repo> --json` informativo (RDD off).

## Tasks
- [x] P0 — Estabilizar sucio actual (Header/toggles/header.css/base/hero, 54+/179-). Verificar qué es, correr checks enfocados, un work-unit commit. Route: delegated writer (6 files → writer trigger). Checks: diff-check + vitest relevante + build.
- [ ] P1 — Eliminar `src/lib/tech-colors.ts` muerto + podar bloque legacy en `tests/lib-contracts.test.ts`, canónico `tech-badges.ts`. TDD RED/GREEN. Route: delegated writer. Checks: `pnpm exec vitest run tests/tech-badges.test.ts tests/lib-contracts.test.ts` + build.
- [ ] P2 — Higiene trackeada: `odd/` a `.gitignore`, `odd/`+`openspec/` a `.vercelignore`, mover `Sebastian_Bravo_CV.pdf` a `public/`, borrar dirs vacíos `public/experience/`+`public/screenshots/.gitkeep`, cuarentena `tests/capture-screenshots.spec.ts` fuera de testMatch, rename `judgment-day.spec.ts` → `regression-contracts.spec.ts`. Limpieza local ignorada (`dist/`, `test-results/`, `playwright-report/`, `.astro/*.log`, `lighthouse-scores.png`) sin commit. Route: delegated writer (2+ files). Checks: `git check-ignore`, vitest list, build.
- [ ] P3 — Analytics muerto: confirmar que `VERCEL` nunca llega en `build:static`/`build:ci`, quitar `@vercel/analytics`+`speed-insights` + entradas CSP/connect-src o habilitar con justificación. Route: delegated writer. Checks: build + verify:csp + grep sin refs.
- [ ] P4 — Privacy deduplicado: crear `LocalizedPrivacy.astro`, migrar `privacy.astro` + `en/privacy.astro` a wrapper delgado. Route: delegated writer. Checks: vitest + playwright smoke/lang + build.
- [ ] P5 — `work.ts` a patrón `Shared + Record<Locale>` como `projects.ts`, tipar retornos. Route: delegated writer. Checks: vitest data/contracts + build.
- [ ] P6 — Layout slim: extraer JSON-LD y scripts inline estables, re-hash `vercel.json` en mismo commit, mantener hashes 10/10. Route: delegated writer. Checks: build + verify:csp + playwright relevante.
- [ ] P7 — Carousel slim + tokens: bajar `<style>`/`<script>`, promover hex sueltos a `@theme inline`, `projects.ts` class-toggle. Route: delegated writer. Checks: vitest + build + playwright carousel.
- [ ] P8 — Tipos y lib: aplanar `CarouselCertification`, const-objects para `status`/`category`/`Locale`/`ThemePreference`, `any` ambiental, documentar `lib/` real en README + checklist translationKey. Route: delegated writer. Checks: `pnpm check` + vitest.
- [ ] P9 — Supply-chain y SEO: `minimumReleaseAge`/dependabot npm/cooldown/lockfile-lint evaluación, pin Node exacto `22.x`, OG PNG junto a SVG, LHCI o asserts para blog/privacy/hreflang. Route: delegated writer. Checks: build + links + LHCI relevante.
- [ ] P10 — Verificación full + informe. Route: delegated verifier (fresh) solo si writer reporta partial/blocked o spot-check caro; si no, parent spot-check un comando. Checks: full gate.

## Progress
- 2026-09-25: documento creado. Punto de partida: rama `refactor/portfolio-theme-tokens-01`, 6 sucios, log `e94a65d` head. RDD off. Próximo: P0.
- 2026-09-25 P0 cerrado: los 6 sucios ya estaban commiteados como `649fd53 refactor(header): move header styles to utilities` (54+/179-, coincide con el diff descrito). Reconciliación con T9 parked (`portfolio-final-polish.md`): NO es el T9 original (ese borraba `header.css` 172 líneas y rompía `css-contracts`); es una variante menor que conserva `header.css` (33 líneas: solo `@custom-variant` scrolled/unscrolled/dark-scrolled, `@theme inline` nav-glass/shadow-nav*/header-cta, y `.nav-active::after` scoped) y mantiene el contrato `header.css` esperado por `tests/css-contracts.test.ts`. Coherente y seguro: cero `var()` en los 3 componentes (verificado con rg en class attrs), tokens nombrados con alpha dentro (rgba plano, sin color-mix), `font-code` globalizado en `portfolio-base.css` y removido el duplicado de `portfolio-hero.css`, `min-w-max` en menús. Sin toques a tests protegidos. Árbol tracked limpio; este commit docs(odd) registra la evidencia. Próximo: P1.

## Verification evidence
- `git diff --check`: OK (sin output; `git status --short` solo muestra este doc untracked, cero modificados tracked)
- `pnpm exec vitest run tests/css-contracts.test.ts tests/theme-utilities.test.ts tests/theme-toggle.test.ts tests/language-toggle.test.ts`: 4 files passed, 16/16 tests passed
- `pnpm build`: VERDE — `astro check` 150 files 0/0/0, limits OK, 90 páginas, bundle OK (hero-webgl 511.4 KiB raw / 126.9 KiB gzip), CSP parity 90 HTML / 636 scripts / 10 hashes
- `git log --oneline -3`: ver hash de este commit docs(odd) abajo
- Nota TDD strict: refactor estilos→utilities sin cambio de comportamiento; este run no introdujo cambios fuente, por lo que no hubo RED previo observable — GREEN verificado post-hoc. Sin evidencia inventada. RED/GREEN de behavior changes aplica desde P1.

## Next step
- Lanzar P1 con writer delegado.

## Route declaration
- P0–P9: delegated direct (writer trigger: 2+ files no triviales; preparation trigger: lectura prepara escritura). P10: parent spot-check + verifier on-demand. Ninguna ruta crea artefactos SDD ni invoca `sdd-*`.
