import { json } from './index.js';
import { awardPoints } from './points.js';

const CHANNELS = ['Kỹ năng bán hàng', 'Chia sẻ kinh nghiệm', 'Thắc mắc', 'Thành công', 'Tâm sự', 'Công cụ'];

export async function handlePosts(request, env, path) {
  if (path === '/api/posts' && request.method === 'GET') {
    const url = new URL(request.url);
    const channel = url.searchParams.get('channel');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = `
      SELECT posts.*, users.name as author_name, users.level as author_level,
        (SELECT IFNULL(SUM(points), 0) FROM points WHERE user_id = posts.user_id) as author_points
      FROM posts
      LEFT JOIN users ON posts.user_id = users.id
    `;
    let bindings = [];

    if (channel) {
      query += ' WHERE posts.channel = ?';
      bindings.push(channel);
    }

    query += ' ORDER BY posts.created_at DESC LIMIT ? OFFSET ?';
    bindings.push(limit, offset);

    const { results } = await env.DB.prepare(query).bind(...bindings).all();

    results.forEach(p => {
      if (p.likes_json) {
        try { p.likes_by = JSON.parse(p.likes_json); } catch {}
      }
    });

    return json(results);
  }

  if (path === '/api/posts/channels' && request.method === 'GET') {
    return json(CHANNELS);
  }

  if (path === '/api/posts' && request.method === 'POST') {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);
    const token = authHeader.split(' ')[1];
    try {
      const payload = await verifyToken(token, env.JWT_SECRET);
      const { content, channel } = await request.json();
      if (!content || content.trim().length === 0) return json({ error: 'Content required' }, 400);

      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      await env.DB.prepare(
        'INSERT INTO posts (id, user_id, content, channel, created_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(id, payload.userId, content.trim(), channel || 'Chia sẻ kinh nghiệm', now).run();

      await awardPoints(env, payload.userId, 'post_share', 2);

      const post = await env.DB.prepare(
        'SELECT posts.*, users.name as author_name, users.level as author_level FROM posts LEFT JOIN users ON posts.user_id = users.id WHERE posts.id = ?'
      ).bind(id).first();

      return json(post, 201);
    } catch (e) {
      return json({ error: 'Invalid token' }, 401);
    }
  }

  const postMatch = path.match(/\/api\/posts\/([^/]+)/);
  if (postMatch && request.method === 'GET') {
    const postId = postMatch[1];
    const post = await env.DB.prepare(
      'SELECT posts.*, users.name as author_name, users.level as author_level FROM posts LEFT JOIN users ON posts.user_id = users.id WHERE posts.id = ?'
    ).bind(postId).first();

    if (!post) return json({ error: 'Post not found' }, 404);
    if (post.likes_json) {
      try { post.likes_by = JSON.parse(post.likes_json); } catch {}
    }
    return json(post);
  }

  if (postMatch && request.method === 'DELETE') {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);
    const token = authHeader.split(' ')[1];
    try {
      const payload = await verifyToken(token, env.JWT_SECRET);
      const postId = postMatch[1];

      const post = await env.DB.prepare('SELECT user_id FROM posts WHERE id = ?').bind(postId).first();
      if (!post) return json({ error: 'Post not found' }, 404);
      if (post.user_id !== payload.userId) return json({ error: 'Forbidden' }, 403);

      await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(postId).run();
      return json({ message: 'Post deleted' });
    } catch {
      return json({ error: 'Invalid token' }, 401);
    }
  }

  if (path.match(/\/api\/posts\/[^/]+\/like/) && request.method === 'POST') {
    const postId = path.split('/')[3];
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);
    const token = authHeader.split(' ')[1];
    try {
      const payload = await verifyToken(token, env.JWT_SECRET);

      const post = await env.DB.prepare('SELECT likes_json FROM posts WHERE id = ?').bind(postId).first();
      if (!post) return json({ error: 'Post not found' }, 404);

      let likesBy = [];
      if (post.likes_json) {
        try { likesBy = JSON.parse(post.likes_json); } catch {}
      }

      const userIdx = likesBy.indexOf(payload.userId);
      if (userIdx > -1) {
        likesBy.splice(userIdx, 1);
      } else {
        likesBy.push(payload.userId);
      }

      await env.DB.prepare(
        'UPDATE posts SET likes = ?, likes_json = ? WHERE id = ?'
      ).bind(likesBy.length, JSON.stringify(likesBy), postId).run();

      return json({ liked: userIdx === -1, likes: likesBy.length });
    } catch {
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
