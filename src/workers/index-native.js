/**
 * Cloudflare Workers native entry point — Hive Warfare OS
 *
 * This is a Hono-native implementation that avoids bundling Express/body-parser.
 * Routes are reimplemented in Hono using the same business logic from src/api/*.
 *
 * Secrets (wrangler secret put):
 *   JWT_SECRET, PASSWORD_SALT, ALLOWED_ORIGIN, ADMIN_TOKEN
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign, verify } from 'hono/jwt';
import { randomUUID } from 'node:crypto';

const app = new Hono();

// CORS — locked to the ALLOWED_ORIGIN secret (dashboard Pages origin).
// Fail-closed: refuse to serve if the secret is missing, mirroring
// src/server.js so a wide-open wildcard can never ship silently.
app.use('*', async (c, next) => {
  const allowed = c.env.ALLOWED_ORIGIN;
  if (!allowed) {
    return c.json({ error: 'ALLOWED_ORIGIN not configured', code: 'CORS_NOT_CONFIGURED' }, 503);
  }
  return cors({
    origin: allowed,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })(c, next);
});

// Error handling
app.onError((err, c) => {
  const msg = err?.message || String(err);
  const status = msg.includes('Missing') || msg.includes('Invalid') ? 401
    : msg.includes('Forbidden') ? 403
    : 500;
  return c.json({ error: msg, code: msg.toUpperCase().replace(/[^A-Z]/g, '_') }, status);
});

// Helper: parse JSON body
async function parseJSON(c) {
  const ct = c.req.header('content-type') || c.req.header('Content-Type') || '';
  if (!ct.includes('application/json')) return null;
  try {
    return await c.req.json();
  } catch {
    return null;
  }
}

// Helper: verify JWT
async function getUserFromToken(c) {
  const auth = c.req.header('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return null;
  }
  const token = auth.slice(7);
  try {
    const JWT_SECRET = c.env.JWT_SECRET || 'test';
    const payload = await verify(token, JWT_SECRET, 'HS256');
    return payload;
  } catch {
    return null;
  }
}

// Auth middleware
app.use('/api/*', async (c, next) => {
  const user = await getUserFromToken(c);
  if (!user) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
  }
  c.set('user', user);
  await next();
});

// Health endpoints (no auth)
app.get('/health', (c) => c.json({ ok: true, timestamp: new Date().toISOString() }));
app.get('/ready', (c) => c.json({ ok: true }));

// Auth endpoints
app.post('/auth/login', async (c) => {
  const body = await parseJSON(c);
  if (!body || !body.email || !body.password) {
    return c.json({ error: 'Email and password required', code: 'MISSING_CREDENTIALS' }, 400);
  }
  // In Workers, we need to query D1 for user
  const DB = c.env.DB;
  if (!DB) {
    return c.json({ error: 'Database not configured', code: 'NO_DB' }, 503);
  }
  // D1's bind() returns a new statement — chain it directly
  const user = await DB.prepare('SELECT * FROM members WHERE email = ? LIMIT 1')
    .bind(body.email)
    .first();
  if (!user) {
    return c.json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' }, 401);
  }
  // Verify password using PBKDF2 (matching Node.js server implementation).
  // Web Crypto caps iterations at 100,000 — the Node side uses the same cap.
  const { subtle } = globalThis.crypto;
  const encoder = new TextEncoder();
  const salt = encoder.encode(c.env.PASSWORD_SALT || '');
  const key = await subtle.importKey(
    'raw',
    encoder.encode(body.password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-512' },
    key,
    512
  );
  const passwordHash = Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (passwordHash !== user.password_hash) {
    return c.json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' }, 401);
  }

  const token = await sign({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    orgId: user.org_id
  }, c.env.JWT_SECRET);

  return c.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      orgId: user.org_id,
      tier: user.tier,
      psnId: user.psn_id
    }
  });
});

app.post('/auth/verify', (c) => {
  const user = c.get('user');
  return c.json({ success: true, user });
});

// Members endpoints
app.get('/api/members', async (c) => {
  const user = c.get('user');
  const DB = c.env.DB;
  if (!DB) return c.json({ error: 'Database not configured', code: 'NO_DB' }, 503);

  let query = 'SELECT * FROM members';
  const params = [];
  if (user.role !== 'Admin' || user.orgId) {
    query += ' WHERE org_id = ?';
    params.push(user.orgId || 'org-default');
  }

  const result = await DB.prepare(query).bind(...params).all();

  return c.json({
    success: true,
    data: result.results?.map(m => ({
      id: m.id,
      name: m.name,
      role: m.role,
      tier: m.tier,
      psnId: m.psn_id,
      orgId: m.org_id,
      status: m.status,
      habitScore: m.habit_score,
      joinDate: m.join_date,
      energyScore: m.energy_score,
      lastLoginAt: m.last_login_at
    })) || []
  });
});

// Leads endpoints
app.get('/api/leads', async (c) => {
  const user = c.get('user');
  const DB = c.env.DB;
  if (!DB) return c.json({ error: 'Database not configured', code: 'NO_DB' }, 503);

  let query = 'SELECT * FROM leads';
  const params = [];
  if (user.role !== 'Admin' || user.orgId) {
    query += ' WHERE org_id = ?';
    params.push(user.orgId || 'org-default');
  }

  const result = await DB.prepare(query).bind(...params).all();

  return c.json({
    total: result.results?.length || 0,
    leads: result.results || []
  });
});

app.post('/api/leads', async (c) => {
  const user = c.get('user');
  const body = await parseJSON(c);
  if (!body || !body.name || !body.phone) {
    return c.json({ error: 'Name and phone required', code: 'MISSING_FIELDS' }, 400);
  }

  const DB = c.env.DB;
  if (!DB) return c.json({ error: 'Database not configured', code: 'NO_DB' }, 503);

  const id = randomUUID();
  const now = new Date().toISOString();
  await DB.prepare(`
    INSERT INTO leads (id, name, phone, email, status, funnel_level, org_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    body.name,
    body.phone,
    body.email || '',
    body.status || 'new',
    body.funnelLevel || 1,
    user.orgId || 'org-default',
    now,
    now
  ).run();

  return c.json({ id, name: body.name, phone: body.phone, status: 'new', createdAt: now }, 201);
});

// Orders endpoints
app.get('/api/orders', async (c) => {
  const user = c.get('user');
  const DB = c.env.DB;
  if (!DB) return c.json({ error: 'Database not configured', code: 'NO_DB' }, 503);

  let query = 'SELECT * FROM orders';
  const params = [];
  if (user.role !== 'Admin' || user.orgId) {
    query += ' WHERE org_id = ?';
    params.push(user.orgId || 'org-default');
  }

  const result = await DB.prepare(query).bind(...params).all();

  return c.json({
    orders: result.results || [],
    pagination: { page: 1, limit: 50, total: result.results?.length || 0, totalPages: 1 }
  });
});

export default app;