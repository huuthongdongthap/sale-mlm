/**
 * Production seed — minimal implementation to satisfy server.js import.
 * Seed data is already managed via SQL migrations; this file is a no-op
 * to prevent missing-module errors in non-test environments.
 */
async function seedProductionData(db) {
  // No-op: migrations handle all production seed data.
  // Keep this function to satisfy the require in server.js.
  return;
}

module.exports = { seedProductionData };