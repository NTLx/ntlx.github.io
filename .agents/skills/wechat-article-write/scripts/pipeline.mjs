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
  process.stdout.write(`Build phase executor (default: one isolated context):
1. hosting-status
   deterministic action: step5-build --hosting-status
2. hosting if needed
   required skill: github-image-hosting; output: image-map.json
3. prepare
   deterministic action: step5-build --prepare-only
4. gzh-design
   required skill: gzh-design; output: article-wechat.html (including validator and preview)
5. finalize
   deterministic action: step5-build --finalize-only

Run these ordered units in one phase executor by default. Stop and return only on Gate failure.
`);
  process.exit(0);
}

if ([6, 6.1, 6.2].includes(step)) {
  const publish = getPublishState(slug);
  process.stdout.write(`Publish states: blog=${publish.blog}, wechat=${publish.wechat}\n`);
  process.stdout.write(`Publish phase executor (default: one isolated context):
1. blog publish if pending/failed
   deterministic action: publish-blog.mjs ${slug}; blog first
2. WeChat prepare
   deterministic action: publish-wechat.mjs ${slug} --prepare-only
3. WeChat publish
   required skill: baoyu-post-to-wechat
4. WeChat finalize
   deterministic action: publish-wechat.mjs ${slug} --finalize-only after child success

Run these ordered units in one phase executor by default. Stop and return only on Gate failure.
`);
  process.exit(0);
}

process.stdout.write(`Next: complete Step ${step} and rerun this advisory.\n`);
