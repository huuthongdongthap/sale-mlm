/**
 * Member model — in-memory store
 */

const { Member } = require('./member');

// In-memory store for members (shared with API)
const memberStore = [];

function getStore() {
  return memberStore;
}

function initStore() {
  memberStore.push(...Member.createSeededMembers());
}

module.exports = { memberStore, getStore, initStore };