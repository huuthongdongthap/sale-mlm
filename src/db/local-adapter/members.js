/**
 * LocalDatabaseAdapter — Members table operations
 */

const crypto = require('crypto');

function bindFirst(stmt) {
  return stmt.get();
}

function bindAll(stmt, ...params) {
  if (params.length) stmt.bind(...params);
  return stmt.all();
}

function bindRun(stmt, ...params) {
  if (params.length) stmt.bind(...params);
  return stmt.run();
}

class MembersOps {
  constructor(db) {
    this.db = db;
  }

  async getMember(id) {
    return bindFirst(this.db.prepare('SELECT id, name, email, email_encrypted, phone_encrypted, password_hash, role, tier, psn_id, org_id, status, created_at FROM members WHERE id = ?').bind(id));
  }

  async listMembers(filters = {}) {
    let query = 'SELECT id, name, email, email_encrypted, phone_encrypted, password_hash, role, tier, psn_id, org_id, status, created_at FROM members WHERE 1=1';
    const params = [];
    if (filters.tier) { query += ' AND tier = ?'; params.push(filters.tier); }
    if (filters.role) { query += ' AND role = ?'; params.push(filters.role); }
    if (filters.psn_id) { query += ' AND psn_id = ?'; params.push(filters.psn_id); }
    if (filters.org_id) { query += ' AND org_id = ?'; params.push(filters.org_id); }
    if (filters.status) { query += ' AND status = ?'; params.push(filters.status); }
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(filters.limit || 50, filters.offset || 0);
    return bindAll(this.db.prepare(query), ...params);
  }

  async createMember(data) {
    const id = data.id || crypto.randomUUID();
    bindRun(this.db.prepare('INSERT INTO members (id, name, email, email_encrypted, phone_encrypted, password_hash, role, tier, psn_id, org_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(
      id, data.name, data.email, data.email_encrypted || '', data.phone_encrypted || '', data.password_hash || '', data.role || 'Member', data.tier || 1, data.psn_id || null, data.org_id || null
    ));
    return this.getMember(id);
  }

  async updateMember(id, data) {
    const fields = Object.keys(data).filter(k => !['id', 'created_at'].includes(k));
    if (!fields.length) return this.getMember(id);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => data[f]);
    bindRun(this.db.prepare(`UPDATE members SET ${setClause}, updated_at = datetime('now') WHERE id = ?`).bind(...values, id));
    return this.getMember(id);
  }

  async deleteMember(id) {
    return bindRun(this.db.prepare('DELETE FROM members WHERE id = ?').bind(id));
  }
}

module.exports = { MembersOps };