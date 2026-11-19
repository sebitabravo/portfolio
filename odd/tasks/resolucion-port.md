# Depurar el proyecto e implementar Resolución

El diseño está cerrado y auditado (`design/resolucion/`, ver `odd/tasks/resolucion-design-close.md`). Este documento cubre la otra mitad: dejar el repositorio con lo justo, en la última versión de Astro, y reemplazar la capa visual por Resolución sin perder contenido, i18n ni SEO.

## Specs

S1 — "antes de implementar el desing que veas el proyecto y que lo limpies que borres todo lo incesario capas test o ci/cd que no son necesarios depuremos el proyecto completo". Se borra todo lo que no se use: tests que fijan la gramática visual vieja, docs de arquitecturas muertas, scripts sin llamador, artefactos de build, dependencias sin consumidor.

S2 — "que quede lo justo y necesario que se va a utilizar". Cada archivo que sobreviva tiene que tener un consumidor real. Cada dependencia que sobreviva tiene que usarse en el build o en runtime.

S3 — "quiero utilizar la ultima version de astro la que tiene el compilador en rust". Astro 7 es la mayor con `@astrojs/compiler-rs` por defecto. Se sube a la última 7.x estable y se cumple su piso de Node duro (22.23.4), que hoy el repo viola.

S4 — "que el rendimeinto de la portafolio este lo mas optimizada posible ... que funcione perfecto y no tener problemas de rendimiento". Sin JS de cliente que el diseño no necesite, sin fuentes de más, sin CSS de más, presupuestos de bundle y Lighthouse verdes, y cada afirmación de rendimiento medida, no estimada.

S5 — "esta todo listo el desing". La fuente de verdad visual es `design/resolucion/`. No se rediseña durante el port: se implementa lo que ya está especificado (tokens, prosa 17/30, estados press/disabled, 12 rutas ES/EN).

S6 — "levanta 100 agentes si quieres pero que quede limpio el proyecto". Se delega por superficies disjuntas; el padre coordina, mantiene el manifest y verifica.

S7 — Preservación: los 45 artículos MDX, el modelo de datos de proyectos, los diccionarios i18n, el SEO/JSON-LD, la política de privacidad, el CV y las 8 certificaciones tienen que seguir funcionando igual. El contenido del autor no se pierde ni se reescribe en su prosa.

## Tasks

| ID | Tarea | Specs | Ruta | Commit |
|---|---|---|---|---|
| T1 | Base: rama, commit del diseño cerrado y de los documentos | S5,S6 | padre | `docs(design)` |
| T2 | Depuración: tests de la gramática vieja, docs muertos, scripts sin llamador, artefactos | S1,S2 | escritor A | `chore(cleanup)` |
| T3 | Upgrade: Astro 7.4.x, Node 22.23.4+, dependencias sin consumidor fuera, CI al día | S2,S3 | escritor B | `chore(deps)` |
| T4 | Tokens, fuentes y base CSS de Resolución en `src/styles` | S5 | escritor C | `feat(styles)` |
| T5 | Layout, header, home y sus secciones | S5,S7 | escritor D | `feat(home)` |
| T6 | Rutas interiores: blog, post, privacidad, 404, links, OG | S5,S7 | escritor E | `feat(routes)` |
| T7 | Migrar el markup de los MDX que usan clases del diseño viejo | S1,S7 | escritor F | `chore(content)` |
| T8 | Rendimiento y verificación: presupuestos, Lighthouse, CSP, links, a11y | S4 | verificador | `perf` |

## Log

L1 — "ya esta perfecto ahora hay que limpiar el proyecto e implementar las cosas como corresponde ya que esta todo listo el desing entonces mira quiero antes de implementear el desing que veas el proyecto y que lo limpies que borres todo lo incesario capas test o ci/cd que no son necesarios depuremos el proyecto completo porfavor para que quede too listo y de buena menra porfavor. levanta 100 agentes si quieres pero que quede limpio el proyecto porfavor y que quede lo justo y necesario que se va a utilizar. queiro utilizar la ultima version de astro la que tiene el compilador en rust y que el rendimeinto de la portafolio este lo mas optimizada posible de buena manera ya que quiero que funcione perfecto y no tener problemas de rendimiento."

L2 — Recon (agente explorador, 2026-11-19): el repo YA está en Astro 7.3.3 con `@astrojs/compiler-rs` por defecto; la última estable es 7.4.13 y su piso duro de Node es 22.23.4 mientras `.nvmrc`, `engines` y los dos workflows fijan 22.23.3. Pipeline Rust ya activo: Rolldown (Vite 8), LightningCSS, Oxc, Sätteri. No hay salto mayor pendiente.

L3 — Inventario: 78 archivos de test (58 vitest + 20 Playwright), 2 workflows + dependabot, 17 scripts en `src/scripts` + 6 en `scripts/`, 6 hojas de estilo, 28 componentes + 33 iconos, 45 MDX. Tests que fijan la gramática vieja identificados por nombre; tests durables (i18n, JSON-LD, CSP, content schema, a11y) se conservan.

L4 — Deuda de contenido: los MDX usan utilidades de Tailwind y tokens del diseño viejo (`bg-card`, `border-parchment`, `not-prose`, `text-foreground`, `bg-muted`, `rounded-xl`, `sm:grid-cols`). Si Tailwind sale del proyecto, esos bloques se rompen en silencio: hay que migrarlos al vocabulario de la prosa nueva.

L5 — Decisión del padre: Tailwind, `three`, `gsap`, `clsx`, `tailwind-merge` y el stack de motion viejo salen. Resolución no usa utilidades, ni WebGL, ni GSAP: usa CSS con custom properties, View Transitions y `steps()`. Cada dependencia que queda tiene consumidor en build o runtime (S2).

L6 — Orden corregido: T3 sube Astro y Node pero NO poda dependencias, porque `src/scripts/hero-webgl.ts` y el stack `motion/` todavía importan `three` y `gsap` hasta que el port los borre. La poda de dependencias se hace en el mismo work unit que elimina sus consumidores, no antes.

L7 — `DESIGN.md` estaba ignorado por `.gitignore:69` a nivel global, así que el documento de diseño no entraba al repo. Se acota la regla a `/DESIGN.md` (solo raíz) y se excluye `design/resolucion/screens/` del versionado por ser evidencia regenerable (~15MB de PNG).

L8 — Base creada: rama `feat/resolucion-port` y commit `ae3cebf` con el diseño cerrado y sus documentos. El reporte de slice avisó 5476 líneas en un commit: es un commit de archivo de artefactos ya escritos (prototipo + docs), no lógica nueva; el límite de ~400 líneas se aplica desde el commit siguiente.

L9 — T2 (`038b1b9`): 40 archivos de test borrados y 9 recortados a sus aserciones durables. Sobreviven i18n, JSON-LD, SEO/OG, CSP, schema de contenido, integridad de datos, links, supply-chain, pinning de acciones y a11y.

L10 — T3: Astro `^7.4.5` con 7.4.5 resuelto. La decisión de rango sale de un conflicto real: la ventana de 14 días bloqueaba 7.4.13 (0.8 días de vida) y las dos instrucciones no podían cumplirse juntas. Con caret + ventana, `bun install` toma solo la última versión que ya envejeció: 7.4.5 hoy, 7.4.13+ en cuanto pase el plazo, sin tocar la política. Se borraron dos exclusiones viejas (`astro@7.3.3`, `vite@8.2.4`) y el override muerto de `rollup`, lo que refuerza la política. Node sube a `>=22.23.4` en `.nvmrc`, `engines` y ambos workflows.

L11 — T9: pnpm → Bun 1.4.4 (`315f69a`). `bunfig.toml` con `minimumReleaseAge = 1209600` y las tres exclusiones; los 16 overrides pasan a `overrides`; `trustedDependencies` lista los tres paquetes de build porque declarar el campo reemplaza la lista por defecto de Bun. Scripts corren bajo Bun directo, así que `tsx` y sus 29 transitivos salen: 656 → 627 entradas sin un solo cambio de versión. Install 1.37s, build 24.8s, 149/149 tests verdes.

L12 — Controles perdidos al salir de pnpm, y su reemplazo: `blockExoticSubdeps` → test que escanea `bun.lock` y rechaza `git+`, `file:`, `link:`, `workspace:`, `http(s)://` en cualquier dependencia; `trustPolicy: no-downgrade` → sin equivalente en Bun, mitigado con `bun ci` en CI más el paso de `bun audit --prod`. Queda un advisory moderado preexistente (GHSA-r3h5-4585-7x3w) que pide Astro ≥ 7.4.6: se resuelve solo cuando la ventana de 14 días lo admita, sin exclusiones.

L13 — Port completado. T4: 6 módulos CSS + entrada única en `src/styles/`, 7 woff2 en `public/fonts/`, valores verbatim del diseño. T5a: `Layout` con el bootstrap pre-paint como único script inline (CSP quedó en **1 hash**), Astro Fonts API eliminada, header/pair de idioma/theme/sonido portados. T5b: home completa con resolve del nombre, stage con tabs roving-tabindex, filas CV y CTA de email; borrados boot screen, signal strip, story track, chrome OS, seal, retro TV, stack GSAP y hero WebGL. T6: blog index con filtros y contador, artículo con TOC sticky y prosa 17/30, privacidad, 404, hub `/links` nuevo y tarjetas OG por locale. T7: los 4 MDX con markup viejo migrados a `.cards`/`.note` con **texto byte-idéntico** (probado con strip de tags contra HEAD). T8: 10 tests reescritos a la gramática nueva, **152/152 verdes**, 6 hojas de estilo viejas borradas, `lighthouserc` con las rutas nuevas.

L14 — Rendimiento medido sobre `dist/` (build limpio, 95 páginas): CSS **21.2 KB raw / 5.0 KB gz** en **un solo archivo**; JS **32.3 KB raw / 10.6 KB gz** repartido en 17 chunks, el mayor 16.1 KB raw / 5.5 KB gz (`ClientRouter`); cada página carga **solo 2 fuentes** (Geist Pixel Square + Geist Mono Regular) pese a que hay 7 disponibles; cero rastro de la paleta vieja (`#ff4fd8`, `#a3127a`, `rainbow-stripes`, `Instrument Serif`) en `dist/`. Los presupuestos del repo pasan: `verify:bundle` (≤150 KiB gz por chunk) y `verify:csp` en paridad exacta.

L15 — Pendiente y fuera de este documento: el run de Lighthouse vive en CI (`lighthouserc.json` con las rutas nuevas) porque la acción no está instalada local; el advisory de Astro se cierra solo al vencer la ventana de 14 días; y push, PR y merge son decisión del autor. Los PDFs de certificaciones son 3.6 MB de `dist/` pero son descargas, no peso de página.
