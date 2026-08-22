/**
 * LocalDatabaseAdapter — PSN table operations
 */

const crypto = require('crypto');

function bindRun(stmt, ...params) {
  return stmt.bind(...params).run();
}
function bindAll(stmt, ...params) {
  return stmt.bind(...params).all();
}
function bindFirst(stmt, ...params) {
  return stmt.bind(...params).first();
}

class PsnOps {
  constructor(db) {
    this.db = db;
  }

  async createPSN(data) {
    return bindRun(this.db.prepare("INSERT INTO psn (id, name, leader_id, team_size, target_revenue_vnd, actual_revenue_vnd, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(
      crypto.randomUUID(), data.name, data.leaderId || null, data.teamSize || 0,
      data.targetRevenueVND || 0, data.actualRevenueVND || 0,
      new Date().toISOString(), new Date().toISOString()
    ));
  }

  async getPSN(id) {
    return bindFirst(this.db.prepare("SELECT * FROM psn WHERE id = ?").bind(id));
  }

  async listPSNs(filters = {}) {
    let sql = "SELECT * FROM psn WHERE 1=1";
    const params = [];
    if (filters.leaderId) { sql += " AND leader_id = ?"; params.push(filters.leaderId); }
    sql += " ORDER BY created_at DESC";
    return bindAll(this.db.prepare(sql), ...params);
  }

  async updatePSN(id, data) {
    const fields = [];
    const params = [];
    if (data.name !== undefined) { fields.push("name = ?"); params.push(data.name); }
    if (data.leaderId !== undefined) { fields.push("leader_id = ?"); params.push(data.leaderId); }
    if (data.teamSize !== undefined) { fields.push("team_size = ?"); params.push(data.teamSize); }
    if (data.targetRevenueVND !== undefined) { fields.push("target_revenue_vnd = ?"); params.push(data.targetRevenueVND); }
    if (data.actualRevenueVND !== undefined) { fields.push("actual_revenue_vnd = ?"); params.push(data.actualRevenueVND); }
    fields.push("updated_at = ?");
    params.push(new Date().toISOString(), id);
    return bindRun(this.db.prepare(`UPDATE psn SET ${fields.join(", ")} WHERE id = ?`), ...params);
  }

  async deletePSN(id) {
    return bindRun(this.db.prepare("DELETE FROM psn WHERE id = ?").bind(id));
  }
}

module.exports = { PsnOps };