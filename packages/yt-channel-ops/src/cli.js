#!/usr/bin/env node
/**
 * yt-channel-ops CLI — approve uploads and inspect learnings.
 *
 *   node src/cli.js approve <videoId> "<who + why, ≥10 chars>"
 *   node src/cli.js verify <token> <videoId>     (dry-run, no consume)
 *   node src/cli.js recommendations [status]
 *   node src/cli.js decide <id> approved|rejected "<note>"
 */
const path = require('path');
const { PublishGate } = require('./publish-gate');
const { LearningEngine } = require('./learning/engine');

function resolveDataDir() {
  return process.env.YT_CHANNEL_OPS_DATA || path.join(process.cwd(), 'data', 'channel-ops');
}

function main(argv) {
  const [cmd, ...args] = argv;
  const dataDir = resolveDataDir();
  const gate = new PublishGate(path.join(dataDir, 'publish-tokens.json'));

  switch (cmd) {
    case 'approve': {
      const [videoId, ...noteParts] = args;
      const token = gate.approve(videoId, noteParts.join(' '));
      console.log(JSON.stringify({ ok: true, videoId, token }, null, 2));
      console.log(`Pass to uploader: --approve ${token}`);
      break;
    }
    case 'verify': {
      const [token, videoId] = args;
      const valid = gate.check(token, videoId);
      console.log(JSON.stringify({ ok: valid }));
      process.exitCode = valid ? 0 : 1;
      break;
    }
    case 'recommendations': {
      const engine = new LearningEngine(path.join(dataDir, 'learning.db'));
      const recs = engine.store.listRecommendations(args[0] || null);
      console.log(JSON.stringify(recs, null, 2));
      engine.close();
      break;
    }
    case 'decide': {
      const [id, status, ...noteParts] = args;
      const engine = new LearningEngine(path.join(dataDir, 'learning.db'));
      const rec = engine.decide(id, status, noteParts.join(' '));
      console.log(JSON.stringify(rec, null, 2));
      engine.close();
      break;
    }
    default:
      console.error('Usage: cli.js <approve|verify|recommendations|decide> ...');
      process.exitCode = 1;
  }
}

if (require.main === module) main(process.argv.slice(2));

module.exports = { main, resolveDataDir };
