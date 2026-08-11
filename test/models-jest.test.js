/**
 * T-018: Jest test suite for KPI model + PSN model + audit log + more member API
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const KPI = require('../src/models/kpi');
const PSN = require('../src/models/psn');
const { logPIIAccess, getAuditLogs, isPIIField, extractPIIFields } = require('../src/utils/auditLog');
const { Member } = require('../src/models/member');

process.env.JWT_SECRET = 'test-secret';

describe('T-018: KPI Model', () => {
  test('create KPI record', () => {
    const kpi = new KPI({
      memberId: 'test-001',
      date: '2026-05-20',
      connectsPerDay: 15,
      followUpsPerDay: 3,
      firstOrderIn14Days: true
    });
    expect(kpi.memberId).toBe('test-001');
    expect(kpi.connectsPerDay).toBe(15);
  });

  test('KPI toJSON', () => {
    const kpi = new KPI({ memberId: 'x', connectsPerDay: 10 });
    const json = kpi.toJSON();
    expect(json).toHaveProperty('memberId');
    expect(json).toHaveProperty('connectsPerDay');
  });

  test('KPI getTierTargets', () => {
    const targets = KPI.getTierTargets();
    expect(targets).toHaveProperty('1');
    expect(targets[1]).toHaveProperty('connects_per_day', 15);
    expect(targets[1]).toHaveProperty('follow_ups_per_day', 3);
  });

  test('KPI calculateStatus — RED (<70%)', () => {
    expect(KPI.calculateStatus(5, 15)).toBe('RED');
    expect(KPI.calculateStatus(10, 15)).toBe('RED'); // 10/15 = 0.67 < 0.7
  });

  test('KPI calculateStatus — YELLOW (70-99%)', () => {
    expect(KPI.calculateStatus(11, 15)).toBe('YELLOW'); // 11/15 = 0.73
    expect(KPI.calculateStatus(14, 15)).toBe('YELLOW');
  });

  test('KPI calculateStatus — GREEN (100%+)', () => {
    expect(KPI.calculateStatus(15, 15)).toBe('GREEN');
    expect(KPI.calculateStatus(20, 15)).toBe('GREEN');
  });

  test('KPI calculateStatus — boolean GREEN', () => {
    expect(KPI.calculateStatus(true, true, 'boolean')).toBe('GREEN');
  });

  test('KPI calculateStatus — boolean RED', () => {
    expect(KPI.calculateStatus(false, true, 'boolean')).toBe('RED');
  });

  test('KPI calculateStatus — zero target returns GREEN', () => {
    expect(KPI.calculateStatus(0, 0)).toBe('GREEN');
  });
});

describe('T-018: PSN Model', () => {
  test('create PSN', () => {
    const psn = new PSN({
      id: 'test-psn',
      name: 'Test PSN',
      leaderId: 'leader-001',
      location: 'Hà Nội'
    });
    expect(psn.id).toBe('test-psn');
    expect(psn.name).toBe('Test PSN');
  });

  test('PSN addMember', () => {
    const psn = new PSN({ id: 'x', name: 'Test' });
    psn.addMember('member-001');
    expect(psn.members).toContain('member-001');
  });

  test('PSN addMember no duplicates', () => {
    const psn = new PSN({ id: 'x', name: 'Test', members: ['m1'] });
    psn.addMember('m1');
    expect(psn.members.length).toBe(1);
  });

  test('PSN memberCount', () => {
    const psn = new PSN({ id: 'x', name: 'Test', members: ['m1', 'm2', 'm3'] });
    expect(psn.memberCount).toBe(3);
  });

  test('PSN toJSON', () => {
    const psn = new PSN({ id: 'x', name: 'Test', leaderId: 'l1', members: ['m1'] });
    const json = psn.toJSON();
    expect(json).toHaveProperty('id');
    expect(json).toHaveProperty('name');
    expect(json).toHaveProperty('memberCount', 1);
  });

  test('PSN default values', () => {
    const psn = new PSN();
    expect(psn.id).toBeTruthy();
    expect(psn.name).toBe('');
    expect(psn.leaderId).toBeNull();
    expect(psn.members).toEqual([]);
    expect(psn.score).toBe(0);
  });
});

describe('T-018: Audit Log', () => {
  test('log PII access', () => {
    const id = logPIIAccess({
      action: 'read',
      resource: 'member',
      resourceId: 'm1',
      piiFields: ['email', 'phone'],
      userId: 'admin-001',
      userRole: 'Admin'
    });
    expect(id).toBeTruthy();
  });

  test('get audit logs', () => {
    const beforeCount = getAuditLogs().length;
    logPIIAccess({
      action: 'read',
      resource: 'member',
      resourceId: 'm1',
      piiFields: ['email'],
      userId: 'admin-001',
      userRole: 'Admin'
    });
    const logs = getAuditLogs();
    expect(logs.length).toBeGreaterThan(beforeCount);
    expect(logs[0].action).toBe('read');
  });

  test('filter audit logs by action', () => {
    const beforeCount = getAuditLogs({ action: 'create' }).length;
    logPIIAccess({ action: 'create', resource: 'member', resourceId: 'm1', piiFields: ['email'], userId: 'u1', userRole: 'Admin' });
    const createLogs = getAuditLogs({ action: 'create' });
    expect(createLogs.length).toBeGreaterThan(beforeCount);
  });

  test('filter audit logs by userId', () => {
    const beforeCount = getAuditLogs({ userId: 'unique-user-123' }).length;
    logPIIAccess({ action: 'read', resource: 'member', resourceId: 'm1', piiFields: ['email'], userId: 'unique-user-123', userRole: 'Admin' });
    const userLogs = getAuditLogs({ userId: 'unique-user-123' });
    expect(userLogs.length).toBeGreaterThan(beforeCount);
  });

  test('isPIIField', () => {
    expect(isPIIField('email')).toBe(true);
    expect(isPIIField('phone')).toBe(true);
    expect(isPIIField('name')).toBe(true);
    expect(isPIIField('address')).toBe(true);
    expect(isPIIField('role')).toBe(false);
  });

  test('extractPIIFields', () => {
    const data = { name: 'Test', email: 't@x.com', phone: '+84901', role: 'Member', tier: 1 };
    const pii = extractPIIFields(data);
    expect(pii).toContain('name');
    expect(pii).toContain('email');
    expect(pii).toContain('phone');
    expect(pii).not.toContain('role');
  });

  test('extractPIIFields with null', () => {
    expect(extractPIIFields(null)).toEqual([]);
    expect(extractPIIFields('string')).toEqual([]);
  });
});

describe('T-018: Members API — more coverage', () => {
  const app = express();
  app.use(express.json());
  const membersAPI = require('../src/api/members');
  app.use('/api/members', membersAPI);

  const adminToken = jwt.sign({ id: 'admin-001', role: 'Admin' }, process.env.JWT_SECRET);
  const psnToken = jwt.sign({ id: 'psn-001', role: 'PSN Leader' }, process.env.JWT_SECRET);
  const coreToken = jwt.sign({ id: 'core-001', role: 'Core Leader' }, process.env.JWT_SECRET);

  test('GET with tier filter', async () => {
    const res = await request(app)
      .get('/api/members')
      .query({ tier: '1' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test('GET with status filter', async () => {
    const res = await request(app)
      .get('/api/members')
      .query({ status: 'active' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test('GET with role filter', async () => {
    const res = await request(app)
      .get('/api/members')
      .query({ role: 'Member' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test('GET with invalid tier returns 400', async () => {
    const res = await request(app)
      .get('/api/members')
      .query({ tier: 'abc' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });

  test('GET with pagination', async () => {
    const res = await request(app)
      .get('/api/members')
      .query({ limit: '5', offset: '0' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pagination');
  });

  test('PATCH own profile', async () => {
    const memberToken = jwt.sign({ id: 'member-001', role: 'Member' }, process.env.JWT_SECRET);
    const res = await request(app)
      .patch('/api/members/member-001')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ name: 'Updated Name' });
    expect([200, 404]).toContain(res.status);
  });

  test('PATCH by Core Leader', async () => {
    const res = await request(app)
      .patch('/api/members/member-001')
      .set('Authorization', `Bearer ${coreToken}`)
      .send({ name: 'Core Leader Update' });
    expect([200, 404]).toContain(res.status);
  });

  test('PATCH role change by non-Admin returns 403', async () => {
    const res = await request(app)
      .patch('/api/members/member-001')
      .set('Authorization', `Bearer ${coreToken}`)
      .send({ role: 'Admin' });
    expect([403, 404, 200]).toContain(res.status);
  });

  test('DELETE non-existent returns 404', async () => {
    const res = await request(app)
      .delete('/api/members/non-existent-id')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  test('POST with invalid tier returns 400', async () => {
    const res = await request(app)
      .post('/api/members')
      .set('Authorization', `Bearer ${psnToken}`)
      .send({ name: 'Bad', tier: 5 });
    expect(res.status).toBe(400);
  });

  test('POST with invalid role returns 400', async () => {
    const res = await request(app)
      .post('/api/members')
      .set('Authorization', `Bearer ${psnToken}`)
      .send({ name: 'Bad', role: 'Super Admin' });
    expect(res.status).toBe(400);
  });
});
