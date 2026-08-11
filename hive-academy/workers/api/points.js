import { json, verifyToken } from './index.js';

export { handlePoints, handleLeaderboard, awardPoints };

export async function handlePoints(request, env, path) {
  if (path === '/api/points' && request.method === 'GET') {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    const period = url.searchParams.get('period') || 'all';

    let dateFilter = '';
    let bindings = [];

    if (period === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      dateFilter = 'WHERE date >= ?';
      bindings.push(weekAgo);
    } else if (period === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      dateFilter = 'WHERE date >= ?';
      bindings.push(monthAgo);
    } else if (period === 'year') {
      const yearAgo = new Date(Date.now() - 365 * 86400000).toISOString().split('T')[0];
      dateFilter = 'WHERE date >= ?';
      bindings.push(yearAgo);
    }

    if (userId) {
      dateFilter = dateFilter ? dateFilter + ' AND user_id = ?' : 'WHERE user_id = ?';
      bindings.push(userId);
    }

    const { results } = await env.DB.prepare(
      `SELECT points.*, users.name as user_name FROM points LEFT JOIN users ON points.user_id = users.id ${dateFilter} ORDER BY date DESC`
    ).bind(...bindings).all();

    return json(results);
  }

  if (path === '/api/points/me' && request.method === 'GET') {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);
    const token = authHeader.split(' ')[1];
    try {
      const payload = await verifyToken(token, env.JWT_SECRET);
      const url = new URL(request.url);
      const period = url.searchParams.get('period') || 'all';

      let dateFilter = 'WHERE user_id = ?';
      let bindings = [payload.userId];

      if (period === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
        dateFilter += ' AND date >= ?';
        bindings.push(weekAgo);
      } else if (period === 'month') {
        const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
        dateFilter += ' AND date >= ?';
        bindings.push(monthAgo);
      }

      const { results } = await env.DB.prepare(
        `SELECT * FROM points ${dateFilter} ORDER BY date DESC`
      ).bind(...bindings).all();

      const total = results.reduce((sum, p) => sum + p.points, 0);

      return json({ points: results, total });
    } catch {
      return json({ error: 'Invalid token' }, 401);
    }
  }

  if (path === '/api/points/award' && request.method === 'POST') {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);
    const token = authHeader.split(' ')[1];
    try {
      const payload = await verifyToken(token, env.JWT_SECRET);
      const { action, custom_points } = await request.json();

      const pointsMap = {
        checkin_habit: 3,
        lesson_complete: 5,
        daily_target: 5,
        post_share: 2,
        perfect_day: 10,
        close_order: 20,
        refer_new: 50,
        graduate_level: 100,
      };

      const points = custom_points || pointsMap[action] || 0;
      if (points === 0) return json({ error: 'Invalid action' }, 400);

      await awardPoints(env, payload.userId, action, points);

      return json({ message: 'Points awarded', points_earned: points });
    } catch {
      return json({ error: 'Invalid token' }, 401);
    }
  }

  return json({ error: 'Not found' }, 404);
}

export async function handleLeaderboard(request, env, path) {
  if (path === '/api/leaderboard' && request.method === 'GET') {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'all';
    const limit = parseInt(url.searchParams.get('limit') || '50');

    let dateFilter = '';
    let bindings = [];

    if (period === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      dateFilter = 'WHERE date >= ?';
      bindings.push(weekAgo);
    } else if (period === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      dateFilter = 'WHERE date >= ?';
      bindings.push(monthAgo);
    } else if (period === 'year') {
      const yearAgo = new Date(Date.now() - 365 * 86400000).toISOString().split('T')[0];
      dateFilter = 'WHERE date >= ?';
      bindings.push(yearAgo);
    }

    const { results } = await env.DB.prepare(`
      SELECT
        p.user_id,
        u.name,
        u.level,
        SUM(p.points) as total_points,
        COUNT(CASE WHEN p.action = 'checkin_habit' THEN 1 END) as checkins,
        COUNT(CASE WHEN p.action = 'lesson_complete' THEN 1 END) as lessons_completed
      FROM points p
      LEFT JOIN users u ON p.user_id = u.id
      ${dateFilter}
      GROUP BY p.user_id
      ORDER BY total_points DESC
      LIMIT ?
    `).bind(...bindings, limit).all();

    const ranked = results.map((r, i) => ({ ...r, rank: i + 1 }));

    return json(ranked);
  }

  return json({ error: 'Not found' }, 404);
}

export async function awardPoints(env, userId, action, points) {
  const id = crypto.randomUUID();
  const today = new Date().toISOString().split('T')[0];
  await env.DB.prepare(
    'INSERT INTO points (id, user_id, action, points, date) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, userId, action, points, today).run();
}
