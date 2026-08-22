/**
 * Lead model — Funnel OS
 *
 * PDPA pattern: name / phone / email stored encrypted in `_encrypted*` fields.
 * Public getters/setters for PII enforce encryption at write-time and
 * decryption at read-time.
 *
 * Backward-compatible barrel. Implementation split across:
 *   src/models/lead/constants.js  — enums + uid helper
 *   src/models/lead/lead.js       — Lead class, encryption, serialization, transitions
 *   src/models/lead/store.js      — In-memory store fallback
 */

const {
  STATUSES,
  FUNNEL_LEVELS,
  TIER_LABELS,
  TIER_COLORS,
  SOURCES,
  uid
} = require('./constants');

const { Lead, isoNow } = require('./lead');
const { leads, getStore, setStore } = require('./store');

module.exports = {
  Lead,
  STATUSES,
  FUNNEL_LEVELS,
  TIER_LABELS,
  TIER_COLORS,
  SOURCES,
  isoNow,
  getStore,
  setStore,
  uid
};