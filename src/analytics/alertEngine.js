/**
 * T-006: Alert Rules Engine
 *
 * Rule DSL: { metric, op, threshold, window, action, severity }
 *
 * Metrics: team_size, retention_30d, retention_90d, revenue_delta,
 *          activity_ratio, habit_avg, connect_avg, psn_health_score
 *
 * Operators: <, <=, >, >=, ==, !=
 *
 * Actions: notify_leader, notify_admin, escalate, auto_buddy, schedule_review
 *
 * Severity: critical, warning, info
 *
 * Implementation lives in src/analytics/alertEngine/
 */
module.exports = require('./alertEngine/index');