/**
 * Shared mutable state for the alert engine.
 *
 * rules and alertLog are singletons so every submodule (rules, evaluate, log)
 * reads and mutates the same arrays — preserving the original module's
 * in-memory behavior across callers.
 */
const rules = [];
const alertLog = [];

module.exports = { rules, alertLog };