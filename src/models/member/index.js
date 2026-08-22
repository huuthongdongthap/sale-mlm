/**
 * Member model — Funnel OS
 * Represents users in the MLM training system with roles and hierarchy
 * Features PDPA-compliant PII encryption for phone and email fields
 *
 * Backward-compatible barrel. Implementation split across:
 *   src/models/member/constants.js  — enums + uid helper
 *   src/models/member/member.js     — Member class, encryption, serialization
 *   src/models/member/store.js      — In-memory store fallback
 */

const { ROLES, uid } = require('./constants');
const { Member } = require('./member');
const { memberStore, getStore, initStore } = require('./store');

module.exports = {
  ROLES,
  Member,
  getStore,
  initStore,
  uid
};