/**
* PHASE 4: Database Adapter — Cloudflare D1
* Wired to actual migration schema (0001_initial_schema.sql)
*
* Tables used: members, habits, kpi_rollups, training_progress,
* psn_health_history, alerts_log, audit_trail, referrals, onboarding_sessions
*/

class DatabaseAdapter {
constructor(db) {
this.db = db;
}

// ─── Members ───
async getMember(id) {
const result = await this.db.prepare(
'SELECT id, name, email, email_encrypted, role, tier, psn_id, created_at FROM members WHERE id = ?'
).bind(id).first();
return result;
}

async listMembers(filters = {}) {
let query = 'SELECT id, name, email, role, tier, psn_id, created_at FROM members WHERE 1=1';
const params = [];
if (filters.tier) { query += ' AND tier = ?'; params.push(filters.tier); }
if (filters.role) { query += ' AND role = ?'; params.push(filters.role); }
if (filters.psn_id) { query += ' AND psn_id = ?'; params.push(filters.psn_id); }
query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
params.push(filters.limit || 50, filters.offset || 0);
return await this.db.prepare(query).bind(...params).all();
}

async createMember(data) {
const id = crypto.randomUUID();
await this.db.prepare(
'INSERT INTO members (id, name, email, email_encrypted, password_hash, role, tier, psn_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
).bind(
id, data.name, data.email, data.email || '', data.password_hash || '', data.role || 'Member', data.tier || 1, data.psn_id || null
).run();
return this.getMember(id);
}

async updateMember(id, data) {
const allowed = ['name', 'email', 'role', 'tier', 'psn_id', 'password_hash'];
const fields = Object.keys(data).filter(k => allowed.includes(k));
if (!fields.length) return this.getMember(id);
const setClause = fields.map(f => `${f} = ?`).join(', ');
const values = fields.map(f => data[f]);
await this.db.prepare(
`UPDATE members SET ${setClause}, updated_at = datetime('now') WHERE id = ?`
).bind(...values, id).run();
return this.getMember(id);
}

async deleteMember(id) {
return await this.db.prepare('DELETE FROM members WHERE id = ?').bind(id).run();
}

// ─── Habits ───
async recordCheckin(memberId, date, items, habitScore = 0, streak = 0) {
const result = await this.db.prepare(
'INSERT OR REPLACE INTO habits (id, member_id, date, items, score, streak) VALUES (?, ?, ?, ?, ?, ?)'
).bind(crypto.randomUUID(), memberId, date, JSON.stringify(items), habitScore, streak).run();
return result;
}

async getMemberHabits(memberId, limit = 30) {
return await this.db.prepare(
'SELECT * FROM habits WHERE member_id = ? ORDER BY date DESC LIMIT ?'
).bind(memberId, limit).all();
}

async getMemberStreak(memberId) {
const result = await this.db.prepare(
'SELECT streak FROM habits WHERE member_id = ? ORDER BY date DESC LIMIT 1'
).bind(memberId).first();
return result ? result.streak : 0;
}

// ─── KPI Rollups ───
async recordKPI(memberId, date, data) {
await this.db.prepare(
'INSERT OR REPLACE INTO kpi_rollups (id, member_id, date, connects_per_day, followups_per_day, first_order, orders_count, revenue) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
).bind(
crypto.randomUUID(), memberId, date,
data.connects_per_day || 0, data.followups_per_day || 0,
data.first_order ? 1 : 0, data.orders_count || 0, data.revenue || 0
).run();
}

async getMemberKPIs(memberId, window = 'daily', period = 30) {
return await this.db.prepare(
'SELECT * FROM kpi_rollups WHERE member_id = ? ORDER BY date DESC LIMIT ?'
).bind(memberId, period).all();
}

// ─── PSN Health ───
async getPSNHealth(psnId) {
const result = await this.db.prepare(
'SELECT * FROM psn_health_history WHERE psn_id = ? ORDER BY created_at DESC LIMIT 1'
).bind(psnId).first();
return result;
}

async recordPSNHealth(psnId, state, riskLevel, metrics = {}) {
await this.db.prepare(
'INSERT INTO psn_health_history (id, psn_id, state, risk_level, metrics) VALUES (?, ?, ?, ?, ?)'
).bind(crypto.randomUUID(), psnId, state, riskLevel, JSON.stringify(metrics)).run();
}

async listPSNHealth() {
return await this.db.prepare(
'SELECT DISTINCT psn_id, state, risk_level, created_at FROM psn_health_history ORDER BY created_at DESC LIMIT 100'
).all();
}

// ─── Alert Log ───
async logAlert(data) {
await this.db.prepare(
'INSERT INTO alerts_log (id, rule_id, metric, severity, evidence, psn_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
).bind(
crypto.randomUUID(), data.ruleId || 'default', data.metric || 'unknown',
data.severity || 'info', JSON.stringify(data.evidence || {}),
data.psnId || null, new Date().toISOString()
).run();
}

async getAlertLog(filters = {}) {
let query = 'SELECT * FROM alerts_log WHERE 1=1';
const params = [];
if (filters.severity) { query += ' AND severity = ?'; params.push(filters.severity); }
if (filters.psn_id) { query += ' AND psn_id = ?'; params.push(filters.psn_id); }
query += ' ORDER BY created_at DESC LIMIT ?';
params.push(filters.limit || 100);
return await this.db.prepare(query).bind(...params).all();
}

// ─── Audit Trail (PDPA compliant) ───
async logAudit(data) {
await this.db.prepare(
'INSERT INTO audit_trail (id, actor_id, action, resource_type, resource_id, pii_fields, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
).bind(
crypto.randomUUID(), data.actorId || 'system', data.action || 'unknown',
data.resourceType || 'unknown', data.resourceId || null,
JSON.stringify(data.piiFields || []), data.ipAddress || null, data.userAgent || null
).run();
}

// ─── Referrals ───
async createReferral(referrerId, refereeId, refereeEmail, refereeName) {
await this.db.prepare(
'INSERT INTO referrals (id, referrer_id, referee_id, referee_email, referee_name, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
).bind(crypto.randomUUID(), referrerId, refereeId, refereeEmail, refereeName, 'pending', new Date().toISOString()).run();
}

async getReferralsByReferrer(referrerId) {
return await this.db.prepare(
'SELECT * FROM referrals WHERE referrer_id = ? ORDER BY created_at DESC'
).bind(referrerId).all();
}

// ─── Training Progress ───
async recordTrainingProgress(memberId, type, value = {}) {
await this.db.prepare(
'INSERT OR REPLACE INTO training_progress (id, member_id, type, value, updated_at) VALUES (?, ?, ?, ?, ?)'
).bind(crypto.randomUUID(), memberId, type, JSON.stringify(value), new Date().toISOString()).run();
}

async getTrainingProgress(memberId, type) {
const result = await this.db.prepare(
'SELECT * FROM training_progress WHERE member_id = ? AND type = ? ORDER BY updated_at DESC LIMIT 1'
).bind(memberId, type).first();
return result;
}

// ─── Onboarding Sessions ───
async createOnboardingSession(memberId, week, day, module) {
await this.db.prepare(
'INSERT INTO onboarding_sessions (id, member_id, week, day, module, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
).bind(crypto.randomUUID(), memberId, week, day, module, 'pending', new Date().toISOString()).run();
}

async getOnboardingSession(memberId, week, day) {
return await this.db.prepare(
'SELECT * FROM onboarding_sessions WHERE member_id = ? AND week = ? AND day = ?'
).bind(memberId, week, day).first();
}

async updateOnboardingSession(id, status) {
await this.db.prepare(
"UPDATE onboarding_sessions SET status = ? WHERE id = ?"
).bind(status, id).run();
}
}

module.exports = DatabaseAdapter;
