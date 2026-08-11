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

  // First, go to the page and inject the token
  console.log('Navigating and injecting token...');
  await page.goto('http://127.0.0.1:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Inject token into localStorage
  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6ImFkbWluLTAwMSIsInJvbGUiOiJBZG1pbiIsIm5hbWUiOiJRdeG6o24gVHLhu4sgVmnDqm4iLCJpYXQiOjE3ODQ2MDgzNzEsImV4cCI6MTc4NDY5NDc3MX0.2j7oRIJe66ownSYpYr3ww5C__1mrez7kjkYzkCDNzSI";
  await page.evaluate((t) => {
    localStorage.setItem('token', t);
  }, token);
  
  // Also inject user data
  await page.evaluate(() => {
    localStorage.setItem('user', JSON.stringify({
      id: 'admin-001',
      name: 'Quản Trị Viên',
      role: 'Admin',
      tier: 3,
      email: 'admin@droppii.vn'
    }));
  });
  
  console.log('Token injected');
  await page.waitForTimeout(1000);
  
  // Now navigate to each view
  const views = [
    { route: '', name: 'overview', label: 'Tổng quan' },
    { route: '/members', name: 'members', label: 'Thành viên' },
    { route: '/psn', name: 'psn', label: 'PSN Health' },
    { route: '/kpi', name: 'kpi', label: 'KPI Tracker' },
    { route: '/training', name: 'training', label: 'Đào tạo' },
    { route: '/alerts', name: 'alerts', label: 'Cảnh báo' }
  ];

  for (const view of views) {
    console.log(`Capturing ${view.label}...`);
    const url = `http://127.0.0.1:3001#${view.route}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);  // Wait for async data loading
    
    const screenshotPath = path.join(evidenceDir, `day0-${view.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Saved: ${screenshotPath}`);
  }

  await browser.close();
  console.log('All screenshots captured!');
}

captureScreenshots().catch(console.error);
