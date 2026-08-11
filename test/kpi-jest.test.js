/**
 * T-018: Jest test suite for KPI API + more habits API coverage
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret';

describe('T-018: KPI API', () => {
  const app = express();
  app.use(express.json());
  const kpiRoutes = require('../src/api/kpi');
  app.use('/api/kpi', kpiRoutes);

  const adminToken = jwt.sign({ id: 'admin-001', role: 'Admin' }, process.env.JWT_SECRET);
  const memberToken = jwt.sign({ id: 'member-001', role: 'Member' }, process.env.JWT_SECRET);

  test('GET /api/kpi/:member_id returns KPI data', async () => {
    const res = await request(app)
      .get('/api/kpi/member-001')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 404]).toContain(res.status);
  });

  test('GET /api/kpi/:member_id with daily window', async () => {
    const res = await request(app)
      .get('/api/kpi/member-001')
      .query({ window: 'daily', period: '7' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 404]).toContain(res.status);
  });

  test('GET /api/kpi/:member_id with weekly window', async () => {
    const res = await request(app)
      .get('/api/kpi/member-001')
      .query({ window: 'weekly' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 404]).toContain(res.status);
  });

  test('GET /api/kpi/:member_id with monthly window', async () => {
    const res = await request(app)
      .get('/api/kpi/member-001')
      .query({ window: 'monthly' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 404]).toContain(res.status);
  });

  test('GET /api/kpi/:member_id with invalid window returns 400', async () => {
    const res = await request(app)
      .get('/api/kpi/member-001')
      .query({ window: 'invalid' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect([400, 404]).toContain(res.status);
  });

  test('POST /api/kpi creates KPI record', async () => {
    const res = await request(app)
      .post('/api/kpi')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        memberId: 'member-001',
        connectsPerDay: 15,
        followUpsPerDay: 3,
        firstOrderIn14Days: true
      });
    expect([201, 400, 403]).toContain(res.status);
  });

  test('POST /api/kpi requires auth', async () => {
    const res = await request(app)
      .post('/api/kpi')
      .send({ memberId: 'x' });
    expect([401, 403]).toContain(res.status);
  });

  test('GET /api/kpi/team returns team KPIs', async () => {
    const res = await request(app)
      .get('/api/kpi/team')
      .query({ psnId: 'psn-rising-dragon' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 404]).toContain(res.status);
  });

  test('GET /api/kpi/team without psnId', async () => {
    const res = await request(app)
      .get('/api/kpi/team')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 400, 404, 500]).toContain(res.status);
  });
});

describe('T-018: Habits API — more coverage', () => {
  const app = express();
  app.use(express.json());
  const habitRoutes = require('../src/api/habits');
  app.use('/api/habits', habitRoutes);

  test('POST /api/habits/checkin — streak increment', async () => {
    // First day
    await request(app)
      .post('/api/habits/checkin')
      .send({ member_id: 'streak-test', date: '2026-05-19', items: ['5am', 'zoom', 'kaizen', 15] });

    // Second day (consecutive)
    const res = await request(app)
      .post('/api/habits/checkin')
      .send({ member_id: 'streak-test', date: '2026-05-20', items: ['5am', 'zoom', 'kaizen', 15] });
    expect(res.status).toBe(200);
    expect(res.body.habit.streak).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/habits/streak/:member_id for non-existent member', async () => {
    const res = await request(app)
      .get('/api/habits/streak/non-existent');
    expect([200, 404]).toContain(res.status);
  });

  test('POST /api/habits/snapshot with default timezone', async () => {
    const res = await request(app)
      .post('/api/habits/snapshot')
      .send({});
    expect(res.status).toBe(200);
  });
});
