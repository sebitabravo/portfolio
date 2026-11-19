# Decision-led portfolio repositioning

Repositions sebastianbravo.dev so a recruiter reads who he is, what he builds and which trade-offs he owns before any theatrical surface loads. The design system (SB-OS 2.6) is not the defect: it is fully specified and tested. The defect is narrative order and what the first viewport proves.

## Specs

S1 — The site positions him as a full-stack engineer with a real AI edge, and never by years, seniority titles or self-deprecation. Verbatim: "mira yo me siento la verdad como un junior siempre estoy aprendidendo de todo un poco pero siento que soy full stack pero controlo mucho sobre inteligencia artificial y ese tipo de cosas entonces necesito que me ayudes con esto porfavor."

S2 — The primary axis of the site is craft and technical judgement: every showcased project states the decision taken and the trade-off accepted, explicitly. Verbatim: "Que tengo oficio y criterio técnico".

S3 — The original essence must be recoverable for a recruiter: who, what, and proof, read without the theatrical surface gating it. Verbatim: "este proyecto a cambiado de diseño muchas veces y perdio mi esencia o al menos eso me dijo un reclutador".

S4 — Everything already correct must stay correct after the change. Verbatim: "que lo suluciones orfavor para que quede perfecto todas las cosas porfavor." Concretely: ES/EN key parity, WCAG AA, CSP hash parity, bundle and source limits, and the existing suite green.

S5 — The visual system is preserved, not replaced. The SB-OS tokens, Instrument Serif/Geist pairing and rainbow stripe identity stay; what changes is which surface a visitor meets first and what the copy claims.

## Tasks

| ID | Task | Specs | Route | Commit |
|---|---|---|---|---|
| T1 | Content audit: extract real decisions and trade-offs per project from blog and data modules | S2 | explorer | — |
| T2 | Thesis doc: one-page positioning plus decision inventory, replaces the 16KB DESIGN.md as the normative north star | S1 S2 S5 | inline | — |
| T3 | Home narrative: reorder chapters and rewrite the hero so the first viewport states role, AI edge and one proof | S1 S2 S3 | worker | — |
| T4 | Project cards: add the decision and the trade-off to each tile and case study | S2 S5 | worker | — |
| T5 | Demote the theatrical surface (boot screen, WebGL terrain, pinned story) from the critical path | S3 S5 | worker | — |
| T6 | ES/EN copy parity for the new narrative | S4 | worker | — |
| T7 | Full verification: a11y, perf, tests, build, CSP, limits | S4 | verify | — |

## Log

L1 — "tengo un problema grave de creatividad en este proyecto eso que necesito que me lo soluciones de manera urgente mira si ves el historial este proyecto a cambiado de diseño muchas veces y perdio mi esencia o al menos eso me dijo un reclutador entonces quieor que lo revices todas las cosas porfavor y que lo soluciones levanta 5 agentes para que lo revices y lo suluciones orfavor para que quede perfecto todas las cosas porfavor."

L2 — Positioning answer: "mira yo me siento la verdad como un junior siempre estoy aprendidendo de todo un poco pero siento que soy full stack pero controlo mucho sobre inteligencia artificial y ese tipo de cosas entonces necesito que me ayudes con esto porfavor."

L3 — Essence answer: "Que tengo oficio y criterio técnico".

L4 — Diagnosis accepted as working context:

L5 — Design directions created: `design/portfolio-2026/` with `01-monografia.html`, `02-taller.html`, `03-placas.html`, all on the author's declared palette (strict black and white base, khaki as the only tint, pastels as accents only). Built from the three-era archaeology: era 1 `59f6eba..92ac3d3` (default shadcn, no identity), era 2 `8dfa51a..fd16409` (Syne/indigo, white-black-one-accent, the closest to his stated taste), era 3 `015ad1a..0f74e36` (SB-OS, rainbow and magenta). Colour census: no saturated hue repeats across the three eras; only the neutral family is constant. Awaiting his choice of artboard; no production file changes until he approves. 127 commits with the last ~15 entirely visual infrastructure (shader overhaul, motion architecture, WebGL gating, theme token refactors) and zero new work; DESIGN.md section 1 binds two third-party Mobbin references plus rules from generic skills, which explains "perdio mi esencia". Parallel designers were rejected as the sixth redesign; agents are used only with disjoint edit surfaces under one thesis.
