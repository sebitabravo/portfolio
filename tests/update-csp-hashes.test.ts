import { describe, expect, it } from "vitest"

import { rewriteCspScriptHashes, updateVercelConfigHashes } from "../scripts/update-csp-hashes"

const firstHash = "B1vNz4iq3O+wH+NBsWCb9KcP7eb+9/f2MjqMzCZnnyo="
const secondHash = "jlf68xrdMaU6q5HllZXouRL1JvGpzQhxPEQkGX9NUv0="
const thirdHash = "3H0jxKECRjR6QX8nx0irHeZIBvORHd/ZpJz9ufp4LmA="

const policy = [
  "default-src 'self'",
  `script-src 'self' 'sha256-${firstHash}' 'sha256-${secondHash}'`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
].join("; ")

function validConfig() {
  return {
    buildCommand: "pnpm build:ci",
    headers: [
      {
        source: "/_astro/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: policy },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ],
  }
}

describe("CSP hash regeneration", () => {
  it("replaces script hashes and keeps fixed sources and other directives intact", () => {
    const rewritten = rewriteCspScriptHashes(policy, [secondHash, thirdHash])

    expect(rewritten).toContain("default-src 'self'")
    expect(rewritten).toContain("script-src 'self'")
    expect(rewritten).toContain(`'sha256-${secondHash}'`)
    expect(rewritten).toContain(`'sha256-${thirdHash}'`)
    expect(rewritten).not.toContain(`'sha256-${firstHash}'`)
    expect(rewritten).toContain("script-src-attr 'none'")
    expect(rewritten).toContain("style-src 'self' 'unsafe-inline'")
    expect(rewritten.indexOf(`'sha256-${thirdHash}'`)).toBeLessThan(
      rewritten.indexOf(`'sha256-${secondHash}'`),
    )
  })

  it("rejects a policy without script-src", () => {
    expect(() => rewriteCspScriptHashes("default-src 'self'", [firstHash])).toThrow(
      "script-src",
    )
  })

  it("updates only the global CSP header without mutating the input", () => {
    const input = validConfig()
    const snapshot = structuredClone(input)
    const result = updateVercelConfigHashes(input, [thirdHash])
    const globalHeaders = (result.config as ReturnType<typeof validConfig>).headers[1].headers

    expect(input).toEqual(snapshot)
    expect(globalHeaders.find((header) => header.key === "Content-Security-Policy")?.value).toContain(
      `'sha256-${thirdHash}'`,
    )
    expect(globalHeaders.find((header) => header.key === "X-Frame-Options")?.value).toBe("DENY")
    expect((result.config as ReturnType<typeof validConfig>).headers[0]).toEqual(input.headers[0])
    expect(result.previousPolicy).toBe(policy)
    expect(result.nextPolicy).not.toBe(policy)
  })

  it("fails when the global rule or CSP header is missing", () => {
    expect(() => updateVercelConfigHashes({ headers: [] }, [firstHash])).toThrow("global")
    expect(() =>
      updateVercelConfigHashes(
        { headers: [{ source: "/(.*)", headers: [{ key: "X-Frame-Options", value: "DENY" }] }] },
        [firstHash],
      ),
    ).toThrow("content-security-policy")
  })
})
