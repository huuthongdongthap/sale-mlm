/**
 * LocalDatabaseAdapter — Orgs table operations
 * orgs table created by migrations/0008_multi_tenant_orgs.sql
 */

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

class OrgsOps {
  constructor(db) {
    this.db = db;
  }

  async createOrg(data) {
    return bindRun(this.db.prepare("INSERT INTO orgs (id, name, slug, created_at) VALUES (?, ?, ?, ?)"),
      data.id || crypto.randomUUID(), data.name, data.slug || null,
      new Date().toISOString()
    );
  }

  async getOrg(id) {
    return bindFirst(this.db.prepare("SELECT * FROM orgs WHERE id = ?"), id);
  }

  async listOrgs(filters = {}) {
    let sql = "SELECT * FROM orgs WHERE 1=1";
    const params = [];
    if (filters.slug) { sql += " AND slug = ?"; params.push(filters.slug); }
    sql += " ORDER BY created_at DESC";
    return bindAll(this.db.prepare(sql), ...params);
  }

  async updateOrg(id, data) {
    const fields = [];
    const params = [];
    if (data.name !== undefined) { fields.push("name = ?"); params.push(data.name); }
    if (data.slug !== undefined) { fields.push("slug = ?"); params.push(data.slug); }
    if (!fields.length) return;
    params.push(id);
    return bindRun(this.db.prepare(`UPDATE orgs SET ${fields.join(", ")} WHERE id = ?`), ...params);
  }

  async deleteOrg(id) {
    return bindRun(this.db.prepare("DELETE FROM orgs WHERE id = ?"), id);
  }
}

module.exports = { OrgsOps };