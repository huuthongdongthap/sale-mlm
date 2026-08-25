/**
 * Org model — multi-tenant organization
 * Mirrors PSN pattern: constructor + seedIfEmpty for local adapter
 */

const crypto = require('crypto');

class Org {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.name = data.name || '';
    this.slug = data.slug || null;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  static async seedIfEmpty(db) {
    if (!db || typeof db.listOrgs !== 'function') return;
    const rows = await db.listOrgs({});
    const existing = Array.isArray(rows) ? rows : (rows.results || []);
    if (existing.length > 0) return;
    await db.createOrg({
      id: 'org-default',
      name: 'Default Organization',
      slug: 'default'
    });
  }

  static async findById(db, orgId) {
    if (!db || typeof db.getOrg !== 'function') return null;
    return await db.getOrg(orgId);
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = { Org };