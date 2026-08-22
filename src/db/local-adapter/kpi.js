/**
 * LocalDatabaseAdapter — KPI Rollups table operations
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

class KpiOps {
  constructor(db) {
    this.db = db;
  }

  async recordKPI(memberId, date, data) {
    return bindRun(this.db.prepare('INSERT OR REPLACE INTO kpi_rollups (id, member_id, date, connects_per_day, followups_per_day, first_order_14d, habit_score, window, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(
      crypto.randomUUID(), memberId, date,
      data.connects_per_day || 0, data.followups_per_day || 0,
      data.first_order_14d ? 1 : 0, data.habit_score || 0,
      data.window || 'daily', data.status || 'green'
    ));
  }

  async getMemberKPIs(memberId, window = 'daily', period = 30) {
    return bindAll(this.db.prepare('SELECT * FROM kpi_rollups WHERE member_id = ? ORDER BY date DESC LIMIT ?').bind(memberId, period));
  }
}

module.exports = { KpiOps };