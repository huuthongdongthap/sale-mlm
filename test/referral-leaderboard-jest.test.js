/**
 * Referral system + leader dashboard integration tests.
 * Covers persistence through the DB adapter and route wiring at /scaling.
 */
process.env.JWT_SECRET = 'test-secret';
process.env.PASSWORD_SALT = 'test-salt-change-in-production';

const request = require('supertest');

// In-memory SQLite-backed adapter matching the local-adapter interface
const { LocalDatabaseAdapter } = require('../src/db/local-adapter');
const referral = require('../src/features/referral');

let app;

beforeAll(async () => {
  process.env.MEMBERS_DB = JSON.stringify([{
    member: {
      id: 'admin-001', name: 'Admin', email: 'admin@droppii.vn',
      role: 'Admin', tier: 3, psnId: 'psn-rising-dragon', status: 'active'
    },
    passwordHash: require('../src/auth/password').hashPassword('admin123')
  }]);

  const { app: serverApp } = require('../src/server');
  app = serverApp;
  // Bind the same store the server bound (server does this when db exists)
  const db = app.get('db');
  if (db) referral.setReferralStore(db);
});

describe('Referral feature (persistence layer)', () => {
  test('createReferralCode derives HIVE- code from member id', () => {
    expect(referral.createReferralCode('member-12345678')).toBe('HIVE-MEMBER-1');
  });

  test('record + stats + activate round-trip through DB', async () => {
    const record = await referral.recordReferral('referrer-x', 'referee-y');
    expect(record.id).toBeDefined();
    expect(record.status).toBe('pending');

    let stats = await referral.getReferralStats('referrer-x');
    expect(stats.totalReferrals).toBe(1);
    expect(stats.activeReferrals).toBe(0);
    expect(stats.currentTier).toBe(0);

    await referral.activateReferral(record.id);

    stats = await referral.getReferralStats('referrer-x');
    expect(stats.activeReferrals).toBe(1);
    expect(stats.currentTier).toBe(1);
  });

  test('leaderboard ranks referrers by active count', async () => {
    for (let i = 0; i < 2; i++) {
      const r = await referral.recordReferral('referrer-z', `referee-${i}`);
      await referral.activateReferral(r.id);
    }
    const leaderboard = await referral.getLeaderboard(10);
    const entry = leaderboard.find(e => e.referrerId === 'referrer-z');
    expect(entry.count).toBe(2);
  });
});

describe('Leader dashboard routes (/scaling)', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@droppii.vn', password: 'admin123' });
    token = res.body.token;
  });

  test('POST /scaling/referral/code returns code', async () => {
    const res = await request(app)
      .post('/scaling/referral/code')
      .set('Authorization', `Bearer ${token}`)
      .send({ memberId: 'member-abcd1234' });
    expect(res.status).toBe(200);
    expect(res.body.code).toBe('HIVE-MEMBER-A');
  });

  test('POST /scaling/referral/code rejects missing memberId', async () => {
    const res = await request(app)
      .post('/scaling/referral/code')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  test('POST /scaling/referral/record persists referral', async () => {
    const res = await request(app)
      .post('/scaling/referral/record')
      .set('Authorization', `Bearer ${token}`)
      .send({ referrerId: 'route-referrer', newMemberId: 'route-new-member' });
    expect(res.status).toBe(201);
    expect(res.body.referrerId).toBe('route-referrer');
  });

  test('GET /scaling/referral/stats/:memberId returns counts', async () => {
    const res = await request(app)
      .get('/scaling/referral/stats/route-referrer')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.totalReferrals).toBeGreaterThanOrEqual(1);
  });

  test('GET /scaling/progress computes live member metrics from DB', async () => {
    const res = await request(app)
      .get('/scaling/progress')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.target_members).toBe(50);
    expect(typeof res.body.current_members).toBe('number');
    expect(res.body.current_members).toBeGreaterThan(0);
  });

  test('routes require auth', async () => {
    const res = await request(app).get('/scaling/progress');
    expect(res.status).toBe(401);
  });
});
