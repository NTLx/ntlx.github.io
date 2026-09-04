#!/usr/bin/env bun
/** State-aware advisory CLI. It never runs workflow steps or writes artifacts. */

import { getPublishState, nextStep } from "./state-lib.mjs";

const args = process.argv.slice(2);
if (args.includes("--help")) {
  process.stdout.write("usage: pipeline.mjs <date-slug>\n");
  process.exit(0);
}
if (args.length !== 1 || args[0].startsWith("--")) {
  process.stderr.write("usage: pipeline.mjs <date-slug>\n");
  process.exit(1);
}

const slug = args[0];
const step = nextStep(slug);
process.stdout.write(`current step: ${step}\n`);

if (step === "done") {
  process.stdout.write("Publish states: blog=done, wechat=done\n");
  process.exit(0);
}

if (step === 5) {
  process.stdout.write(`Next:
1. dispatch Hosting Worker → github-image-hosting → image-map.json
2. dispatch Build Prepare Worker → run step5-build.mjs ${slug} --prepare-only
3. dispatch WeChat Layout Worker → gzh-design → article-wechat.html (including its validator and preview)
4. dispatch Build Finalize Worker → run step5-build.mjs ${slug} --finalize-only
`);
  process.exit(0);
}

if ([6, 6.1, 6.2].includes(step)) {
  const publish = getPublishState(slug);
  process.stdout.write(`Publish states: blog=${publish.blog}, wechat=${publish.wechat}\n`);
  if (publish.blog === "pending" || publish.blog === "failed") process.stdout.write(`Next:
1. dispatch Blog Publish Worker → run publish-blog.mjs ${slug}
2. dispatch WeChat Publish Prepare Worker → run publish-wechat.mjs ${slug} --prepare-only
3. dispatch WeChat Publishing Worker → baoyu-post-to-wechat
4. Worker runs publish-wechat.mjs ${slug} --finalize-only after child success
`);
  else process.stdout.write(`Next:
1. dispatch WeChat Publish Prepare Worker → run publish-wechat.mjs ${slug} --prepare-only
2. dispatch WeChat Publishing Worker → baoyu-post-to-wechat
3. Worker runs publish-wechat.mjs ${slug} --finalize-only after child success
`);
  process.exit(0);
}

process.stdout.write(`Next: complete Step ${step} and rerun this advisory.\n`);
