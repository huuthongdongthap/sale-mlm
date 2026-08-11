const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const evidenceDir = path.join('/Users/mac/mekong-cli/SALE MLM/src/dashboard/plans/launch/evidence');
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }

  // First, log in
  console.log('Logging in...');
  await page.goto('http://127.0.0.1:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Fill login form
  await page.fill('input[type="email"]', 'admin@droppii.vn');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  // Check if logged in
  const token = await page.evaluate(() => localStorage.getItem('token'));
  console.log('Token:', token?.substring(0, 30) + '...');
  
  // Navigate to each view and capture
  const views = [
    { route: '/', name: 'overview', label: 'Tổng quan' },
    { route: '/members', name: 'members', label: 'Thành viên' },
    { route: '/psn', name: 'psn', label: 'PSN Health' },
    { route: '/kpi', name: 'kpi', label: 'KPI Tracker' },
    { route: '/training', name: 'training', label: 'Đào tạo' },
    { route: '/alerts', name: 'alerts', label: 'Cảnh báo' }
  ];

  for (const view of views) {
    console.log(`Capturing ${view.label}...`);
    await page.goto(`http://127.0.0.1:3001#${view.route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const screenshotPath = path.join(evidenceDir, `day0-${view.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Saved: ${screenshotPath}`);
  }

  await browser.close();
  console.log('All screenshots captured!');
}

captureScreenshots().catch(console.error);
