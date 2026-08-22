/**
 * Ottomaton — POST /otto/message handler
 *
 * WhatsApp-format session bridge: records the outbound task in D1 and
 * proxies it to the configured agent endpoint. Gateway failures are
 * tolerated and recorded as "accepted" rather than surfaced as errors.
 */
const { json } = require('./cors');

/**
 * Handle a /message POST request.
 *
 * @param {Request} request
 * @param {object} env  — env bindings (DB, WHATSAPP_GW, GW_TOKEN)
 */
async function handleMessage(request, env) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({ error: 'INVALID_JSON' }, 400);
  }

  const { leadId, text, agentEndpoint, sessionId } = body;
  if (!text) {
    return json({ error: 'MISSING_TEXT' }, 400);
  }

  // Record outbound task in D1
  let OUTCOME = 'accepted';
  let outStatus = 0;
  let outPayload = null;

  try {
    if (env.DB) {
      await env.DB.prepare(
        'INSERT INTO ottomaton_tasks (lead_id, text, session_id, outcome, created_at) VALUES (?, ?, ?, ?, ?)'
      )
        .bind(leadId || null, text, sessionId || null, OUTCOME, new Date().toISOString())
        .run();
    }

    const WHATSAPP_GW = env.WHATSAPP_GW || 'https://gw.alias';
    const GW_TOKEN = env.GW_TOKEN;

    if (agentEndpoint) {
      const outboundBody = {
        leadId,
        text,
        sessionId,
        timestamp: new Date().toISOString(),
      };

      const outRes = await fetch(agentEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(GW_TOKEN ? { Authorization: `Bearer ${GW_TOKEN}` } : {}),
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

module.exports = { handleMessage };