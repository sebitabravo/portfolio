import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const expectedUses = {
  ".github/workflows/ci.yml": [
    "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1",
    "pnpm/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 # v6.1.0",
    "actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0",
    "actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7.0.2",
  ],
  ".github/workflows/lighthouse.yml": [
    "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1",
    "pnpm/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 # v6.1.0",
    "actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0",
    "treosh/lighthouse-ci-action@3e7e23fb74242897f95c0ba9cabad3d0227b9b18 # 12.6.2",
  ],
} as const;

const usesLine = /^\s*uses:\s*(\S+)\s+#\s+(v?\d+\.\d+\.\d+)\s*$/;

describe("GitHub Actions immutable references", () => {
  it.each(Object.entries(expectedUses))("pins every action in %s", async (path, expected) => {
    const workflow = await readFile(path, "utf8");
    const uses = workflow.split("\n").filter((line) => /^\s*uses:/.test(line));

    expect(uses).toHaveLength(expected.length);
    for (const line of uses) {
      expect(line).toMatch(usesLine);
      expect(line.match(usesLine)?.[1]).toMatch(/^[\w.-]+\/[\w.-]+@[0-9a-f]{40}$/);
    }
    expect(uses.map((line) => line.trim().replace(/^uses:\s*/, ""))).toEqual(expected);
  });

  it("schedules weekly updates for GitHub Actions at the repository root", async () => {
    const config = await readFile(".github/dependabot.yml", "utf8");

    expect(config).toMatch(/^version:\s*2\s*$/m);
    expect(config).toMatch(
      /^[ \t]*-[ \t]*package-ecosystem:\s*["']?github-actions["']?\s*\n[ \t]*directory:\s*["']?\/["']?\s*\n[ \t]*schedule:\s*\n[ \t]*interval:\s*["']?weekly["']?/m,
    );
  });

  it("gates automated npm updates behind a 7-day cooldown", async () => {
    const config = await readFile(".github/dependabot.yml", "utf8");

    expect(config).toMatch(/package-ecosystem:\s*["']?npm["']?/);
    for (const key of [
      "default-days",
      "semver-major-days",
      "semver-minor-days",
      "semver-patch-days",
    ]) {
      expect(config).toMatch(new RegExp(`${key}:\\s*7\\b`));
    }
  });
});
