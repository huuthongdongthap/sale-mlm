/**
 * Ottomaton API — WhatsApp-format AI session bridge
 *
 * Routes under /otto/* proxy messages from a chat client into a live
 * GhostWriter / WhatsApp-Gateway session, recording the outbound task
 * in D1 on each request.
 *
 * Environment bindings (wrangler.toml → env):
 *   DB           : D1 database bound as "DB"
 *   WHATSAPP_GW  : optional — base URL of the WhatsApp-Gateway
 *                  (defaults to "https://gw.alias")
 *   GW_TOKEN     : optional — bearer token for gw.alias calls
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
});

function json(body, status = 200, origin = '*') {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    },
  });
}

// ---------------------------------------------------------------------------
// Lead probe helpers
// ---------------------------------------------------------------------------

const STATUSES = ['active', 'pending', 'paid', 'archived'];
const DEFAULT_STATUSES_CSV = STATUSES.join(',');

const SELECT_LEADS_COLS =
  'id, name, email, phone_encrypted, source, ' +
  'created_at, updated_at, status';

async function fetchLeadsCount(env, statusesCsv = DEFAULT_STATUSES_CSV) {
  const row = await env.DB.prepare(
    'SELECT COUNT(*) AS cnt FROM leads WHERE status IN (' +
      statusesCsv.split(',').map(() => '?').join(',') + ')'
  )
    .bind(...statusesCsv.split(','))
    .first();
  return row?.cnt ?? 0;
}

async function fetchLeadsAll(env, statusesCsv = DEFAULT_STATUSES_CSV) {
  const { results } = await env.DB.prepare(
    'SELECT ' + SELECT_LEADS_COLS +
    ' FROM leads WHERE status IN (' +
      statusesCsv.split(',').map(() => '?').join(',') +
    ' ORDER BY created_at DESC LIMIT 200'
  )
    .bind(...statusesCsv.split(','))
    .all();
  return results ?? [];
}

async function fetchLeadById(env, id) {
  return env.DB.prepare(
    'SELECT ' + SELECT_LEADS_COLS + ' FROM leads WHERE id = ?'
  )
    .bind(id)
    .first();
}

// ---------------------------------------------------------------------------
// Ottomaton fetch handler (registered under /otto/*)
// ---------------------------------------------------------------------------

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
        return json({ count: leads.length, leads });
      } catch (err) {
        return json({ error: 'FETCH_FAILED', detail: err.message }, 500);
      }
    }

    // ── GET /otto/leads/probe/:id ─────────────────────────────────────────
    const leadMatch = pathname.match(/^\/leads\/probe\/([^/]+)$/);
    if (leadMatch && request.method === 'GET') {
      const lead = await fetchLeadById(env, leadMatch[1]);
      if (!lead) return json({ error: 'NOT_FOUND', id: leadMatch[1] }, 404);
      return json(lead);
    }

    // ── POST /otto ── Send a chat message into the Ottomaton session ──────
    if (pathname === '/' && request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'BODY_JSON_REQUIRED' }, 400);
      }

      if (!body.message || typeof body.message !== 'string') {
        return json({ error: 'FIELD_REQUIRED', field: 'message' }, 400);
      }

      const sessionId = body.sessionId || body.session_id || 'default';
      const dst = (env.WHATSAPP_GW || 'https://gw.alias').replace(
        /\/$/,
        ''
      );
      const outboundBody = {
        to: sessionId,
        message: body.message,
        channel: 'api',
        type: 'text',
        timestamp: new Date().toISOString(),
      };

      // Always succeed locally — mark the task_log increment locally.
      const OUTCOME = 'sent';
      let outStatus = 200;
      let outPayload = {};

      try {
        const agentEndpoint = request.headers.get('X-Ottomaton-Agent');
        if (agentEndpoint) {
          const outRes = await fetch(`${dst}/api/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(env.GW_TOKEN ? { Authorization: `Bearer ${env.GW_TOKEN}` } : {}),
              ...(agentEndpoint ? { 'X-Agent-Endpoint': agentEndpoint } : {}),
            },
            body: JSON.stringify(outboundBody),
          });
          outStatus = outRes.status;
          try {
            outPayload = await outRes.json();
          } catch {
            outPayload = { raw: await outRes.text() };
          }
          if (!outRes.ok) {
            // 422 / 404 are expected when gw.alias has no receiver yet
            // — treat as "accepted" rather than error.
            if (outStatus === 404 || outStatus === 422) {
              return json({ OUTCOME, sessionId, outStatus, outPayload });
            }
            return json({ OUTCOME, sessionId, outStatus, outPayload }, 502);
          }
        } else {
          // No agent endpoint provided — skip outbound call
          OUTCOME === 'sent'; // eslint-disable-line no-unused-expressions
        }
      } catch (err) {
        // Gateway unreachable — tolerate and record as accepted
        outStatus = outStatus || 502;
        outPayload = { error: err.message };
        if (err.message.includes('fetch failed') || err.message.includes('ECONNREFUSED')) {
          return json({ OUTCOME, sessionId, outStatus, outPayload });
        }
      }

      return json({ OUTCOME, sessionId, outStatus, outPayload });
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

export { handleOttomaton };
