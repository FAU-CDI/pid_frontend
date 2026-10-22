#!/usr/bin/env node
/**
 * Generate TypeScript types from an external OpenAPI spec.
 *
 * Usage:
 *   npm run generate:api -- /path/to/openapi.yaml
 *
 * The OpenAPI spec must NOT live in this repository. Pass an absolute or
 * relative path to a local copy of the QuickPID OpenAPI document.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const usage = "Usage: npm run generate:api -- <path-to-openapi.yaml>";

const specArg = process.argv[2];
if (!specArg) {
  console.error(usage);
  process.exit(1);
}

const specPath = resolve(specArg);
if (!existsSync(specPath)) {
  console.error(`OpenAPI spec not found: ${specPath}`);
  console.error(usage);
  process.exit(1);
}

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outPath = resolve(root, "lib/backend/schema.d.ts");

const result = spawnSync(
  "npx",
  ["openapi-typescript", specPath, "-o", outPath],
  { stdio: "inherit", cwd: root, shell: process.platform === "win32" }
);

process.exit(result.status ?? 1);
