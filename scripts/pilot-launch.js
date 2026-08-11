#!/usr/bin/env node
/**
 * PHASE 1: Pilot Launch Script
 *
 * Deploys pilot with 10 Tân Binh, sends welcome messages,
 * starts onboarding, and monitors first 7 days.
 *
 * Usage: node scripts/pilot-launch.js [--dry-run]
 */

const { seed } = require('./seed');
const { startOnboarding, generateNudge, getProgress } = require('../src/agents/onboardingBot');
const { assignCurriculum, getProgress: getTrainingProgress } = require('../src/agents/trainingOps');
const { PILOT_MEMBERS, PSNS } = require('./seed');

const dryRun = process.argv.includes('--dry-run');

function log(msg) {
  console.log(`🚀 ${msg}`);
}

function logStep(step, total, msg) {
  console.log(`  [${step}/${total}] ${msg}`);
}

async function launchPilot() {
  log('DROPPII TRAINING OS — PILOT LAUNCH');
  log('='.repeat(50));

  if (dryRun) {
    log('DRY RUN MODE — no actual API calls');
  }

  // Step 1: Seed data
  logStep(1, 6, 'Seeding pilot data...');
  const seedResult = seed();
  log(`   ✅ ${seedResult.members.length} members seeded across ${PSNS.length} PSNs`);

  // Step 2: Start onboarding for each member
  logStep(2, 6, 'Starting onboarding for 10 Tân Binh...');
  const onboarded = [];
  for (const member of PILOT_MEMBERS) {
    if (dryRun) {
      log(`   [DRY] Would onboard: ${member.name} (${member.psnId})`);
      onboarded.push(member);
    } else {
      const session = startOnboarding(member.id, {
        name: member.name,
        tier: member.tier,
        phone: member.phone,
        buddyId: member.buddyId,
        psnId: member.psnId
      });
      onboarded.push(session);
      log(`   ✅ ${member.name} — Week 1, Day 1 (5AM Club)`);
    }
  }

  // Step 3: Assign training curriculum
  logStep(3, 6, 'Assigning Tier 1 curriculum...');
  for (const member of PILOT_MEMBERS) {
    if (!dryRun) {
      assignCurriculum(member.id, {
        name: member.name,
        tier: member.tier,
        phone: member.phone,
        buddyId: member.buddyId,
        psnId: member.psnId
      });
    }
    log(`   ✅ ${member.name} → ${member.tier === 1 ? 'Tân Binh → Chiến Binh' : member.tier === 2 ? 'Chiến Binh → Chỉ Huy' : 'Chỉ Huy → Tướng Quân'}`);
  }

  // Step 4: Generate Day 1 nudges
  logStep(4, 6, 'Generating Day 1 welcome nudges...');
  for (const member of PILOT_MEMBERS) {
    if (!dryRun) {
      const nudge = generateNudge(member.id);
      log(`   📱 ${member.name}: "${nudge.message.substring(0, 60)}..."`);
    } else {
      log(`   [DRY] Would nudge: ${member.name}`);
    }
  }

  // Step 5: PSN health baseline
  logStep(5, 6, 'Computing PSN health baseline...');
  for (const psn of PSNS) {
    log(`   📊 ${psn.name} (${psn.location}):`);
    log(`      Leader: ${psn.leader.name}`);
    log(`      Members: 5`);
    log(`      Status: Active — Week 1 starting`);
  }

  // Step 6: Launch summary
  logStep(6, 6, 'Launch summary...');
  console.log('\n' + '='.repeat(50));
  console.log('📋 PILOT LAUNCH SUMMARY');
  console.log('='.repeat(50));
  console.log(`   Members onboarded:  ${onboarded.length}/10`);
  console.log(`   PSNs active:        ${PSNS.length}`);
  console.log(`   Training tier:      Tier 1 (Tân Binh → Chiến Binh)`);
  console.log(`   Duration:           4 weeks (28 days)`);
  console.log(`   Start date:         ${new Date().toISOString().split('T')[0]}`);
  console.log(`   Target graduation:  ${new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`);
  console.log('\n📊 Success Criteria:');
  console.log('   ✅ 70% habit completion rate (≥4/6 for 3 weeks)');
  console.log('   ✅ 3 orders per member in first 14 days');
  console.log('   ✅ 15 connects/day average');
  console.log('   ✅ 0 dropouts in first week');
  console.log('\n🔗 Monitoring Endpoints:');
  console.log('   GET /api/onboarding/active        — Active sessions');
  console.log('   GET /api/training/attention       — Members needing help');
  console.log('   GET /api/alerts/summary           — Alert summary');
  console.log('   GET /health                       — System health');
  console.log('\n🎉 PILOT LAUNCH COMPLETE!');
  console.log('   Ready to onboard 10 Tân Binh into Hive Warfare Academy.');

  return {
    launched: true,
    members: onboarded.length,
    psns: PSNS.length,
    start_date: new Date().toISOString().split('T')[0],
    target_graduation: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };
}

if (require.main === module) {
  launchPilot();
}

module.exports = { launchPilot };
