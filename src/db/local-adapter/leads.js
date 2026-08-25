/**
 * LocalDatabaseAdapter — Leads table operations
 */

const crypto = require('crypto');

function bindRun(stmt, ...params) {
  if (params.length) stmt.bind(...params);
  return stmt.run();
}
function bindAll(stmt, ...params) {
  if (params.length) stmt.bind(...params);
  return stmt.all();
}
function bindFirst(stmt, ...params) {
  if (params.length) stmt.bind(...params);
  return stmt.get();
}

class LeadsOps {
  constructor(db) {
    this.db = db;
  }

  async createLead(data) {
    // leads.email is NOT NULL in the schema; store the plaintext alongside
    // the encrypted copy (mirrors members handling).
    return bindRun(this.db.prepare("INSERT INTO leads (id, name, email, email_encrypted, phone_encrypted, notes_encrypted, lead_stage, psn_id, org_id, source, status, funnel_level, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"),
      data.id, data.name || null, data.email || '', data.encryptedEmail || '',
      data.encryptedPhone || '', data.encryptedNotes || null,
      data.leadStage || 'lead_magnet', data.psnId || null, data.org_id || null,
      data.source || 'organic', data.status || 'new', data.funnelLevel !== undefined ? 'L' + data.funnelLevel : 'L0',
      new Date().toISOString(), new Date().toISOString()
    );
  }

  async getLead(id) {
    return bindFirst(this.db.prepare("SELECT * FROM leads WHERE id = ?").bind(id));
  }

  async listLeads(filters = {}) {
    let sql = "SELECT * FROM leads WHERE 1=1";
    const params = [];
    if (filters.psnId) { sql += " AND psn_id = ?"; params.push(filters.psnId); }
    if (filters.org_id) { sql += " AND org_id = ?"; params.push(filters.org_id); }
    if (filters.stage) { sql += " AND lead_stage = ?"; params.push(filters.stage); }
    if (filters.status) { sql += " AND status = ?"; params.push(filters.status); }
    sql += " ORDER BY created_at DESC";
    return bindAll(this.db.prepare(sql), ...params);
  }

  async updateLead(id, data) {
    const fields = [];
    const params = [];
    if (data.name !== undefined) { fields.push("name = ?"); params.push(data.name); }
    if (data.leadStage !== undefined) { fields.push("lead_stage = ?"); params.push(data.leadStage); }
    if (data.status !== undefined) { fields.push("status = ?"); params.push(data.status); }
    if (data.encryptedEmail !== undefined) { fields.push("email_encrypted = ?"); params.push(data.encryptedEmail); }
    if (data.encryptedPhone !== undefined) { fields.push("phone_encrypted = ?"); params.push(data.encryptedPhone); }
    if (data.encryptedNotes !== undefined) { fields.push("notes_encrypted = ?"); params.push(data.encryptedNotes); }
    if (data.psnId !== undefined) { fields.push("psn_id = ?"); params.push(data.psnId); }
    if (data.source !== undefined) { fields.push("source = ?"); params.push(data.source); }
    fields.push("updated_at = ?");
    params.push(new Date().toISOString(), id);
    return bindRun(this.db.prepare(`UPDATE leads SET ${fields.join(", ")} WHERE id = ?`), ...params);
  }

  async deleteLead(id) {
    return bindRun(this.db.prepare("DELETE FROM leads WHERE id = ?").bind(id));
  }
}

module.exports = { LeadsOps };