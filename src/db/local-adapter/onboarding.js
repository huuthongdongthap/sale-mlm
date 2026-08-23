/**
 * LocalDatabaseAdapter — Onboarding Sessions table operations
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

class OnboardingOps {
  constructor(db) {
    this.db = db;
  }

  async createOnboardingSession(memberId, week, day, module) {
    return bindRun(this.db.prepare('INSERT INTO onboarding_sessions (id, member_id, week, day, module, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(
      crypto.randomUUID(), memberId, week, day, module, 'pending', new Date().toISOString()
    ));
  }

  async getOnboardingSession(memberId, week, day) {
    return bindFirst(this.db.prepare('SELECT * FROM onboarding_sessions WHERE member_id = ? AND week = ? AND day = ?').bind(memberId, week, day));
  }

  async updateOnboardingSession(id, status) {
    return bindRun(this.db.prepare("UPDATE onboarding_sessions SET status = ? WHERE id = ?").bind(status, id));
  }
}

module.exports = { OnboardingOps };