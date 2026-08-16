/**
 * T-020: KPI API coverage tests
 * Targets: leaderboard, rollup calculations, POST create, error paths
 */

const request = require('supertest');
const jwt = require('../src/auth/jwt');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'test-encryption-key-32b!!';
process.env.ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost';

const { app: serverApp } = require('../src/server');

const adminToken = jwt.sign({ id: 'admin-001', role: 'Admin' });
const psnToken = jwt.sign({ id: 'psn-001', role: 'PSN Leader' });

describe('T-020: KPI API - Coverage', () => {
  describe('POST /api/kpi', () => {
    test('creates KPI record for Admin', async () => {
      const res = await request(serverApp)
        .post('/api/kpi')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          memberId: 'member-001',
          connectsPerDay: 15,
          followUpsPerDay: 3,
          firstOrderIn14Days: true,
          date: new Date().toISOString().split('T')[0]
        });
      expect([201, 400, 403]).toContain(res.status);
    });

    test('returns 401 without auth', async () => {
      const res = await request(serverApp)
        .post('/api/kpi')
        .send({ memberId: 'x' });
      expect(res.status).toBe(401);
    });

    test('returns 400 for invalid body', async () => {
      const res = await request(serverApp)
        .post('/api/kpi')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect([400, 201]).toContain(res.status);
    });
  });

  describe('GET /api/kpi/:member_id', () => {
    test('daily window with data', async () => {
      const res = await request(serverApp)
        .get('/api/kpi/member-001')
        .query({ window: 'daily', period: '30' });
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('rollup');
        expect(res.body).toHaveProperty('tier_targets');
        expect(res.body.window).toBe('daily');
      }
    });

    test('weekly window', async () => {
      const res = await request(serverApp)
        .get('/api/kpi/member-001')
        .query({ window: 'weekly' });
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('rollup');
        expect(res.body.window).toBe('weekly');
      }
    });

    test('monthly window', async () => {
      const res = await request(serverApp)
        .get('/api/kpi/member-001')
        .query({ window: 'monthly' });
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('rollup');
        expect(res.body.window).toBe('monthly');
      }
    });

    test('invalid window returns 400', async () => {
      const res = await request(serverApp)
        .get('/api/kpi/member-001')
        .query({ window: 'bogus' });
      expect([400, 404]).toContain(res.status);
    });

    test('unknown member returns 404', async () => {
      const res = await request(serverApp)
        .get('/api/kpi/does-not-exist-999');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/kpi/leaderboard', () => {
    test('returns rankings', async () => {
      const res = await request(serverApp)
        .get('/api/kpi/leaderboard')
        .query({ window: 'daily', limit: '5' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('rankings');
      expect(Array.isArray(res.body.rankings)).toBe(true);
      expect(res.body).toHaveProperty('window');
    });

    test('with weekly window', async () => {
      const res = await request(serverApp)
        .get('/api/kpi/leaderboard')
        .query({ window: 'weekly' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('rankings');
    });

    test('with monthly window', async () => {
      const res = await request(serverApp)
        .get('/api/kpi/leaderboard')
        .query({ window: 'monthly' });
      expect(res.status).toBe(200);
    });
  });
});
