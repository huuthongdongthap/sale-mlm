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
 *
 * Implementation lives in src/workers/ottomaton/
 */
const { handleOttomaton } = require('./handler');

module.exports = { handleOttomaton };