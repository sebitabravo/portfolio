// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  setupPortfolioMotion,
  shouldLoadWebGLEnhancement,
  teardownPortfolioMotion,
} from "../src/scripts/portfolio-motion";

const motionHarness = vi.hoisted(() => {
  const media = {
    add: vi.fn(),
    revert: vi.fn(),
  };
  const timeline = {
    scrollTrigger: { kill: vi.fn() },
    kill: vi.fn(),
  };
  const sectionTrigger = { kill: vi.fn() };
  const sceneCleanup = vi.fn();
  const pointerCleanup = vi.fn();
  const cardCleanup = vi.fn();

  return {
    conditions: { reduceMotion: false, finePointer: true },
    media,
    timeline,
    sectionTrigger,
    sceneCleanup,
    pointerCleanup,
    cardCleanup,
    gsap: {
      registerPlugin: vi.fn(),
      matchMedia: vi.fn(() => media),
      fromTo: vi.fn(() => timeline),
    },
    ScrollTrigger: {
      create: vi.fn((_options: unknown) => sectionTrigger),
    },
    createHeroScene: vi.fn((_canvas: HTMLCanvasElement) => {
      _canvas.dataset.webglStatus = "ready";
      return sceneCleanup;
    }),
    createPointerMotion: vi.fn(() => pointerCleanup),
    createCardTilt: vi.fn(() => cardCleanup),
  };
});

vi.mock("gsap", () => ({
  gsap: motionHarness.gsap,
  default: motionHarness.gsap,
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: motionHarness.ScrollTrigger,
  default: motionHarness.ScrollTrigger,
}));

vi.mock("../src/scripts/hero-webgl", () => ({
  createHeroScene: motionHarness.createHeroScene,
}));

vi.mock("../src/scripts/motion-interactions", () => ({
  createPointerMotion: motionHarness.createPointerMotion,
  createCardTilt: motionHarness.createCardTilt,
}));

function installActivationObserver() {
  let callback: IntersectionObserverCallback | undefined;
  const observer = {
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
    takeRecords: vi.fn(() => []),
  };
  const IntersectionObserverMock = vi.fn(
    (
      nextCallback: IntersectionObserverCallback,
      _options?: IntersectionObserverInit,
    ) => {
      callback = nextCallback;
      return observer;
    },
  );
  vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

  return {
    observer,
    IntersectionObserverMock,
    triggerProximity: () => {
      callback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        observer as unknown as IntersectionObserver,
      );
    },
  };
}

function setHeroOffscreen(root: HTMLElement) {
  vi.spyOn(root, "getBoundingClientRect").mockReturnValue({
    top: window.innerHeight + 300,
    bottom: window.innerHeight + 400,
  } as DOMRect);
}

describe("portfolio motion gates", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
    motionHarness.conditions.reduceMotion = false;
    motionHarness.conditions.finePointer = true;
    motionHarness.media.add.mockImplementation((_queries, callback) => {
      const contextCleanup = callback({ conditions: motionHarness.conditions });
      motionHarness.media.revert.mockImplementation(() => contextCleanup?.());
    });
  });

  afterEach(() => {
    teardownPortfolioMotion();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("does not load WebGL on data-saving, slow or low-memory devices", () => {
    expect(shouldLoadWebGLEnhancement({ saveData: true }, 8)).toBe(false);
    expect(shouldLoadWebGLEnhancement({ effectiveType: "2g" }, 8)).toBe(false);
    expect(shouldLoadWebGLEnhancement({ effectiveType: "slow-2g" }, 8)).toBe(
      false,
    );
    expect(shouldLoadWebGLEnhancement({}, 1)).toBe(false);
    expect(shouldLoadWebGLEnhancement({}, undefined)).toBe(true);
    expect(shouldLoadWebGLEnhancement({}, 2)).toBe(true);
  });

  it("keeps the static hero visible and waits for hero interaction before loading", async () => {
    document.body.innerHTML = `
      <section data-portfolio-motion>
        <canvas data-hero-webgl></canvas>
      </section>
    `;
    const { observer } = installActivationObserver();
    const requestIdleCallback = vi.fn();
    vi.stubGlobal("requestIdleCallback", requestIdleCallback);
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false })),
    );
    const root = document.querySelector<HTMLElement>("[data-portfolio-motion]")!;
    setHeroOffscreen(root);

    setupPortfolioMotion();

    const canvas =
      document.querySelector<HTMLCanvasElement>("[data-hero-webgl]")!;
    expect(root.dataset.motionStatus).toBe("loading");
    expect(canvas.dataset.webglStatus).toBe("pending");
    expect(requestIdleCallback).not.toHaveBeenCalled();
    expect(observer.observe).toHaveBeenCalledWith(root);
    await Promise.resolve();
    expect(root.dataset.motionStatus).toBe("loading");
    expect(motionHarness.gsap.registerPlugin).not.toHaveBeenCalled();

    root.dispatchEvent(new Event("pointerenter"));
    await vi.waitFor(() => expect(root.dataset.motionStatus).toBe("active"));

    expect(motionHarness.createHeroScene).toHaveBeenCalledWith(canvas, root);
  });

  it("activates when the hero is within 200px of the viewport and disconnects on teardown", async () => {
    document.body.innerHTML = `
      <section data-portfolio-motion>
        <canvas data-hero-webgl></canvas>
      </section>
    `;
    const { observer, IntersectionObserverMock, triggerProximity } =
      installActivationObserver();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false })),
    );
    const root = document.querySelector<HTMLElement>("[data-portfolio-motion]")!;
    setHeroOffscreen(root);

    setupPortfolioMotion();

    expect(IntersectionObserverMock).toHaveBeenCalledWith(
      expect.any(Function),
      { rootMargin: "200px" },
    );
    triggerProximity();
    await vi.waitFor(() => expect(root.dataset.motionStatus).toBe("active"));

    teardownPortfolioMotion();

    expect(observer.disconnect).toHaveBeenCalled();
  });

  it("activates an initially near hero before IntersectionObserver delivers a callback", async () => {
    document.body.innerHTML = `<section data-portfolio-motion><canvas data-hero-webgl></canvas></section>`;
    const { observer } = installActivationObserver();
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    const root = document.querySelector<HTMLElement>("[data-portfolio-motion]")!;
    vi.spyOn(root, "getBoundingClientRect").mockReturnValue({
      top: window.innerHeight + 150,
      bottom: window.innerHeight + 250,
    } as DOMRect);

    setupPortfolioMotion();

    expect(observer.observe).toHaveBeenCalledWith(root);
    await vi.waitFor(() => expect(root.dataset.motionStatus).toBe("active"));
    expect(motionHarness.gsap.registerPlugin).toHaveBeenCalledTimes(1);
  });

  it("activates an initially near hero without IntersectionObserver", async () => {
    document.body.innerHTML = `<section data-portfolio-motion><canvas data-hero-webgl></canvas></section>`;
    vi.stubGlobal("IntersectionObserver", undefined);
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    const root = document.querySelector<HTMLElement>("[data-portfolio-motion]")!;
    vi.spyOn(root, "getBoundingClientRect").mockReturnValue({
      top: window.innerHeight + 150,
      bottom: window.innerHeight + 250,
    } as DOMRect);

    setupPortfolioMotion();
    await vi.waitFor(() => expect(root.dataset.motionStatus).toBe("active"));
    expect(motionHarness.gsap.registerPlugin).toHaveBeenCalledTimes(1);
  });

  it("waits for a near scroll without IntersectionObserver and starts only once", async () => {
    document.body.innerHTML = `<section data-portfolio-motion><canvas data-hero-webgl></canvas></section>`;
    vi.stubGlobal("IntersectionObserver", undefined);
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    const root = document.querySelector<HTMLElement>("[data-portfolio-motion]")!;
    let top = window.innerHeight + 300;
    vi.spyOn(root, "getBoundingClientRect").mockImplementation(() => ({
      top,
      bottom: top + 100,
    } as DOMRect));

    setupPortfolioMotion();
    expect(root.dataset.motionStatus).toBe("loading");
    window.dispatchEvent(new Event("scroll"));
    expect(motionHarness.gsap.registerPlugin).not.toHaveBeenCalled();

    top = window.innerHeight + 150;
    window.dispatchEvent(new Event("scroll"));
    await vi.waitFor(() => expect(root.dataset.motionStatus).toBe("active"));
    window.dispatchEvent(new Event("resize"));
    expect(motionHarness.gsap.registerPlugin).toHaveBeenCalledTimes(1);
  });

  it("removes no-IntersectionObserver scroll and resize listeners on teardown and re-setup", async () => {
    document.body.innerHTML = `<section data-portfolio-motion><canvas data-hero-webgl></canvas></section>`;
    vi.stubGlobal("IntersectionObserver", undefined);
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    const root = document.querySelector<HTMLElement>("[data-portfolio-motion]")!;
    let top = window.innerHeight + 300;
    vi.spyOn(root, "getBoundingClientRect").mockImplementation(() => ({
      top,
      bottom: top + 100,
    } as DOMRect));
    const removeListener = vi.spyOn(window, "removeEventListener");

    setupPortfolioMotion();
    teardownPortfolioMotion();
    expect(removeListener).toHaveBeenCalledWith("scroll", expect.any(Function));
    expect(removeListener).toHaveBeenCalledWith("resize", expect.any(Function));
    top = window.innerHeight + 150;
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("resize"));
    expect(motionHarness.gsap.registerPlugin).not.toHaveBeenCalled();

    top = window.innerHeight + 300;
    setupPortfolioMotion();
    expect(root.dataset.motionStatus).toBe("loading");
    top = window.innerHeight + 150;
    window.dispatchEvent(new Event("resize"));
    await vi.waitFor(() => expect(root.dataset.motionStatus).toBe("active"));
    expect(motionHarness.gsap.registerPlugin).toHaveBeenCalledTimes(1);
    removeListener.mockRestore();
  });

  it("cancels deferred activation and resets only pending status on teardown and re-setup", () => {
    document.body.innerHTML = `
      <section data-portfolio-motion>
        <canvas data-hero-webgl></canvas>
      </section>
    `;
    const { observer } = installActivationObserver();
    const root = document.querySelector<HTMLElement>("[data-portfolio-motion]")!;
    setHeroOffscreen(root);

    setupPortfolioMotion();
    const canvas = root.querySelector<HTMLCanvasElement>("[data-hero-webgl]")!;
    expect(root.dataset.motionStatus).toBe("loading");
    expect(canvas.dataset.webglStatus).toBe("pending");

    teardownPortfolioMotion();
    root.dispatchEvent(new Event("pointerenter"));

    expect(observer.disconnect).toHaveBeenCalled();
    expect(motionHarness.gsap.registerPlugin).not.toHaveBeenCalled();
    expect(root.dataset.motionStatus).toBe("idle");
    expect(canvas.dataset.webglStatus).toBe("idle");

    setupPortfolioMotion();
    expect(root.dataset.motionStatus).toBe("loading");
    expect(canvas.dataset.webglStatus).toBe("pending");
    expect(observer.observe).toHaveBeenCalledTimes(2);
  });

  it("announces ownership on the root for every setup", () => {
    document.body.innerHTML = `
      <section data-portfolio-motion>
        <canvas data-hero-webgl></canvas>
      </section>
    `;
    installActivationObserver();
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    const root = document.querySelector<HTMLElement>("[data-portfolio-motion]")!;
    const onOwnership = vi.fn();
    root.addEventListener("portfolio-motion:claimed", onOwnership);

    setupPortfolioMotion();
    teardownPortfolioMotion();
    setupPortfolioMotion();

    expect(onOwnership).toHaveBeenCalledTimes(2);
    expect(onOwnership.mock.calls.every(([event]) => event.target === root)).toBe(true);
  });

  it("does nothing when the motion root is not present", () => {
    expect(() => setupPortfolioMotion()).not.toThrow();
  });

  it("settles to fallback when activated enhancement imports exceed the startup budget", () => {
    document.body.innerHTML = `
      <section data-portfolio-motion>
        <canvas data-hero-webgl></canvas>
      </section>
    `;
    const { triggerProximity } = installActivationObserver();
    const root = document.querySelector<HTMLElement>("[data-portfolio-motion]")!;
    setHeroOffscreen(root);
    vi.useFakeTimers();

    setupPortfolioMotion();
    triggerProximity();
    vi.advanceTimersByTime(4000);

    expect(
      document.querySelector<HTMLElement>("[data-portfolio-motion]")?.dataset
        .motionStatus,
    ).toBe("fallback");
    expect(
      document.querySelector<HTMLCanvasElement>("[data-hero-webgl]")?.dataset
        .webglStatus,
    ).toBe("fallback");

    vi.useRealTimers();
  });

  it("keeps the activation fallback terminal when imports resolve after the timeout", async () => {
    document.body.innerHTML = `
      <section data-portfolio-motion>
        <canvas data-hero-webgl></canvas>
      </section>
    `;
    installActivationObserver();
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    const root = document.querySelector<HTMLElement>("[data-portfolio-motion]")!;
    setHeroOffscreen(root);
    vi.useFakeTimers();

    setupPortfolioMotion();
    const canvas = root.querySelector<HTMLCanvasElement>("[data-hero-webgl]")!;
    root.dispatchEvent(new Event("pointerenter"));
    vi.advanceTimersByTime(4000);

    expect(root.dataset.motionStatus).toBe("fallback");
    expect(canvas.dataset.webglStatus).toBe("fallback");

    await vi.dynamicImportSettled();
    await Promise.resolve();
    await Promise.resolve();

    expect(root.dataset.motionStatus).toBe("fallback");
    expect(canvas.dataset.webglStatus).toBe("fallback");
    expect(motionHarness.gsap.registerPlugin).not.toHaveBeenCalled();
    expect(motionHarness.createHeroScene).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("falls back if imports resolve but the GSAP media callback never runs", async () => {
    document.body.innerHTML = `<section data-portfolio-motion><canvas data-hero-webgl></canvas></section>`;
    installActivationObserver();
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    const root = document.querySelector<HTMLElement>("[data-portfolio-motion]")!;
    const canvas = root.querySelector<HTMLCanvasElement>("[data-hero-webgl]")!;
    setHeroOffscreen(root);
    motionHarness.media.add.mockImplementation(() => undefined);
    vi.useFakeTimers();

    setupPortfolioMotion();
    root.dispatchEvent(new Event("pointerenter"));
    await vi.dynamicImportSettled();
    await Promise.resolve();
    await Promise.resolve();
    expect(motionHarness.media.add).toHaveBeenCalledTimes(1);
    expect(root.dataset.motionStatus).toBe("loading");
    expect(canvas.dataset.webglStatus).toBe("pending");

    vi.advanceTimersByTime(4000);
    expect(root.dataset.motionStatus).toBe("fallback");
    expect(canvas.dataset.webglStatus).toBe("fallback");

    const callback = motionHarness.media.add.mock.calls[0]?.[1] as (
      context: { conditions: typeof motionHarness.conditions },
    ) => void;
    callback({ conditions: motionHarness.conditions });
    expect(root.dataset.motionStatus).toBe("fallback");
    expect(canvas.dataset.webglStatus).toBe("fallback");
    expect(motionHarness.createHeroScene).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it.each(["active", "reduced"] as const)(
    "cancels the startup fallback once the media callback sets %s",
    async (status) => {
      document.body.innerHTML = `<section data-portfolio-motion><canvas data-hero-webgl></canvas></section>`;
      installActivationObserver();
      vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
      motionHarness.conditions.reduceMotion = status === "reduced";
      const root = document.querySelector<HTMLElement>("[data-portfolio-motion]")!;
      const canvas = root.querySelector<HTMLCanvasElement>("[data-hero-webgl]")!;
      setHeroOffscreen(root);
      vi.useFakeTimers();

      setupPortfolioMotion();
      root.dispatchEvent(new Event("pointerenter"));
      await vi.dynamicImportSettled();
      await Promise.resolve();
      await Promise.resolve();
      expect(motionHarness.media.add).toHaveBeenCalledTimes(1);
      expect(root.dataset.motionStatus).toBe(status);

      vi.advanceTimersByTime(4000);
      expect(root.dataset.motionStatus).toBe(status);
      expect(canvas.dataset.webglStatus).toBe(status === "reduced" ? "reduced" : "ready");
      vi.useRealTimers();
    },
  );

  it("loads the active motion layer and tears down GSAP, WebGL and scroll state", async () => {
    document.body.innerHTML = `
      <section data-portfolio-motion>
        <canvas data-hero-webgl></canvas>
      </section>
      <section id="projects">
        <div data-project-scroll-meter><span></span></div>
        <div data-projects-list>
          <article data-project-card></article>
        </div>
      </section>
    `;
    installActivationObserver();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: false })),
    });
    const root = document.querySelector<HTMLElement>("[data-portfolio-motion]")!;
    setHeroOffscreen(root);

    setupPortfolioMotion();
    const canvas =
      document.querySelector<HTMLCanvasElement>("[data-hero-webgl]")!;
    const grid = document.querySelector<HTMLElement>("[data-projects-list]")!;
    const meter = document.querySelector<HTMLElement>(
      "[data-project-scroll-meter] span",
    )!;
    expect(root.dataset.motionStatus).toBe("loading");
    expect(canvas.dataset.webglStatus).toBe("pending");

    root.dispatchEvent(new Event("pointerenter"));
    await vi.waitFor(() => expect(root.dataset.motionStatus).toBe("active"));

    expect(motionHarness.gsap.registerPlugin).toHaveBeenCalledWith(
      motionHarness.ScrollTrigger,
    );
    expect(motionHarness.createHeroScene).toHaveBeenCalledWith(canvas, root);
    expect(motionHarness.createPointerMotion).toHaveBeenCalledWith(
      motionHarness.gsap,
      root,
    );
    expect(motionHarness.gsap.fromTo).toHaveBeenCalledWith(
      [expect.any(HTMLElement)],
      expect.objectContaining({ "--motion-y": "1.2rem" }),
      expect.objectContaining({ "--motion-scale": 1 }),
    );

    const scrollOptions = motionHarness.ScrollTrigger.create.mock
      .calls[0]?.[0] as {
      onUpdate: (instance: { progress: number }) => void;
    };
    scrollOptions.onUpdate({ progress: 0.625 });
    expect(grid.style.getPropertyValue("--project-progress")).toBe("0.625");
    expect(meter.style.transform).toBe("scaleX(0.625)");

    teardownPortfolioMotion();

    expect(root.dataset.motionStatus).toBe("idle");
    expect(canvas.dataset.webglStatus).toBe("ready");
    expect(motionHarness.media.revert).toHaveBeenCalled();
    expect(motionHarness.timeline.scrollTrigger.kill).toHaveBeenCalled();
    expect(motionHarness.timeline.kill).toHaveBeenCalled();
    expect(motionHarness.sectionTrigger.kill).toHaveBeenCalled();
    expect(motionHarness.sceneCleanup).toHaveBeenCalled();
    expect(motionHarness.pointerCleanup).toHaveBeenCalled();
    expect(motionHarness.cardCleanup).toHaveBeenCalled();
    expect(grid.style.getPropertyValue("--project-progress")).toBe("");
    expect(meter.style.transform).toBe("scaleX(0)");
  });

  it("ignores a stale GSAP media callback after teardown", async () => {
    document.body.innerHTML = `
      <section data-portfolio-motion>
        <canvas data-hero-webgl></canvas>
      </section>
    `;
    installActivationObserver();
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    const root = document.querySelector<HTMLElement>("[data-portfolio-motion]")!;
    setHeroOffscreen(root);

    setupPortfolioMotion();
    const canvas = root.querySelector<HTMLCanvasElement>("[data-hero-webgl]")!;
    root.dispatchEvent(new Event("pointerenter"));
    await vi.waitFor(() => expect(root.dataset.motionStatus).toBe("active"));
    const callback = motionHarness.media.add.mock.calls[0]?.[1] as (
      context: { conditions: typeof motionHarness.conditions },
    ) => void;

    teardownPortfolioMotion();
    motionHarness.createHeroScene.mockClear();
    motionHarness.createPointerMotion.mockClear();
    callback({ conditions: motionHarness.conditions });

    expect(root.dataset.motionStatus).toBe("idle");
    expect(canvas.dataset.webglStatus).toBe("ready");
    expect(motionHarness.createHeroScene).not.toHaveBeenCalled();
    expect(motionHarness.createPointerMotion).not.toHaveBeenCalled();
  });

  it("marks the layer reduced and skips enhancements when reduced motion is active", async () => {
    document.body.innerHTML = `
      <section data-portfolio-motion>
        <canvas data-hero-webgl></canvas>
      </section>
    `;
    motionHarness.conditions.reduceMotion = true;
    motionHarness.conditions.finePointer = false;
    installActivationObserver();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: true })),
    });

    setupPortfolioMotion();
    document
      .querySelector<HTMLElement>("[data-portfolio-motion]")
      ?.dispatchEvent(new Event("pointerenter"));
    await vi.waitFor(() => {
      expect(
        document.querySelector<HTMLElement>("[data-portfolio-motion]")?.dataset
          .motionStatus,
      ).toBe("reduced");
    });

    expect(
      document.querySelector<HTMLCanvasElement>("[data-hero-webgl]")?.dataset
        .webglStatus,
    ).toBe("reduced");
    expect(motionHarness.gsap.registerPlugin).not.toHaveBeenCalled();
    expect(motionHarness.createHeroScene).not.toHaveBeenCalled();
    expect(motionHarness.createPointerMotion).not.toHaveBeenCalled();

    teardownPortfolioMotion();
    expect(
      document.querySelector<HTMLElement>("[data-portfolio-motion]")?.dataset
        .motionStatus,
    ).toBe("idle");
    expect(
      document.querySelector<HTMLCanvasElement>("[data-hero-webgl]")?.dataset
        .webglStatus,
    ).toBe("reduced");
  });

  it.each(["fallback", "disposed"])(
    "preserves a terminal %s canvas state on teardown",
    (status) => {
      document.body.innerHTML = `
        <section data-portfolio-motion>
          <canvas data-hero-webgl></canvas>
        </section>
      `;
      installActivationObserver();
      vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
      const root = document.querySelector<HTMLElement>("[data-portfolio-motion]")!;
      setHeroOffscreen(root);
      setupPortfolioMotion();
      const canvas = root.querySelector<HTMLCanvasElement>("[data-hero-webgl]")!;
      expect(canvas.dataset.webglStatus).toBe("pending");
      canvas.dataset.webglStatus = status;

      teardownPortfolioMotion();

      expect(root.dataset.motionStatus).toBe("idle");
      expect(canvas.dataset.webglStatus).toBe(status);
    },
  );
});
