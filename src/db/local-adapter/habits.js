/**
 * LocalDatabaseAdapter — Habits table operations
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

class HabitsOps {
  constructor(db) {
    this.db = db;
  }

  async recordCheckin(memberId, date, items, habitScore = 0, streak = 0) {
    return bindRun(this.db.prepare('INSERT OR REPLACE INTO habits (id, member_id, date, items, score, streak) VALUES (?, ?, ?, ?, ?, ?)').bind(
      crypto.randomUUID(), memberId, date, JSON.stringify(items), habitScore, streak
    ));
  }

  async getMemberHabits(memberId, limit = 30) {
    return bindAll(this.db.prepare('SELECT * FROM habits WHERE member_id = ? ORDER BY date DESC LIMIT ?').bind(memberId, limit));
  }

  async getMemberStreak(memberId) {
    const result = bindFirst(this.db.prepare('SELECT streak FROM habits WHERE member_id = ? ORDER BY date DESC LIMIT 1').bind(memberId));
    return result ? result.streak : 0;
  }
}

module.exports = { HabitsOps };