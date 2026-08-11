const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const kpiRouter = require('../src/api/kpi');
const { Member } = require('../src/models/member');
const KPI = require('../src/models/kpi');

// Setup test app
const app = express();
app.use(express.json());
app.use('/api/kpi', kpiRouter);

// Mock JWT secret
process.env.JWT_SECRET = 'test-secret';

// Test member data
const testMember = {
  id: 'test-member-001',
  name: 'Tân Binh Test',
  email: 'test@droppii.vn',
  role: 'Member',
  tier: 1
};

// Valid JWT tokens for different roles
const adminToken = jwt.sign({ userId: 'admin-001', role: 'Admin' }, process.env.JWT_SECRET);
const memberToken = jwt.sign({ userId: 'test-member-001', role: 'Member' }, process.env.JWT_SECRET);

describe('KPI Rollup System', () => {
  beforeEach(() => {
    // Clear test data before each test
    // Note: In production this would clear database tables
  });

  describe('GET /api/kpi/:member_id - KPI Rollup Endpoint', () => {
    test('returns current vs tier target for valid member', async () => {
      const response = await request(app)
        .get('/api/kpi/member-001')
        .query({ window: 'daily', period: 7 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('member_id', 'member-001');
      expect(response.body).toHaveProperty('tier_targets');
      expect(response.body).toHaveProperty('rollup');
      expect(response.body.rollup).toHaveProperty('connects_per_day');
      expect(response.body.rollup).toHaveProperty('follow_ups_per_day');
      expect(response.body.rollup).toHaveProperty('first_order_14d');
    });

    test('supports daily window rollup', async () => {
      const response = await request(app)
        .get('/api/kpi/member-001')
        .query({ window: 'daily', period: 30 });

      expect(response.status).toBe(200);
      expect(response.body.window).toBe('daily');
      expect(response.body.rollup.summary).toHaveProperty('total_days', 30);
    });

    test('supports weekly window rollup', async () => {
      const response = await request(app)
        .get('/api/kpi/member-001')
        .query({ window: 'weekly' });

      expect(response.status).toBe(200);
      expect(response.body.window).toBe('weekly');
      expect(response.body.rollup).toHaveProperty('weeks');
      expect(response.body.rollup.summary).toHaveProperty('weeks_tracked');
    });

    test('supports monthly window rollup', async () => {
      const response = await request(app)
        .get('/api/kpi/member-001')
        .query({ window: 'monthly' });

      expect(response.status).toBe(200);
      expect(response.body.window).toBe('monthly');
      expect(response.body.rollup).toHaveProperty('months');
      expect(response.body.rollup.summary).toHaveProperty('months_tracked');
    });

    test('returns 404 for invalid member ID', async () => {
      const response = await request(app)
        .get('/api/kpi/invalid-member-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/Member not found/);
    });

    test('returns 400 for invalid window parameter', async () => {
      const response = await request(app)
        .get('/api/kpi/member-001')
        .query({ window: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/Invalid window/);
    });
  });

  describe('Tier Thresholds from company.json', () => {
    test('loads tier targets from company.json', () => {
      const targets = KPI.getTierTargets();

      expect(targets).toHaveProperty('1');
      expect(targets).toHaveProperty('2');
      expect(targets).toHaveProperty('3');

      // Tier 1 targets from company.json
      expect(targets[1]).toHaveProperty('connects_per_day', 15);
      expect(targets[1]).toHaveProperty('follow_ups_per_day', 3);
      expect(targets[1]).toHaveProperty('first_order_deadline_days', 14);
    });

    test('uses fallback targets if company.json fails to load', () => {
      // Mock fs.readFileSync to throw error
      const originalFs = require('fs');
      const mockFs = { ...originalFs };
      mockFs.readFileSync = jest.fn(() => {
        throw new Error('File not found');
      });

      require.cache[require.resolve('fs')] = { exports: mockFs };

      const targets = KPI.getTierTargets();

      expect(targets[1]).toHaveProperty('connects_per_day', 15);
      expect(targets[1]).toHaveProperty('follow_ups_per_day', 3);

      // Restore original fs
      require.cache[require.resolve('fs')] = { exports: originalFs };
    });
  });

  describe('RED/YELLOW/GREEN Status Calculation', () => {
    test('calculates GREEN status for meeting target', () => {
      const status = KPI.calculateStatus(15, 15); // 100% of target
      expect(status).toBe('GREEN');
    });

    test('calculates GREEN status for exceeding target', () => {
      const status = KPI.calculateStatus(20, 15); // 133% of target
      expect(status).toBe('GREEN');
    });

    test('calculates YELLOW status for 70-99% of target', () => {
      const status = KPI.calculateStatus(12, 15); // 80% of target
      expect(status).toBe('YELLOW');
    });

    test('calculates RED status for <70% of target', () => {
      const status = KPI.calculateStatus(8, 15); // 53% of target
      expect(status).toBe('RED');
    });

    test('handles boolean KPIs correctly', () => {
      expect(KPI.calculateStatus(true, true, 'boolean')).toBe('GREEN');
      expect(KPI.calculateStatus(false, true, 'boolean')).toBe('RED');
    });

    test('returns GREEN for zero target', () => {
      const status = KPI.calculateStatus(10, 0);
      expect(status).toBe('GREEN');
    });
  });

  describe('POST /api/kpi - Create KPI Record', () => {
    test('creates KPI record with admin role', async () => {
      const kpiData = {
        memberId: 'member-001',
        date: '2026-04-24',
        connectsPerDay: 12,
        followUpsPerDay: 2,
        firstOrderIn14Days: false
      };

      const response = await request(app)
        .post('/api/kpi')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(kpiData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.memberId).toBe('member-001');
      expect(response.body.connectsPerDay).toBe(12);
    });

    test('rejects KPI creation without proper role', async () => {
      const kpiData = {
        memberId: 'member-001',
        connectsPerDay: 12
      };

      const response = await request(app)
        .post('/api/kpi')
        .set('Authorization', `Bearer ${memberToken}`)
        .send(kpiData);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/kpi/leaderboard', () => {
    test('returns member rankings', async () => {
      const response = await request(app)
        .get('/api/kpi/leaderboard')
        .query({ limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('rankings');
      expect(response.body.rankings).toBeInstanceOf(Array);
      expect(response.body.rankings.length).toBeLessThanOrEqual(5);

      if (response.body.rankings.length > 0) {
        const ranking = response.body.rankings[0];
        expect(ranking).toHaveProperty('member_id');
        expect(ranking).toHaveProperty('member_name');
        expect(ranking).toHaveProperty('tier');
        expect(ranking).toHaveProperty('score');
        expect(ranking).toHaveProperty('status_breakdown');
      }
    });
  });

  describe('Integration Test - Full KPI Rollup Flow', () => {
    test('complete flow: create KPIs -> rollup -> verify status colors', async () => {
      // Step 1: Create sample KPIs for a member
      const sampleKPIs = [
        {
          memberId: 'member-001',
          date: '2026-04-20',
          connectsPerDay: 15, // GREEN (meets target)
          followUpsPerDay: 2,  // YELLOW (67% of target)
          firstOrderIn14Days: false // RED
        },
        {
          memberId: 'member-001',
          date: '2026-04-21',
          connectsPerDay: 18, // GREEN
          followUpsPerDay: 3,  // GREEN
          firstOrderIn14Days: true // GREEN
        }
      ];

      // Create KPIs
      for (const kpiData of sampleKPIs) {
        await request(app)
          .post('/api/kpi')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(kpiData);
      }

      // Step 2: Get rollup
      const rollupResponse = await request(app)
        .get('/api/kpi/member-001')
        .query({ window: 'daily', period: 7 });

      expect(rollupResponse.status).toBe(200);

      // Step 3: Verify status calculations
      const rollup = rollupResponse.body.rollup;

      // Average connects = (15 + 18) / 7 = 4.7 vs target 15 = RED
      expect(rollup.connects_per_day.status).toBe('RED');

      // Average follow-ups = (2 + 3) / 7 = 0.7 vs target 3 = RED
      expect(rollup.follow_ups_per_day.status).toBe('RED');

      // First order achieved = GREEN
      expect(rollup.first_order_14d.status).toBe('GREEN');
    });
  });
});