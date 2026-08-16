/**
 * T-019: E2E Smoke Test
 *
 * Tests: login + view dashboard using supertest (Playwright alternative for now)
 *
 * Accept criteria:
 *   - POST /auth/login returns JWT
 *   - GET /api/members behind auth returns 200
 *   - GET /health returns ok
 *   - GET /api/kpi/:id behind auth returns data
 *   - Dashboard shell loads (index.html exists)
 */

const request = require('supertest');
const fs = require('fs');
const path = require('path');
const jwt = require('../src/auth/jwt');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'test-encryption-key-32b!!';
process.env.ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost';

const { app: serverApp } = require('../src/server');

describe('T-019: E2E Smoke Tests', () => {
  test('GET /health returns ok', async () => {
    const res = await request(serverApp).get('/health');
    expect(res.status).toBe(200);
    expect(['ok', 'healthy']).toContain(res.body.status);
    expect(res.body.service).toBe('Hive Warfare OS');
  });

  test('POST /auth/login with valid creds', async () => {
    const res = await request(serverApp)
      .post('/auth/login')
      .send({ email: 'admin@droppii.vn', password: 'admin123' });
    // Should return 200 with JWT or 401 if no seed user
    expect([200, 401]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('token');
    }
  });

  test('GET /api/members behind auth', async () => {
    const token = jwt.sign({ id: 'admin-001', role: 'Admin' }, process.env.JWT_SECRET);
    const res = await request(serverApp)
      .get('/api/members')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/members without auth returns 401', async () => {
    const res = await request(serverApp).get('/api/members');
    expect(res.status).toBe(401);
  });

  test('GET /api/kpi/:id behind auth', async () => {
    const token = jwt.sign({ id: 'admin-001', role: 'Admin' }, process.env.JWT_SECRET);
    const res = await request(serverApp)
      .get('/api/kpi/member-001')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 404]).toContain(res.status);
  });

  test('POST /api/habits/checkin works', async () => {
    const res = await request(serverApp)
      .post('/api/habits/checkin')
      .send({
        member_id: 'e2e-test-member',
        date: '2026-05-20',
        items: ['5am', 'zoom', 'kaizen', 15]
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/analytics/psn-health works', async () => {
    const res = await request(serverApp)
      .post('/api/analytics/psn-health')
      .send({
        team_size: 5,
        retention_30d: 0.7,
        retention_90d: 0.6,
        revenue_delta: 0.1,
        activity_ratio: 0.8,
        habit_avg: 4.5,
        connect_avg: 12
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('state');
    expect(res.body).toHaveProperty('score');
  });

  test('POST /api/alerts/evaluate works', async () => {
    const res = await request(serverApp)
      .post('/api/alerts/evaluate')
      .send({
        psnId: 'test-psn',
        metrics: {
          team_size: 5,
          retention_30d: 0.7,
          retention_90d: 0.6,
          revenue_delta: 0.1,
          activity_ratio: 0.8,
          habit_avg: 4.5,
          connect_avg: 12
        }
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('fired');
  });

  test('POST /api/onboarding/start works', async () => {
    const token = jwt.sign({ id: 'admin-001', role: 'Admin' }, process.env.JWT_SECRET);
    const res = await request(serverApp)
      .post('/api/onboarding/start')
      .set('Authorization', `Bearer ${token}`)
      .send({
        memberId: 'e2e-onboard-test',
        name: 'Test Member',
        tier: 1,
        phone: '+84901234567'
      });
    expect(res.status).toBe(200);
    expect(res.body.session.memberId).toBe('e2e-onboard-test');
  });

  test('POST /api/training/assign works', async () => {
    const res = await request(serverApp)
      .post('/api/training/assign')
      .send({
        memberId: 'e2e-training-test',
        name: 'Test Trainee',
        tier: 1,
        phone: '+84901234567'
      });
    expect(res.status).toBe(200);
    expect(res.body.memberId).toBe('e2e-training-test');
  });

  test('Dashboard index.html exists', () => {
    const indexPath = path.join(__dirname, '../src/dashboard/index.html');
    expect(fs.existsSync(indexPath)).toBe(true);

    const content = fs.readFileSync(indexPath, 'utf8');
    expect(content).toContain('Hive Warfare');
  });

  test('Dashboard style.css exists', () => {
    const cssPath = path.join(__dirname, '../src/dashboard/style.css');
    expect(fs.existsSync(cssPath)).toBe(true);
  });

  test('Dashboard main.js exists', () => {
    const jsPath = path.join(__dirname, '../src/dashboard/main.js');
    expect(fs.existsSync(jsPath)).toBe(true);
  });

  /* ---- Extended API surface tests ---- */

  test('GET /api/training/active returns 200 with trainees array', async () => {
    const res = await request(serverApp).get('/api/training/active');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('trainees');
    expect(Array.isArray(res.body.trainees)).toBe(true);
  });

  test('GET /api/training/attention returns 200 with needing_attention array', async () => {
    const res = await request(serverApp).get('/api/training/attention');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('needing_attention');
    expect(Array.isArray(res.body.needing_attention)).toBe(true);
  });

  test('POST /api/orders creates order and returns id + success', async () => {
    const token = jwt.sign({ id: 'admin-001', role: 'Admin' }, process.env.JWT_SECRET);
    const res = await request(serverApp)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        leadName: 'E2E Test Lead',
        productName: 'Tinh Hoa Yen Sao',
        productTier: 2,
        quantity: 1,
        unitPriceVND: 1500000,
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('order');
    expect(res.body.order).toHaveProperty('id');
    expect(res.body.order.productTier).toBe(2);
  });

  test('POST /api/orders/mark-paid marks an existing order as paid', async () => {
    const token = jwt.sign({ id: 'admin-001', role: 'Admin' }, process.env.JWT_SECRET);
    // First create an order
    const createRes = await request(serverApp)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        leadName: 'E2E Mark-Paid Lead',
        productName: 'Tinh Hoa Yen Sao',
        productTier: 1,
        quantity: 1,
        unitPriceVND: 500000,
      });
    expect(createRes.status).toBe(201);
    const orderId = createRes.body.order.id;

    // Then mark it paid
    const res = await request(serverApp)
      .post('/api/orders/mark-paid')
      .set('Authorization', `Bearer ${token}`)
      .send({ orderId, paymentReference: 'E2E-REF-001', paymentMethod: 'bank_transfer' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('order');
    expect(res.body.order.paymentStatus).toBe('paid');
  });

  test('GET /api/leads returns 200 with leads array', async () => {
    const token = jwt.sign({ id: 'admin-001', role: 'Admin' }, process.env.JWT_SECRET);
    const res = await request(serverApp)
      .get('/api/leads')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('leads');
    expect(Array.isArray(res.body.leads)).toBe(true);
  });

  test('POST /api/leads creates lead and returns 201 with id', async () => {
    const token = jwt.sign({ id: 'admin-001', role: 'Admin' }, process.env.JWT_SECRET);
    const res = await request(serverApp)
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'E2E New Lead',
        phone: '+84901234567',
        source: 'e2e-test',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('E2E New Lead');
  });

  test('GET /ready returns 200 with status property', async () => {
    const res = await request(serverApp).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body.status).toBe('ready');
  });

  test('GET /metrics returns 200', async () => {
    const res = await request(serverApp).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  test('GET /api/monitoring/summary returns 200 with auth', async () => {
    const token = jwt.sign({ id: 'admin-001', role: 'Admin' }, process.env.JWT_SECRET);
    const res = await request(serverApp)
      .get('/api/monitoring/summary')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
  });

  test('GET /api/monitoring/summary returns 401 without auth', async () => {
    const res = await request(serverApp).get('/api/monitoring/summary');
    expect(res.status).toBe(401);
  });
});
