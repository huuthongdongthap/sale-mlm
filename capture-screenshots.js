const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = path.join(__dirname, 'plans/launch/evidence');
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  // Login via token injection
  async function login() {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });

    // Inject JWT token into localStorage
    await page.evaluate(() => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoiYWRtaW5AZHJvcHBpaS52biIsInJvbGUiOiJhZG1pbiIsInRpZXIiOjMsInBzbmlkIjoicHNuLXJpc2luZy1kcmFnb24iLCJpYXQiOjE3MjE0OTE2MDAsImV4cCI6MTcyMTU3ODAwMH0.DUMMY_SIGNATURE_FOR_TEST';
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify({
        id: 'admin-001',
        name: 'Admin User',
        email: 'admin@droppii.vn',
        role: 'admin',
        tier: 3,
        psn_id: 'psn-rising-dragon',
        habit_score: 8,
        energy: 8,
        status: 'active'
      }));
    });

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  }

  await login();

  const views = [
    { path: '/', name: 'overview', waitFor: '.members-table, .dashboard-overview' },
    { path: '/members', name: 'members', waitFor: '.members-table' },
    { path: '/psn', name: 'psn', waitFor: '.psn-health-grid' },
    { path: '/kpi', name: 'kpi', waitFor: '.kpi-panel' },
    { path: '/alerts', name: 'alerts', waitFor: '.alerts-inbox' },
    { path: '/training', name: 'training', waitFor: '.training-view' },
  ];

  for (const view of views) {
    console.log(`Capturing ${view.name}...`);
    await page.goto(`http://localhost:3001${view.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const screenshotPath = path.join(EVIDENCE_DIR, `day0-${view.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Saved: ${screenshotPath}`);
  }

  await browser.close();
  console.log('All screenshots captured!');
}

captureScreenshots().catch(console.error);