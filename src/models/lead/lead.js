/**
 * Lead model — Funnel OS
 *
 * PDPA pattern: name / phone / email stored encrypted in `_encrypted*` fields.
 * Public getters/setters for PII enforce encryption at write-time and
 * decryption at read-time.
 */

const { encrypt, decrypt } = require('../../utils/encryption');
const { STATUSES, FUNNEL_LEVELS, TIER_LABELS, TIER_COLORS, SOURCES, uid } = require('./constants');

function isoNow() {
  return new Date().toISOString();
}

class Lead {
  constructor(data = {}) {
    this.id = data.id || uid();
    this.status = STATUSES.includes(data.status) ? data.status : 'new';
    this.funnelLevel = FUNNEL_LEVELS.includes(data.funnelLevel)
      ? data.funnelLevel
      : 0;
    this.source = SOURCES.includes(data.source) ? data.source : 'organic';
    this.assignedCtvId = data.assignedCtvId || null;
    this.promotedFromId = data.promotedFromId || null; // member.id when converted
    this.quizAnswers = data.quizAnswers || null;
    this.notes = data.notes || null;
    this.createdAt = data.createdAt || isoNow();
    this.updatedAt = data.updatedAt || isoNow();
    this.lastContactedAt = data.lastContactedAt || null;
    this.archivedAt = data.archivedAt || null;
    this.metadata = data.metadata || {};

    // Encrypted PII fields
    this._encryptedName = data._encryptedName || null;
    this._encryptedPhone = data._encryptedPhone || null;
    this._encryptedEmail = data._encryptedEmail || null;

    // Set initial values if provided as plain text (for backwards compatibility)
    if (data.name && !this._encryptedName) this.setName(data.name);
    if (data.phone && !this._encryptedPhone) this.setPhone(data.phone);
    if (data.email && !this._encryptedEmail) this.setEmail(data.email);
  }

  /* ---- PII accessors (PDPA-compliant) ---- */

  getName() {
    if (!this._encryptedName) return '';
    return decrypt(this._encryptedName) || '';
  }

  setName(name) {
    if (!name) {
      this._encryptedName = null;
    } else {
      this._encryptedName = encrypt(name);
    }
  }

  getPhone() {
    if (!this._encryptedPhone) return '';
    return decrypt(this._encryptedPhone) || '';
  }

  setPhone(phone) {
    if (!phone) {
      this._encryptedPhone = null;
    } else {
      this._encryptedPhone = encrypt(phone);
    }
  }

  getEmail() {
    if (!this._encryptedEmail) return '';
    return decrypt(this._encryptedEmail) || '';
  }

  setEmail(email) {
    if (!email) {
      this._encryptedEmail = null;
    } else {
      this._encryptedEmail = encrypt(email);
    }
  }

  /* ---- Serialization ---- */

  toJSON() {
    const obj = { ...this };
    // Never expose encrypted fields in JSON
    delete obj._encryptedName;
    delete obj._encryptedPhone;
    delete obj._encryptedEmail;

    // Add decrypted values for API responses (caller must log PDPA access)
    obj.name = this.getName();
    obj.phone = this.getPhone();
    obj.email = this.getEmail();

    return obj;
  }

  toDB() {
    // For database persistence: store encrypted values with _ prefix
    return {
      id: this.id,
      _encrypted_name: this._encryptedName,
      _encrypted_phone: this._encryptedPhone,
      _encrypted_email: this._encryptedEmail,
      status: this.status,
      funnel_level: this.funnelLevel,
      source: this.source,
      assigned_ctv_id: this.assignedCtvId,
      promoted_from_id: this.promotedFromId,
      quiz_answers: this.quizAnswers ? JSON.stringify(this.quizAnswers) : null,
      notes: this.notes,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      last_contacted_at: this.lastContactedAt,
      archived_at: this.archivedAt,
      metadata: JSON.stringify(this.metadata)
    };
  }

  /* ---- Transitions ---- */

  static canTransition(fromLevel, toLevel, lead = null) {
    if (fromLevel === toLevel) return { ok: false, reason: 'Same level' };
    if (!FUNNEL_LEVELS.includes(toLevel)) return { ok: false, reason: 'Invalid target' };
    if (toLevel < fromLevel) {
      // Allow demotion only from tier 1+ to contacted
      if (fromLevel >= 2 && toLevel === 1) return { ok: true };
      return { ok: false, reason: 'Reversion only allowed from tier ≥2 to trial' };
    }
    return { ok: true };
  }

  applyTransition(toLevel, actorId) {
    const result = Lead.canTransition(this.funnelLevel, toLevel, this);
    if (!result.ok) throw new Error(result.reason || 'Invalid transition');

    const prev = this.funnelLevel;
    this.funnelLevel = toLevel;
    this.updatedAt = isoNow();
    this.lastContactedAt = isoNow();

    // Log transition in metadata (lightweight, mirrors journey_events)
    const entry = {
      event: 'stage_transition',
      fromTier: prev,
      toTier: toLevel,
      fromLabel: TIER_LABELS[prev],
      toLabel: TIER_LABELS[toLevel],
      actorId,
      at: this.updatedAt,
    };
    if (!this.metadata.transitions) this.metadata.transitions = [];
    this.metadata.transitions.push(entry);
  }
}

/**
 * Seed the database with the default lead set when it is empty.
 * Mirrors the in-memory `createSeededLeads` so the DB-backed and
 * in-memory stores stay consistent.
 */
Lead.seedIfEmpty = async function (db) {
  if (!db || !db.getLead || !db.createLead) return;
  const existing = await db.listLeads ? await db.listLeads({}) : [];
  if (existing.length > 0) return;
  for (const l of Lead.createSeededLeads()) {
    await db.createLead(l.toDB ? l.toDB() : l);
  }
};

/**
 * Create seeded leads for testing/demo
 */
Lead.createSeededLeads = function () {
  const memberModule = require('../models/member');
  const MemberCls = memberModule.Member;
  const seededMembers = MemberCls.createSeededMembers ? MemberCls.createSeededMembers() : [];

  let nextId = 1;
  const make = (overrides) => {
    const l = new Lead(overrides);
    l.displayId = nextId++;
    return l;
  };

  return [
    // L0: Lead Magnet (3)
    make({ name: 'Nguyễn Văn A', phone: '+84901234567', email: 'nguyena@test.vn', funnelLevel: 0, source: 'zalo' }),
    make({ name: 'Trần Thị B', phone: '+84919876543', email: 'tranb@test.vn', funnelLevel: 0, source: 'social' }),
    make({ name: 'Lê Văn C', phone: '+84987654321', email: 'lec@test.vn', funnelLevel: 0, source: 'event' }),

    // L1: Trial (4)
    make({ name: 'Phạm Thị D', phone: '+84911223344', email: 'phamd@test.vn', funnelLevel: 1, source: 'referral', status: 'contacted', quizAnswers: { goal: 'dinh duong', budget: '150k' } }),
    make({ name: 'Hoàng Văn E', phone: '+84955667788', email: 'hoange@test.vn', funnelLevel: 1, source: 'organic', status: 'contacted' }),
    make({ name: 'Đỗ Thị F', phone: '+84933445566', email: 'dof@test.vn', funnelLevel: 1, source: 'zalo', quizAnswers: { goal: 'lam dep', budget: '500k' } }),
    make({ name: 'Vũ Văn G', phone: '+84977889900', email: 'vug@test.vn', funnelLevel: 1, status: 'qualified' }),

    // L2: Health Active (4)
    make({ name: 'Bùi Thị H', phone: '+84922334455', email: 'buih@test.vn', funnelLevel: 2, source: 'referral', status: 'qualified', promotedFromId: seededMembers[0]?.id || null }),
    make({ name: 'Ngô Văn I', phone: '+84966778899', email: 'ngoi@test.vn', funnelLevel: 2, source: 'social', status: 'converted', promotedFromId: seededMembers[1]?.id || null }),
    make({ name: 'Dương Thị K', phone: '+84944556677', email: 'duongk@test.vn', funnelLevel: 2, source: 'organic', status: 'qualified' }),
    make({ name: 'Trịnh Văn L', phone: '+84988990011', email: 'trinhl@test.vn', funnelLevel: 2, source: 'zalo', status: 'qualified' }),

    // L3: Combo (3)
    make({ name: 'Lý Thị M', phone: '+84955667722', email: 'lym@test.vn', funnelLevel: 3, source: 'referral', status: 'converted', notes: 'Potential leader candidate' }),
    make({ name: 'Phan Văn N', phone: '+84911223355', email: 'phann@test.vn', funnelLevel: 3, source: 'social', status: 'converted' }),
    make({ name: 'Đặng Thị O', phone: '+84977889933', email: 'dango@test.vn', funnelLevel: 3, source: 'event', status: 'converted' }),

    // L4: CTV Partner (2) — these are actual CTV members now
    make({ name: 'Hồ Văn P', phone: '+84933445588', email: 'hop@test.vn', funnelLevel: 4, source: 'referral', status: 'converted', promotedFromId: seededMembers[3]?.id || null, metadata: { isCTV: true, joinedAt: '2026-06-15' } }),
    make({ name: 'Ngô Thị Q', phone: '+84966779944', email: 'ngoq@test.vn', funnelLevel: 4, source: 'social', status: 'converted', promotedFromId: seededMembers[5]?.id || null, metadata: { isCTV: true, joinedAt: '2026-06-20' } }),
  ];
};

module.exports = { Lead, isoNow };