/**
 * T-020: Funnel Analytics API — Jest tests
 */

const request = require('supertest');
const jwt = require('../src/auth/jwt');

process.env.JWT_SECRET = 'test-secret';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32b!!';
process.env.ALLOWED_ORIGIN = 'http://localhost';

// Import the full server app for integration tests
const { app: serverApp } = require('../src/server');

const testToken = jwt.sign({ id: 'test-user', role: 'Admin' });
const psnLeaderToken = jwt.sign({ id: 'psn-leader-001', role: 'PSN Leader' });
const memberToken = jwt.sign({ id: 'member-001', role: 'Member' });

describe('T-020: Funnel Analytics API', () => {
  describe('GET /api/analytics/funnel', () => {
    test('returns tier counts, conversion rates, and revenue for Admin', async () => {
      const res = await request(serverApp)
        .get('/api/analytics/funnel')
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('counts');
      expect(res.body).toHaveProperty('rates');
      expect(res.body).toHaveProperty('revenue');
      expect(res.body).toHaveProperty('totalLeads');
      expect(Array.isArray(res.body.counts)).toBe(true);
      expect(res.body.counts.length).toBe(5);
      expect(Array.isArray(res.body.rates)).toBe(true);
      expect(res.body.rates.length).toBe(4); // 4 transitions between 5 tiers
      expect(Array.isArray(res.body.revenue)).toBe(true);
      expect(res.body.revenue.length).toBe(5);
    });

    test('returns tier counts for PSN Leader', async () => {
      const res = await request(serverApp)
        .get('/api/analytics/funnel')
        .set('Authorization', `Bearer ${psnLeaderToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('counts');
    });

    test('returns 401 without auth', async () => {
      const res = await request(serverApp).get('/api/analytics/funnel');
      expect(res.status).toBe(401);
    });

    test('counts structure includes tier, name, count', async () => {
      const res = await request(serverApp)
        .get('/api/analytics/funnel')
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.body.counts[0]).toHaveProperty('tier');
      expect(res.body.counts[0]).toHaveProperty('name');
      expect(res.body.counts[0]).toHaveProperty('count');
      expect(res.body.counts[0].name).toBe('Lead Magnet');
    });

    test('rates structure includes fromTier, toTier, conversionRate', async () => {
      const res = await request(serverApp)
        .get('/api/analytics/funnel')
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.body.rates[0]).toHaveProperty('fromTier');
      expect(res.body.rates[0]).toHaveProperty('toTier');
      expect(res.body.rates[0]).toHaveProperty('conversionRate');
    });

    test('revenue structure includes tier, tierName, orderCount, revenue', async () => {
      const res = await request(serverApp)
        .get('/api/analytics/funnel')
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.body.revenue[0]).toHaveProperty('tier');
      expect(res.body.revenue[0]).toHaveProperty('tierName');
      expect(res.body.revenue[0]).toHaveProperty('orderCount');
      expect(res.body.revenue[0]).toHaveProperty('revenue');
    });
  });

  describe('GET /api/analytics/funnel/stats', () => {
    test('returns avg time in stage, drop-off rates, top performers for Admin', async () => {
      const res = await request(serverApp)
        .get('/api/analytics/funnel/stats')
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('avgTimeInStage');
      expect(res.body).toHaveProperty('dropoffRates');
      expect(res.body).toHaveProperty('topPerformers');
      expect(Array.isArray(res.body.avgTimeInStage)).toBe(true);
      expect(res.body.avgTimeInStage.length).toBe(5);
      expect(Array.isArray(res.body.dropoffRates)).toBe(true);
      expect(res.body.dropoffRates.length).toBe(5);
      expect(Array.isArray(res.body.topPerformers)).toBe(true);
    });

    test('returns stats for PSN Leader', async () => {
      const res = await request(serverApp)
        .get('/api/analytics/funnel/stats')
        .set('Authorization', `Bearer ${psnLeaderToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('avgTimeInStage');
    });

    test('returns 401 without auth', async () => {
      const res = await request(serverApp).get('/api/analytics/funnel/stats');
      expect(res.status).toBe(401);
    });

    test('avgTimeInStage structure includes tier, name, avgDays', async () => {
      const res = await request(serverApp)
        .get('/api/analytics/funnel/stats')
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.body.avgTimeInStage[0]).toHaveProperty('tier');
      expect(res.body.avgTimeInStage[0]).toHaveProperty('name');
      expect(res.body.avgTimeInStage[0]).toHaveProperty('avgDays');
    });

    test('dropoffRates structure includes tier, name, dropoffPct', async () => {
      const res = await request(serverApp)
        .get('/api/analytics/funnel/stats')
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.body.dropoffRates[0]).toHaveProperty('tier');
      expect(res.body.dropoffRates[0]).toHaveProperty('name');
      expect(res.body.dropoffRates[0]).toHaveProperty('dropoffPct');
    });

    test('topPerformers structure includes ctvId, name, convertedCount', async () => {
      const res = await request(serverApp)
        .get('/api/analytics/funnel/stats')
        .set('Authorization', `Bearer ${testToken}`);
      if (res.body.topPerformers.length > 0) {
        expect(res.body.topPerformers[0]).toHaveProperty('ctvId');
        expect(res.body.topPerformers[0]).toHaveProperty('name');
        expect(res.body.topPerformers[0]).toHaveProperty('convertedCount');
      }
    });
  });

  describe('POST /api/analytics/funnel/export', () => {
    test('returns CSV export for PSN Leader', async () => {
      const res = await request(serverApp)
        .post('/api/analytics/funnel/export')
        .set('Authorization', `Bearer ${psnLeaderToken}`);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('funnel-export.csv');
      expect(res.text).toContain('ID');
      expect(res.text).toContain('Name');
      expect(res.text).toContain('Phone');
    });

    test('returns CSV export for Admin', async () => {
      const res = await request(serverApp)
        .post('/api/analytics/funnel/export')
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
    });

    test('returns 403 for Member role', async () => {
      const res = await request(serverApp)
        .post('/api/analytics/funnel/export')
        .set('Authorization', `Bearer ${memberToken}`);
      expect(res.status).toBe(403);
    });

    test('returns 401 without auth', async () => {
      const res = await request(serverApp)
        .post('/api/analytics/funnel/export');
      expect(res.status).toBe(401);
    });
  });

  describe('Tier labels match frontend', () => {
    test('tier labels match expected values', async () => {
      const res = await request(serverApp)
        .get('/api/analytics/funnel')
        .set('Authorization', `Bearer ${testToken}`);
      const expectedLabels = ['Lead Magnet', 'Trial', 'Health Active', 'Combo', 'CTV Partner'];
      res.body.counts.forEach((count, i) => {
        expect(count.name).toBe(expectedLabels[i]);
      });
    });

    test('stats tier labels match expected values', async () => {
      const res = await request(serverApp)
        .get('/api/analytics/funnel/stats')
        .set('Authorization', `Bearer ${testToken}`);
      const expectedLabels = ['Lead Magnet', 'Trial', 'Health Active', 'Combo', 'CTV Partner'];
      res.body.avgTimeInStage.forEach((stat, i) => {
        expect(stat.name).toBe(expectedLabels[i]);
      });
      res.body.dropoffRates.forEach((stat, i) => {
        expect(stat.name).toBe(expectedLabels[i]);
      });
    });
  });
});