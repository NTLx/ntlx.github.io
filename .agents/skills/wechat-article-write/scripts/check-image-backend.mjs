#!/usr/bin/env bun
/**
 * check-image-backend.mjs — raster backend policy preflight
 *
 * This is a verifier, not a repairer.  It checks the project configuration,
 * the high-level visual adapters used by the current prompt helper, the local
 * Codex CLI, and non-secret runtime tuning.  A missing Codex CLI is an error:
 * the article workflow has no paid-provider escape route.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot as configuredRepoRoot } from "./path-resolver.mjs";

const EXPECTED_PROVIDER = "codex-cli";
const EXPECTED_HIGH_LEVEL_BACKEND = "baoyu-image-gen";

export const HIGH_LEVEL_RASTER_SKILLS = [
  "baoyu-cover-image",
  "baoyu-article-illustrator",
  "baoyu-infographic",
];

function scalarValue(text, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`^\\s*${escaped}\\s*:\\s*([^#\\r\\n]*?)\\s*(?:#.*)?$`, "m"));
  if (!match) return null;
  const value = match[1].trim();
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}
function parseEnvFile(path) {
  if (!existsSync(path)) return {};
  const values = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (match) values[match[1]] = match[2].trim();
  }
  return values;
}

function parsePositiveInt(value) {
  if (value == null || value === "") return null;
  if (!/^\d+$/.test(String(value))) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function command(args) {
  return spawnSync("codex", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function checkProjectConfig(root, errors, details) {
  const imageGenConfigPath = resolve(root, ".baoyu-skills/baoyu-image-gen/EXTEND.md");
  details.image_gen_config = imageGenConfigPath;
  if (!existsSync(imageGenConfigPath)) {
    errors.push(`baoyu-image-gen config missing: ${imageGenConfigPath}`);
  } else {
    const text = readFileSync(imageGenConfigPath, "utf8");
    const provider = scalarValue(text, "default_provider");
    const legacy = scalarValue(text, "preferred_image_backend");
    const version = scalarValue(text, "version");
    details.default_provider = provider;
    details.schema_version = version;
    if (version !== "1") errors.push("baoyu-image-gen EXTEND.md must declare version: 1");
    if (provider !== EXPECTED_PROVIDER) {
      errors.push(`baoyu-image-gen default_provider must be ${EXPECTED_PROVIDER}`);
    }
    if (legacy !== null) {
      errors.push("baoyu-image-gen EXTEND.md still uses legacy preferred_image_backend; use default_provider");
    }
  }
}

function checkHighLevelConfigs(root, errors, details) {
  details.high_level = {};
  for (const skill of HIGH_LEVEL_RASTER_SKILLS) {
    const skillPath = resolve(root, ".agents/skills", skill, "SKILL.md");
    if (!existsSync(skillPath)) {
      details.high_level[skill] = { installed: false };
      continue;
    }

    const configPath = resolve(root, ".baoyu-skills", skill, "EXTEND.md");
    const item = { installed: true, config: configPath };
    details.high_level[skill] = item;
    if (!existsSync(configPath)) {
      errors.push(`${skill} config missing: ${configPath}`);
      continue;
    }

    const backend = scalarValue(readFileSync(configPath, "utf8"), "preferred_image_backend");
    item.preferred_image_backend = backend;
    if (backend !== EXPECTED_HIGH_LEVEL_BACKEND) {
      errors.push(`${skill} preferred_image_backend must be ${EXPECTED_HIGH_LEVEL_BACKEND}`);
    }
  }
}

function checkLocalRuntime(root, errors, warnings, details, checkEnv) {
  const envPath = resolve(root, ".baoyu-skills/.env");
  const fileEnv = parseEnvFile(envPath);
  const keys = Object.keys(fileEnv).sort();
  details.env = { path: envPath, present: existsSync(envPath), keys };
  if (!checkEnv) return;

  const effective = (key) => process.env[key] ?? fileEnv[key] ?? null;
  if (!existsSync(envPath)) warnings.push(`project env missing: ${envPath} (secrets are not required for this read-only preflight)`);

  const timeoutRaw = effective("BAOYU_CODEX_IMAGEGEN_TIMEOUT_MS");
  const timeout = parsePositiveInt(timeoutRaw);
  if (timeoutRaw == null) {
    warnings.push("BAOYU_CODEX_IMAGEGEN_TIMEOUT_MS is unset; recommend 1800000 for long-running Codex image generation");
  } else if (timeout === null) {
    errors.push("BAOYU_CODEX_IMAGEGEN_TIMEOUT_MS must be a positive integer");
  } else if (timeout < 1800000) {
    warnings.push("BAOYU_CODEX_IMAGEGEN_TIMEOUT_MS is below the recommended 1800000ms");
  }

  const concurrencyRaw = effective("BAOYU_IMAGE_GEN_CODEX_CLI_CONCURRENCY");
  const concurrency = parsePositiveInt(concurrencyRaw);
  if (concurrencyRaw == null) {
    warnings.push("BAOYU_IMAGE_GEN_CODEX_CLI_CONCURRENCY is unset; upstream default is 1, explicit 1 is recommended");
  } else if (concurrency === null) {
    errors.push("BAOYU_IMAGE_GEN_CODEX_CLI_CONCURRENCY must be a positive integer");
  } else if (concurrency !== 1) {
    errors.push("BAOYU_IMAGE_GEN_CODEX_CLI_CONCURRENCY must be 1 for this article workflow");
  }

  const intervalRaw = effective("BAOYU_IMAGE_GEN_CODEX_CLI_START_INTERVAL_MS");
  const interval = parsePositiveInt(intervalRaw);
  if (intervalRaw == null) {
    warnings.push("BAOYU_IMAGE_GEN_CODEX_CLI_START_INTERVAL_MS is unset; recommend 2000");
  } else if (interval === null) {
    errors.push("BAOYU_IMAGE_GEN_CODEX_CLI_START_INTERVAL_MS must be a positive integer");
  } else if (interval < 2000) {
    warnings.push("BAOYU_IMAGE_GEN_CODEX_CLI_START_INTERVAL_MS is below the recommended 2000ms");
  }

  const retriesRaw = effective("BAOYU_CODEX_IMAGEGEN_RETRIES");
  if (retriesRaw != null && !/^\d+$/.test(String(retriesRaw))) {
    errors.push("BAOYU_CODEX_IMAGEGEN_RETRIES must be a non-negative integer when set");
  }
}

function checkCodexCli(errors, warnings, details, checkCli) {
  if (!checkCli) return;
  const version = command(["--version"]);
  details.codex = { executable: !version.error && version.status === 0 };
  if (version.error || version.status !== 0) {
    errors.push("Codex CLI unavailable: codex --version failed; image stage is blocked");
    return;
  }

  const loginHelp = command(["login", "--help"]);
  const helpText = `${loginHelp.stdout ?? ""}\n${loginHelp.stderr ?? ""}`;
  if (loginHelp.status === 0 && /(^|\s)status(\s|$)/m.test(helpText)) {
    const login = command(["login", "status"]);
    details.codex.login_status_supported = true;
    details.codex.logged_in = !login.error && login.status === 0;
    if (login.error || login.status !== 0) errors.push("Codex CLI login status is not active; image stage is blocked");
  } else {
    details.codex.login_status_supported = false;
    warnings.push("Codex CLI login status command is not exposed; executable availability was verified only");
  }
}

export function runImageBackendChecks({
  root = configuredRepoRoot(),
  checkCli = true,
  checkEnv = true,
} = {}) {
  const errors = [];
  const warnings = [];
  const details = {};
  checkProjectConfig(root, errors, details);
  checkHighLevelConfigs(root, errors, details);
  checkLocalRuntime(root, errors, warnings, details, checkEnv);
  checkCodexCli(errors, warnings, details, checkCli);
  return { ok: errors.length === 0, errors, warnings, details };
}

function printHelp() {
  process.stdout.write(`check-image-backend.mjs — verify the article raster backend policy\n\nUsage:\n  bun run check-image-backend.mjs [--json]\n`);
}

if (import.meta.main) {
  if (process.argv.includes("--help")) {
    printHelp();
    process.exit(0);
  }
  const result = runImageBackendChecks();
  if (process.argv.includes("--json")) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } else {
    for (const warning of result.warnings) process.stderr.write(`check-image-backend: WARN - ${warning}\n`);
    for (const error of result.errors) process.stderr.write(`check-image-backend: FAIL - ${error}\n`);
    if (result.ok) process.stdout.write("check-image-backend: OK\n");
  }
  process.exit(result.ok ? 0 : 2);
}
