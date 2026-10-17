#!/usr/bin/env bun
/**
 * Step 6.1 deployment reconciliation.
 *
 * A successful git push is not a successful publication. This script binds the pushed article
 * commit to the GitHub Pages workflow, verifies the workflow conclusion, probes the canonical
 * article URL, and only then changes publish.blog from pending/blocked to done.
 *
 * Exit codes:
 *   0 deployed and URL reachable
 *   1 invalid arguments/state
 *   2 workflow still pending or --wait timeout
 *   3 workflow completed unsuccessfully
 *   4 GitHub Actions status could not be queried
 *   5 workflow succeeded but the canonical URL could not be verified
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { loadState, markBlogBlocked, markBlogDone } from "./state-lib.mjs";
import { postsRoot, repoRoot } from "./path-resolver.mjs";
import { parseFrontmatter } from "./frontmatter-lib.mjs";

function parseArgs(argv) {
  const opts = { slug: null, wait: false, timeoutSeconds: 300, pollSeconds: 5, commit: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help") {
      process.stdout.write(`reconcile-blog-deploy.mjs <date-slug> [--wait] [--timeout-seconds <n>] [--poll-seconds <n>] [--commit <sha>]\n`);
      process.exit(0);
    } else if (arg === "--wait") opts.wait = true;
    else if (arg === "--timeout-seconds") opts.timeoutSeconds = Number(argv[++i]);
    else if (arg === "--poll-seconds") opts.pollSeconds = Number(argv[++i]);
    else if (arg === "--commit") opts.commit = argv[++i];
    else if (arg.startsWith("--")) throw new Error(`unknown flag ${arg}`);
    else if (!opts.slug) opts.slug = arg;
    else throw new Error(`unexpected argument ${arg}`);
  }
  if (!opts.slug || !/^\d{4}-\d{2}-\d{2}-/.test(opts.slug)) throw new Error("missing or invalid <date-slug>");
  if (!Number.isFinite(opts.timeoutSeconds) || opts.timeoutSeconds <= 0) throw new Error("--timeout-seconds must be > 0");
  if (!Number.isFinite(opts.pollSeconds) || opts.pollSeconds <= 0) throw new Error("--poll-seconds must be > 0");
  return opts;
}

function queryWorkflow(commit) {
  const result = spawnSync("gh", [
    "run", "list",
    "--workflow", "deploy.yml",
    "--commit", commit,
    "--limit", "1",
    "--json", "databaseId,status,conclusion,headSha,url",
  ], {
    cwd: repoRoot(),
    encoding: "utf8",
    timeout: 20_000,
  });
  if (result.error) return { error: result.error.message };
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").trim();
    return { error: detail || `gh exited with ${result.status}` };
  }
  try {
    const runs = JSON.parse(result.stdout || "[]");
    return { run: Array.isArray(runs) ? runs[0] ?? null : null };
  } catch (error) {
    return { error: `invalid gh JSON: ${error.message}` };
  }
}

function canonicalSourceUrl(slug, state) {
  for (const value of [state?.source_url, state?.sourceUrl]) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  const articlePath = resolve(postsRoot(), slug, "article.md");
  if (!existsSync(articlePath)) return null;
  const fm = parseFrontmatter(readFileSync(articlePath, "utf8"));
  return fm?.sourceUrl?.trim?.() || null;
}

async function probeUrl(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
      headers: { "user-agent": "wechat-article-write-deploy-reconciler/1" },
    });
    return { ok: response.ok, status: response.status, finalUrl: response.url };
  } catch (error) {
    return { ok: false, status: null, finalUrl: null, error: error.message };
  }
}

function blogResult(state, patch) {
  return {
    ...(state?.publish_result?.blog ?? {}),
    ...patch,
  };
}

function block(slug, state, patch, message, exitCode) {
  markBlogBlocked(slug, {
    commit: patch.deployed_commit ?? state.commit ?? null,
    pushed: state.pushed ?? true,
    publish_result: { blog: blogResult(state, patch) },
  });
  process.stderr.write(`reconcile-blog-deploy: ${message}\n`);
  process.exit(exitCode);
}

let opts;
try {
  opts = parseArgs(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`reconcile-blog-deploy: ${error.message}\n`);
  process.exit(1);
}

const state = loadState(opts.slug);
if (!state) {
  process.stderr.write(`reconcile-blog-deploy: no pipeline state for ${opts.slug}\n`);
  process.exit(1);
}
if (state.last_complete_step < 6) {
  process.stderr.write("reconcile-blog-deploy: blog publish has not reached Step 6\n");
  process.exit(1);
}

const commit = opts.commit || state.commit || state.publish_result?.blog?.commit || null;
if (!commit) {
  process.stderr.write("reconcile-blog-deploy: pushed commit is missing from pipeline state; use --commit only for verified recovery\n");
  process.exit(1);
}
const sourceUrl = canonicalSourceUrl(opts.slug, state);
if (!sourceUrl) {
  process.stderr.write("reconcile-blog-deploy: canonical sourceUrl is missing\n");
  process.exit(1);
}

if (!opts.commit && state.publish_result?.blog?.remote_pushed !== true && state.pushed !== true) {
  process.stderr.write("reconcile-blog-deploy: state does not prove the article commit was pushed\n");
  process.exit(1);
}

if (state.publish.blog === "done" && state.publish_result?.blog?.site_deployed === true
    && state.publish_result?.blog?.deployed_commit === commit) {
  process.stdout.write(JSON.stringify({ slug: opts.slug, commit, site_deployed: true, already_reconciled: true, source_url: sourceUrl }) + "\n");
  process.exit(0);
}

const deadline = Date.now() + opts.timeoutSeconds * 1000;
let lastRun = null;
while (true) {
  const queried = queryWorkflow(commit);
  if (queried.error) {
    block(opts.slug, state, {
      site_deployed: null,
      deployed_commit: commit,
      deploy_check: "gh-query-failed",
      deploy_checked_at: new Date().toISOString(),
    }, `cannot query GitHub Pages workflow: ${queried.error}`, 4);
  }

  lastRun = queried.run;
  const pending = !lastRun || lastRun.status !== "completed";
  if (pending) {
    if (opts.wait && Date.now() < deadline) {
      await Bun.sleep(opts.pollSeconds * 1000);
      continue;
    }
    const patch = {
      site_deployed: null,
      deployed_commit: commit,
      deploy_check: lastRun ? "workflow-pending" : "workflow-not-found",
      deploy_checked_at: new Date().toISOString(),
      ...(lastRun ? { workflow_run_id: lastRun.databaseId, workflow_url: lastRun.url, workflow_status: lastRun.status } : {}),
    };
    if (opts.wait) {
      block(opts.slug, state, patch, "deployment verification timed out; blog remains resumable", 2);
    }
    process.stdout.write(JSON.stringify({ slug: opts.slug, commit, site_deployed: null, pending: true, ...patch }) + "\n");
    process.exit(2);
  }

  if (lastRun.headSha && lastRun.headSha !== commit) {
    block(opts.slug, state, {
      site_deployed: null,
      deployed_commit: commit,
      deploy_check: "workflow-commit-mismatch",
      deploy_checked_at: new Date().toISOString(),
      workflow_run_id: lastRun.databaseId,
      workflow_url: lastRun.url,
      workflow_status: lastRun.status,
      workflow_conclusion: lastRun.conclusion,
    }, `workflow head ${lastRun.headSha} does not match expected commit ${commit}`, 4);
  }

  if (lastRun.conclusion !== "success") {
    block(opts.slug, state, {
      site_deployed: false,
      deployed_commit: commit,
      deploy_check: "workflow-failed",
      deploy_checked_at: new Date().toISOString(),
      workflow_run_id: lastRun.databaseId,
      workflow_url: lastRun.url,
      workflow_status: lastRun.status,
      workflow_conclusion: lastRun.conclusion,
    }, `Pages workflow concluded ${lastRun.conclusion || "unknown"}`, 3);
  }

  const probe = await probeUrl(sourceUrl);
  if (!probe.ok) {
    if (opts.wait && Date.now() < deadline) {
      await Bun.sleep(opts.pollSeconds * 1000);
      continue;
    }
    block(opts.slug, state, {
      site_deployed: null,
      deployed_commit: commit,
      deploy_check: "url-unreachable",
      deploy_checked_at: new Date().toISOString(),
      workflow_run_id: lastRun.databaseId,
      workflow_url: lastRun.url,
      workflow_status: lastRun.status,
      workflow_conclusion: lastRun.conclusion,
      site_url: sourceUrl,
      site_http_status: probe.status,
      ...(probe.error ? { site_probe_error: probe.error } : {}),
    }, `workflow succeeded but ${sourceUrl} is not reachable${probe.status ? ` (HTTP ${probe.status})` : ""}`, 5);
  }

  const checkedAt = new Date().toISOString();
  const result = blogResult(state, {
    site_deployed: true,
    deployed_commit: commit,
    deploy_check: "verified",
    deploy_checked_at: checkedAt,
    workflow_run_id: lastRun.databaseId,
    workflow_url: lastRun.url,
    workflow_status: lastRun.status,
    workflow_conclusion: lastRun.conclusion,
    site_url: sourceUrl,
    site_http_status: probe.status,
    site_final_url: probe.finalUrl,
  });
  markBlogDone(opts.slug, {
    extra: {
      commit,
      pushed: true,
      publish_result: { blog: result },
    },
  });
  process.stdout.write(JSON.stringify({
    slug: opts.slug,
    commit,
    site_deployed: true,
    workflow_run_id: lastRun.databaseId,
    workflow_url: lastRun.url,
    source_url: sourceUrl,
    http_status: probe.status,
    checked_at: checkedAt,
  }) + "\n");
  process.exit(0);
}
