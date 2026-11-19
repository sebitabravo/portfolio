# Cerrar el diseño Resolución

Diseño de registro: `design/resolucion/` (ES, 7 vistas + OG + board de prosa + board de estados). Este documento cierra lo que falta para que el diseño esté completo y verificable antes de portarlo a Astro. Decisiones delegadas al agente por el autor.

## Specs

S1 — "la idea es que sea con fondo negro muy minimalista y que utilices Geist Pixel y mono". Oscuro es el tema por defecto (`#000`), claro secundario (`#fff`, nunca crema). Display: Geist Pixel. Todo lo demás: Geist Mono. Ninguna tercera familia, en ningún contexto.

S2 — "la idea es vender de forma espectacular mis productos". El único color del sitio son las capturas de los productos. La UI no introduce color fuera de `--bg`, `--fg`, `--fg-muted`, `--fg-faint`, `--line`, `--fill`.

S3 — "que tenga sonidos y animaciones brutales". Motion cuantizado: `steps(4)` 80ms feedback, `steps(6)` 240ms transición, `steps(8)` 480ms entrada, 8px de distancia. Sonido sintetizado con Web Audio, apagado por defecto, persistido, nunca en scroll pasivo. Todo silencioso y estático bajo `prefers-reduced-motion`.

S4 — "que el proyecto quede bien optimizado ya que por eso se utiliza astro". Sin CDN, sin fuentes remotas, sin dependencias nuevas. Solo las 7 fuentes locales de `fonts/`.

S5 — "me dijieron que esta muy saturado y poco profecional se nota que soy junior y no senior". Un solo lenguaje visual. Prohibido reimportar lo rechazado en `DESIGN.md` §1: avatar con glow, chips de color por tecnología, devicons, badge cónico, gradiente en `h1`, grain, palette `⌘K`, reveals bezier, acciones solo-icono.

S6 — "quiero que todas las desiciones de diseño y esas cosas las tomes tu ya sabes que buscaba y que queria". Dentro de S1–S5 el agente decide y registra la decisión en `DESIGN.md`; no devuelve la pregunta al autor.

S7 — "quiero que quede todo perfecto". Toda ruta dibujada en ES y EN, todo componente interactivo con sus estados especificados, y un audit que lo pruebe en 1440 y 390, en los dos temas.

S8 — "levanta agenets para que realicen todo este trabajo". El trabajo se ejecuta por agentes con superficies disjuntas; el padre solo coordina, mantiene el manifest y reporta.

## Tasks

| ID | Tarea | Specs | Ruta | Commit |
|---|---|---|---|---|
| T1 | Espejos EN de las 7 vistas + toggle `es/en` funcional en todas | S1,S4,S6,S7 | escritor A | sin commit |
| T2 | Board de estados completo + estados faltantes en CSS + nota de `design/system.md` | S1,S5,S6,S7 | escritor B | sin commit |
| T3 | CV imprimible regenerado + las 3 tarjetas OG renderizadas | S2,S4,S7 | escritor C | sin commit |
| T4 | Manifest `design.json` + `DESIGN.md` al día | S6,S7 | padre | sin commit |
| T5 | Audit Playwright de todas las vistas (1440/390, dos temas, reduced-motion, foco, contraste) | S3,S7 | verificador | sin commit |
| T6 | Reporte de cierre con huecos y evidencia | S7 | padre | sin commit |

Estado: T1-T6 cerradas. Evidencia por tarea al final del documento.

## Log

L1 — "ya mira nose si estara en engram pero antiguamente hicimos un desing pero no me gusto ninguno entonces yo realice el mio propio @design/ entonces quiero que lo revises porfavor con el gentle-desing y que si es que me quedo bien que es para comenzar a limpiar el proyecto y quitar todo lo inutil e invesario que tengo y cambiar el diseño por ese pero perimero quiero que lo dianostiques y que me digas si es que quedo bien."

L2 — "ya mira en @design/ ya se realizo lo que queria que era un labado de cara que era esto (mira estoy creando un desing para arreglar mi portafolio ya que me dijieron que esta muy saturado y poco profecional se nota que soy junior y no senior. la idea es vender de forma espectacular mis productos y que tenga sonidos y animaciones brutales. la idea es que el proyecto quede bien optimizado ya que por eso se utiliza astro y que mejores la ui al maximo. la idea es que sea con fondo negro muy minimalista y que utilices Geist Pixel y mono. tengo un par de repositorios de ejemplo para que te bases de como tiene que ser ...). pero la duda que tengo es si es que para crear mi desing revisaste los que te pase de referencia? ... ya que el que me hiciste esta bonito pero capas algo de estos te pueda servir para que te quede mas perfecto aun el diseño."

L3 — "mira quiero que todas las desiciones de diseño y esas cosas las tomes tu ya sabes que buscaba y que queriaentonces quiero que quede todo perfecto"

L4 — "no realices tu las cosas levanta agenets para que realicen todo este trabajo y que quede todo bien montado el desing y asi veo si es que quede perfecto o no"

L5 — Decisión del padre sobre la prosa del artículo (delegada en L3): `17px/30px` en Geist Mono. A 44rem, 15px daba ~78 caracteres por línea; 17px queda en 69 y conserva la identidad. Sans descartada: tercera familia, ~40KB y contradice S1. Aplicado en `views.css`, verificado en Chromium.

L6 — Decisión del padre sobre estados faltantes: press = `translateY(2px)` con el mismo `steps(4)` de 80ms (no oscurecer); deshabilitado = `--fg-faint` + `--line`, nunca opacidad intermedia. Aplicado en `resolucion.css`.

L7 — WIP de la dirección anterior descartada por decisión del autor (161 cambios, 74 M + 7 D + 80 ??); preservados `design/`, `POSITIONING.md`, `docs/design/archive-sb-os-2.6.md` y `odd/tasks/`. Patch de rescate en `/tmp/portfolio-wip-sb-os-2.6.patch`.

L8 — EN no se dibuja como artboard separado por vista legal: las vistas interiores comparten layout y solo cambian strings; se dibujan igual porque el toggle es una promesa visible del sitio y un control muerto es peor que un archivo de más.
L9 — Cierre (T1-T6). T1: `design/resolucion/en/` con 6 espejos, strings de `en.json` y `LocalizedPrivacy.astro`, hreflang es/en/x-default en los 12 heads, toggle real con `aria-current`. T2: `09-estados.html` con 20 especímenes por tema, press y disabled especificados por primera vez y aplicados en `resolucion.css:140-155`; `design/system.md` con nota de estado (captura de lo enviado, no el sistema de registro). T3: `common.js:85-104` etiqueta de sonido derivada de `<html lang>` y guards de nodos; 3 OG a 1200×630 exactos; 46 capturas en `screens/`; CV en 4 páginas A4. T4: `design.json` con 16 artboards sobre 15 archivos, 46 screens, 3 og, 4 shared; sin faltantes ni sobrantes. T5: audit de 17 documentos con S1-S7 en PASS, sin hallazgos bloqueantes; las secciones I (manifest) y H (conteo de print) del verificador se descartaron por carrera de lectura y por contradecir el artefacto, y el padre las re-midió (manifest consistente, PDF 4 páginas). T6: reporte al autor con el canvas y la lista de lo que queda para el port.
