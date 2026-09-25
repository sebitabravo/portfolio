import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const expectedUses = {
  ".github/workflows/ci.yml": [
    "actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2",
    "pnpm/action-setup@fe02b34f77f8bc703788d5817da081398fad5dd2 # v4.0.0",
    "actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4.4.0",
    "actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4.6.2",
  ],
  ".github/workflows/lighthouse.yml": [
    "actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2",
    "pnpm/action-setup@fe02b34f77f8bc703788d5817da081398fad5dd2 # v4.0.0",
    "actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4.4.0",
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
