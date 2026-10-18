import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const config = JSON.parse(await readFile("lighthouserc.json", "utf8"));
const workflow = await readFile(".github/workflows/lighthouse.yml", "utf8");
const readme = await readFile("README.md", "utf8");

const steps = workflow.split(/^      - name: /m).slice(1);
const step = (name: string) => steps.find((entry) => entry.startsWith(`${name}\n`));

describe("Lighthouse checks the checked-out static build", () => {
  it("serves locale, blog, and privacy routes from dist three times and keeps error-level assertions", () => {
    expect(config.ci.collect.staticDistDir).toBe("./dist");
    expect(config.ci.collect.url).toEqual([
      "http://localhost/",
      "http://localhost/en/",
      "http://localhost/blog/",
      "http://localhost/privacy/",
    ]);
    expect(config.ci.collect.numberOfRuns).toBe(3);
    expect(config.ci.collect.settings.skipAudits).toEqual(["robots-txt"]);
    expect(config.ci.assert.assertions).toEqual({
      "categories:performance": ["error", { minScore: 0.95 }],
      "categories:accessibility": ["error", { minScore: 0.95 }],
      "categories:best-practices": ["error", { minScore: 0.90 }],
      "categories:seo": ["error", { minScore: 0.90 }],
    });
    expect(config.ci.upload.target).toBe("temporary-public-storage");
  });

  it("builds the checkout before the blocking LHCI action on PR, main push, and manual runs", () => {
    expect(workflow).toMatch(/^on:\n  workflow_dispatch:\n  pull_request:\n    branches: \[main\]\n  push:\n    branches: \[main\]/m);
    expect(workflow).toMatch(/^permissions:\n  contents: read$/m);
    expect(steps.map((entry) => entry.split("\n", 1)[0])).toEqual([
      "Checkout repository",
      "Set up pnpm",
      "Set up Node",
      "Install dependencies",
      "Build site",
      "Run Lighthouse CI",
    ]);
    expect(step("Checkout repository")).toContain("uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1");
    expect(step("Set up pnpm")).toMatch(/uses: pnpm\/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 # v6\.1\.0\n        with:\n          version: 10\.30\.1/);
    expect(step("Set up Node")).toMatch(/uses: actions\/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7\.1\.0\n        with:\n          node-version: 22.23.3\n          cache: pnpm/);
    expect(step("Install dependencies")).toContain("run: pnpm install --frozen-lockfile");
    expect(step("Build site")).toContain("run: pnpm build");
    expect(step("Run Lighthouse CI")).toMatch(/continue-on-error: false\n        uses: treosh\/lighthouse-ci-action@3e7e23fb74242897f95c0ba9cabad3d0227b9b18 # 12\.6\.2/);
    expect(step("Run Lighthouse CI")).toContain("configPath: ./lighthouserc.json");
    expect(step("Run Lighthouse CI")).toContain("uploadArtifacts: true");
    expect(step("Run Lighthouse CI")).toContain("temporaryPublicStorage: true");
  });

  it("explains that failed thresholds fail the job, while merge protection is external", () => {
    const spanishEvidence = readme.split("## Quality evidence\n")[1]?.split("\n## ")[0];
    const englishCi = readme.split("## CI/CD\n")[1]?.split("\n## ")[0];
    expect(spanishEvidence).toMatch(/build.*checkout|checkout.*build/is);
    expect(spanishEvidence).toMatch(/umbrales.*fallar.*(job|workflow)|fallar.*(job|workflow).*umbrales/is);
    expect(spanishEvidence).toMatch(/protecci[oó]n de rama/is);
    expect(englishCi).toMatch(/Lighthouse audit:.*checked-out build.*thresholds.*fail the (job|workflow)/is);
    expect(englishCi).toMatch(/branch protection.*merge|merge.*branch protection/is);
    expect(englishCi).not.toMatch(/informational workflow|continue-on-error: true/i);
  });
});
