import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import {
  compareCspHashParity,
  extractExecutableScriptBodies,
  hashScript,
  validateVercelConfig,
} from "../scripts/verify-csp-hashes";

const requiredHeaders = [
  ["X-Frame-Options", "DENY"],
  ["X-Content-Type-Options", "nosniff"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  [
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=(), browsing-topics=()",
  ],
  ["Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload"],
  ["Cross-Origin-Opener-Policy", "same-origin"],
  ["Cross-Origin-Resource-Policy", "same-origin"],
] as const;

const csp =
  "default-src 'self'; script-src 'self' https://va.vercel-scripts.com 'sha256-YWJjZA=='; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com; worker-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; manifest-src 'self'; upgrade-insecure-requests";

function validConfig() {
  return {
    headers: [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          ...requiredHeaders.map(([key, value]) => ({ key, value })),
        ],
      },
    ],
  };
}

describe("Vercel security-header contract", () => {
  it("accepts the checked-in global rule and its fixed policy tokens", async () => {
    const config = JSON.parse(await readFile("vercel.json", "utf8")) as unknown;
    const result = validateVercelConfig(config);

    expect(result.errors).toEqual([]);
    expect(result.policy?.source).toBe("/(.*)");
    expect(result.policy?.directives.get("script-src-attr")).toEqual([
      "'none'",
    ]);
    expect(result.policy?.directives.get("script-src")).toContain(
      "https://va.vercel-scripts.com",
    );
    expect([...result.policy!.scriptHashes]).toHaveLength(11);
  });

  it.each([
    [
      "missing global rule",
      (config: ReturnType<typeof validConfig>) => {
        config.headers = [];
      },
      "global /(.*) rule",
    ],
    [
      "missing CSP",
      (config: ReturnType<typeof validConfig>) => {
        config.headers[0].headers.shift();
      },
      "content-security-policy",
    ],
    [
      "duplicate header",
      (config: ReturnType<typeof validConfig>) => {
        config.headers[0].headers.push({
          key: "X-Frame-Options",
          value: "DENY",
        });
      },
      "duplicate header: x-frame-options",
    ],
    [
      "incorrect required header",
      (config: ReturnType<typeof validConfig>) => {
        config.headers[0].headers[1].value = "SAMEORIGIN";
      },
      "x-frame-options",
    ],
    [
      "duplicate CSP directive",
      (config: ReturnType<typeof validConfig>) => {
        config.headers[0].headers[0].value += "; default-src 'self'";
      },
      "duplicate csp directive: default-src",
    ],
    [
      "missing CSP directive",
      (config: ReturnType<typeof validConfig>) => {
        config.headers[0].headers[0].value = csp.replace(
          "; frame-ancestors 'none'",
          "",
        );
      },
      "frame-ancestors",
    ],
    [
      "unexpected script source",
      (config: ReturnType<typeof validConfig>) => {
        config.headers[0].headers[0].value = csp.replace(
          "https://va.vercel-scripts.com",
          "https://unsafe.example",
        );
      },
      "script-src",
    ],
  ])(
    "rejects %s with an actionable diagnostic",
    (_name, mutate, diagnostic) => {
      const config = validConfig();
      mutate(config);

      expect(
        validateVercelConfig(config).errors.join("\n").toLowerCase(),
      ).toContain(diagnostic);
    },
  );
});

describe("executable inline script parity", () => {
  it("hashes classic and module bodies once while excluding external and JSON-LD scripts", () => {
    const html = `<script>classic()</script><script type="module">module()</script><script>classic()</script><script SRC="bundle.js"></script><script TYPE="APPLICATION/LD+JSON">{}</script>`;
    const bodies = extractExecutableScriptBodies(html);

    expect(bodies).toEqual(["classic()", "module()", "classic()"]);
    const parity = compareCspHashParity(
      new Set([hashScript("classic()"), hashScript("module()")]),
      [html],
    );
    expect(parity).toMatchObject({
      executableScripts: 3,
      missing: [],
      unused: [],
    });
    expect(parity.generated).toEqual(
      [hashScript("classic()"), hashScript("module()")].sort(),
    );
  });

  it("preserves raw whitespace and reports missing and unused hashes separately", () => {
    const raw = " alert('exact bytes') ";
    const changed = "alert('exact bytes')";
    const generatedHash = hashScript(raw);
    const unusedHash = hashScript("unused()");

    expect(generatedHash).not.toBe(hashScript(changed));
    const parity = compareCspHashParity(new Set([unusedHash]), [
      `<script>${raw}</script>`,
    ]);
    expect(parity.missing).toEqual([generatedHash]);
    expect(parity.unused).toEqual([unusedHash]);
  });
});
