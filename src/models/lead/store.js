/**
 * Lead model — in-memory store
 */

// In-memory store for leads
const leads = [];

function getStore() {
  return leads;
}

function setStore(newLeads) {
  leads.length = 0;
  if (newLeads && Array.isArray(newLeads)) {
    leads.push(...newLeads);
  }
  return leads;
}

function initStore() {
  const { Lead } = require('./lead');
  leads.push(...Lead.createSeededLeads());
}

module.exports = { leads, getStore, setStore, initStore };