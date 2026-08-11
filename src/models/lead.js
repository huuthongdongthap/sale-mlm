/**
 * Lead model — Funnel OS
 *
 * PDPA pattern: name / phone / email stored encrypted in `_encrypted*` fields.
 * Public getters/setters for PII enforce encryption at write-time and
 * decryption at read-time.
 */

const crypto = require('crypto');
const { encrypt, decrypt } = require('../utils/encryption');

const STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost', 'archived'];
const FUNNEL_LEVELS = [0, 1, 2, 3, 4];
const TIER_LABELS = [
  'Lead Magnet', // 0
  'Trial', // 1
  'Health Active', // 2
  'Combo', // 3
  'CTV Partner', // 4
];
const TIER_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
const SOURCES = ['organic', 'referral', 'social', 'zalo', 'event', 'ads'];

function uid() {
  return crypto.randomUUID();
}

function isoNow() {
  return new Date().toISOString();
}

class Lead {
  constructor(data = {}) {
    this.id = data.id || uid();
    this.status = data.status || 'new';
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

    this._encryptedName = data._encryptedName || null;
    this._encryptedPhone = data._encryptedPhone || null;
    this._encryptedEmail = data._encryptedEmail || null;
    this._encryptedNotes = data._encryptedNotes || null;

    if (data.name && !this._encryptedName) this.setName(data.name);
    if (data.phone && !this._encryptedPhone) this.setPhone(data.phone);
    if (data.email && !this._encryptedEmail) this.setEmail(data.email);
    if (data.notes && !this._encryptedNotes) this.setNotes(data.notes);
    if (data._encryptedNotes && !this.notes) this.setNotes(null); // noop, keep encrypted
  }

  /* ---- PII setter/getter ---- */

  setName(v) { this._encryptedName = encrypt(v); }
  setPhone(v) { this._encryptedPhone = encrypt(v); }
  setEmail(v) { this._encryptedEmail = encrypt(v); }
  setNotes(v) { this._encryptedNotes = v ? encrypt(v) : null; }

  getName() { return this._encryptedName ? decrypt(this._encryptedName) : null; }
  getPhone() { return this._encryptedPhone ? decrypt(this._encryptedPhone) : null; }
  getEmail() { return this._encryptedEmail ? decrypt(this._encryptedEmail) : null; }
  getNotes() { return this._encryptedNotes ? decrypt(this._encryptedNotes) : null; }

  /* ---- Validation helpers ---- */

  isValidStatus(s) {
    return STATUSES.includes(s);
  }
  isValidFunnelLevel(l) {
    return FUNNEL_LEVELS.includes(l);
  }

  /* ---- Serialization ---- */

  /** Safe plain object for internal use (encrypted PII stays encrypted) */
  toJSON() {
    return {
      id: this.id,
      status: this.status,
      funnelLevel: this.funnelLevel,
      tierLabel: TIER_LABELS[this.funnelLevel],
      tierColor: TIER_COLORS[this.funnelLevel],
      source: this.source,
      assignedCtvId: this.assignedCtvId,
      promotedFromId: this.promotedFromId,
      quizAnswers: this.quizAnswers,
      notesMasked: !!this._encryptedNotes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastContactedAt: this.lastContactedAt,
      archivedAt: this.archivedAt,
      metadata: this.metadata,
    };
  }

  /**
   * Safe plain object for administrative views only.
   * Includes decrypted PII — callers must enforce RBAC before using.
   */
  toJSON_Admin() {
    return {
      ...this.toJSON(),
      name: this.getName(),
      phone: this.getPhone(),
      email: this.getEmail(),
      notes: this.getNotes(),
    };
  }

  /* ---- Transition helpers ---- */

  /**
   * Validate transition from `fromLevel` → `toLevel`.
   * Returns `{ ok: boolean, reason?: string }` and may mutate `lastContactedAt`.
   */
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

/* ---- In-memory store ---- */

let leads = [];
let nextId = 1; // monotonic display id (1-based)

Lead.prototype.displayId = null; // set lazily

Lead.createSeededLeads = function () {
  if (leads.length) return leads.slice();

  /** Helper to build lead then assign a fake 1-based display id */
  const make = (overrides) => {
    const l = new Lead(overrides);
    l.displayId = nextId++;
    return l;
  };

  // Helper to create a Member seed member for promotedFromId
  const existingMembers = require('../models/member');
  const MemberCls = existingMembers.Member;
  const seededMembers = MemberCls.createSeededMembers ? MemberCls.createSeededMembers() : [];

  leads = [
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

  return leads;
};

module.exports = {
  Lead,
  STATUSES,
  FUNNEL_LEVELS,
  TIER_LABELS,
  TIER_COLORS,
  SOURCES,
  getStore: () => leads,
  setStore: () => leads,
};
