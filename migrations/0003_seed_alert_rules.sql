-- Seed default alert rules (idempotent)
INSERT OR IGNORE INTO alert_rules (id, trigger_text, action, severity, metric, threshold, op) VALUES
  ('conversion_low', 'Conversion < 15%', 'Notify leader + watchlist', 'red', 'conversionRate', 15, '<'),
  ('lead_drop', 'Leads < 100/week', 'MiniBoost campaign + notify core', 'yellow', 'leadsWeek', 100, '<'),
  ('habit_drop', 'Habit score < 3', 'Assign buddy + schedule 1:1', 'red', 'habitScore', 3, '<'),
  ('psn_weak', 'PSN avg habit < 3', 'Escalate + coaching pack', 'red', 'psnAvgHabit', 3, '<'),
  ('retention_risk', 'Risk = High', 'Immediate 1:1 + ticket', 'critical', 'retentionRisk', 0, '=='),
  ('q2_neglect', 'Q2 tasks < 40%', 'Block time + notify leader', 'red', 'q2Pct', 40, '<');
