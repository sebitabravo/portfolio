import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

// P9 supply-chain hardening (npm-security skill: cooldown, lockfile
// integrity, deterministic installs). Rationale for the pnpm settings lives
// here next to the contract:
// - minimumReleaseAge 20160 (14d) delays brand-new releases (LiteLLM/Telnyx
//   <3h window) without touching frozen pins.
// - blockExoticSubdeps rejects git:/tarball: subdeps that bypass the
//   registry and security scanning.
// - trustPolicy no-downgrade flags a package that drops OIDC/provenance
//   publishing (takeover signal). Kept because `pnpm install
//   --frozen-lockfile` still resolves cleanly (verified in P9 evidence).
// - No lockfile-lint dependency: the integrity contract below is the
//   zero-dependency equivalent (registry-only https resolutions, every pin
//   carrying an integrity hash), enforced with the frozen-lockfile installs
//   already used in CI.

const EXACT_NODE = "22.23.3";

describe("exact Node pin alignment", () => {
  it("pins .nvmrc, engines, and both workflows to the same exact Node version", async () => {
    const [nvmrc, packageJson, ci, lighthouse] = await Promise.all([
      readFile(".nvmrc", "utf8"),
      readFile("package.json", "utf8"),
      readFile(".github/workflows/ci.yml", "utf8"),
      readFile(".github/workflows/lighthouse.yml", "utf8"),
    ]);

    expect(nvmrc.trim()).toBe(EXACT_NODE);
    expect(
      (JSON.parse(packageJson) as { engines: { node: string } }).engines.node,
    ).toBe(EXACT_NODE);
    for (const workflow of [ci, lighthouse]) {
      expect(workflow).toContain(`node-version: ${EXACT_NODE}`);
      expect(workflow).not.toMatch(/node-version: 22\n/);
    }
  });
});

describe("dependabot supply-chain coverage", () => {
  it("keeps weekly github-actions updates and adds npm with a 7-day cooldown", async () => {
    const config = await readFile(".github/dependabot.yml", "utf8");

    expect(config).toMatch(/^version:\s*2\s*$/m);
    expect(config).toMatch(/package-ecosystem:\s*["']?github-actions["']?/);
    expect(config).toMatch(/package-ecosystem:\s*["']?npm["']?/);
    expect(config).toMatch(/default-days:\s*7/);
    expect(config).toMatch(/semver-major-days:\s*7/);
    expect(config).toMatch(/semver-minor-days:\s*7/);
    expect(config).toMatch(/semver-patch-days:\s*7/);
  });
});

describe("pnpm workspace hardening", () => {
  it("keeps the approved build allowlist and enforces release-age, exotic, and trust policy", async () => {
    const workspace = await readFile("pnpm-workspace.yaml", "utf8");

    expect(workspace).toContain("'@tailwindcss/oxide': true");
    expect(workspace).toContain("esbuild: true");
    expect(workspace).toContain("sharp: true");
    expect(workspace).toMatch(/^minimumReleaseAge:\s*20160$/m);
    expect(workspace).toMatch(/^blockExoticSubdeps:\s*true$/m);
    expect(workspace).toMatch(/^trustPolicy:\s*no-downgrade$/m);
  });
});

describe("lockfile integrity without new dependencies", () => {
  it("declares no git, tarball, or file dependencies", async () => {
    const manifest = JSON.parse(await readFile("package.json", "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const specs = [
      ...Object.values(manifest.dependencies ?? {}),
      ...Object.values(manifest.devDependencies ?? {}),
    ];

    expect(specs.length).toBeGreaterThan(0);
    for (const spec of specs) {
      expect(spec).not.toMatch(/^(git\+|github:|https?:|file:)/);
    }
  });

  it("resolves every locked package from the registry with an integrity hash", async () => {
    const lockfile = await readFile("pnpm-lock.yaml", "utf8");
    const inlineResolutions = [...lockfile.matchAll(/^ +resolution: (\{.*\})$/gm)].map(
      (match) => match[1],
    );

    expect(inlineResolutions.length).toBeGreaterThan(500);
    for (const body of inlineResolutions) {
      expect(body).toContain("integrity:");
      expect(body).not.toContain("tarball:");
    }
    expect(lockfile).not.toMatch(/resolution:[^\n]*git\+/);
  });
});
