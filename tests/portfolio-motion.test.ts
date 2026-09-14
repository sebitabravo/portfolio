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

    setupPortfolioMotion();

    const root = document.querySelector<HTMLElement>(
      "[data-portfolio-motion]",
    )!;
    const canvas =
      document.querySelector<HTMLCanvasElement>("[data-hero-webgl]")!;
    expect(root.dataset.motionStatus).toBe("loading");
    expect(canvas.dataset.webglStatus).toBe("pending");
    expect(requestIdleCallback).not.toHaveBeenCalled();
    expect(observer.observe).toHaveBeenCalledWith(root);
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

    setupPortfolioMotion();

    const root = document.querySelector<HTMLElement>(
      "[data-portfolio-motion]",
    )!;
    expect(IntersectionObserverMock).toHaveBeenCalledWith(
      expect.any(Function),
      { rootMargin: "200px" },
    );
    triggerProximity();
    await vi.waitFor(() => expect(root.dataset.motionStatus).toBe("active"));

    teardownPortfolioMotion();

    expect(observer.disconnect).toHaveBeenCalled();
  });

  it("cancels deferred activation on teardown", () => {
    document.body.innerHTML = `
      <section data-portfolio-motion>
        <canvas data-hero-webgl></canvas>
      </section>
    `;
    const { observer } = installActivationObserver();

    setupPortfolioMotion();
    const root = document.querySelector<HTMLElement>(
      "[data-portfolio-motion]",
    )!;
    teardownPortfolioMotion();
    root.dispatchEvent(new Event("pointerenter"));

    expect(observer.disconnect).toHaveBeenCalled();
    expect(motionHarness.gsap.registerPlugin).not.toHaveBeenCalled();
    expect(root.dataset.motionStatus).toBe("loading");
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

    setupPortfolioMotion();
    const root = document.querySelector<HTMLElement>(
      "[data-portfolio-motion]",
    )!;
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
  });
});
