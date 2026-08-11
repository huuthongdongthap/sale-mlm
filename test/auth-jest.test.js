/**
 * T-018: Jest test suite for auth + RBAC
 * Covers: JWT sign/verify, role hierarchy, requireRole middleware
 */

const jwt = require('../src/auth/jwt');
const { requireRole, requireAuth, requireAdmin, ROLE_HIERARCHY } = require('../src/middleware/requireRole');

function createMockReq(token = null) {
  return {
    headers: { authorization: token ? `Bearer ${token}` : undefined }
  };
}

function createMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('T-018: JWT Authentication', () => {
  test('sign and verify valid JWT', () => {
    const payload = { id: 'test-001', email: 'test@example.com', role: 'Member' };
    const token = jwt.sign(payload);
    expect(token).toBeTruthy();
    const decoded = jwt.verify(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  test('reject invalid token', () => {
    expect(jwt.verify('invalid.token.here')).toBeNull();
  });

  test('reject expired token', () => {
    const expired = jwt.sign({ id: 'x' }, -1);
    expect(jwt.verify(expired)).toBeNull();
  });

  test('reject missing token', () => {
    expect(jwt.verify(undefined)).toBeNull();
    expect(jwt.verify('')).toBeNull();
  });
});

describe('T-018: RBAC Middleware', () => {
  test('Admin accesses Admin resource', () => {
    const token = jwt.sign({ id: 'admin-001', role: 'Admin' });
    const req = createMockReq(token);
    const res = createMockRes();
    const next = jest.fn();
    requireRole('Admin')(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('PSN Leader denied Admin resource', () => {
    const token = jwt.sign({ id: 'psn-001', role: 'PSN Leader' });
    const req = createMockReq(token);
    const res = createMockRes();
    const next = jest.fn();
    requireRole('Admin')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('Member denied PSN Leader resource', () => {
    const token = jwt.sign({ id: 'member-001', role: 'Member' });
    const req = createMockReq(token);
    const res = createMockRes();
    const next = jest.fn();
    requireRole('PSN Leader')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('Member allowed Member resource', () => {
    const token = jwt.sign({ id: 'member-001', role: 'Member' });
    const req = createMockReq(token);
    const res = createMockRes();
    const next = jest.fn();
    requireRole('Member')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('no token returns 401', () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = jest.fn();
    requireRole('Member')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('Core Leader accesses Member and PSN resources', () => {
    const token = jwt.sign({ id: 'core-001', role: 'Core Leader' });
    const req = createMockReq(token);
    const res = createMockRes();
    const next = jest.fn();
    requireRole('Member')(req, res, next);
    expect(next).toHaveBeenCalled();
    next.mockClear();
    const res2 = createMockRes();
    requireRole('PSN Leader')(req, res2, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('T-018: Role Hierarchy', () => {
  test('correct hierarchy levels', () => {
    expect(ROLE_HIERARCHY['Member']).toBe(1);
    expect(ROLE_HIERARCHY['PSN Leader']).toBe(2);
    expect(ROLE_HIERARCHY['Core Leader']).toBe(3);
    expect(ROLE_HIERARCHY['Admin']).toBe(4);
  });
});

describe('T-018: requireAuth and requireAdmin shortcuts', () => {
  test('requireAuth passes with valid token', () => {
    const token = jwt.sign({ id: 'x', role: 'Member' });
    const req = createMockReq(token);
    const res = createMockRes();
    const next = jest.fn();
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('requireAdmin passes only for Admin', () => {
    const token = jwt.sign({ id: 'admin-001', role: 'Admin' });
    const req = createMockReq(token);
    const res = createMockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('requireAdmin rejects non-Admin', () => {
    const token = jwt.sign({ id: 'core-001', role: 'Core Leader' });
    const req = createMockReq(token);
    const res = createMockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
