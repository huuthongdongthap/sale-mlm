/**
 * Ottomaton — fetch handler (registered under /otto/*)
 */
const { corsHeaders, json } = require('./cors');
const { handleMessage } = require('./message');
const {
  fetchLeadsCount,
  fetchLeadsAll,
  fetchLeadById,
} = require('./leads');

async function handleOttomaton(request, env) {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders(request.headers.get('origin')),
    });
  }

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/^\/otto/, '') || '/';

  try {
    // ── GET /otto/health ──────────────────────────────────────────────────
    if (pathname === '/health' && request.method === 'GET') {
      return json({ ok: true, service: 'ottomaton', ts: Date.now() });
    }

    // ── GET /otto/leads/probe/count ───────────────────────────────────────
    if (
      pathname === '/leads/probe/count' &&
      request.method === 'GET'
    ) {
      try {
        const count = await fetchLeadsCount(env);
        return json({ count });
      } catch (err) {
        return json({ error: 'COUNT_FAILED', detail: err.message }, 500);
      }
    }

    // ── GET /otto/leads/probe/all ─────────────────────────────────────────
    if (
      pathname === '/leads/probe/all' &&
      request.method === 'GET'
    ) {
      try {
        const leads = await fetchLeadsAll(env);
        return json({ leads });
      } catch (err) {
        return json({ error: 'LEADS_FETCH_FAILED', detail: err.message }, 500);
      }
    }

    // ── GET /otto/leads/:id ───────────────────────────────────────────────
    if (
      /^\/leads\/[^/]+$/.test(pathname) &&
      request.method === 'GET'
    ) {
      const id = pathname.split('/')[2];
      try {
        const lead = await fetchLeadById(env, id);
        if (!lead) {
          return json({ error: 'LEAD_NOT_FOUND' }, 404);
        }
        return json({ lead });
      } catch (err) {
        return json({ error: 'LEAD_FETCH_FAILED', detail: err.message }, 500);
      }
    }

    // ── POST /otto/leads/:id/ack ──────────────────────────────────────────
    if (
      /^\/leads\/[^/]+\/ack$/.test(pathname) &&
      request.method === 'POST'
    ) {
      const leadId = pathname.split('/')[2];
      try {
        await env.DB.prepare(
          'UPDATE leads SET status = ?, updated_at = ? WHERE id = ?'
        )
          .bind('archived', new Date().toISOString(), leadId)
          .run();
        return json({ ok: true, leadId });
      } catch (err) {
        return json({ error: 'ACK_FAILED', detail: err.message }, 500);
      }
    }

    // ── POST /otto/leads/:id/notes ────────────────────────────────────────
    if (
      /^\/leads\/[^/]+\/notes$/.test(pathname) &&
      request.method === 'POST'
    ) {
      const leadId = pathname.split('/')[2];
      let body = {};
      try {
        body = await request.json();
      } catch {
        return json({ error: 'INVALID_JSON' }, 400);
      }
      const note = body.note || '';
      try {
        await env.DB.prepare(
          'INSERT INTO lead_notes (lead_id, note, created_at) VALUES (?, ?, ?)'
        )
          .bind(leadId, note, new Date().toISOString())
          .run();
        return json({ ok: true, leadId });
      } catch (err) {
        return json({ error: 'NOTE_FAILED', detail: err.message }, 500);
      }
    }

    // ── POST /otto/message — WhatsApp-format session bridge ───────────────
    if (pathname === '/message' && request.method === 'POST') {
      return handleMessage(request, env);
    }

    // ── Fallback ─────────────────────────────────────────────────────────
    return json({ error: 'NOT_FOUND', path: pathname }, 404);

  } catch (err) {
    const msg = err.message || String(err);
    return json(
      { error: 'INTERNAL', detail: msg },
      500
    );
  }
}

module.exports = { handleOttomaton };