import { handleAuth } from './auth.js';
import { handleLessons, handleProgress } from './lessons.js';
import { handlePosts } from './posts.js';
import { handleAlerts } from './alerts.js';
import { handlePoints, handleLeaderboard, awardPoints } from './points.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (path.startsWith('/api/auth')) return handleAuth(request, env, path);
      if (path.startsWith('/api/users')) return handleUsers(request, env, path);
      if (path.startsWith('/api/habits')) return handleHabits(request, env, path);
      if (path.startsWith('/api/lessons')) return handleLessons(request, env, path);
      if (path.startsWith('/api/progress')) return handleProgress(request, env, path);
      if (path.startsWith('/api/posts')) return handlePosts(request, env, path);
      if (path.startsWith('/api/dashboard')) return handleDashboard(request, env, path);
      if (path.startsWith('/api/points')) return handlePoints(request, env, path);
      if (path.startsWith('/api/leaderboard')) return handleLeaderboard(request, env, path);
      if (path.startsWith('/api/alerts')) return handleAlerts(request, env, path);

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

async function handleUsers(request, env, path) {
  if (path === '/api/users' && request.method === 'GET') {
    const users = await env.DB.prepare('SELECT * FROM users').all();
    return json(users.results);
  }
  const match = path.match(/\/api\/users\/([^/]+)/);
  if (match && request.method === 'GET') {
    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(match[1]).first();
    return json(user);
  }
  return json({ error: 'Not found' }, 404);
}

async function handleHabits(request, env, path) {
  if (path === '/api/habits/today' && request.method === 'GET') {
    const today = new Date().toISOString().split('T')[0];
    const habits = await env.DB.prepare('SELECT * FROM habits WHERE date = ?').bind(today).all();
    return json(habits.results);
  }
  if (path === '/api/habits/checkin' && request.method === 'POST') {
    const { user_id, habit_type } = await request.json();
    const id = crypto.randomUUID();
    const today = new Date().toISOString().split('T')[0];
    await env.DB.prepare('INSERT INTO habits (id, user_id, date, habit_type, completed, completed_at) VALUES (?, ?, ?, ?, TRUE, CURRENT_TIMESTAMP)')
      .bind(id, user_id, today, habit_type).run();

    await awardPoints(env, user_id, 'checkin_habit', 3);

    return json({ message: 'Checked in', points_earned: 3 });
  }
  return json({ error: 'Not found' }, 404);
}

async function handleLessons(request, env, path) {
  if (path === '/api/lessons' && request.method === 'GET') {
    const lessons = await env.DB.prepare('SELECT * FROM lessons ORDER BY order_num').all();
    return json(lessons.results);
  }
  const match = path.match(/\/api\/lessons\/([^/]+)/);
  if (match && request.method === 'GET') {
    const lesson = await env.DB.prepare('SELECT * FROM lessons WHERE id = ?').bind(match[1]).first();
    return json(lesson);
  }
  return json({ error: 'Not found' }, 404);
}

async function handleProgress(request, env, path) {
  if (path === '/api/progress/complete' && request.method === 'POST') {
    const { user_id, lesson_id, score } = await request.json();
    const id = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO progress (id, user_id, lesson_id, completed, score, completed_at) VALUES (?, ?, ?, TRUE, ?, CURRENT_TIMESTAMP)')
      .bind(id, user_id, lesson_id, score).run();
    return json({ message: 'Progress saved' });
  }
  return json({ error: 'Not found' }, 404);
}

async function handleDashboard(request, env, path) {
  if (path === '/api/dashboard' && request.method === 'GET') {
    const users = await env.DB.prepare('SELECT * FROM users').all();
    const habits = await env.DB.prepare('SELECT * FROM habits WHERE date = CURRENT_DATE').all();
    return json({ users: users.results, habits: habits.results });
  }

  if (path === '/api/dashboard/members' && request.method === 'GET') {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);
    const token = authHeader.split(' ')[1];
    try {
      const payload = await verifyToken(token, env.JWT_SECRET);
      const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(payload.userId).first();
      if (!user || (user.role !== 'leader' && user.role !== 'admin')) {
        return json({ error: 'Forbidden' }, 403);
      }

      const today = new Date().toISOString().split('T')[0];
      const { results: members } = await env.DB.prepare(`
        SELECT u.*,
          (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id AND p.completed = 1) as lessons_done,
          (SELECT IFNULL(SUM(points), 0) FROM points WHERE user_id = u.id) as points_total,
          (SELECT MAX(date) FROM habits WHERE user_id = u.id) as last_checkin,
          (SELECT a.level FROM alerts a WHERE a.user_id = u.id AND a.resolved_at IS NULL ORDER BY a.created_at DESC LIMIT 1) as alert_severity,
          (SELECT IFNULL(SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END), 0) FROM habits WHERE user_id = u.id AND date = ?) as today_habits
        FROM users u
        WHERE u.role != 'admin'
        ORDER BY points_total DESC
      `).bind(today).all();

      return json(members);
    } catch {
      return json({ error: 'Invalid token' }, 401);
    }
  }

  if (path === '/api/dashboard/analytics' && request.method === 'GET') {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'week';
    const days = period === 'month' ? 30 : period === 'all' ? 3650 : 7;
    const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

    const { results: analytics } = await env.DB.prepare(`
      SELECT
        COUNT(DISTINCT u.id) as total_members,
        COUNT(DISTINCT CASE WHEN h.date = CURRENT_DATE THEN h.user_id END) as active_today,
        COUNT(DISTINCT CASE WHEN p.completed = 1 THEN p.user_id END) as learning_members,
        IFNULL((SELECT SUM(points) FROM points WHERE date >= ?), 0) as points_week,
        IFNULL((SELECT COUNT(*) FROM posts WHERE DATE(created_at) >= ?), 0) as posts_week
      FROM users u
      LEFT JOIN habits h ON u.id = h.user_id
      LEFT JOIN progress p ON u.id = p.user_id
      WHERE u.role != 'admin'
    `).bind(since, since).all();

    const { results: severity } = await env.DB.prepare(`
      SELECT
        COUNT(CASE WHEN a.level = 'red' THEN 1 END) as red_count,
        COUNT(CASE WHEN a.level = 'yellow' THEN 1 END) as yellow_count,
        COUNT(CASE WHEN a.level = 'green' THEN 1 END) as green_count
      FROM alerts a
      WHERE a.resolved_at IS NULL
    `).all();

    const { results: topLearners } = await env.DB.prepare(`
      SELECT u.id, u.name, IFNULL(SUM(po.points), 0) as points_week
      FROM users u
      LEFT JOIN points po ON u.id = po.user_id AND po.date >= ?
      WHERE u.role != 'admin'
      GROUP BY u.id
      ORDER BY points_week DESC
      LIMIT 10
    `).bind(since).all();

    const { results: dailyActivity } = await env.DB.prepare(`
      SELECT date, COUNT(DISTINCT user_id) as count
      FROM habits
      WHERE date >= ? AND completed = 1
      GROUP BY date
      ORDER BY date
    `).bind(since).all();

    const maxDaily = Math.max(...dailyActivity.map(d => d.count), 1);

    const result = analytics[0] || {};
    result.red_count = severity[0]?.red_count || 0;
    result.yellow_count = severity[0]?.yellow_count || 0;
    result.green_count = severity[0]?.green_count || 0;
    result.top_learners = topLearners;
    result.daily_activity = dailyActivity;
    result.max_daily = maxDaily;

    return json(result);
  }

  return json({ error: 'Not found' }, 404);
}

async function verifyToken(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  return JSON.parse(atob(parts[1]));
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
