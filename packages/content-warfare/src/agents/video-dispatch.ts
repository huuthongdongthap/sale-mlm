/**
 * Video Dispatcher Agent
 * Takes approved scripts → submits video generation jobs
 * to KingContent Video AI (Veo3) or Sophia AI Factory.
 *
 * Phase 1 (MVP): Outputs KC-ready scripts for manual submission
 * Phase 2: Browser automation via Mekong CLI
 * Phase 3: Direct API integration
 */

import type { VideoScript, VideoJob } from '../types.js';
import schedule from '../config/schedule.json' assert { type: 'json' };

/**
 * Prepare script text for KingContent Video AI.
 * KC requires plain text without special chars for voice-over.
 */
function prepareForKC(script: VideoScript): string {
  const fullText = [script.hook, script.body, script.cta].join('. ');
  // KC Voice AI works best with plain Vietnamese (no diacritics needed,
  // KC handles TTS internally)
  return fullText;
}

/**
 * Submit video job to KingContent Video AI (Veo3).
 *
 * MVP: Returns job instructions for manual execution.
 * Future: Browser automation or API call.
 */
export async function submitToKingContent(script: VideoScript): Promise<VideoJob> {
  const kcText = prepareForKC(script);
  const { kingcontent: kc } = schedule;

  console.log(`\n🎬 [Video Dispatch] Submitting to KingContent Veo3...`);
  console.log(`   Account: ${kc.account} (${kc.plan})`);
  console.log(`   Style: ${kc.video_style}, Frame: ${kc.frame}`);
  console.log(`   Script (${script.duration_seconds}s): "${script.title}"`);
  console.log(`\n   📋 KC Manual Steps:`);
  console.log(`   1. Go to ${kc.base_url}/text-to-video?type=video_ai`);
  console.log(`   2. Paste script into textarea`);
  console.log(`   3. Set frame: ${kc.frame}`);
  console.log(`   4. Style: ${kc.video_style}`);
  console.log(`   5. Voice: ${kc.voice}`);
  console.log(`   6. Click "XEM TRƯỚC" → "TẠO VIDEO"`);
  console.log(`\n   Script text:\n   "${kcText.substring(0, 200)}..."`);

  return {
    id: `vj_kc_${Date.now()}`,
    script_id: script.id,
    platform: 'kingcontent_veo3',
    frame: kc.frame as '9:16' | '16:9',
    voice: kc.voice,
    style: kc.video_style,
    status: 'queued',
    submitted_at: new Date().toISOString(),
  };
}

/**
 * Submit video job to Sophia AI Factory (fallback).
 */
export async function submitToSophia(script: VideoScript): Promise<VideoJob> {
  const { sophia } = schedule;

  console.log(`\n🎬 [Video Dispatch] Submitting to Sophia AI Factory...`);
  console.log(`   URL: ${sophia.base_url}`);
  console.log(`   Script: "${script.title}"`);

  // Sophia integration via localhost API
  try {
    const response = await fetch(`${sophia.base_url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        script: [script.hook, script.body, script.cta].join('\n'),
        duration: script.duration_seconds,
        style: 'health_wellness',
        voice: 'vietnamese_female',
      }),
    });

    if (!response.ok) throw new Error(`Sophia API ${response.status}`);
    console.log(`   ✅ Sophia job submitted`);
  } catch {
    console.log(`   ⚠️  Sophia unavailable — queued for KingContent only`);
  }

  return {
    id: `vj_sophia_${Date.now()}`,
    script_id: script.id,
    platform: 'sophia',
    frame: '9:16',
    voice: 'vietnamese_female',
    style: 'health_wellness',
    status: 'queued',
    submitted_at: new Date().toISOString(),
  };
}

/**
 * Dispatch all scripts to video production.
 * Primary: KingContent Veo3
 * Fallback: Sophia AI Factory
 */
export async function dispatchAll(scripts: VideoScript[]): Promise<VideoJob[]> {
  console.log(`\n🚀 [Video Dispatch] Dispatching ${scripts.length} scripts...`);

  const jobs: VideoJob[] = [];
  for (const script of scripts) {
    // Primary: KingContent
    const kcJob = await submitToKingContent(script);
    jobs.push(kcJob);

    // Fallback: Sophia (if configured)
    if (schedule.sophia.fallback) {
      const sophiaJob = await submitToSophia(script);
      jobs.push(sophiaJob);
    }
  }

  console.log(`\n📊 [Video Dispatch] Summary:`);
  console.log(`   Total jobs: ${jobs.length}`);
  console.log(`   KingContent: ${jobs.filter(j => j.platform === 'kingcontent_veo3').length}`);
  console.log(`   Sophia: ${jobs.filter(j => j.platform === 'sophia').length}`);

  return jobs;
}
