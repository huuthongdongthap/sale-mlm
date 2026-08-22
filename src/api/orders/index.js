/**
 * Orders API — Funnel OS — composition barrel
 *
 * Backward-compatible with the original handler(app, env) signature.
 * Exports `handler` (and `registerOrders`) so existing require() callers
 * keep working without edits.
 */
const { registerOrders } = require('./handlers');

/**
 * @param {Express.Application|Request} appOrReq
 * @param {Object|Response} envOrRes
 */
function handler(appOrReq, envOrRes) {
  // Detect if called as Express-style middleware (app, env) or as a route module (req, res)
  if (appOrReq && appOrReq.use) {
    // Express app passed — register routes
    const app = appOrReq;
    const env = envOrRes || process.env;
    return registerOrders(app);
  }

  // Fallback: direct (req, res) call — for Workers compatibility
  // Not fully implemented; worker entrypoint should register routes directly
}

module.exports = { handler, registerOrders };