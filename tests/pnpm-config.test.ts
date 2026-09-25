import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("pnpm build-script and CI policy", () => {
  it("keeps exactly the approved build packages in the canonical workspace setting", async () => {
    const workspace = await readFile("pnpm-workspace.yaml", "utf8");

    expect(workspace.trim()).toBe(
      [
        "allowBuilds:",
        "  '@tailwindcss/oxide': true",
        "  esbuild: true",
        "  sharp: true",
        "minimumReleaseAge: 20160",
        "blockExoticSubdeps: true",
        "trustPolicy: no-downgrade",
      ].join("\n"),
    );
  });

  it("removes obsolete allowlists without changing the peer-install setting", async () => {
    const [npmrc, workspace, packageJson] = await Promise.all([
      readFile(".npmrc", "utf8"),
      readFile("pnpm-workspace.yaml", "utf8"),
      readFile("package.json", "utf8"),
    ]);
    const manifest = JSON.parse(packageJson) as { pnpm?: Record<string, unknown> };

    expect(npmrc.trim()).toBe("auto-install-peers=false");
    expect(workspace).not.toMatch(/approveBuildsAllowlist|onlyBuiltDependencies|ignoredBuiltDependencies/);
    expect(manifest.pnpm).not.toHaveProperty("onlyBuiltDependencies");
    expect(manifest.pnpm).not.toHaveProperty("ignoredBuiltDependencies");
  });

  it("runs the existing type check before the CI-only build without a second check", async () => {
    const [workflow, packageJson] = await Promise.all([
      readFile(".github/workflows/ci.yml", "utf8"),
      readFile("package.json", "utf8"),
    ]);
    const manifest = JSON.parse(packageJson) as { scripts: Record<string, string> };
    const commands = [...workflow.matchAll(/^\s+run:\s*(.+)$/gm)].map((match) => match[1]);
    const check = commands.indexOf("pnpm astro check");
    const build = commands.indexOf("pnpm build:ci");

    expect(check).toBeGreaterThanOrEqual(0);
    expect(build).toBeGreaterThan(check);
    expect(commands.filter((command) => command === "pnpm astro check")).toHaveLength(1);
    expect(commands.filter((command) => command === "pnpm build:ci")).toHaveLength(1);
    expect(commands).not.toContain("pnpm build");
    expect(manifest.scripts["build:ci"]).not.toContain("astro check");
  });
});
