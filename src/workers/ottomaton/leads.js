/**
 * Ottomaton — lead probe helpers
 */

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

module.exports = { STATUSES, DEFAULT_STATUSES_CSV, SELECT_LEADS_COLS, fetchLeadsCount, fetchLeadsAll, fetchLeadById };