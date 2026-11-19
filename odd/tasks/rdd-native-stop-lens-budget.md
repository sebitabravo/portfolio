# Native stop: la review no arranca en este repo

Estado: **abierto del lado del proveedor**. No es un problema del candidato ni del código. No hay autoridad quemada ni linaje que reparar.

## Síntoma

`gentle_review` con `operation: "start"` responde siempre, en fase `preflight`, el mismo fallo:

```json
{ "code": "lens_context_budget_exceeded",
  "message": "The candidate's complete reviewer evidence exceeds the native context budget, so no review authority was created; review this change as smaller candidates that each fit under it.",
  "mutation_performed": false,
  "next_action": "stop",
  "cause": "... retrying this exact candidate cannot succeed ..." }
```

El envelope lo manda a `answer-consent`, pero sin envelope de consentimiento: es un `native_failure`, no una pregunta.

## Intentos

| # | Candidato | Alcance | Lentes | Código | Linaje |
|---|---|---|---|---|---|
| 1 | rama entera | workspace, 246 archivos | risk, reliability | `lenses-invalid` | no creado |
| 2 | rama entera | workspace | risk, reliability | `lens_context_budget_exceeded` | `review-81fe6f132a9aa12b` |
| 3 | `chore(deps)!` (8 archivos) | committed, `0f74e36..e2b894b` | risk | `lens_context_budget_exceeded` | `review-f35292bc61d9ce29` |
| 4 | `feat(styles)` (7 archivos) | committed, `0f74e36..64e01e8` | readability | `lens_context_budget_exceeded` | `review-9f822e450bbaae91` |

Los targets fueron `sha256:b96b9a46…` (rama) y los dos slices; en los cuatro casos `mutation_performed: false`.

## Lo que descarta el mensaje del proveedor

El texto sugiere partir en candidatos más chicos. Se probó: un slice de **7 archivos con una sola lente** sigue fallando. Por lo tanto el presupuesto no se está midiendo sobre el diff del candidato.

Hipótesis a verificar del lado nativo, en orden:

1. **El contexto del revisor incluye árbol completo del repo, no solo el cambio.** Con ~170 archivos de `src/` más 45 MDX y un `bun.lock` de 627 entradas, cualquier candidato arrastra el mismo peso.
2. **El lockfile se cuenta completo.** En el intento 3 el slice son 6.115 líneas de borrado de `pnpm-lock.yaml` más `bun.lock`; si el lockfile entra al contexto sin colapsarse, ningún slice de toolchain va a entrar nunca.
3. **Evidencia inmutable del candidato** (capturas, artefactos) sumada al árbol. `design/resolucion/screens/` está gitignoreado, pero `design/` versionado tiene ~5.000 líneas de HTML de prototipo.

## Qué NO está afectado

- La implementación: `astro check` 0 errores, **152/152** unitarios, **77/77** e2e Chromium, build de 95 páginas con `verify:bundle` y `verify:csp` en paridad.
- La historia: 15 slices verificados byte a byte contra `backup/pre-split`.
- La autoridad de review: no se creó ningún linaje, así que no hay nada que abandonar, resolver ni recuperar.

## Reproducir

```bash
cd <repo>
git switch --detach 64e01e8   # un slice de 7 archivos
# luego: gentle_review start con {"mode":"ordinary","lenses":["readability"],...}
```

Respuesta esperada hoy: `lens_context_budget_exceeded` con `next_action: stop`.

## Continuación

Por ahora la verificación es la suite propia del repo, que es exactamente lo que la review venía a complementar: es autoverificación, no opinión externa. Cuando el presupuesto nativo esté arreglado o cuando el repo baje de tamaño, el camino es `gentle-ai review status --next-transition` y ejecutar la transición devuelta para el scope reducido.
