import { signToken, verifyToken, hashPassword, comparePassword } from '../utils/auth.js';
import { awardPoints } from './points.js';

export async function handleAuth(request, env, path) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (path === '/api/auth/login' && request.method === 'POST') {
      return handleLogin(request, env, corsHeaders);
    }
    if (path === '/api/auth/register' && request.method === 'POST') {
      return handleRegister(request, env, corsHeaders);
    }
    if (path === '/api/auth/verify' && request.method === 'GET') {
      return handleVerify(request, env, corsHeaders);
    }
    if (path === '/api/auth/me' && request.method === 'GET') {
      return handleMe(request, env, corsHeaders);
    }
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleLogin(request, env, corsHeaders) {
  const { phone, password } = await request.json();
  
  if (!phone || !password) {
    return new Response(JSON.stringify({ error: 'Phone and password required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const user = await env.DB.prepare('SELECT * FROM users WHERE phone = ?')
    .bind(phone).first();
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const token = await signToken({ userId: user.id, phone: user.phone }, env.JWT_SECRET);
  
  return new Response(JSON.stringify({
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      level: user.level,
      phone: user.phone,
      team_id: user.team_id
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleRegister(request, env, corsHeaders) {
  const { name, phone, password, referrer_code } = await request.json();
  
  if (!name || !phone || !password) {
    return new Response(JSON.stringify({ error: 'Name, phone and password required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const existing = await env.DB.prepare('SELECT id FROM users WHERE phone = ?')
    .bind(phone).first();
  
  if (existing) {
    return new Response(JSON.stringify({ error: 'Phone already registered' }), {
      status: 409,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  let referrer_id = null;
  if (referrer_code) {
    const referrer = await env.DB.prepare('SELECT id FROM users WHERE id = ? OR phone = ?')
      .bind(referrer_code, referrer_code).first();
    if (referrer) referrer_id = referrer.id;
  }

  const password_hash = await hashPassword(password);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.prepare(
    'INSERT INTO users (id, name, role, level, phone, password_hash, referrer_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, name, 'CTV', 'Khám phá', phone, password_hash, referrer_id, now).run();

  if (referrer_id) {
    await awardPoints(env, referrer_id, 'refer_new', 50);
  }

  const token = await signToken({ userId: id, phone: phone }, env.JWT_SECRET);

  return new Response(JSON.stringify({
    token,
    user: { id, name, role: 'CTV', level: 'Khám phá', phone, referrer_id }
  }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleVerify(request, env, corsHeaders) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'No token provided' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = await verifyToken(token, env.JWT_SECRET);
    return new Response(JSON.stringify({ valid: true, userId: payload.userId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ valid: false, error: 'Invalid token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleMe(request, env, corsHeaders) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'No token provided' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = await verifyToken(token, env.JWT_SECRET);
    const user = await env.DB.prepare('SELECT id, name, role, level, phone, team_id, referrer_id, created_at FROM users WHERE id = ?')
      .bind(payload.userId).first();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(user), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
