import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";

type Header = { key?: unknown; value?: unknown };
type HeaderRule = { source?: unknown; headers?: unknown };
type VercelConfig = { headers?: unknown };

export type ValidatedPolicy = {
  source: string;
  directives: Map<string, string[]>;
  scriptHashes: Set<string>;
};

const requiredHeaders = new Map([
  ["x-frame-options", "DENY"],
  ["x-content-type-options", "nosniff"],
  ["referrer-policy", "strict-origin-when-cross-origin"],
  [
    "permissions-policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=(), browsing-topics=()",
  ],
  ["strict-transport-security", "max-age=63072000; includeSubDomains; preload"],
  ["cross-origin-opener-policy", "same-origin"],
  ["cross-origin-resource-policy", "same-origin"],
]);

const fixedDirectives = new Map([
  ["default-src", ["'self'"]],
  ["script-src-attr", ["'none'"]],
  ["style-src", ["'self'", "'unsafe-inline'"]],
  ["img-src", ["'self'", "data:"]],
  ["font-src", ["'self'", "data:"]],
  [
    "connect-src",
    [
      "'self'",
      "https://vitals.vercel-insights.com",
      "https://va.vercel-scripts.com",
    ],
  ],
  ["worker-src", ["'self'"]],
  ["frame-ancestors", ["'none'"]],
  ["base-uri", ["'self'"]],
  ["form-action", ["'self'"]],
  ["object-src", ["'none'"]],
  ["manifest-src", ["'self'"]],
  ["upgrade-insecure-requests", []],
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sameTokens(actual: string[], expected: string[]): boolean {
  return (
    actual.length === expected.length &&
    [...actual]
      .sort()
      .every((token, index) => token === [...expected].sort()[index])
  );
}

function parseCsp(value: string): {
  directives: Map<string, string[]>;
  errors: string[];
} {
  const directives = new Map<string, string[]>();
  const errors: string[] = [];

  for (const part of value.split(";")) {
    const tokens = part.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) continue;
    const [name, ...sources] = tokens;
    const normalized = name.toLowerCase();
    if (directives.has(normalized)) {
      errors.push(`duplicate CSP directive: ${normalized}`);
    } else {
      directives.set(normalized, sources);
    }
  }

  return { directives, errors };
}

export function validateVercelConfig(input: unknown): {
  errors: string[];
  policy?: ValidatedPolicy;
} {
  const errors: string[] = [];
  const config = input as VercelConfig;
  const rules =
    isRecord(config) && Array.isArray(config.headers)
      ? (config.headers as HeaderRule[])
      : [];
  const globalRules = rules.filter(
    (rule) => isRecord(rule) && rule.source === "/(.*)",
  );

  if (globalRules.length !== 1) {
    return {
      errors: [
        `expected exactly one global /(.*) rule, found ${globalRules.length}`,
      ],
    };
  }

  const rawHeaders = globalRules[0].headers;
  if (!Array.isArray(rawHeaders))
    return { errors: ["global /(.*) rule must contain a headers array"] };

  const headers = new Map<string, string>();
  for (const rawHeader of rawHeaders as Header[]) {
    if (
      !isRecord(rawHeader) ||
      typeof rawHeader.key !== "string" ||
      typeof rawHeader.value !== "string" ||
      !rawHeader.value.trim()
    ) {
      errors.push("global header must have a non-empty key and value");
      continue;
    }
    const key = rawHeader.key.toLowerCase();
    if (headers.has(key)) errors.push(`duplicate header: ${key}`);
    else headers.set(key, rawHeader.value);
  }

  for (const [key, value] of requiredHeaders) {
    if (headers.get(key) !== value)
      errors.push(`required header ${key} must equal ${value}`);
  }

  const csp = headers.get("content-security-policy");
  if (!csp)
    return { errors: [...errors, "missing content-security-policy header"] };

  const parsed = parseCsp(csp);
  errors.push(...parsed.errors);
  for (const [directive, expected] of fixedDirectives) {
    const actual = parsed.directives.get(directive);
    if (!actual || !sameTokens(actual, expected)) {
      errors.push(
        `CSP directive ${directive} must contain exactly: ${expected.join(" ") || "no values"}`,
      );
    }
  }

  const scriptSources = parsed.directives.get("script-src");
  const scriptHashes = new Set<string>();
  if (scriptSources) {
    const fixedSources = ["'self'", "https://va.vercel-scripts.com"];
    for (const source of scriptSources) {
      const hash = source.match(/^'sha256-([A-Za-z0-9+/]{43}=)'$/);
      if (hash) scriptHashes.add(hash[1]);
      else if (!fixedSources.includes(source))
        errors.push(
          `CSP directive script-src contains unexpected source: ${source}`,
        );
    }
    if (
      !sameTokens(
        scriptSources.filter((source) => !source.startsWith("'sha256-")),
        fixedSources,
      )
    ) {
      errors.push(
        "CSP directive script-src must contain only the approved non-hash sources",
      );
    }
  } else {
    errors.push("CSP directive script-src is required");
  }

  return {
    errors,
    policy: { source: "/(.*)", directives: parsed.directives, scriptHashes },
  };
}

export function hashScript(content: string): string {
  return createHash("sha256").update(content).digest("base64");
}

function openingTagEnd(html: string, start: number): number {
  let quote: string | undefined;
  for (let index = start; index < html.length; index++) {
    const char = html[index];
    if (quote) {
      if (char === quote) quote = undefined;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === ">") {
      return index;
    }
  }
  return -1;
}

const javascriptMimeTypes = new Set([
  "application/ecmascript",
  "application/javascript",
  "application/x-ecmascript",
  "application/x-javascript",
  "text/ecmascript",
  "text/javascript",
  "text/javascript1.0",
  "text/javascript1.1",
  "text/javascript1.2",
  "text/javascript1.3",
  "text/javascript1.4",
  "text/javascript1.5",
  "text/jscript",
  "text/livescript",
  "text/x-ecmascript",
  "text/x-javascript",
]);

function isExecutableScriptType(type: string | undefined): boolean {
  if (type === undefined) return true;
  const normalized = type.trim().toLowerCase();
  return (
    normalized === "" ||
    normalized === "module" ||
    javascriptMimeTypes.has(normalized.split(";", 1)[0].trim())
  );
}

function scriptAttributes(attributes: string): {
  hasSrc: boolean;
  type: string | undefined;
} {
  let hasSrc = false;
  let type: string | undefined;
  let index = 0;
  while (index < attributes.length) {
    while (index < attributes.length && /[\s/]/.test(attributes[index])) index++;
    const start = index;
    while (index < attributes.length && !/[\s=/>]/.test(attributes[index])) index++;
    const name = attributes.slice(start, index).toLowerCase();
    if (!name) {
      index++;
      continue;
    }
    if (name === "src") hasSrc = true;

    while (index < attributes.length && /\s/.test(attributes[index])) index++;
    if (attributes[index] !== "=") {
      if (name === "type" && type === undefined) type = "";
      continue;
    }
    index++;
    while (index < attributes.length && /\s/.test(attributes[index])) index++;
    const quote = attributes[index];
    let value: string;
    if (quote === '"' || quote === "'") {
      index++;
      const valueStart = index;
      while (index < attributes.length && attributes[index] !== quote) index++;
      value = attributes.slice(valueStart, index);
      if (index < attributes.length) index++;
    } else {
      const valueStart = index;
      while (index < attributes.length && !/\s/.test(attributes[index])) index++;
      value = attributes.slice(valueStart, index);
    }
    if (name === "type" && type === undefined) type = value;
  }
  return { hasSrc, type };
}

export function extractExecutableScriptBodies(html: string): string[] {
  const bodies: string[] = [];
  const opening = /<script\b/gi;
  const closing = /<\/script>/gi;
  while (opening.exec(html)) {
    const end = openingTagEnd(html, opening.lastIndex);
    if (end < 0) break;
    closing.lastIndex = end + 1;
    const close = closing.exec(html);
    if (!close) break;
    const attributes = html.slice(opening.lastIndex, end);
    const { hasSrc, type } = scriptAttributes(attributes);
    if (!hasSrc && isExecutableScriptType(type))
      bodies.push(html.slice(end + 1, close.index));
    opening.lastIndex = closing.lastIndex;
  }
  return bodies;
}

export function compareCspHashParity(
  configured: Set<string>,
  htmlDocuments: string[],
) {
  const generated = new Set(
    htmlDocuments.flatMap(extractExecutableScriptBodies).map(hashScript),
  );
  return {
    generated: [...generated].sort(),
    missing: [...generated].filter((hash) => !configured.has(hash)).sort(),
    unused: [...configured].filter((hash) => !generated.has(hash)).sort(),
    executableScripts: htmlDocuments.flatMap(extractExecutableScriptBodies)
      .length,
  };
}

async function collectHtml(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? collectHtml(path)
        : entry.name.endsWith(".html")
          ? [path]
          : [];
    }),
  );
  return files.flat();
}

async function main(): Promise<void> {
  let config: unknown;
  let htmlFiles: string[];
  try {
    config = JSON.parse(await readFile("vercel.json", "utf8"));
    htmlFiles = await collectHtml("dist");
  } catch (error) {
    console.error(
      `CSP verification could not read configuration or dist/: ${(error as Error).message}`,
    );
    process.exitCode = 1;
    return;
  }
  if (htmlFiles.length === 0) {
    console.error("CSP verification found no HTML files in dist/");
    process.exitCode = 1;
    return;
  }

  const validation = validateVercelConfig(config);
  if (validation.errors.length > 0 || !validation.policy) {
    console.error("Security-header contract failed:");
    for (const error of validation.errors) console.error(`  ${error}`);
    process.exitCode = 1;
    return;
  }

  const parity = compareCspHashParity(
    validation.policy.scriptHashes,
    await Promise.all(htmlFiles.map((file) => readFile(file, "utf8"))),
  );
  if (parity.missing.length || parity.unused.length) {
    console.error("CSP exact hash parity failed:");
    for (const hash of parity.missing)
      console.error(`  missing authorization: 'sha256-${hash}'`);
    for (const hash of parity.unused)
      console.error(`  unused authorization: 'sha256-${hash}'`);
    process.exitCode = 1;
    return;
  }
  console.log(
    `CSP exact hash parity passed: ${htmlFiles.length} HTML files, ${parity.executableScripts} executable inline scripts, ${parity.generated.length} unique hashes.`,
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  void main();
