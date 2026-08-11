/**
 * Smoke test for Alerts Inbox functionality
 * Quick verification of T-011 accept criteria
 */

const { mockAlertsAPI } = require('../src/mocks/alerts-api.js');

// Test 1: Mock API functionality
async function testMockAPI() {
  console.log('🧪 Test 1: Mock API Functionality');

  try {
    // Test getAlerts
    const alerts = await mockAlertsAPI.getAlerts();
    console.log('✓ getAlerts returns data:', alerts.success);
    console.log('✓ Alert count:', alerts.data.total);
    console.log('✓ Grouped by severity:', Object.keys(alerts.data.grouped));

    // Test acknowledge
    const unackAlert = alerts.data.alerts.find(a => !a.acknowledged);
    if (unackAlert) {
      const ackResult = await mockAlertsAPI.acknowledgeAlert(unackAlert.id, 'test-user');
      console.log('✓ Acknowledge success:', ackResult.success);
      console.log('✓ Audit entry created:', !!ackResult.data.audit_entry);
    }

    return true;
  } catch (error) {
    console.log('❌ Mock API test failed:', error.message);
    return false;
  }
}

// Test 2: Severity grouping
async function testSeverityGrouping() {
  console.log('\n🧪 Test 2: Severity Grouping');

  try {
    const alerts = await mockAlertsAPI.getAlerts();
    const { grouped } = alerts.data;

    const severityLevels = ['critical', 'warn', 'info'];
    let allGroupsValid = true;

    for (const severity of severityLevels) {
      if (grouped[severity]) {
        const allSameSeverity = grouped[severity].every(a => a.severity === severity);
        console.log(`✓ ${severity} group valid:`, allSameSeverity);
        allGroupsValid = allGroupsValid && allSameSeverity;
      }
    }

    return allGroupsValid;
  } catch (error) {
    console.log('❌ Severity grouping test failed:', error.message);
    return false;
  }
}

// Test 3: Alert data structure
async function testAlertStructure() {
  console.log('\n🧪 Test 3: Alert Data Structure');

  try {
    const alerts = await mockAlertsAPI.getAlerts();
    const alert = alerts.data.alerts[0];

    const requiredFields = ['id', 'severity', 'rule', 'title', 'evidence', 'suggested_action', 'created_at', 'acknowledged'];
    const missingFields = requiredFields.filter(field => !(field in alert));

    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields);
      return false;
    }

    console.log('✓ All required fields present');

    // Check Vietnamese content
    const hasVietnamese = alert.title.match(/[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i);
    console.log('✓ Vietnamese UI content:', !!hasVietnamese);

    return true;
  } catch (error) {
    console.log('❌ Alert structure test failed:', error.message);
    return false;
  }
}

// Test 4: Bulk acknowledge
async function testBulkAcknowledge() {
  console.log('\n🧪 Test 4: Bulk Acknowledge');

  try {
    const alerts = await mockAlertsAPI.getAlerts({ acknowledged: false });
    const alertIds = alerts.data.alerts.slice(0, 2).map(a => a.id);

    if (alertIds.length === 0) {
      console.log('⚠️ No unacknowledged alerts to test bulk acknowledge');
      return true;
    }

    const result = await mockAlertsAPI.bulkAcknowledge(alertIds, 'test-user');
    console.log('✓ Bulk acknowledge success:', result.success);
    console.log('✓ Acknowledged count:', result.data.acknowledged);

    return result.success;
  } catch (error) {
    console.log('❌ Bulk acknowledge test failed:', error.message);
    return false;
  }
}

// Test 5: File existence check
function testFileExistence() {
  console.log('\n🧪 Test 5: File Structure');

  const fs = require('fs');
  const path = require('path');

  const requiredFiles = [
    'src/mocks/alerts-api.js',
    'src/dashboard/alerts-inbox.js',
    'src/dashboard/components/severity-group.js',
    'src/dashboard/components/alert-card.js'
  ];

  let allFilesExist = true;

  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(__dirname, '..', file));
    console.log(`${exists ? '✓' : '❌'} ${file}`);
    allFilesExist = allFilesExist && exists;
  }

  return allFilesExist;
}

// Main test runner
async function runTests() {
  console.log('🚨 T-011 Alerts Inbox - Smoke Tests\n');

  const results = [];

  results.push(await testMockAPI());
  results.push(await testSeverityGrouping());
  results.push(await testAlertStructure());
  results.push(await testBulkAcknowledge());
  results.push(testFileExistence());

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('\n📊 Test Results:');
  console.log(`✓ Passed: ${passed}/${total}`);
  console.log(`${passed === total ? '🎉' : '❌'} ${passed === total ? 'All tests passed!' : 'Some tests failed'}`);

  // Exit with appropriate code
  process.exit(passed === total ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test runner error:', error);
  process.exit(1);
});