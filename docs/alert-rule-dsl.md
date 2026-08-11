# Alert Rule DSL Documentation

## Overview

The Alert Engine uses a JSON-based Domain Specific Language (DSL) to define monitoring rules for PSN (Personal Sales Network) health. Rules are evaluated on a schedule (every 4 hours by default) against computed PSN metrics.

## Rule Structure

```json
{
  "id": "unique-rule-id",
  "name": "Human readable name",
  "metric": "metric_name",
  "op": "<",
  "threshold": 0.30,
  "window": "daily",
  "action": "notify_leader",
  "severity": "critical",
  "message": "Alert message template",
  "active": true
}
```

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (auto-generated if omitted) |
| `name` | string | Yes | Display name for dashboards |
| `metric` | string | Yes | Metric to evaluate (see Metrics table) |
| `op` | string | Yes | Comparison operator (see Operators table) |
| `threshold` | number | Yes | Numeric threshold to compare against |
| `window` | string | Yes | Evaluation window: `daily` or `weekly` |
| `action` | string | Yes | Action to trigger (see Actions table) |
| `severity` | string | Yes | Alert severity: `critical`, `warning`, `info` |
| `message` | string | Yes | Human-readable alert message |
| `active` | boolean | No | Whether rule is active (default: true) |

## Supported Metrics

| Metric | Description | Source |
|--------|-------------|--------|
| `team_size` | Number of active members in PSN | Member model |
| `retention_30d` | 30-day retention rate (0-1) | Member model |
| `retention_90d` | 90-day retention rate (0-1) | Member model |
| `revenue_delta` | Month-over-month revenue change (-1 to ∞) | Order analytics |
| `activity_ratio` | Fraction of trainees active in last 2 days (0-1) | Training ops |
| `habit_avg` | Average habit score across trainees (0-5) | Training ops |
| `connect_avg` | Average daily connects per member | Onboarding bot |
| `psn_health_score` | Composite Cửu Địa health score (0-100) | PSN Health classifier |

## Operators

| Operator | Meaning |
|----------|---------|
| `<` | Less than |
| `<=` | Less than or equal |
| `>` | Greater than |
| `>=` | Greater than or equal |
| `==` | Equal |
| `!=` | Not equal |

## Actions

| Action | Description | Target |
|--------|-------------|--------|
| `notify_leader` | Send webhook to PSN Leader | PSN Leader |
| `notify_admin` | Send webhook to Admin | Admin |
| `escalate` | Escalate to Core Leader/Admin | Core Leader, Admin |
| `auto_buddy` | Trigger buddy assignment system | Training ops |
| `schedule_review` | Create review task in dashboard | PSN Leader |

## Severity Levels

| Level | Priority | Use Case |
|-------|----------|----------|
| `critical` | 1 (highest) | Immediate intervention required |
| `warning` | 2 | Attention needed within 24h |
| `info` | 3 (lowest) | Informational, no immediate action |

## Evaluation Windows

| Window | Description |
|--------|-------------|
| `daily` | Evaluated on every scheduled run (every 4 hours) |
| `weekly` | Evaluated only once per week (checks day of week) |

## Default Rules

The system seeds with 6 default rules:

1. **Retention Below 30%** (`rule-retention-critical`)
   - Metric: `retention_30d` < 0.30
   - Action: `escalate`, Severity: `critical`

2. **Habit Score Below 2.5** (`rule-habit-low`)
   - Metric: `habit_avg` < 2.5
   - Action: `auto_buddy`, Severity: `warning`

3. **Activity Ratio Below 40%** (`rule-activity-low`)
   - Metric: `activity_ratio` < 0.40
   - Action: `notify_leader`, Severity: `warning`

4. **Revenue Decline > 20%** (`rule-revenue-decline`)
   - Metric: `revenue_delta` < -0.20
   - Action: `schedule_review`, Severity: `warning`

5. **Connects Below 8/day** (`rule-connects-low`)
   - Metric: `connect_avg` < 8
   - Action: `notify_leader`, Severity: `info`

6. **PSN Health Score Critical** (`rule-psn-critical`)
   - Metric: `psn_health_score` <= 25
   - Action: `escalate`, Severity: `critical`

## API Endpoints

### Create Rule
```bash
POST /api/alerts/rules
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Custom Rule",
  "metric": "habit_avg",
  "op": "<",
  "threshold": 3,
  "window": "daily",
  "action": "notify_leader",
  "severity": "warning",
  "message": "Custom alert message"
}
```

### List Rules
```bash
GET /api/alerts/rules
Authorization: Bearer <token>
```

### Update Rule
```bash
PUT /api/alerts/rules/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "threshold": 2.5,
  "severity": "critical"
}
```

### Delete Rule
```bash
DELETE /api/alerts/rules/:id
Authorization: Bearer <token>
```

## Webhook Payload

When a rule fires, a webhook is sent to all subscribed endpoints:

```json
{
  "psnId": "psn-001",
  "alerts": [
    {
      "id": "alert-uuid",
      "ruleId": "rule-retention-critical",
      "ruleName": "Retention Below 30%",
      "metric": "retention_30d",
      "value": 0.25,
      "threshold": 0.30,
      "op": "<",
      "action": "escalate",
      "severity": "critical",
      "message": "PSN retention dưới 30% — cần can thiệp ngay",
      "psnId": "psn-001",
      "createdAt": "2026-08-11T10:00:00.000Z"
    }
  ],
  "metrics": {
    "team_size": 15,
    "retention_30d": 0.25,
    "habit_avg": 2.1,
    ...
  },
  "timestamp": "2026-08-11T10:00:00.000Z"
}
```

## Webhook Subscription

```bash
POST /api/alerts/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://hooks.slack.com/services/xxx",
  "events": ["escalate", "auto_buddy"]
}
```

Events can be specific action names or `["*"]` for all.

## Manual Evaluation Trigger

```bash
POST /api/alerts/evaluate-scheduled
Authorization: Bearer <token>
```

Triggers immediate evaluation of all PSNs.

## PSN Metrics Endpoint

```bash
GET /api/alerts/psn-metrics/:psnId
Authorization: Bearer <token>
```

Returns computed metrics for a specific PSN.

## Custom Rule Examples

### Alert when team size drops below 5
```json
{
  "name": "Small Team Alert",
  "metric": "team_size",
  "op": "<",
  "threshold": 5,
  "window": "daily",
  "action": "notify_leader",
  "severity": "warning",
  "message": "PSN team size under 5 — recruiting needed"
}
```

### Alert when weekly revenue grows > 50%
```json
{
  "name": "Revenue Growth Spike",
  "metric": "revenue_delta",
  "op": ">",
  "threshold": 0.50,
  "window": "weekly",
  "action": "notify_admin",
  "severity": "info",
  "message": "Revenue grew > 50% week-over-week — investigate source"
}
```

### Alert when habit score improves above 4
```json
{
  "name": "High Performance",
  "metric": "habit_avg",
  "op": ">",
  "threshold": 4,
  "window": "weekly",
  "action": "notify_leader",
  "severity": "info",
  "message": "Team habit score exceeds 4 — recognize top performers"
}
```

## Integration with Training/Onboarding

Metrics are automatically computed from:
- **Training ops**: `getActiveTrainees()`, `getTraineesByPSN()` → habit scores, activity ratios
- **Onboarding bot**: Active sessions → connect averages
- **Member model**: PSN membership → team size, retention
- **Order model**: Paid orders by PSN → revenue delta

## Testing Rules

```bash
# Evaluate specific PSN with custom metrics
POST /api/alerts/evaluate
Authorization: Bearer <token>
Content-Type: application/json

{
  "psnId": "psn-001",
  "metrics": {
    "team_size": 10,
    "retention_30d": 0.8,
    "habit_avg": 3.5,
    "connect_avg": 12,
    "revenue_delta": 0.15,
    "activity_ratio": 0.7,
    "psn_health_score": 75
  }
}
```