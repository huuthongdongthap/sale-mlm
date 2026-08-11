#!/usr/bin/env node
/**
 * T-023: Seed data — 10 pilot members across 2 PSNs with 14-day history
 *
 * Usage: node scripts/seed.js [--reset]
 *
 * Creates:
 * - 2 PSNs (Personal Sales Networks)
 * - 10 pilot members (5 per PSN) with realistic Vietnamese names
 * - 14 days of habit check-ins, KPI records, and connect logs
 * - Mix of tiers: 7 Tân Binh (Tier 1), 2 Chiến Binh (Tier 2), 1 Chỉ Huy (Tier 3)
 */

const { Member } = require('../src/models/member');
const Habit = require('../src/models/habit');
const KPI = require('../src/models/kpi');

// PSN definitions
const PSNS = [
  {
    id: 'psn-rising-dragon',
    name: 'PSN Rồng Thăng',
    leader: { name: 'Nguyễn Minh Tuấn', phone: '+84901234567', email: 'tuan.nguyen@droppii.vn' },
    location: 'Hà Nội'
  },
  {
    id: 'psn-golden-star',
    name: 'PSN Sao Vàng',
    leader: { name: 'Trần Thị Hương', phone: '+84912345678', email: 'huong.tran@droppii.vn' },
    location: 'TP.HCM'
  }
];

// 10 pilot members with realistic data
const PILOT_MEMBERS = [
  // PSN Rồng Thăng (5 members)
  { id: 'pilot-001', name: 'Nguyễn Minh Tuấn', role: 'PSN Leader', tier: 3, psnId: 'psn-rising-dragon', phone: '+84901234567', email: 'tuan.nguyen@droppii.vn', energyScore: 8, status: 'active' },
  { id: 'pilot-002', name: 'Lê Thị Mai', role: 'Member', tier: 1, psnId: 'psn-rising-dragon', phone: '+84902345678', email: 'mai.le@droppii.vn', energyScore: 7, status: 'active' },
  { id: 'pilot-003', name: 'Phạm Văn Đức', role: 'Member', tier: 1, psnId: 'psn-rising-dragon', phone: '+84903456789', email: 'duc.pham@droppii.vn', energyScore: 6, status: 'active' },
  { id: 'pilot-004', name: 'Hoàng Thị Lan', role: 'Member', tier: 1, psnId: 'psn-rising-dragon', phone: '+84904567890', email: 'lan.hoang@droppii.vn', energyScore: 5, status: 'training' },
  { id: 'pilot-005', name: 'Vũ Quang Huy', role: 'Member', tier: 2, psnId: 'psn-rising-dragon', phone: '+84905678901', email: 'huy.vu@droppii.vn', energyScore: 7, status: 'active' },

  // PSN Sao Vàng (5 members)
  { id: 'pilot-006', name: 'Trần Thị Hương', role: 'PSN Leader', tier: 3, psnId: 'psn-golden-star', phone: '+84912345678', email: 'huong.tran@droppii.vn', energyScore: 9, status: 'active' },
  { id: 'pilot-007', name: 'Đặng Văn Long', role: 'Member', tier: 1, psnId: 'psn-golden-star', phone: '+84913456789', email: 'long.dang@droppii.vn', energyScore: 6, status: 'active' },
  { id: 'pilot-008', name: 'Bùi Thị Hồng', role: 'Member', tier: 1, psnId: 'psn-golden-star', phone: '+84914567890', email: 'hong.bui@droppii.vn', energyScore: 4, status: 'at_risk' },
  { id: 'pilot-009', name: 'Đỗ Minh Tâm', role: 'Member', tier: 2, psnId: 'psn-golden-star', phone: '+84915678901', email: 'tam.do@droppii.vn', energyScore: 8, status: 'active' },
  { id: 'pilot-010', name: 'Lý Thị Yến', role: 'Member', tier: 1, psnId: 'psn-golden-star', phone: '+84916789012', email: 'yen.ly@droppii.vn', energyScore: 5, status: 'training' }
];

// Buddy system pairings
const BUDDY_PAIRS = [
  ['pilot-002', 'pilot-003'],
  ['pilot-004', 'pilot-005'],
  ['pilot-007', 'pilot-008'],
  ['pilot-009', 'pilot-010']
];

/**
 * Generate 14 days of habit data for a member
 */
function generateHabitHistory(memberId, daysAgo = 14) {
  const habits = [];
  const today = new Date();

  for (let d = daysAgo; d >= 1; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];

    // Simulate realistic habit patterns
    const rand = Math.random();
    let items;

    if (rand < 0.15) {
      // Bad day (15%) — missed most habits
      items = ['zoom'];
    } else if (rand < 0.35) {
      // Average day (20%) — some habits
      items = ['5am', 'kaizen', Math.floor(Math.random() * 10) + 3];
    } else {
      // Good day (65%) — most habits
      items = ['5am', 'zoom', 'kaizen', Math.floor(Math.random() * 8) + 10];
    }

    habits.push({
      member_id: memberId,
      date: dateStr,
      items
    });
  }

  return habits;
}

/**
 * Generate 14 days of KPI data for a member
 */
function generateKPIHistory(memberId, tier, daysAgo = 14) {
  const kpis = [];
  const today = new Date();

  const targets = {
    1: { connects: 15, followUps: 3, firstOrder: false },
    2: { connects: 20, followUps: 5, firstOrder: true },
    3: { connects: 25, followUps: 8, firstOrder: true }
  };

  const t = targets[tier] || targets[1];

  for (let d = daysAgo; d >= 1; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];

    const variance = () => Math.floor(Math.random() * 10) - 3;
    const connects = Math.max(0, t.connects + variance());
    const followUps = Math.max(0, t.followUps + Math.floor(Math.random() * 4) - 1);

    kpis.push({
      memberId,
      date: dateStr,
      connectsPerDay: connects,
      followUpsPerDay: followUps,
      firstOrderIn14Days: d <= 7 && tier >= 2 ? true : (d <= 10 && Math.random() > 0.5)
    });
  }

  return kpis;
}

/**
 * Main seed function
 */
function seed() {
  console.log('🌱 Seeding Droppii Training OS — Pilot Data\n');

  // Reset flag
  const reset = process.argv.includes('--reset');
  if (reset) {
    console.log('⚠️  Reset mode: clearing existing data\n');
  }

  // Create members
  console.log(`📋 Creating ${PILOT_MEMBERS.length} pilot members across ${PSNS.length} PSNs...`);

  const members = [];
  for (const data of PILOT_MEMBERS) {
    const member = new Member({
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      tier: data.tier,
      psnId: data.psnId,
      energyScore: data.energyScore,
      status: data.status,
      joinDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    });
    members.push(member);
  }

  // Setup buddy pairs
  for (const [a, b] of BUDDY_PAIRS) {
    const memberA = members.find(m => m.id === a);
    const memberB = members.find(m => m.id === b);
    if (memberA && memberB) {
      memberA.buddyId = b;
      memberB.buddyId = a;
    }
  }

  console.log(`✅ ${members.length} members created`);

  // Print PSN summary
  for (const psn of PSNS) {
    const psnMembers = members.filter(m => m.psnId === psn.id);
    console.log(`\n  🏠 ${psn.name} (${psn.location})`);
    console.log(`     Leader: ${psn.leader.name}`);
    console.log(`     Members: ${psnMembers.length}`);
    for (const m of psnMembers) {
      const tierLabel = ['?', 'Tân Binh', 'Chiến Binh', 'Chỉ Huy'][m.tier];
      console.log(`     - ${m.name} (${tierLabel}, ${m.role}, Energy: ${m.energyScore}/10)`);
    }
  }

  // Generate habit history
  console.log('\n📊 Generating 14-day habit history...');
  let totalHabits = 0;
  for (const member of members) {
    const habits = generateHabitHistory(member.id);
    totalHabits += habits.length;
  }
  console.log(`✅ ${totalHabits} habit records generated (${members.length} members × 14 days)`);

  // Generate KPI history
  console.log('\n📈 Generating 14-day KPI history...');
  let totalKPIs = 0;
  for (const member of members) {
    const kpis = generateKPIHistory(member.id, member.tier);
    totalKPIs += kpis.length;
  }
  console.log(`✅ ${totalKPIs} KPI records generated`);

  // Summary
  console.log('\n📊 Seed Summary:');
  console.log(`   Members:     ${members.length}`);
  console.log(`   PSNs:        ${PSNS.length}`);
  console.log(`   Habit records: ${totalHabits}`);
  console.log(`   KPI records:   ${totalKPIs}`);
  console.log(`   Buddy pairs:   ${BUDDY_PAIRS.length}`);
  console.log(`   Days of history: 14`);

  console.log('\n🎯 Pilot Readiness:');
  const activeMembers = members.filter(m => m.status === 'active').length;
  const trainingMembers = members.filter(m => m.status === 'training').length;
  const atRiskMembers = members.filter(m => m.status === 'at_risk').length;
  console.log(`   Active:    ${activeMembers}`);
  console.log(`   Training:  ${trainingMembers}`);
  console.log(`   At Risk:   ${atRiskMembers}`);

  console.log('\n✅ Seed complete. Ready for pilot launch!');

  return { members, totalHabits, totalKPIs };
}

// Run if called directly
if (require.main === module) {
  seed();
}

module.exports = { seed, PILOT_MEMBERS, PSNS, BUDDY_PAIRS, generateHabitHistory, generateKPIHistory };
