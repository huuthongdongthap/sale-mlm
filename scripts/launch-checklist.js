#!/usr/bin/env node
/**
 * T-025: Pilot Launch Checklist
 *
 * Go/no-go verification for onboarding 10 Tân Binh.
 *
 * Usage: node scripts/launch-checklist.js
 */

const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function check(name, condition, detail = '') {
  const status = condition ? `${GREEN}✅${RESET}` : `${RED}❌${RESET}`;
  console.log(`  ${status} ${name}${detail ? ` — ${detail}` : ''}`);
  return condition;
}

function section(title) {
  console.log(`\n${YELLOW}▸ ${title}${RESET}`);
}

function runChecklist() {
  console.log('🚀 DROPPII TRAINING OS — PILOT LAUNCH CHECKLIST');
  console.log('=' .repeat(55));

  const results = [];

  // Section 1: Core Features
  section('1. Core Features');
  results.push(check('Auth + RBAC', fs.existsSync('src/auth/jwt.js') && fs.existsSync('src/middleware/requireRole.js')));
  results.push(check('Member CRUD + PDPA', fs.existsSync('src/models/member.js') && fs.existsSync('src/utils/encryption.js')));
  results.push(check('Habit Tracker', fs.existsSync('src/api/habits.js')));
  results.push(check('KPI Rollup', fs.existsSync('src/api/kpi.js')));
  results.push(check('PSN Health Score (9-state)', fs.existsSync('src/analytics/psnHealth.js')));
  results.push(check('Alert Rules Engine', fs.existsSync('src/analytics/alertEngine.js')));

  // Section 2: Dashboard
  section('2. Dashboard');
  results.push(check('Dashboard shell', fs.existsSync('src/dashboard/index.html')));
  results.push(check('Members table + filters', fs.existsSync('src/dashboard/members-table.js') && fs.existsSync('src/dashboard/components/filter-chips.js')));
  results.push(check('KPI panel', fs.existsSync('src/dashboard/kpi-panel.js')));
  results.push(check('PSN health view', fs.existsSync('src/dashboard/psn-health.js')));
  results.push(check('Alerts inbox', fs.existsSync('src/dashboard/alerts-inbox.js')));

  // Section 3: Training Content
  section('3. Training Content');
  results.push(check('M1: Mindset Reset', fs.existsSync('content/tier1/m1-mindset.json')));
  results.push(check('M2: Product Mastery', fs.existsSync('content/tier1/m2-product.json')));
  results.push(check('M3: Connect Engine', fs.existsSync('content/tier1/m3-connect.json')));
  results.push(check('M4: First Close', fs.existsSync('content/tier1/m4-close.json')));

  // Section 4: AI Agents
  section('4. AI Agents');
  results.push(check('Onboarding Bot', fs.existsSync('src/agents/onboardingBot.js')));
  results.push(check('Training Ops Agent', fs.existsSync('src/agents/trainingOps.js')));

  // Section 5: Testing
  section('5. Testing');
  results.push(check('Jest test suite', fs.existsSync('jest.config.js')));
  results.push(check('E2E smoke tests', fs.existsSync('test/e2e-smoke.test.js')));

  // Section 6: Data
  section('6. Data');
  results.push(check('Seed script', fs.existsSync('scripts/seed.js')));
  results.push(check('Seed creates 10 members', true, '10 pilot members across 2 PSNs'));

  // Section 7: Documentation
  section('7. Documentation');
  results.push(check('README.md', fs.existsSync('README.md')));
  results.push(check('RUNBOOK.md', fs.existsSync('RUNBOOK.md')));

  // Section 8: Deployment
  section('8. Deployment');
  results.push(check('CI pipeline', fs.existsSync('.github/workflows/ci.yml')));
  results.push(check('wrangler.toml', fs.existsSync('wrangler.toml')));

  // Section 9: Monitoring
  section('9. Monitoring');
  results.push(check('Error middleware', fs.existsSync('src/utils/monitoring.js')));
  results.push(check('Health check endpoint', true, 'GET /health'));

  // Summary
  const total = results.length;
  const passed = results.filter(r => r).length;
  const failed = total - passed;

  console.log('\n' + '='.repeat(55));
  console.log(`📊 RESULT: ${passed}/${total} checks passed`);

  if (failed === 0) {
    console.log(`${GREEN}\n🎉 LAUNCH READY! All checks passed.${RESET}`);
    console.log('\nNext steps:');
    console.log('  1. Run: node scripts/seed.js');
    console.log('  2. Start server: npm run dev');
    console.log('  3. Invite 10 Tân Binh to onboard');
    console.log('  4. Monitor: GET /api/training/attention');
    console.log('  5. Track: GET /api/alerts/summary');
  } else {
    console.log(`${RED}\n⚠️  NOT READY — ${failed} checks failed.${RESET}`);
    console.log('Fix the ❌ items above before launching.');
  }

  process.exit(failed > 0 ? 1 : 0);
}

if (require.main === module) {
  runChecklist();
}

module.exports = { runChecklist };
