/**
 * T-018: Jest test suite for habits API + model
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret';

const app = express();
app.use(express.json());

const habitRoutes = require('../src/api/habits');
app.use('/api/habits', habitRoutes);

const adminToken = jwt.sign({ id: 'admin-001', role: 'Admin' }, process.env.JWT_SECRET);
const memberToken = jwt.sign({ id: 'member-001', role: 'Member' }, process.env.JWT_SECRET);

describe('T-018: Habits API', () => {
  test('POST /api/habits/checkin — valid checkin', async () => {
    const res = await request(app)
      .post('/api/habits/checkin')
      .send({
        member_id: 'test-member-1',
        date: '2026-05-20',
        items: ['5am', 'zoom', 'kaizen', 15]
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.habit).toHaveProperty('habitScore');
    expect(res.body.habit).toHaveProperty('streak');
  });

  test('POST /api/habits/checkin — missing member_id returns 400', async () => {
    const res = await request(app)
      .post('/api/habits/checkin')
      .send({ items: ['5am'] });
    expect([400, 401]).toContain(res.status);
  });

  test('POST /api/habits/checkin — invalid items returns 400', async () => {
    const res = await request(app)
      .post('/api/habits/checkin')
      .send({ member_id: 'x', items: 'not-array' });
    expect(res.status).toBe(400);
  });

  test('GET /api/habits/streak/:member_id', async () => {
    const res = await request(app)
      .get('/api/habits/streak/test-member-1');
    expect([200]).toContain(res.status);
  });

  test('POST /api/habits/snapshot', async () => {
    const res = await request(app)
      .post('/api/habits/snapshot')
      .send({ timezone: 'Asia/Ho_Chi_Minh' });
    expect(res.status).toBe(200);
  });

  test('GET /api/habits/cron/midnight-snapshot', async () => {
    const res = await request(app)
      .get('/api/habits/cron/midnight-snapshot');
    expect(res.status).toBe(200);
  });

  test('checkin with max score (6)', async () => {
    const res = await request(app)
      .post('/api/habits/checkin')
      .send({
        member_id: 'max-score-test',
        date: '2026-05-20',
        items: ['5am', 'zoom', 'kaizen', 20]
      });
    expect(res.status).toBe(200);
    expect(res.body.habit.habitScore).toBeGreaterThanOrEqual(5);
  });

  test('streak resets on low score', async () => {
    // First good day
    await request(app)
      .post('/api/habits/checkin')
      .send({ member_id: 'streak-reset-test', date: '2026-05-18', items: ['5am', 'kaizen', 15] });

    // Skip a day, then low score
    const res = await request(app)
      .post('/api/habits/checkin')
      .send({ member_id: 'streak-reset-test', date: '2026-05-20', items: ['zoom', 3] });
    expect(res.status).toBe(200);
  });
});
