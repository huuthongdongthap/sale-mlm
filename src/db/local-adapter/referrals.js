/**
 * LocalDatabaseAdapter — Referrals table operations
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

class ReferralsOps {
  constructor(db) {
    this.db = db;
  }

  async createReferral(referralId, referrerId, refereeId) {
    return bindRun(this.db.prepare('INSERT INTO referrals (id, referrer_id, referee_id, referee_email, reward_status, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(
      referralId || crypto.randomUUID(), referrerId, refereeId, '', 'pending', new Date().toISOString()
    ));
  }

  async getReferralsByReferrer(referrerId) {
    return bindAll(this.db.prepare('SELECT * FROM referrals WHERE referrer_id = ? ORDER BY created_at DESC').bind(referrerId));
  }

  async activateReferral(referralId) {
    await bindRun(this.db.prepare("UPDATE referrals SET reward_status = 'active' WHERE id = ? AND reward_status = 'pending'").bind(referralId));
    return bindAll(this.db.prepare('SELECT * FROM referrals WHERE id = ?').bind(referralId))[0] || null;
  }

  async findPendingByReferee(refereeId) {
    return bindAll(this.db.prepare("SELECT * FROM referrals WHERE referee_id = ? AND reward_status = 'pending'").bind(refereeId));
  }

  async getActiveReferralCounts() {
    return bindAll(this.db.prepare("SELECT referrer_id, COUNT(*) AS active_count FROM referrals WHERE reward_status = 'active' GROUP BY referrer_id ORDER BY active_count DESC"));
  }
}

module.exports = { ReferralsOps };
