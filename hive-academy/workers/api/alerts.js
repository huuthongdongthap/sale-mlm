import { json } from './index.js';

export async function handleAlerts(request, env, path) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Unauthorized' }, 401);

  try {
    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token, env.JWT_SECRET);
    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(payload.userId).first();
    if (!user || (user.role !== 'leader' && user.role !== 'admin')) {
      return json({ error: 'Forbidden' }, 403);
    }

    if (path === '/api/alerts' && request.method === 'GET') {
      const { results } = await env.DB.prepare(`
        SELECT a.*, u.name as user_name, u.phone, u.level, u.role, u.team_id
        FROM alerts a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.resolved_at IS NULL
        ORDER BY
          CASE a.level
            WHEN 'red' THEN 1
            WHEN 'yellow' THEN 2
            WHEN 'green' THEN 3
          END,
          a.created_at DESC
      `).all();
      return json(results);
    }

    if (path === '/api/alerts/all' && request.method === 'GET') {
      const { results } = await env.DB.prepare(`
        SELECT a.*, u.name as user_name, u.phone, u.level
        FROM alerts a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
        LIMIT 200
      `).all();
      return json(results);
    }

    if (path === '/api/alerts/generate' && request.method === 'POST') {
      return await generateAlerts(env);
    }

    if (path === '/api/alerts/report/weekly' && request.method === 'GET') {
      const report = await generateWeeklyReport(env);
      return json(report);
    }

    if (path.startsWith('/api/alerts/resolve/') && request.method === 'PUT') {
      const alertId = path.split('/').pop();
      await env.DB.prepare('UPDATE alerts SET resolved_at = CURRENT_TIMESTAMP WHERE id = ?').bind(alertId).run();
      return json({ message: 'Alert resolved' });
    }

    return json({ error: 'Not found' }, 404);
  } catch (e) {
    return json({ error: 'Invalid token' }, 401);
  }
}

async function generateAlerts(env) {
  const now = new Date().toISOString();
  const today = now.split('T')[0];
  const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0];
  const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0];

  const { results: users } = await env.DB.prepare(
    'SELECT * FROM users WHERE role != ?', 'admin'
  ).all();

  let alertsCreated = 0;

  for (const u of users) {
    const { results: habits } = await env.DB.prepare(`
      SELECT date,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as done
      FROM habits
      WHERE user_id = ? AND date >= ?
      GROUP BY date
      ORDER BY date DESC
    `).bind(u.id, tenDaysAgo).all();

    const todayHabit = habits.find(h => h.date === today);
    const todayDone = todayHabit ? Number(todayHabit.done) : 0;

    let consecMiss = 0;
    for (const h of habits) {
      if (Number(h.done) === 0) consecMiss++;
      else break;
    }

    const totalMiss = habits.filter(h => Number(h.done) === 0).length;

    const { results: zoomRes } = await env.DB.prepare(`
      SELECT COUNT(*) as c FROM habits
      WHERE user_id = ? AND date >= ? AND habit_type = 'Connect' AND completed = 1
    `).bind(u.id, fiveDaysAgo).all();
    const zoomCount = Number(zoomRes[0]?.c || 0);

    let level, reason;

    if (totalMiss >= 5 || (totalMiss >= 1 && zoomCount === 0)) {
      level = 'red';
      reason = `${u.name} - ĐỎ: ${totalMiss} ngày bỏ lỡ${zoomCount === 0 ? ', 0 Zoom 5 ngày' : ''}. GỌI 1:1 TRONG 24H.`;
    } else if (consecMiss >= 2) {
      level = 'yellow';
      reason = `${u.name} - VÀNG: ${consecMiss} ngày liên tiếp bỏ lỡ. Buddy + Leader liên hệ trong 48h.`;
    } else if (todayDone >= 4) {
      level = 'green';
      reason = `${u.name} - XANH: ${todayDone}/6 habits hôm nay. Tiếp tục phát huy! 🎉`;
    } else {
      continue;
    }

    const existing = await env.DB.prepare(
      'SELECT id FROM alerts WHERE user_id = ? AND level = ? AND resolved_at IS NULL'
    ).bind(u.id, level).first();

    if (!existing) {
      await env.DB.prepare(
        'INSERT INTO alerts (id, user_id, level, reason, created_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(crypto.randomUUID(), u.id, level, reason, now).run();
      alertsCreated++;
    }
  }

  return json({ message: `Created ${alertsCreated} alerts`, total: users.length });
}

export async function generateWeeklyReport(env) {
  const today = new Date().toISOString().split('T')[0];
  const weekStart = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  const { results: members } = await env.DB.prepare(`
    SELECT
      u.id, u.name, u.role, u.level, u.team_id,
      (SELECT COUNT(*) FROM habits WHERE user_id = u.id AND date >= ?) as checkins_week,
      (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id AND p.completed = 1 AND DATE(p.completed_at) >= ?) as lessons_week,
      (SELECT IFNULL(SUM(points), 0) FROM points WHERE user_id = u.id AND date >= ?) as points_week,
      (SELECT COUNT(*) FROM posts WHERE user_id = u.id AND created_at >= ?) as posts_week,
      (SELECT COUNT(*) FROM habits WHERE user_id = u.id AND date >= ? AND completed = 1 AND habit_type = 'Connect') as zoom_week,
      (SELECT IFNULL(SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END), 0) FROM habits WHERE user_id = u.id AND date = ?) as today_habits
    FROM users u
    WHERE u.role != 'admin'
    ORDER BY points_week DESC
  `).bind(weekStart, weekStart, weekStart, weekStart, weekStart, today).all();

  return {
    period: `${weekStart} → ${today}`,
    total_members: members.length,
    total_checkins: members.reduce((s, m) => s + Number(m.checkins_week || 0), 0),
    total_lessons: members.reduce((s, m) => s + Number(m.lessons_week || 0), 0),
    total_points: members.reduce((s, m) => s + Number(m.points_week || 0), 0),
    red_count: members.filter(m => Number(m.today_habits) === 0).length,
    members: members.map(m => ({
      ...m,
      checkins_week: Number(m.checkins_week || 0),
      lessons_week: Number(m.lessons_week || 0),
      points_week: Number(m.points_week || 0),
      posts_week: Number(m.posts_week || 0),
      zoom_week: Number(m.zoom_week || 0),
      today_habits: Number(m.today_habits || 0)
    }))
  };
}

async function verifyToken(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  return JSON.parse(atob(parts[1]));
}
