/**
 * Rule CRUD: default rules, addRule, updateRule, deleteRule, getRules, initRules
 */
const crypto = require('crypto');
const { rules } = require('./state');

/**
 * Default seeded rules
 */
const DEFAULT_RULES = [
  {
    id: 'rule-retention-critical',
    name: 'Retention Below 30%',
    metric: 'retention_30d',
    op: '<',
    threshold: 0.30,
    window: 'daily',
    action: 'escalate',
    severity: 'critical',
    message: 'PSN retention dưới 30% — cần can thiệp ngay',
    active: true
  },
  {
    id: 'rule-habit-low',
    name: 'Habit Score Below 2.5',
    metric: 'habit_avg',
    op: '<',
    threshold: 2.5,
    window: 'daily',
    action: 'auto_buddy',
    severity: 'warning',
    message: 'Điểm thói quen trung bình dưới 2.5 — kích hoạt buddy system',
    active: true
  },
  {
    id: 'rule-activity-low',
    name: 'Activity Ratio Below 40%',
    metric: 'activity_ratio',
    op: '<',
    threshold: 0.40,
    window: 'weekly',
    action: 'notify_leader',
    severity: 'warning',
    message: 'Tỷ lệ hoạt động dưới 40% — leader cần check-in',
    active: true
  },
  {
    id: 'rule-revenue-decline',
    name: 'Revenue Decline > 20%',
    metric: 'revenue_delta',
    op: '<',
    threshold: -0.20,
    window: 'weekly',
    action: 'schedule_review',
    severity: 'warning',
    message: 'Doanh số giảm hơn 20% — cần review chiến lược',
    active: true
  },
  {
    id: 'rule-connects-low',
    name: 'Connects Below 8/day',
    metric: 'connect_avg',
    op: '<',
    threshold: 8,
    window: 'daily',
    action: 'notify_leader',
    severity: 'info',
    message: 'Trung bình kết nối dưới 8/ngày — nhắc nhở Connect Engine',
    active: true
  },
  {
    id: 'rule-psn-critical',
    name: 'PSN Health Score Critical',
    metric: 'psn_health_score',
    op: '<=',
    threshold: 25,
    window: 'daily',
    action: 'escalate',
    severity: 'critical',
    message: 'PSN health score ở mức Tử Địa — can thiệp khẩn cấp',
    active: true
  }
];

/**
 * Initialize with default rules
 */
function initRules() {
  if (rules.length === 0) {
    rules.push(...DEFAULT_RULES.map(r => ({ ...r })));
  }
  return [...rules];
}

/**
 * Add a new rule
 */
function addRule(ruleData) {
  const rule = {
    id: ruleData.id || crypto.randomUUID(),
    name: ruleData.name,
    metric: ruleData.metric,
    op: ruleData.op,
    threshold: ruleData.threshold,
    window: ruleData.window || 'daily',
    action: ruleData.action || 'notify_leader',
    severity: ruleData.severity || 'warning',
    message: ruleData.message || '',
    active: ruleData.active !== undefined ? ruleData.active : true,
    created_at: new Date().toISOString()
  };

  rules.push(rule);
  return rule;
}

/**
 * Update a rule
 */
function updateRule(ruleId, updates) {
  const idx = rules.findIndex(r => r.id === ruleId);
  if (idx === -1) return null;

  rules[idx] = { ...rules[idx], ...updates, updated_at: new Date().toISOString() };
  return rules[idx];
}

/**
 * Delete a rule
 */
function deleteRule(ruleId) {
  const idx = rules.findIndex(r => r.id === ruleId);
  if (idx === -1) return false;

  rules.splice(idx, 1);
  return true;
}

/**
 * Get all rules
 */
function getRules() {
  return [...rules];
}

module.exports = { DEFAULT_RULES, initRules, addRule, updateRule, deleteRule, getRules };