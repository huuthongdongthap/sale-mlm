/**
 * LocalDatabaseAdapter — shared better-sqlite3 statement helpers.
 *
 * better-sqlite3 only allows one bind() per statement object. Some call
 * sites pre-bind inline; these helpers accept either an unbound statement
 * plus params, or an already-bound statement with none, without throwing.
 */
function bindRun(stmt, ...params) {
  if (params.length) stmt.bind(...params);
  return stmt.run();
}
function bindAll(stmt, ...params) {
  if (params.length) stmt.bind(...params);
  return stmt.all();
}
function bindFirst(stmt, ...params) {
  if (params.length) stmt.bind(...params);
  return stmt.get();
}
module.exports = { bindRun, bindAll, bindFirst };
