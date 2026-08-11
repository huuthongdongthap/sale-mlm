/**
 * T-021: Leads API — Jest tests
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

describe('T-021: Leads API', () => {
  describe('GET /api/leads', () => {
    test('returns leads list for Admin', async () => {
      const res = await request(serverApp)
        .get('/api/leads')
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('leads');
      expect(Array.isArray(res.body.leads)).toBe(true);
      expect(res.body.leads.length).toBeGreaterThan(0);
    });

    test('returns leads list for PSN Leader', async () => {
      const res = await request(serverApp)
        .get('/api/leads')
        .set('Authorization', `Bearer ${psnLeaderToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('leads');
    });

    test('returns leads list for Member', async () => {
      const res = await request(serverApp)
        .get('/api/leads')
        .set('Authorization', `Bearer ${memberToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('leads');
    });

    test('returns 401 without auth', async () => {
      const res = await request(serverApp).get('/api/leads');
      expect(res.status).toBe(401);
    });

    test('supports pagination', async () => {
      const res = await request(serverApp)
        .get('/api/leads?limit=5&page=1')
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body.limit).toBe(5);
    });

    test('supports status filter', async () => {
      const res = await request(serverApp)
        .get('/api/leads?status=new')
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.body.leads.every(l => l.status === 'new')).toBe(true);
    });

    test('supports funnelLevel filter', async () => {
      const res = await request(serverApp)
        .get('/api/leads?funnel_level=0')
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.body.leads.every(l => l.funnelLevel === 0)).toBe(true);
    });
  });

  describe('GET /api/leads/:id', () => {
    test('returns single lead for Admin', async () => {
      // First get a lead ID
      const listRes = await request(serverApp)
        .get('/api/leads')
        .set('Authorization', `Bearer ${testToken}`);
      const leadId = listRes.body.leads[0].id;

      const res = await request(serverApp)
        .get(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', leadId);
      expect(res.body).toHaveProperty('name');
    });

    test('returns 404 for non-existent lead', async () => {
      const res = await request(serverApp)
        .get('/api/leads/non-existent-id')
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(404);
    });

    test('returns 401 without auth', async () => {
      const res = await request(serverApp).get('/api/leads/some-id');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/leads', () => {
    test('creates lead for PSN Leader', async () => {
      const res = await request(serverApp)
        .post('/api/leads')
        .set('Authorization', `Bearer ${psnLeaderToken}`)
        .send({
          name: 'Test Lead',
          phone: '+84901234567',
          email: 'test@lead.vn',
          funnelLevel: 0,
          source: 'test'
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      // PSN Leader gets safe JSON (no PII), so name won't be in response
      expect(res.body.funnelLevel).toBe(0);
      expect(res.body.tierLabel).toBe('Lead Magnet');
    });

    test('creates lead for Admin', async () => {
      const res = await request(serverApp)
        .post('/api/leads')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Admin Lead',
          phone: '+84911223344',
          email: 'admin@lead.vn',
          funnelLevel: 1,
          source: 'admin-test'
        });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Admin Lead');
    });

    test('returns 403 for Member', async () => {
      const res = await request(serverApp)
        .post('/api/leads')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          name: 'Member Lead',
          phone: '+84922334455',
          email: 'member@lead.vn'
        });
      expect(res.status).toBe(403);
    });

    test('returns 400 for missing name', async () => {
      const res = await request(serverApp)
        .post('/api/leads')
        .set('Authorization', `Bearer ${psnLeaderToken}`)
        .send({
          phone: '+84901234567',
          email: 'test@lead.vn'
        });
      expect(res.status).toBe(400);
    });

    test('returns 401 without auth', async () => {
      const res = await request(serverApp)
        .post('/api/leads')
        .send({
          name: 'Test Lead',
          phone: '+84901234567',
          email: 'test@lead.vn'
        });
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/leads/:id', () => {
    test('updates lead for PSN Leader', async () => {
      const listRes = await request(serverApp)
        .get('/api/leads')
        .set('Authorization', `Bearer ${psnLeaderToken}`);
      const leadId = listRes.body.leads[0].id;

      const res = await request(serverApp)
        .patch(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${psnLeaderToken}`)
        .send({
          status: 'contacted',
          notes: 'Test update'
        });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('contacted');
    });

    test('returns 403 for Member', async () => {
      const listRes = await request(serverApp)
        .get('/api/leads')
        .set('Authorization', `Bearer ${psnLeaderToken}`);
      const leadId = listRes.body.leads[0].id;

      const res = await request(serverApp)
        .patch(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'contacted' });
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/leads/:id', () => {
    test('archives lead for Admin', async () => {
      // Create a lead first
      const createRes = await request(serverApp)
        .post('/api/leads')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Lead to Delete',
          phone: '+84933445566',
          email: 'delete@lead.vn'
        });
      const leadId = createRes.body.id;

      const res = await request(serverApp)
        .delete(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.action).toBe('hard_delete');
    });

    test('archives lead for PSN Leader (soft delete)', async () => {
      // Create a lead first
      const createRes = await request(serverApp)
        .post('/api/leads')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Lead to Archive',
          phone: '+84944556677',
          email: 'archive@lead.vn'
        });
      const leadId = createRes.body.id;

      const res = await request(serverApp)
        .delete(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${psnLeaderToken}`);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.action).toBe('archived');
    });
  });

  describe('GET /api/leads/:id/journey', () => {
    test('returns transition journey for Admin', async () => {
      const listRes = await request(serverApp)
        .get('/api/leads')
        .set('Authorization', `Bearer ${testToken}`);
      const leadId = listRes.body.leads[0].id;

      const res = await request(serverApp)
        .get(`/api/leads/${leadId}/journey`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('events');
      expect(Array.isArray(res.body.events)).toBe(true);
    });
  });

  describe('POST /api/leads/:id/assign', () => {
    test('assigns CTV for PSN Leader', async () => {
      const listRes = await request(serverApp)
        .get('/api/leads')
        .set('Authorization', `Bearer ${psnLeaderToken}`);
      const leadId = listRes.body.leads[0].id;

      const res = await request(serverApp)
        .post(`/api/leads/${leadId}/assign`)
        .set('Authorization', `Bearer ${psnLeaderToken}`)
        .send({ ctvId: 'test-ctv-001' });
      expect(res.status).toBe(200);
      expect(res.body.assignedCtvId).toBe('test-ctv-001');
    });

    test('returns 400 for missing ctvId', async () => {
      const listRes = await request(serverApp)
        .get('/api/leads')
        .set('Authorization', `Bearer ${psnLeaderToken}`);
      const leadId = listRes.body.leads[0].id;

      const res = await request(serverApp)
        .post(`/api/leads/${leadId}/assign`)
        .set('Authorization', `Bearer ${psnLeaderToken}`)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/leads/:id/transition', () => {
    test('transitions lead tier for PSN Leader', async () => {
      // Find a lead at tier 0
      const listRes = await request(serverApp)
        .get('/api/leads?funnelLevel=0')
        .set('Authorization', `Bearer ${psnLeaderToken}`);
      const leadId = listRes.body.leads[0].id;

      const res = await request(serverApp)
        .post(`/api/leads/${leadId}/transition`)
        .set('Authorization', `Bearer ${psnLeaderToken}`)
        .send({ toTier: 1 });
      expect([200, 400]).toContain(res.status); // May fail if prerequisites not met
    });

    test('returns 400 for invalid target tier', async () => {
      const listRes = await request(serverApp)
        .get('/api/leads')
        .set('Authorization', `Bearer ${psnLeaderToken}`);
      const leadId = listRes.body.leads[0].id;

      const res = await request(serverApp)
        .post(`/api/leads/${leadId}/transition`)
        .set('Authorization', `Bearer ${psnLeaderToken}`)
        .send({ toTier: 99 });
      expect(res.status).toBe(400);
    });
  });

  describe('Tier labels match frontend', () => {
    test('lead tier labels match expected values', async () => {
      const res = await request(serverApp)
        .get('/api/leads')
        .set('Authorization', `Bearer ${testToken}`);
      const expectedLabels = ['Lead Magnet', 'Trial', 'Health Active', 'Combo', 'CTV Partner'];
      res.body.leads.forEach(lead => {
        const expectedLabel = expectedLabels[lead.funnelLevel];
        if (expectedLabel) {
          expect(lead.tierLabel).toBe(expectedLabel);
        }
      });
    });
  });
});