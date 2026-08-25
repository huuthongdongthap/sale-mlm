/**
 * Local SQLite adapter for development
 * Mirrors DatabaseAdapter interface for Cloudflare D1
 *
 * Backward-compatible barrel. Implementation split across:
 *   src/db/local-adapter/members.js   — Members table operations
 *   src/db/local-adapter/habits.js    — Habits table operations
 *   src/db/local-adapter/kpi.js       — KPI Rollups table operations
 *   src/db/local-adapter/psn-health.js — PSN Health table operations
 *   src/db/local-adapter/alerts.js    — Alerts table operations
 *   src/db/local-adapter/audit.js     — Audit Trail table operations
 *   src/db/local-adapter/referrals.js — Referrals table operations
 *   src/db/local-adapter/training.js  — Training Progress table operations
 *   src/db/local-adapter/onboarding.js — Onboarding Sessions table operations
 *   src/db/local-adapter/leads.js     — Leads table operations
 *   src/db/local-adapter/orders.js    — Orders table operations
 *   src/db/local-adapter/psn.js       — PSN table operations
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const { MembersOps } = require('./members');
const { HabitsOps } = require('./habits');
const { KpiOps } = require('./kpi');
const { PsnHealthOps } = require('./psn-health');
const { AlertsOps } = require('./alerts');
const { AuditOps } = require('./audit');
const { ReferralsOps } = require('./referrals');
const { TrainingOps } = require('./training');
const { OnboardingOps } = require('./onboarding');
const { LeadsOps } = require('./leads');
const { OrdersOps } = require('./orders');
const { PsnOps } = require('./psn');
const { OrgsOps } = require('./orgs');

class LocalDatabaseAdapter {
  constructor(dbPath = null, wipe = false) {
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    // In test mode default to an in-memory database so every adapter
    // instance is fully isolated. A shared file cannot work: a test file
    // that requires server.js at module scope pins one adapter instance,
    // and a later suite's wipe would silently destroy that instance's data.
    const dbFile = (process.env.NODE_ENV === 'test' && !dbPath)
      ? ':memory:'
      : (dbPath || path.join(dataDir, 'hive-warfare-dev.db'));
    this.db = new Database(dbFile);
    this._runMigrations();

    // Initialize operation modules
    this.members = new MembersOps(this.db);
    this.habits = new HabitsOps(this.db);
    this.kpi = new KpiOps(this.db);
    this.psnHealth = new PsnHealthOps(this.db);
    this.alerts = new AlertsOps(this.db);
    this.audit = new AuditOps(this.db);
    this.referrals = new ReferralsOps(this.db);
    this.training = new TrainingOps(this.db);
    this.onboarding = new OnboardingOps(this.db);
    this.leads = new LeadsOps(this.db);
    this.orders = new OrdersOps(this.db);
    this.psn = new PsnOps(this.db);
    this.orgs = new OrgsOps(this.db);
  }

  _runMigrations() {
    // Apply every migration in migrations/ in filename order so tables
    // added by later files (leads/orders/psn in 0004_funnel_tables.sql)
    // exist alongside the base schema.
    const migrationsDir = path.join(__dirname, '../../../migrations');
    if (!fs.existsSync(migrationsDir)) return;
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const statements = sql.split(';').filter(s => s.trim());
      for (const stmt of statements) {
        try {
          this.db.exec(stmt);
        } catch (err) {
          const msg = err.message.toLowerCase();
          if (!msg.includes('already exists') && !msg.includes('duplicate column name')) {
            console.warn('[local-adapter] Migration warning (' + file + '):', err.message);
          }
        }
      }
    }
  }

  prepare(sql) {
    // Wrap the native statement so callers can chain .bind(...).run/all/get
    // (get replaces the non-existent .first from the D1-style API).
    const stmt = this.db.prepare(sql);
    return {
      bind: (...params) => {
        if (params.length) stmt.bind(...params);
        return {
          run: () => stmt.run(),
          all: () => stmt.all(),
          get: () => stmt.get(),
          // Legacy alias — better-sqlite3 v13 has no .first()
          first: () => stmt.get(),
        };
      },
    };
  }

  // Delegate to operation modules — maintains backward compatibility
  async getMember(id) { return this.members.getMember(id); }
  async listMembers(filters = {}) { return this.members.listMembers(filters); }
  async createMember(data) { return this.members.createMember(data); }
  async updateMember(id, data) { return this.members.updateMember(id, data); }
  async deleteMember(id) { return this.members.deleteMember(id); }

  async recordCheckin(memberId, date, items, habitScore = 0, streak = 0) {
    return this.habits.recordCheckin(memberId, date, items, habitScore, streak);
  }
  async getMemberHabits(memberId, limit = 30) { return this.habits.getMemberHabits(memberId, limit); }
  async getMemberStreak(memberId) { return this.habits.getMemberStreak(memberId); }

  async recordKPI(memberId, date, data) { return this.kpi.recordKPI(memberId, date, data); }
  async getMemberKPIs(memberId, window = 'daily', period = 30) { return this.kpi.getMemberKPIs(memberId, window, period); }

  async getPSNHealth(psnId) { return this.psnHealth.getPSNHealth(psnId); }
  async recordPSNHealth(psnId, state, riskLevel, metrics = {}) { return this.psnHealth.recordPSNHealth(psnId, state, riskLevel, metrics); }
  async listPSNHealth() { return this.psnHealth.listPSNHealth(); }

  async logAlert(data) { return this.alerts.logAlert(data); }
  async getAlertLog(filters = {}) { return this.alerts.getAlertLog(filters); }

  async getAuditTrail(filters = {}) { return this.audit.getAuditTrail(filters); }
  async logAudit(data) { return this.audit.logAudit(data); }

  async createReferral(referrerId, refereeId, refereeEmail, refereeName) { return this.referrals.createReferral(referrerId, refereeId, refereeEmail, refereeName); }
  async getReferralsByReferrer(referrerId) { return this.referrals.getReferralsByReferrer(referrerId); }

  async recordTrainingProgress(memberId, type, value = {}) { return this.training.recordTrainingProgress(memberId, type, value); }
  async getTrainingProgress(memberId, type) { return this.training.getTrainingProgress(memberId, type); }

  async createOnboardingSession(memberId, week, day, module) { return this.onboarding.createOnboardingSession(memberId, week, day, module); }
  async getOnboardingSession(memberId, week, day) { return this.onboarding.getOnboardingSession(memberId, week, day); }
  async updateOnboardingSession(id, status) { return this.onboarding.updateOnboardingSession(id, status); }

  async createLead(data) { return this.leads.createLead(data); }
  async getLead(id) { return this.leads.getLead(id); }
  async listLeads(filters = {}) { return this.leads.listLeads(filters); }
  async updateLead(id, data) { return this.leads.updateLead(id, data); }
  async deleteLead(id) { return this.leads.deleteLead(id); }

  async createOrder(data) { return this.orders.createOrder(data); }
  async getOrder(id) { return this.orders.getOrder(id); }
  async listOrders(filters = {}) { return this.orders.listOrders(filters); }
  async updateOrder(id, data) { return this.orders.updateOrder(id, data); }
  async deleteOrder(id) { return this.orders.deleteOrder(id); }
  async clearOrders() { return this.orders.clearOrders(); }

  async createPSN(data) { return this.psn.createPSN(data); }
  async getPSN(id) { return this.psn.getPSN(id); }
  async listPSNs(filters = {}) { return this.psn.listPSNs(filters); }
  async updatePSN(id, data) { return this.psn.updatePSN(id, data); }
  async deletePSN(id) { return this.psn.deletePSN(id); }

  async createOrg(data) { return this.orgs.createOrg(data); }
  async getOrg(id) { return this.orgs.getOrg(id); }
  async listOrgs(filters = {}) { return this.orgs.listOrgs(filters); }
  async updateOrg(id, data) { return this.orgs.updateOrg(id, data); }
  async deleteOrg(id) { return this.orgs.deleteOrg(id); }

  close() {
    this.db.close();
  }
}

module.exports = { LocalDatabaseAdapter };