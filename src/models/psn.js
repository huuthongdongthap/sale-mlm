class PSN {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.name = data.name || '';
    this.leaderId = data.leaderId || null;
    this.members = data.members || [];     // array of member IDs
    this.score = data.score || 0;          // PSN health score 0-100
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  get memberCount() { return this.members.length; }

  addMember(memberId) {
    if (!this.members.includes(memberId)) this.members.push(memberId);
  }

  toJSON() {
    return { ...this, memberCount: this.memberCount };
  }
  /**
   * Seed the database-backed psn table if empty.
   * Mirrors Order.seedIfEmpty so server.js startup seeding works for
   * the local SQLite adapter.
   */
  static async seedIfEmpty(db) {
    if (!db || typeof db.listPSNs !== 'function') return;
    const rows = await db.listPSNs({});
    const existing = Array.isArray(rows) ? rows : (rows.results || []);
    if (existing.length > 0) return;
    await db.createPSN({
      name: 'Rising Dragon',
      leaderId: 'psn-001',
      teamSize: 2,
      targetRevenueVND: 50000000,
      actualRevenueVND: 0
    });
  }
}

module.exports = PSN;
