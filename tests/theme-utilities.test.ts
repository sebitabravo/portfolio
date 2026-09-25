import { globSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Every design token is a named theme utility via `@theme inline`; a var() inside brackets bypasses it.
const ARBITRARY_VAR_CLASS = /[\w:/-]+-\[[^\]\s]*var\([^\]]*\][^\s"'`]*/g;

const files = globSync("src/**/*.{astro,mdx,ts}");

function stripStyleBlocks(source: string): string {
  return source.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
}

describe("theme utility contract", () => {
  it("never places var() inside a Tailwind arbitrary-value class name", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const source = stripStyleBlocks(readFileSync(file, "utf8"));
      const lines = source.split("\n");
      lines.forEach((line, index) => {
        const matches = line.match(ARBITRARY_VAR_CLASS);
        if (matches) {
          for (const match of matches) {
            offenders.push(`${file}:${index + 1}: ${match}`);
          }
        }
      });
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });
});
