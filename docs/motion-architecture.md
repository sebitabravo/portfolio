# Motion architecture (Phase 2 proposal)

Status: design only. No component or production motion code changes in this phase.

## 1. Goals and constraints

- Keep the HTML/CSS experience complete without JavaScript.
- Keep the hero `h1` static. It is the LCP element and must never receive a reveal, opacity, filter, or transform animation.
- Respect `prefers-reduced-motion: reduce` by disabling every GSAP tween, ScrollTrigger, Flip animation, and WebGL scene. When the preference is active at load, the enhancement chunks must not be requested at all.
- Integrate with Astro ClientRouter: full cleanup before a view swap, reinitialization after it.
- Keep the existing CSP contract (`script-src 'self'` plus exact inline hashes), bundle budget, and source limits.
- Keep the current Vitest and Playwright contracts green while the implementation moves behind new modules.
- Spanish code comments; English identifiers, docs, and commits.

## 2. Target module tree

```text
src/scripts/motion/
  types.ts               lifecycle, capabilities, GSAP/Flip types, guards, transition names
  environment.ts         media queries, pointer, memory, save-data, WebGL2 capability
  loaders.ts             lazy GSAP/ScrollTrigger/Flip/hero-webgl imports
  controller.ts          page-scoped lifecycle, activation gate, fallback, error isolation
  bootstrap.ts           Astro event wiring and singleton controller
  cards.ts               unified project-card manager
  hero.ts                hero pointer, magnetic CTA, scroll handoff, WebGL scene
  interactions.ts        pointer primitives, tilt, magnetic target
  reveal.ts              non-card [data-animate] reveal
  nav-indicator.ts       active-pill positioning with Flip.fit
  experience-timeline.ts timeline scrub and item reveal
  transitions.ts         view-transition names and route lifecycle helpers
```

### Existing files after migration

| Current file | Target |
| --- | --- |
| `src/scripts/portfolio-motion.ts` | Compatibility facade exporting `setupPortfolioMotion`, `teardownPortfolioMotion`, `shouldLoadWebGLEnhancement` from the controller/bootstrapper. Removed only after tests migrate. |
| `src/scripts/motion-capabilities.ts` | Re-exported by `environment.ts` and `loaders.ts`; deleted after callers migrate. |
| `src/scripts/motion-interactions.ts` | Re-exported by `motion/interactions.ts`; kept until tests import the new path. |
| `src/scripts/scroll-reveal.ts` | Thin wrapper around `motion/reveal.ts`; same public behavior for generic `[data-animate]` elements. |
| `src/scripts/projects.ts` | Thin wrapper around the cards module's image-fallback behavior until tests migrate. |
| `src/scripts/hero-webgl.ts` | Unchanged in Phase 3. Imported by `hero.ts`. |
| `src/scripts/header-nav.ts` | Keeps `.nav-active` and `aria-current`. Adds a custom event consumed by the nav indicator. |
| `src/scripts/reading-progress.ts` | Not part of the motion controller. Keep as the single owner of `[data-reading-progress]`. |

No new runtime dependency is required.

## 3. Lifecycle contract

`MotionModule` and `MotionController` both expose `init`, `refresh`, `destroy`, and `cleanup`.

| Method | Semantics |
| --- | --- |
| `init(context)` | Acquire resources, bind listeners with `context.signal`, create observers and GSAP instances. Called once per activation. Must not run twice. May throw; the controller isolates the failure. |
| `refresh(context, reason)` | Re-measure geometry after resize, font/image load, breakpoint change, page load, or view transition. Idempotent, no listener duplication, no re-init. |
| `destroy()` | Stop work and restore state: kill tweens/ScrollTriggers, disconnect observers, abort listeners, cancel rAF, clear inline properties. The module instance can be initialized again. It must not remove DOM nodes. |
| `cleanup()` | Terminal release. Calls `destroy()` if needed, drops element and library references, and is idempotent. After cleanup, `init()` is invalid. |

Controller rules:

- Modules are destroyed in reverse registration order.
- Each module failure is reported through `onError` and does not prevent the remaining modules from being destroyed.
- The controller owns the `AbortController`; its signal is aborted on `destroy()`.
- `destroy()` must be safe to call twice.
- `cleanup()` is called on `astro:before-swap` after `destroy()`.

State machine:

```text
idle --init--> loading --libraries ready--> active
                  |---- timeout/import failure ----> fallback
                  |---- reduced motion ------------> reduced
active --live reduced motion--> reduced (all modules destroyed)
reduced --no-preference again--> loading (activation gate rearmed)
any --astro:before-swap--> destroyed (new controller on next page-load)
```

`fallback` is terminal for the current navigation. A later reduced-motion change or navigation can create a new controller.

## 4. Astro lifecycle integration

`bootstrap.ts` is imported once from `Layout.astro`. `ClientRouter` is added once in `<head>`.

### `astro:before-swap`

Order matters:

1. `controller.destroy()`.
2. Hero scene cleanup cancels its `requestAnimationFrame` before disposing the renderer and forcing context loss. No Three.js frame can paint into a detached canvas during the swap.
3. Abort the controller signal, which removes all listeners registered by modules.
4. Kill tracked tweens with `gsap.killTweensOf(targets)`.
5. Kill remaining triggers with `ScrollTrigger.getAll().forEach((trigger) => trigger.kill())` as a safety net. The site owns all ScrollTriggers.
6. Revert `gsap.matchMedia()` contexts.
7. Restore tilt/magnetic variables and nav indicator inline styles.
8. Set `data-motion-status="idle"`; convert only `pending` WebGL state to `idle`. Preserve `fallback`, `reduced`, `ready`, and `disposed` terminal values.
9. `controller.cleanup()`.

### `astro:after-swap`

No motion modules are initialized here. The new document is in the DOM, but layout and fonts may not be settled. Keeping initialization in `page-load` avoids measuring stale geometry.

### `astro:page-load`

1. Create a new page-scoped controller and call `init()`.
2. Set `data-motion-status="loading"` and `data-webgl-status="pending"` on the new DOM.
3. Arm the activation gate.
4. On activation, load chunks and initialize modules.
5. After the first frame, call `controller.refresh("page-load")`; refresh again after `document.fonts.ready`, with a guard that the controller is still alive.

### Inline Hero script caveat

The Hero component's inline timer only executes on a full document load. Astro does not execute inline scripts from a document loaded through ClientRouter. The controller therefore owns the startup bound on client-side navigations:

- It emits `portfolio-motion:claimed` when it takes ownership.
- It emits `portfolio-motion:started` when loading begins.
- It applies the same 4-second bound after `started` and settles to `fallback`.
- The existing inline 3-second bound remains untouched on the initial load, preserving its CSP hash and the `motion-fallback` behavior.

Do not move the inline timer into a bundled script. Its early, synchronous protection is intentional.

## 5. Activation and fallback

The controller preserves the current gate exactly:

- `pointerenter`, `focusin`, and `touchstart` on `[data-portfolio-motion]`.
- `IntersectionObserver` with `rootMargin: "200px"`.
- Synchronous proximity check for heroes already near the viewport.
- Without `IntersectionObserver`, passive `scroll` plus `resize` listeners.
- 4-second fallback after `portfolio-motion:started`.

Chunk loading stays deferred until after the page load event. `loaders.ts` dynamically imports:

- `gsap` and `gsap/ScrollTrigger` always.
- `gsap/Flip` only when a nav indicator target exists.
- `./hero-webgl` only when WebGL capability checks pass.

WebGL capability checks keep the existing rules: no WebGL on `saveData`, `2g`, `slow-2g`, or `deviceMemory < 2`. If WebGL fails, GSAP motion remains active and the canvas settles to `fallback`.

If the core GSAP import fails or exceeds the bound, the controller sets both statuses to `fallback`. If an individual module throws, only that module is disabled; the controller remains `active`.

## 6. Module specifications

### 6.1 Cards manager (`cards.ts`)

This module becomes the only owner of `[data-project-card]`. It absorbs:

- Card reveal classes currently owned by `scroll-reveal.ts`.
- Card lift/scale and section progress currently owned by `portfolio-motion.ts`.
- Image error fallback currently owned by `projects.ts`.

DOM contract:

```text
[data-projects-list]                 grid
[data-project-card]                  card
img[data-img-fallback]               broken-image fallback
```

Behavior:

- Eager layer (no GSAP): image fallback and IntersectionObserver reveal. This layer works even if GSAP falls back.
- GSAP layer: card tilt and scroll-scrubbed `--motion-y` / `--motion-scale`. No section progress trigger: the page renders no meter that would consume it.
- One pointer lifecycle per card: a single `AbortController`, one `ResizeObserver`, one rAF loop for the tilt.
- `ScrollTrigger.batch` is typed and available for a one-time stagger, but Phase 3 keeps the existing scroll-scrubbed entrance to avoid a visual regression. If batch is adopted, it must feature-detect `typeof ScrollTrigger.batch === "function"` so the current unit harness still exercises the `fromTo` fallback path.
- `destroy()` kills the card timeline and its trigger and calls every pointer cleanup.

Ownership rule: no other module may add `reveal-pending`, `animate-in`, or write `--motion-*`, `--card-*` on a project card.

### 6.2 Hero (`hero.ts`)

- The `h1` is never selected. A regression test should assert that the hero title has no inline transform, opacity, or filter after activation.
- The pointer drives only the glass glow (`--hero-glow-x/y` on `.hero-art-frame`, read by `.os-crt`) through GSAP `quickTo`; the frame no longer tilts.
- Magnetic CTA: new `createMagneticTarget` primitive in `interactions.ts` writes `--magnet-x` and `--magnet-y`. CSS applies them with the independent `translate` property, so existing hover `transform` rules remain intact. Maximum displacement is 6–8 px, only on fine pointers, and never created under reduced motion. Keyboard focus gets no displacement.
- Scroll handoff: a scrub tween moves/fades only `.hero-art-frame`, `.hero-actions`, and `.hero-meta` as the hero exits. No pin, no layout-shifting trigger. The `h1` and its copy column stay static.
- WebGL scene creation and disposal remain in `hero-webgl.ts`. The hero module passes the same canvas and root elements the current tests expect.
- `destroy()` kills the handoff trigger, pointer cleanup, magnetic cleanup, and scene cleanup.

### 6.3 Nav indicator (`nav-indicator.ts`)

- Header receives one `<span data-nav-indicator aria-hidden="true">` pill. It is decorative; navigation semantics stay on the links.
- `header-nav.ts` keeps its IntersectionObserver and continues to set `.nav-active` and `aria-current`. It additionally dispatches `header-nav:change` with the active link.
- The indicator listens for that event and calls `Flip.fit(indicator, activeLink, { duration: 0.35, ease: "power3.out", absolute: true })`.
- `refresh("viewport")` re-fits with duration `0`.
- With no active link, the indicator fades out.
- Reduced motion sets the final geometry immediately; no Flip timeline is created.
- `Flip` is imported only when `[data-nav-indicator]` exists. If the import fails, geometry is set without animation.
- `destroy()` kills tweens of the indicator, clears inline geometry, and removes the event listener. It does not touch `.nav-active` or `aria-current`.

### 6.4 Experience timeline (`experience-timeline.ts`)

New markup markers:

```text
data-experience-list       <ol>
data-experience-item       each <li>
data-experience-progress   progress line overlay
```

- `ScrollTrigger.create` scrubs `--timeline-progress` from 0 to 1 between `top 80%` and `bottom 60%`.
- The progress line scales on the Y axis; item content reveals once.
- No pin, no horizontal scroll, no layout mutation.
- Reduced motion sets `--timeline-progress: 1` and reveals every item immediately.
- `destroy()` kills the trigger, restores the variable, and removes inline styles.

### 6.5 Reveal (`reveal.ts`)

- Owns `[data-animate]` except project cards and experience items. This avoids double ownership.
- Same IntersectionObserver behavior as `scroll-reveal.ts`: clean stale classes, mark near-viewport targets `reveal-pending`, add `animate-in` on intersection, unobserve.
- Default CSS visibility remains the source of truth; JS only enhances.
- Reduced motion skips the observer entirely.
- `refresh()` re-evaluates visibility without hiding elements that were already revealed.

### 6.6 View transitions (`transitions.ts`)

- `ClientRouter` is added once in `Layout.astro` `<head>`.
- Default animations are used. No custom `viewTransition.ready` code.
- Header is not persisted. `transition:persist` would keep stale `data-home`, locale, dropdown, and theme state across navigations; the default fade is safer.
- Shared-element names are canonical and unique per document:

| Name | Source | Target |
| --- | --- | --- |
| `vt-article-title-${postId}` | project card title on Home (using localized `blogSlug`) and BlogCard `h2` | Blog post `h1` |
| `vt-article-media-${postId}` | project card media, when a matching post image exists | Blog post cover image, when added |
| `vt-nav-indicator` | nav pill | nav pill (page-local only) |

- `postId` is sanitized by `articleTitleTransitionName()` / `articleMediaTransitionName()` in `types.ts`.
- Never place the same transition name on two elements in one document. Multiple cards link to different posts; duplicate IDs must drop the attribute rather than duplicate the name.
- Locale variants use different post IDs (`-en` suffix in project data), so names stay unique and matching.
- Astro disables view-transition animations under reduced motion. No custom fallback animation is added.
- On navigation failure or unsupported browsers, ClientRouter's normal fallback applies.

## 7. Reduced-motion matrix

| Surface | `no-preference` | `reduce` |
| --- | --- | --- |
| CSS hero reveals / orbit | active | disabled by CSS |
| GSAP imports | deferred, on activation | never requested initially |
| Card tilt / scrub | active | not created; destroyed if preference changes live |
| Hero magnetic CTA | active on fine pointer | not created |
| WebGL scene | created if capable | never created; canvas hidden by CSS; disposed if live change |
| Nav Flip pill | animated | positioned instantly |
| Experience timeline | scrubbed | progress set to 1 |
| ClientRouter transitions | default Astro animation | disabled by Astro |

Live preference changes:

1. Increment the activation sequence so in-flight imports are ignored.
2. Clear the fallback timer.
3. Disconnect the activation observer and remove gate listeners.
4. `destroy()` active modules and revert the GSAP media context.
5. Dispose WebGL, cancel rAF, and set `data-webgl-status="reduced"`.
6. Set `data-motion-status="reduced"`.
7. On return to `no-preference`, set loading/pending, rearm the gate, and wait for a fresh pointer/proximity activation. Do not auto-resume.

## 8. CSP, bundle, and source limits

- ClientRouter emits a bundled module script. It is covered by `script-src 'self'`; it does not add an inline executable hash.
- No new inline scripts, inline event handlers, `eval`, or dynamic code strings.
- View-transition names are plain attributes. Astro's generated transition styles fall under `style-src 'self' 'unsafe-inline'`.
- `transition:name` values are sanitized to `[a-z0-9_-]`.
- The existing Hero inline timer is not modified, so its hash stays valid.
- If `pnpm verify:csp` reports parity failure, stop. Do not hand-edit `vercel.json` hashes.
- Bundle budget remains 600 KiB raw / 150 KiB gzip per chunk. Flip is conditional; WebGL remains conditional; cards/hero/reveal share the GSAP chunk.
- Source limits: `.ts` ≤ 300 lines, `.astro` ≤ 250, `.css` ≤ 1500. New modules must stay under their limits; split by responsibility rather than growing `controller.ts`.

## 9. Test compatibility

Current evidence before implementation: `pnpm check` passes and Vitest reports 245 passing tests.

| Test | Contract to preserve |
| --- | --- |
| `tests/portfolio-motion.test.ts` (24) | Compatibility exports; activation gate; 4s fallback; `gsap.matchMedia`; `registerPlugin` once; `createPointerMotion`, `createCardTilt`, `createHeroScene` calls; no project section trigger; teardown statuses; claimed event; stale callback rejection. |
| `tests/motion-fallback.spec.ts` | Inline 3s fallback; `portfolio-motion:started`; stale timer cannot settle a newer loading state. |
| `tests/motion-load-order.spec.ts` | GSAP/ScrollTrigger/WebGL chunks start after the page load event. |
| `tests/motion-late-startup.spec.ts` | Late claim still settles to fallback when the observer never activates. |
| `tests/animation-behavior.spec.ts` | Reduced motion keeps the hero visible with zero animations; live changes re-arm and tear down. |
| `tests/hero-webgl.test.ts` | Scene lifecycle, fallback, observer/frame cleanup, post-dispose callbacks ignored. Do not edit `hero-webgl.ts` in Phase 3. |
| `tests/motion-interactions.test.ts` | Existing `createPointerMotion` / `createCardTilt` signatures and variable values. New options must be optional. |
| `tests/projects-script.test.ts` | Image fallback and no pointer writes on cards; teardown removes listeners. The compatibility wrapper must keep this behavior. |
| `tests/scroll-reveal.test.ts` | Generic `[data-animate]` lifecycle. The wrapper must keep same class and observer behavior; cards must be excluded only in the new reveal module, not in the wrapper's generic test fixtures. |
| `tests/header-nav.test.ts` | `.nav-active`, `aria-current`, scrolled threshold, observer visibility, teardown, no stacked listeners. The custom event is additive. |
| `tests/reading-progress.test.ts` | Global scroll progress remains owned by `reading-progress.ts`. |
| `tests/home/home.spec.ts` | `[data-reading-progress]` style uses `scaleX(...)` and progresses on scroll while active. |
| `tests/css-contracts`, design-token, performance, security tests | No new global stylesheet entrypoints; CSP and bundle gates unchanged. |

Migration rule: keep compatibility facades and feature detection until the new modules are proven. Do not rewrite or relax an assertion to make a new implementation pass. If a test must change, stop and ask first with the exact contract and replacement coverage.

## 10. Phase 3 implementation order

1. `environment.ts`, `loaders.ts`, `controller.ts`, `bootstrap.ts` behind the existing `portfolio-motion.ts` exports. No component changes. Run `pnpm check` and `pnpm test`.
2. `interactions.ts`: add optional signal and magnetic primitive without changing existing signatures.
3. `cards.ts` and compatibility wrappers for `projects.ts` / `scroll-reveal.ts`. Run all motion tests.
4. `hero.ts`: pointer reuse, magnetic CTA, scroll handoff. Add the `h1` static regression assertion.
5. `header-nav.ts` event and `nav-indicator.ts`; verify reduced motion and teardown.
6. `experience-timeline.ts` plus `data-experience-*` markup. No visual change without JS.
7. Enable `ClientRouter` in `Layout.astro`; add `transition:name` helpers to project/card/post headings. Run full Playwright suite.
8. Remove old bootstraps and facades only after the suite has been green for one full pass. Delete `scroll-reveal`'s after-swap listener, Hero's page-load listener, and Projects' page-load listener in the same commit that makes the controller their owner.

## 11. Acceptance criteria

- `pnpm check`: 0 errors.
- `pnpm test`: existing Vitest suite passes.
- `pnpm build`: source limits, bundle size, and exact CSP hash parity pass.
- Playwright: motion, animation-behavior, fallback, home, smoke, and accessibility specs pass in Chromium, Firefox, and WebKit.
- Three consecutive client navigations leave no duplicate ScrollTriggers, observers, or pointer listeners.
- Reduced motion: zero active GSAP tweens, zero ScrollTriggers, zero WebGL contexts, hero content fully visible.
- Hero `h1` computed style has no animation, opacity change, filter, or transform after activation.
- No console errors, no unhandled rejections, no orphaned rAF loops.
- View transitions share the article title between Home/Blog and the post, with unique names per document.

## 12. Decisions for approval

1. Keep `portfolio-motion.ts`, `projects.ts`, and `scroll-reveal.ts` as compatibility facades during Phase 3. Remove them only after the full suite passes.
2. Keep the existing scroll-scrubbed card entrance. `ScrollTrigger.batch` stays in the type contract and is feature-detected for future stagger work; it is not the default card path in Phase 3.
3. Do not persist the header across navigations. Let ClientRouter swap it and reinitialize nav state.
4. Use a single shared-element name family: `vt-article-title-${postId}` (implemented), `vt-article-media-${postId}` (reserved until the post page renders a cover).
5. Load Flip only when a nav indicator exists; do not add it to the core GSAP chunk.
