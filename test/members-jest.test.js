/**
 * T-018: Jest test suite for members API + encryption + PDPA
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { Member } = require('../src/models/member');
const { encrypt, decrypt, isEncrypted } = require('../src/utils/encryption');

process.env.JWT_SECRET = 'test-secret-for-jest';

const app = express();
app.use(express.json());

const membersAPI = require('../src/api/members');
app.use('/api/members', membersAPI);

const adminToken = jwt.sign({ id: 'admin-001', role: 'Admin' }, process.env.JWT_SECRET);
const psnToken = jwt.sign({ id: 'psn-001', role: 'PSN Leader' }, process.env.JWT_SECRET);
const memberToken = jwt.sign({ id: 'member-001', role: 'Member' }, process.env.JWT_SECRET);

describe('T-018: Encryption Utilities', () => {
  test('encrypt and decrypt', () => {
    const plain = 'user@example.com';
    const enc = encrypt(plain);
    expect(enc).not.toBe(plain);
    expect(isEncrypted(enc)).toBe(true);
    expect(decrypt(enc)).toBe(plain);
  });

  test('null handling', () => {
    expect(encrypt(null)).toBeNull();
    expect(decrypt(null)).toBeNull();
  });
});

describe('T-018: Member Model', () => {
  test('encrypts email and phone', () => {
    const m = new Member({ name: 'Test', email: 't@x.com', phone: '+84901234567' });
    expect(m._encryptedEmail).toBeTruthy();
    expect(m.getEmail()).toBe('t@x.com');
    expect(m.getPhone()).toBe('+84901234567');
  });

  test('toJSON excludes encrypted fields', () => {
    const m = new Member({ name: 'Test', email: 't@x.com' });
    const json = m.toJSON();
    expect(json._encryptedEmail).toBeUndefined();
    expect(json.email).toBe('t@x.com');
  });

  test('toSafeJSON excludes PII', () => {
    const m = new Member({ name: 'Test', email: 't@x.com', phone: '+84901234567' });
    const safe = m.toSafeJSON();
    expect(safe.email).toBeUndefined();
    expect(safe.phone).toBeUndefined();
    expect(safe.name).toBe('Test');
  });

  test('valid roles', () => {
    const m = new Member();
    expect(m.isValidRole('Member')).toBe(true);
    expect(m.isValidRole('Admin')).toBe(true);
    expect(m.isValidRole('Invalid')).toBe(false);
  });
});

describe('T-018: Members API', () => {
  test('GET /api/members requires auth', async () => {
    const res = await request(app).get('/api/members');
    expect(res.status).toBe(401);
  });

  test('GET /api/members returns list with auth', async () => {
    const res = await request(app)
      .get('/api/members')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /api/members requires PSN Leader+', async () => {
    const res = await request(app)
      .post('/api/members')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ name: 'New Member' });
    expect(res.status).toBe(403);
  });

  test('POST /api/members creates member', async () => {
    const res = await request(app)
      .post('/api/members')
      .set('Authorization', `Bearer ${psnToken}`)
      .send({ name: 'Test Member', email: 'test@x.com', phone: '+84901234567', role: 'Member', tier: 1 });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Member');
  });

  test('POST rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/members')
      .set('Authorization', `Bearer ${psnToken}`)
      .send({ name: 'Bad', email: 'invalid' });
    expect(res.status).toBe(400);
  });

  test('POST rejects invalid phone', async () => {
    const res = await request(app)
      .post('/api/members')
      .set('Authorization', `Bearer ${psnToken}`)
      .send({ name: 'Bad', phone: '0901234567' });
    expect(res.status).toBe(400);
  });

  test('GET /api/members/:id returns member', async () => {
    const res = await request(app)
      .get('/api/members/member-001')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 404]).toContain(res.status);
  });

  test('DELETE requires Admin', async () => {
    const res = await request(app)
      .delete('/api/members/member-001')
      .set('Authorization', `Bearer ${psnToken}`);
    expect(res.status).toBe(403);
  });
});
