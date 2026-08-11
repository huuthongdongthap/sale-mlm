const http = require('http');
const { URL } = require('url');

// Test framework - simple assertion-based testing
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    testsPassed++;
  } else {
    console.log(`✗ ${message}`);
    testsFailed++;
  }
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`✓ ${message}`);
    testsPassed++;
  } else {
    console.log(`✗ ${message} - Expected: ${expected}, Got: ${actual}`);
    testsFailed++;
  }
}

// HTTP client helper
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            data: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testHabitTracker() {
  console.log('🧪 Starting Habit Tracker Tests\n');

  try {
    // Test 1: Basic checkin functionality
    console.log('Test Group: Basic Checkin');
    const checkinResponse = await makeRequest('POST', '/api/habits/checkin', {
      member_id: 'test-member-1',
      date: '2026-04-24',
      items: ['5am', 'zoom', 'kaizen', 10] // 10 connects
    });

    assert(checkinResponse.statusCode === 200, 'Checkin returns 200 status');
    assert(checkinResponse.data.success === true, 'Checkin success flag is true');
    assert(checkinResponse.data.habit.habitScore === 5, 'Habit score calculation correct (2+1+1+1=5)');
    assert(checkinResponse.data.habit.streak === 1, 'Initial streak is 1 for qualifying score');

    // Test 2: Streak increment
    console.log('\nTest Group: Streak Management');
    const nextDayCheckin = await makeRequest('POST', '/api/habits/checkin', {
      member_id: 'streak-test-member',
      date: '2026-04-24',
      items: ['5am', 'kaizen', 15] // 5 points (2+1+2)
    });

    assert(nextDayCheckin.data.habit.habitScore === 5, 'Full score achieved (2+2+1=5)');
    assert(nextDayCheckin.data.habit.streak === 1, 'Initial streak is 1');

    const secondDay = await makeRequest('POST', '/api/habits/checkin', {
      member_id: 'streak-test-member',
      date: '2026-04-25',
      items: ['5am', 'kaizen', 15] // 5 points again
    });

    assert(secondDay.data.habit.streak === 2, 'Streak incremented to 2');

    // Test 3: Streak break (score below 4)
    const lowScoreCheckin = await makeRequest('POST', '/api/habits/checkin', {
      member_id: 'streak-test-member',
      date: '2026-04-26',
      items: ['zoom', 5] // Only 1 point (zoom=1, connects 5 < 10 = 0)
    });

    assert(lowScoreCheckin.data.habit.habitScore === 1, 'Low score calculated correctly');
    assert(lowScoreCheckin.data.habit.streak === 0, 'Streak reset to 0 for score <4');

    // Test 4: Validation tests
    console.log('\nTest Group: Validation');
    const invalidCheckin = await makeRequest('POST', '/api/habits/checkin', {
      items: ['5am']
    });
    assert(invalidCheckin.statusCode === 400, 'Missing member_id returns 400');

    const invalidItems = await makeRequest('POST', '/api/habits/checkin', {
      member_id: 'test-member',
      items: 'not-an-array'
    });
    assert(invalidItems.statusCode === 400, 'Invalid items format returns 400');

    // Test 5: Streak retrieval
    console.log('\nTest Group: Streak Retrieval');
    const streakResponse = await makeRequest('GET', '/api/habits/streak/streak-test-member');
    assert(streakResponse.statusCode === 200, 'Streak endpoint returns 200');
    assert(streakResponse.data.currentStreak === 0, 'Current streak reflects last broken streak');

    // Test 6: Snapshot functionality
    console.log('\nTest Group: Snapshot');
    const snapshotResponse = await makeRequest('POST', '/api/habits/snapshot', {
      timezone: 'Asia/Ho_Chi_Minh'
    });
    assert(snapshotResponse.statusCode === 200, 'Snapshot endpoint returns 200');
    assert(snapshotResponse.data.snapshotStatus === 'completed', 'Snapshot status is completed');

    // Test 7: Cron stub
    const cronResponse = await makeRequest('GET', '/api/habits/cron/midnight-snapshot');
    assert(cronResponse.statusCode === 200, 'Cron stub returns 200');
    assert(cronResponse.data.timezone === 'Asia/Ho_Chi_Minh', 'Cron uses correct timezone');

    // Test 8: Multiple items in single checkin
    console.log('\nTest Group: Batch Checkin');
    const batchCheckin = await makeRequest('POST', '/api/habits/checkin', {
      member_id: 'test-member-2',
      date: '2026-04-24',
      items: ['5am', 'zoom', 'kaizen', 'connect', 'connect', 'connect', 15] // Should result in 15 connects total
    });

    assert(batchCheckin.data.habit.connects >= 15, 'Multiple connect items processed');
    assert(batchCheckin.data.habit.habitScore === 6, 'Maximum score achieved with batch items (2+1+1+2=6)');

    // Test 9: Grace window (confirm 1 day break resets streak)
    console.log('\nTest Group: Grace Window');
    await makeRequest('POST', '/api/habits/checkin', {
      member_id: 'grace-test',
      date: '2026-04-20',
      items: ['5am', 'kaizen', 15] // 6 points, streak = 1
    });

    // Skip one day (2026-04-21), then checkin 2026-04-22
    const afterGap = await makeRequest('POST', '/api/habits/checkin', {
      member_id: 'grace-test',
      date: '2026-04-22',
      items: ['5am', 'kaizen', 15] // 6 points
    });

    assert(afterGap.data.habit.streak === 1, 'Streak resets after 1-day gap (grace window = 0)');

  } catch (error) {
    console.error('Test execution error:', error);
    testsFailed++;
  }

  // Summary
  console.log(`\n🧪 Test Summary:`);
  console.log(`✓ Passed: ${testsPassed}`);
  console.log(`✗ Failed: ${testsFailed}`);
  console.log(`Total: ${testsPassed + testsFailed}`);

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  }
}

// Start server and run tests
const app = require('../src/server.js');
let server;

function startServer() {
  return new Promise((resolve) => {
    server = app.listen(3000, () => {
      console.log('Test server started on port 3000');
      resolve();
    });
  });
}

function stopServer() {
  if (server) {
    server.close();
  }
}

// Run tests
(async () => {
  try {
    await startServer();
    await testHabitTracker();
  } catch (error) {
    console.error('Test suite error:', error);
    process.exit(1);
  } finally {
    stopServer();
  }
})();