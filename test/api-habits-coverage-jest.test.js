/**
 * T-020: Habits API coverage tests
 * Targets: GET / with filters, POST /quick, connect/order items, snapshot error path
 */

const request = require('supertest');
const jwt = require('../src/auth/jwt');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'test-encryption-key-32b!!';
process.env.ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost';

const { app: serverApp } = require('../src/server');

describe('T-020: Habits API - Coverage', () => {
  describe('POST /api/habits/checkin', () => {
    test('with connect and order items', async () => {
      const res = await request(serverApp)
        .post('/api/habits/checkin')
        .send({
          member_id: 'cov-habit-member-1',
          date: new Date().toISOString().split('T')[0],
          items: ['5am', 'zoom', 'kaizen', 'connect', 'order', 10]
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.habit).toHaveProperty('connects');
    });

    test('with numeric string connect', async () => {
      const res = await request(serverApp)
        .post('/api/habits/checkin')
        .send({
          member_id: 'cov-habit-member-2',
          date: new Date().toISOString().split('T')[0],
          items: ['25']
        });
      expect(res.status).toBe(200);
    });

    test('missing member_id returns 400', async () => {
      const res = await request(serverApp)
        .post('/api/habits/checkin')
        .send({ items: ['5am'] });
      expect([400, 401]).toContain(res.status);
    });

    test('non-array items returns 400', async () => {
      const res = await request(serverApp)
        .post('/api/habits/checkin')
        .send({ member_id: 'x', items: 'not-array' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/habits', () => {
    test('returns all habits', async () => {
      const res = await request(serverApp).get('/api/habits');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('filters by memberId', async () => {
      const res = await request(serverApp)
        .get('/api/habits')
        .query({ memberId: 'cov-habit-member-1' });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('filters by date', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await request(serverApp)
        .get('/api/habits')
        .query({ date: today });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('filters by memberId and date', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await request(serverApp)
        .get('/api/habits')
        .query({ memberId: 'cov-habit-member-1', date: today });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/habits/streak/:memberId', () => {
    test('returns streak data', async () => {
      const res = await request(serverApp)
        .get('/api/habits/streak/cov-habit-member-1');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('memberId');
      expect(res.body).toHaveProperty('currentStreak');
      expect(res.body).toHaveProperty('totalDays');
    });

    test('returns zero streak for unknown member', async () => {
      const res = await request(serverApp)
        .get('/api/habits/streak/unknown-member-999');
      expect(res.status).toBe(200);
      expect(res.body.currentStreak).toBe(0);
    });
  });

  describe('POST /api/habits/quick', () => {
    test('5am action', async () => {
      const res = await request(serverApp)
        .post('/api/habits/quick')
        .send({ memberId: 'quick-member-1', action: '5am' });
      expect(res.status).toBe(200);
      expect(res.body.habit.wakeUp5am).toBe(true);
    });

    test('zoom action', async () => {
      const res = await request(serverApp)
        .post('/api/habits/quick')
        .send({ memberId: 'quick-member-2', action: 'zoom' });
      expect(res.status).toBe(200);
      expect(res.body.habit.zoomAttend).toBe(true);
    });

    test('kaizen action', async () => {
      const res = await request(serverApp)
        .post('/api/habits/quick')
        .send({ memberId: 'quick-member-3', action: 'kaizen' });
      expect(res.status).toBe(200);
      expect(res.body.habit.kaizenJournal).toBe(true);
    });

    test('connect action', async () => {
      const res = await request(serverApp)
        .post('/api/habits/quick')
        .send({ memberId: 'quick-member-4', action: 'connect' });
      expect(res.status).toBe(200);
    });

    test('order action', async () => {
      const res = await request(serverApp)
        .post('/api/habits/quick')
        .send({ memberId: 'quick-member-5', action: 'order' });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/habits/snapshot', () => {
    test('returns snapshot with default timezone', async () => {
      const res = await request(serverApp)
        .post('/api/habits/snapshot')
        .send({});
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('snapshotStatus', 'completed');
      expect(res.body).toHaveProperty('memberCount');
    });

    test('returns snapshot with custom timezone', async () => {
      const res = await request(serverApp)
        .post('/api/habits/snapshot')
        .send({ timezone: 'Asia/Tokyo' });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/habits/cron/midnight-snapshot', () => {
    test('returns stub snapshot', async () => {
      const res = await request(serverApp)
        .get('/api/habits/cron/midnight-snapshot');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('timezone');
    });
  });
});
