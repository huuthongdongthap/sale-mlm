/**
 * T-006: Alert Rules Engine — Jest tests
 */

const request = require('supertest');
const express = require('express');
const jwt = require('../src/auth/jwt');
const alertsRoutes = require('../src/api/alerts');

// Import the full server app for integration tests
const { app, getSubscriptions, unsubscribeWebhook } = require('../src/server');

const legacyApp = express();
legacyApp.use(express.json());
legacyApp.use('/api/alerts', alertsRoutes);

// Create a valid token for testing
const testToken = jwt.sign({ id: 'test-user', role: 'Admin' });

describe('T-006: Alert Rules Engine (Legacy)', () => {
  test('GET /api/alerts/rules returns rule list', async () => {
    const res = await request(legacyApp)
      .get('/api/alerts/rules')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('POST /api/alerts/check triggers multiple alerts', async () => {
    const res = await request(legacyApp)
      .post('/api/alerts/check')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        memberId: 'test-member',
        habitScore: 2,
        conversionRate: 10,
        leadsWeek: 50,
        psnAvgHabit: 2,
        retentionRisk: 'high',
        q2Pct: 30
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('alertsTriggered');
    expect(res.body.alertsTriggered).toBeGreaterThan(0);
    expect(Array.isArray(res.body.alerts)).toBe(true);
  });

  test('POST /api/alerts/check no triggers', async () => {
    const res = await request(legacyApp)
      .post('/api/alerts/check')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        memberId: 'test-member',
        habitScore: 5,
        conversionRate: 20,
        leadsWeek: 150,
        psnAvgHabit: 5,
        retentionRisk: 'low',
        q2Pct: 60
      });
    expect(res.status).toBe(200);
    expect(res.body.alertsTriggered).toBe(0);
  });

  test('GET /api/alerts/log returns history', async () => {
    const res = await request(legacyApp)
      .get('/api/alerts/log')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('T-006: Alert Engine — Webhook Management', () => {
  beforeEach(() => {
    // Clear webhooks before each test
    const subs = getSubscriptions();
    subs.forEach(s => unsubscribeWebhook(s.id));
  });

  test('POST /api/alerts/webhooks creates subscription', async () => {
    const res = await request(app)
      .post('/api/alerts/webhooks')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ url: 'https://example.com/webhook', events: ['auto_buddy', 'notify_leader'] });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.url).toBe('https://example.com/webhook');
    expect(res.body.events).toEqual(['auto_buddy', 'notify_leader']);
  });

  test('GET /api/alerts/webhooks returns subscriptions', async () => {
    await request(app)
      .post('/api/alerts/webhooks')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ url: 'https://example.com/webhook2', events: ['*'] });

    const res = await request(app)
      .get('/api/alerts/webhooks')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(200);
    expect(res.body.subscriptions.length).toBeGreaterThan(0);
  });

  test('DELETE /api/alerts/webhooks/:id removes subscription', async () => {
    const createRes = await request(app)
      .post('/api/alerts/webhooks')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ url: 'https://example.com/webhook3', events: ['escalate'] });

    const res = await request(app)
      .delete(`/api/alerts/webhooks/${createRes.body.id}`)
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const getRes = await request(app)
      .get('/api/alerts/webhooks')
      .set('Authorization', `Bearer ${testToken}`);
    expect(getRes.body.subscriptions.find(s => s.id === createRes.body.id)).toBeUndefined();
  });
});

describe('T-006: Alert Engine — Scheduled Evaluation', () => {
  test('POST /api/alerts/evaluate-scheduled triggers evaluation', async () => {
    const res = await request(app)
      .post('/api/alerts/evaluate-scheduled')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('evaluation triggered');
  });

  test('GET /api/alerts/psn-metrics/:psnId returns computed metrics', async () => {
    const res = await request(app)
      .get('/api/alerts/psn-metrics/psn-001')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('team_size');
    expect(res.body).toHaveProperty('retention_30d');
    expect(res.body).toHaveProperty('habit_avg');
    expect(res.body).toHaveProperty('connect_avg');
  });
});

describe('T-006: Alert Engine — Alert Rules CRUD', () => {
  test('POST /api/alerts/rules creates new rule', async () => {
    const newRule = {
      id: 'test-custom-rule',
      name: 'Test Custom Rule',
      metric: 'habit_avg',
      op: '<',
      threshold: 3,
      window: 'daily',
      action: 'notify_leader',
      severity: 'warning',
      message: 'Custom test rule'
    };
    const res = await request(app)
      .post('/api/alerts/rules')
      .set('Authorization', `Bearer ${testToken}`)
      .send(newRule);
    expect(res.status).toBe(201);
    expect(res.body.id).toBe('test-custom-rule');
    expect(res.body.name).toBe('Test Custom Rule');
  });

  test('PUT /api/alerts/rules/:id updates rule', async () => {
    const res = await request(app)
      .put('/api/alerts/rules/test-custom-rule')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ threshold: 2.5, severity: 'critical' });
    expect(res.status).toBe(200);
    expect(res.body.threshold).toBe(2.5);
    expect(res.body.severity).toBe('critical');
  });

  test('DELETE /api/alerts/rules/:id removes rule', async () => {
    const res = await request(app)
      .delete('/api/alerts/rules/test-custom-rule')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const getRes = await request(app)
      .get('/api/alerts/rules')
      .set('Authorization', `Bearer ${testToken}`);
    expect(getRes.body.rules.find(r => r.id === 'test-custom-rule')).toBeUndefined();
  });
});

describe('T-006: Alert Engine — Full Flow Integration', () => {
  test('Full flow: onboarding → training → PSN metrics → alert evaluation', async () => {
    // This test verifies the integration chain works end-to-end
    // 1. Create a member first (since onboarding doesn't auto-create members)
    const memberRes = await request(app)
      .post('/api/members')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Flow Test Member',
        email: 'flow@test.com',
        phone: '+84901234567',
        role: 'Member',
        tier: 1,
        psnId: 'psn-flow-test'
      });
    expect(memberRes.status).toBe(201);
    const memberId = memberRes.body.data.id;

    // 2. Start onboarding for that member
    const onboardRes = await request(app)
      .post('/api/onboarding/start')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        memberId,
        name: 'Flow Test Member',
        tier: 1,
        phone: '+84901234567',
        psnId: 'psn-flow-test'
      });
    expect(onboardRes.status).toBe(200);
    expect(onboardRes.body.session.memberId).toBe(memberId);

    // 3. Compute PSN metrics
    const metricsRes = await request(app)
      .get('/api/alerts/psn-metrics/psn-flow-test')
      .set('Authorization', `Bearer ${testToken}`);
    expect(metricsRes.status).toBe(200);
    expect(metricsRes.body.team_size).toBeGreaterThanOrEqual(1);

    // 4. Evaluate alerts
    const evalRes = await request(app)
      .post('/api/alerts/evaluate')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ metrics: metricsRes.body, psnId: 'psn-flow-test' });
    expect(evalRes.status).toBe(200);
    expect(evalRes.body).toHaveProperty('fired');
    expect(Array.isArray(evalRes.body.fired)).toBe(true);
  });
});
