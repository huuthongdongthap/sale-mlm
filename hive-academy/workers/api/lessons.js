import { json } from './index.js';
import { awardPoints } from './points.js';

export async function handleLessons(request, env, path) {
  if (path === '/api/lessons' && request.method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT * FROM lessons ORDER BY order_num'
    ).all();
    return json(results);
  }

  if (path === '/api/lessons/by-level' && request.method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT * FROM lessons ORDER BY level, order_num'
    ).all();
    const grouped = results.reduce((acc, lesson) => {
      if (!acc[lesson.level]) acc[lesson.level] = [];
      acc[lesson.level].push(lesson);
      return acc;
    }, {});
    return json(grouped);
  }

  const lessonMatch = path.match(/\/api\/lessons\/([^/]+)/);
  if (lessonMatch && request.method === 'GET') {
    const lessonId = lessonMatch[1];
    const lesson = await env.DB.prepare(
      'SELECT * FROM lessons WHERE id = ?'
    ).bind(lessonId).first();

    if (!lesson) return json({ error: 'Lesson not found' }, 404);

    if (lesson.quiz_json) {
      try { lesson.quiz = JSON.parse(lesson.quiz_json); } catch {}
    }

    if (request.headers.get('Authorization')) {
      const token = request.headers.get('Authorization').split(' ')[1];
      try {
        const payload = await verifyToken(token, env.JWT_SECRET);
        const progress = await env.DB.prepare(
          'SELECT * FROM progress WHERE user_id = ? AND lesson_id = ?'
        ).bind(payload.userId, lessonId).first();
        lesson.progress = progress || null;
      } catch {}
    }

    return json(lesson);
  }

  if (path === '/api/lessons' && request.method === 'POST') {
    const { level, title, content, video_url, quiz_json, order_num } = await request.json();
    const id = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO lessons (id, level, title, content, video_url, quiz_json, order_num) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, level, title, content, video_url, quiz_json, order_num).run();
    return json({ id, message: 'Lesson created' }, 201);
  }

  return json({ error: 'Not found' }, 404);
}

export async function handleProgress(request, env, path) {
  if (path === '/api/progress' && request.method === 'GET') {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);
    const token = authHeader.split(' ')[1];
    try {
      const payload = await verifyToken(token, env.JWT_SECRET);
      const { results } = await env.DB.prepare(
        'SELECT p.*, l.title, l.level FROM progress p JOIN lessons l ON p.lesson_id = l.id WHERE p.user_id = ?'
      ).bind(payload.userId).all();
      return json(results);
    } catch {
      return json({ error: 'Invalid token' }, 401);
    }
  }

  if (path === '/api/progress/complete' && request.method === 'POST') {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);
    const token = authHeader.split(' ')[1];

    try {
      const payload = await verifyToken(token, env.JWT_SECRET);
      const { lesson_id, score } = await request.json();
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      await env.DB.prepare(
        'INSERT OR REPLACE INTO progress (id, user_id, lesson_id, completed, score, completed_at) VALUES (?, ?, ?, TRUE, ?, ?)'
      ).bind(id, payload.userId, lesson_id, score || 0, now).run();

      await awardPoints(env, payload.userId, 'lesson_complete', 5);

      return json({ message: 'Progress saved', points_earned: 5 });
    } catch (e) {
      return json({ error: 'Invalid token' }, 401);
    }
  }

  return json({ error: 'Not found' }, 404);
}

async function verifyToken(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  const payload = JSON.parse(atob(parts[1]));
  return payload;
}
