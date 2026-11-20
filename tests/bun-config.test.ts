import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

// Bun migration contract (replaces the pnpm build-script/CI policy tests).
// - The 14-day release cooldown moves to bunfig.toml; Bun reads seconds
//   (20160 pnpm minutes = 1209600 Bun seconds).
// - The three cooldown excludes are carried over verbatim.
// - trustedDependencies replaces pnpm's allowBuilds allowlist. Defining it
//   REPLACES Bun's built-in default list, so sharp must stay
//   listed or its postinstall stops running.
// - blockExoticSubdeps has no Bun equivalent: the registry-only resolution
//   check on bun.lock below is the executable replacement.
// - trustPolicy no-downgrade also has no Bun equivalent; dependabot's 7-day
//   npm cooldown plus the CI production audit are the remaining mitigations
//   (asserted in tests/supply-chain.test.ts).

const EXCLUDED = ["http-cache-semantics@4.3.0", "undici@8.12.2", "fast-uri@4.2.3"];

const OVERRIDES = {
  "fast-uri": ">=4.2.3",
  ajv: ">=8.18.0",
  yaml: ">=2.8.3",
  devalue: "5.9.3",
  vite: ">=8.2.4",
  picomatch: ">=4.0.4",
  "js-yaml": "4.3.2",
  nanoid: ">=3.3.18",
  postcss: ">=8.5.23",
  svgo: ">=4.1.0",
  "http-cache-semantics": ">=4.3.0",
  "smol-toml": ">=1.9.0",
  "source-map-js": ">=1.2.2",
  undici: ">=8.12.2",
  zod: ">=4.6.6",
} as const;

// bun.lock is JSONC (comments and trailing commas); this string-aware strip
// keeps `//` sequences that occur inside base64 integrity hashes.
function parseBunLock(raw: string): {
  packages: Record<string, unknown[]>;
} {
  let out = "";
  let inString = false;
  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    if (inString) {
      out += char;
      if (char === "\\") {
        out += raw[i + 1];
        i++;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
      out += char;
      continue;
    }
    if (char === "/" && raw[i + 1] === "/") {
      while (i < raw.length && raw[i] !== "\n") i++;
      continue;
    }
    if (char === ",") {
      let next = i + 1;
      while (next < raw.length && /\s/.test(raw[next])) next++;
      if (raw[next] === "}" || raw[next] === "]") continue;
    }
    out += char;
  }
  return JSON.parse(out);
}

describe("bun install policy", () => {
  it("keeps exactly the 14-day cooldown and its three excludes in bunfig.toml", async () => {
    const bunfig = await readFile("bunfig.toml", "utf8");

    expect(bunfig.trim()).toBe(
      [
        "[install]",
        "minimumReleaseAge = 1209600",
        `minimumReleaseAgeExcludes = [${EXCLUDED.map((name) => JSON.stringify(name)).join(", ")}]`,
      ].join("\n"),
    );
  });

  it("pins Bun, moves the 16 overrides verbatim to the top level, and trusts the three build packages", async () => {
    const manifest = JSON.parse(await readFile("package.json", "utf8")) as {
      packageManager: string;
      overrides: Record<string, string>;
      trustedDependencies: string[];
      pnpm?: Record<string, unknown>;
      engines: { node: string };
    };

    expect(manifest.packageManager).toBe("bun@1.4.4");
    expect(manifest.overrides).toEqual(OVERRIDES);
    expect(manifest.trustedDependencies).toEqual(["sharp"]);
    expect(manifest.pnpm).toBeUndefined();
    expect(manifest.engines.node).toBe(">=22.23.4");
  });

  it("runs the existing type check before the CI-only build without a second check", async () => {
    const [workflow, packageJson] = await Promise.all([
      readFile(".github/workflows/ci.yml", "utf8"),
      readFile("package.json", "utf8"),
    ]);
    const manifest = JSON.parse(packageJson) as { scripts: Record<string, string> };
    const commands = [...workflow.matchAll(/^\s+run:\s*(.+)$/gm)].map((match) => match[1]);
    const check = commands.indexOf("bunx astro check");
    const build = commands.indexOf("bun run build:ci");

    expect(check).toBeGreaterThanOrEqual(0);
    expect(build).toBeGreaterThan(check);
    expect(commands.filter((command) => command === "bunx astro check")).toHaveLength(1);
    expect(commands.filter((command) => command === "bun run build:ci")).toHaveLength(1);
    expect(commands).not.toContain("bun run build");
    expect(manifest.scripts["build:ci"]).not.toContain("astro check");
  });
});

describe("bun.lock registry-only resolutions (blockExoticSubdeps replacement)", () => {
  it("resolves every locked package from the registry with no git, file, link, or http target", async () => {
    const lock = parseBunLock(await readFile("bun.lock", "utf8"));
    const entries = Object.entries(lock.packages ?? {});

    expect(entries.length).toBeGreaterThan(500);
    for (const [, entry] of entries) {
      // entry[0] is the canonical "name@version" the entry resolves to; bun
      // may prefix the KEY with a parent path for nested duplicates, so the
      // protocol check must run on the value, not the key.
      const resolution = String(entry[0]);
      expect(resolution).toMatch(/@[\d][\w.+-]*$/);
      expect(resolution.startsWith("git+")).toBe(false);
      expect(resolution).not.toMatch(/^(github:|https?:|file:|link:|workspace:)/);
      const body = JSON.stringify(entry);
      expect(body).not.toContain("tarball:");
      expect(body).not.toMatch(/"(git\+|github:|file:|link:|workspace:)/);
    }
  });
});
