/**
 * Content Warfare Pipeline — Daily Orchestrator
 *
 * Runs the full daily pipeline:
 * 1. Spy Scout → trending topics
 * 2. Script Writer → 3 scripts per niche
 * 3. Video Dispatcher → submit to KC/Sophia
 *
 * Usage: npx tsx src/pipeline.ts
 */

import { runDailySpy, getTodayNiches } from './agents/spy-scout.js';
import { generateScripts } from './agents/script-writer.js';
import { dispatchAll } from './agents/video-dispatch.js';
import type { VideoScript, VideoJob, SpyResult } from './types.js';
import niches from './config/niches.json' assert { type: 'json' };
import type { Niche } from './types.js';

async function runPipeline() {
  const startTime = Date.now();
  console.log('═══════════════════════════════════════════════════');
  console.log('  🐝 CONTENT WARFARE ENGINE — Daily Pipeline');
  console.log(`  📅 ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}`);
  console.log('═══════════════════════════════════════════════════\n');

  // Step 1: Spy
  console.log('━━━ STEP 1: SPY SCOUT ━━━');
  const spyResults = await runDailySpy();

  // Step 2: Generate Scripts
  console.log('\n━━━ STEP 2: SCRIPT WRITER ━━━');
  const allScripts: VideoScript[] = [];
  const todayNiches = getTodayNiches();
  const config = niches as { niches: Niche[] };

  for (const spy of spyResults) {
    const niche = config.niches.find((n: Niche) => n.id === spy.niche_id);
    if (!niche) continue;

    const useLLM = !!process.env.LLM_API_KEY;
    const scripts = await generateScripts(spy, niche, useLLM);
    allScripts.push(...scripts);
  }

  // Step 3: Dispatch to Video Production
  console.log('\n━━━ STEP 3: VIDEO DISPATCH ━━━');
  const jobs = await dispatchAll(allScripts);

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  📊 DAILY PIPELINE REPORT');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Niches scanned:    ${spyResults.length}`);
  console.log(`  Scripts generated: ${allScripts.length}`);
  console.log(`  Video jobs:        ${jobs.length}`);
  console.log(`  Time elapsed:      ${elapsed}s`);
  console.log('');
  console.log('  📋 Next steps:');
  console.log('  1. Check KingContent "Đang Chờ" tab for video status');
  console.log('  2. Download completed videos from "Hoàn Tất" tab');
  console.log('  3. Schedule posts via KingContent auto-post');
  console.log('  4. Monitor funnel analytics for lead conversion');
  console.log('═══════════════════════════════════════════════════\n');

  return { spyResults, scripts: allScripts, jobs };
}

// Run
runPipeline().catch(console.error);
