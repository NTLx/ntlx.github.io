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
  process.stdout.write(`Next execution units:
1. hosting
   required skill: github-image-hosting
   output: image-map.json
2. build-prepare
   deterministic action: step5-build --prepare-only
3. wechat-layout
   required skill: gzh-design
   output: article-wechat.html (including its validator and preview)
4. build-finalize
   deterministic action: step5-build --finalize-only

Main chooses an available isolated execution mechanism for each unit.
`);
  process.exit(0);
}

if ([6, 6.1, 6.2].includes(step)) {
  const publish = getPublishState(slug);
  process.stdout.write(`Publish states: blog=${publish.blog}, wechat=${publish.wechat}\n`);
  if (publish.blog === "pending" || publish.blog === "failed") process.stdout.write(`Next execution units:
1. blog-publish
   deterministic action: publish-blog.mjs ${slug}
2. wechat-publish-prepare
   deterministic action: publish-wechat.mjs ${slug} --prepare-only
3. wechat-publish
   required skill: baoyu-post-to-wechat
4. wechat-publish-finalize
   deterministic action: publish-wechat.mjs ${slug} --finalize-only after child success

Main chooses an available isolated execution mechanism for each unit.
`);
  else process.stdout.write(`Next execution units:
1. wechat-publish-prepare
   deterministic action: publish-wechat.mjs ${slug} --prepare-only
2. wechat-publish
   required skill: baoyu-post-to-wechat
3. wechat-publish-finalize
   deterministic action: publish-wechat.mjs ${slug} --finalize-only after child success

Main chooses an available isolated execution mechanism for each unit.
`);
  process.exit(0);
}

process.stdout.write(`Next: complete Step ${step} and rerun this advisory.\n`);
