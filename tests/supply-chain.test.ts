import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

// Supply-chain hardening (cooldown, lockfile integrity, deterministic
// installs), now enforced through Bun instead of pnpm:
// - The 14-day release cooldown lives in bunfig.toml as
//   minimumReleaseAge = 1209600 (seconds) with the same three excludes.
// - blockExoticSubdeps has no Bun equivalent: the registry-only resolution
//   contract on bun.lock (tests/bun-config.test.ts) is the replacement.
// - trustPolicy no-downgrade has no Bun equivalent either: dependabot's
//   7-day npm cooldown below plus the CI `bun audit --prod` step are the
//   remaining mitigations for a provenance/publishing downgrade signal.
// - No lockfile-lint dependency: the integrity contract below is the
//   zero-dependency equivalent (registry-only https resolutions, every pin
//   carrying an integrity hash), enforced with `bun ci` (frozen lockfile)
//   already used in CI.

const NODE_PIN = "24.22.3";
const NODE_FLOOR = ">=22.23.4";

describe("exact Node pin alignment", () => {
  it("pins .nvmrc and both workflows to the same exact Node version and keeps the Astro floor in engines", async () => {
    const [nvmrc, packageJson, ci, lighthouse] = await Promise.all([
      readFile(".nvmrc", "utf8"),
      readFile("package.json", "utf8"),
      readFile(".github/workflows/ci.yml", "utf8"),
      readFile(".github/workflows/lighthouse.yml", "utf8"),
    ]);

    expect(nvmrc.trim()).toBe(NODE_PIN);
    expect(
      (JSON.parse(packageJson) as { engines: { node: string } }).engines.node,
    ).toBe(NODE_FLOOR);
    for (const workflow of [ci, lighthouse]) {
      expect(workflow).toContain(`node-version: ${NODE_PIN}`);
      expect(workflow).not.toMatch(/node-version: 22\n/);
      // The package manager switched to Bun; pnpm must not reappear.
      expect(workflow).not.toContain("pnpm");
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

describe("bun install hardening", () => {
  it("keeps the release cooldown, its excludes, and the approved build allowlist", async () => {
    const [bunfig, packageJson] = await Promise.all([
      readFile("bunfig.toml", "utf8"),
      readFile("package.json", "utf8"),
    ]);
    const manifest = JSON.parse(packageJson) as { trustedDependencies: string[] };

    expect(bunfig).toMatch(/^minimumReleaseAge = 1209600$/m);
    expect(bunfig).toContain("http-cache-semantics@4.3.0");
    expect(bunfig).toContain("undici@8.12.2");
    expect(bunfig).toContain("fast-uri@4.2.3");
    // Defining trustedDependencies replaces Bun's default list; sharp must
    // stay or its postinstall stops running.
    expect(manifest.trustedDependencies).toEqual(["sharp"]);
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
    const lockfile = await readFile("bun.lock", "utf8");
    const inlineResolutions = [...lockfile.matchAll(/"(sha512-[A-Za-z0-9+/=]+)"/g)].map(
      (match) => match[1],
    );

    expect(inlineResolutions.length).toBeGreaterThan(500);
    for (const hash of inlineResolutions) {
      expect(hash).toMatch(/^sha512-[A-Za-z0-9+/=]+$/);
    }
    expect(lockfile).not.toMatch(/"(git\+|github:|file:|link:|workspace:)[^"]*"/);
  });
});
