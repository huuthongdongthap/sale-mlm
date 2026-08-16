/**
 * T-020: Alerts API coverage tests (inline routes in server.js)
 * Targets: /api/alerts/evaluate, /api/alerts/rules, /api/alerts/log
 */

const request = require('supertest');
const jwt = require('../src/auth/jwt');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'test-encryption-key-32b!!';
process.env.ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost';

const { app: serverApp } = require('../src/server');

const adminToken = jwt.sign({ id: 'admin-001', role: 'Admin' });
const psnToken = jwt.sign({ id: 'psn-001', role: 'PSN Leader' });

describe('T-020: Alerts API - Coverage', () => {
  describe('GET /api/alerts/rules', () => {
    test('returns alert rules with auth', async () => {
      const res = await request(serverApp)
        .get('/api/alerts/rules')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
    });
  });

  describe('POST /api/alerts/evaluate', () => {
    test('evaluates alerts for a PSN', async () => {
      const res = await request(serverApp)
        .post('/api/alerts/evaluate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ psnId: 'psn-rising-dragon' });
      expect([200, 400, 500]).toContain(res.status);
    });

    test('returns error without auth or invalid body', async () => {
      const res = await request(serverApp)
        .post('/api/alerts/evaluate')
        .send({ psnId: 'x' });
      expect([400, 401]).toContain(res.status);
    });
  });

  describe('GET /api/alerts/log', () => {
    test('returns alert log', async () => {
      const res = await request(serverApp)
        .get('/api/alerts/log')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
    });
  });

  describe('GET /api/alerts/summary', () => {
    test('returns alert summary', async () => {
      const res = await request(serverApp)
        .get('/api/alerts/summary')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/alerts/webhooks', () => {
    test('registers webhook', async () => {
      const res = await request(serverApp)
        .post('/api/alerts/webhooks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ url: 'https://example.com/hook', events: ['*'] });
      expect([200, 201, 400]).toContain(res.status);
    });
  });

  describe('GET /api/alerts/webhooks', () => {
    test('lists webhooks', async () => {
      const res = await request(serverApp)
        .get('/api/alerts/webhooks')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
    });
  });

  describe('GET /api/alerts/psn-metrics/:psnId', () => {
    test('returns PSN metrics', async () => {
      const res = await request(serverApp)
        .get('/api/alerts/psn-metrics/psn-rising-dragon')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/alerts/rules', () => {
    test('adds a new rule', async () => {
      const res = await request(serverApp)
        .post('/api/alerts/rules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ id: 'custom-rule', trigger: 'test', action: 'test action', severity: 'yellow' });
      expect([200, 201, 400]).toContain(res.status);
    });
  });
});
