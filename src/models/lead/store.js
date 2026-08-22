/**
 * Lead model — in-memory store
 */

// In-memory store for leads
const leads = [];

function getStore() {
  return leads;
}

function setStore() {
  return leads;
}

module.exports = { leads, getStore, setStore };