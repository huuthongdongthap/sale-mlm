# RUNBOOK — Droppii Sales Training OS

> Operations guide for admin and PSN leaders

## Daily Operations

### Morning Check (5AM)
```bash
# Check system health
curl http://localhost:3000/health

# Check active onboarding sessions
curl http://localhost:3000/api/onboarding/active

# Check trainees needing attention
curl http://localhost:3000/api/training/attention

# Check alert summary
curl http://localhost:3000/api/alerts/summary
```

### Send Daily Nudges
```bash
# Get sessions needing nudges
curl http://localhost:3000/api/onboarding/active

# For each active session, generate nudge
curl -X POST http://localhost:3000/api/onboarding/{memberId}/nudge
```

### Evening Review
```bash
# Check today's habit check-ins
curl http://localhost:3000/api/habits/streak/{memberId}

# Check KPI rollup
curl http://localhost:3000/api/kpi/{memberId}?window=daily

# Check PSN health
curl -X POST http://localhost:3000/api/analytics/psn-health \
  -H "Content-Type: application/json" \
  -d '{"team_size":5,"retention_30d":0.7,"retention_90d":0.6,"revenue_delta":0.1,"activity_ratio":0.8,"habit_avg":4.5,"connect_avg":12}'
```

## Troubleshooting

### Server Won't Start
```bash
# Check port availability
lsof -i :3000

# Kill existing process
kill -9 $(lsof -t -i:3000)

# Restart
npm run dev
```

### Tests Failing
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Run tests with verbose output
npm test -- --verbose

# Run specific failing test
npx jest test/auth-jest.test.js --verbose
```

### Database Reset (In-Memory)
```bash
# Restart server to clear in-memory data
# Re-seed data
node scripts/seed.js
```

### Alert Rules Not Firing
```bash
# Check current rules
curl http://localhost:3000/api/alerts/rules

# Manually evaluate
curl -X POST http://localhost:3000/api/alerts/evaluate \
  -H "Content-Type: application/json" \
  -d '{"psnId":"test","metrics":{"retention_30d":0.2,"habit_avg":1.5}}'

# Check alert log
curl http://localhost:3000/api/alerts/log
```

### Onboarding Stuck
```bash
# Check session status
curl http://localhost:3000/api/onboarding/{memberId}

# Force advance day
curl -X POST http://localhost:3000/api/onboarding/{memberId}/advance

# Check progress
curl http://localhost:3000/api/onboarding/{memberId}/progress
```

## Monitoring

### Error Log
```bash
# View recent errors
curl http://localhost:3000/api/monitoring/errors?limit=20

# View error summary
curl http://localhost:3000/api/monitoring/summary
```

### Health Check Endpoints
| Endpoint | Description |
|----------|-------------|
| `GET /health` | Full health with subsystem status |
| `GET /api/monitoring/errors` | Error log |
| `GET /api/monitoring/summary` | Error summary |

### Zalo Alert Setup
Set `ZALO_ALERT_WEBHOOK` env var to enable critical error alerts via Zalo.

### Sentry Setup
Set `SENTRY_DSN` env var to enable Sentry error tracking.

## Backup & Restore

### Export Data
```bash
# Export members
curl http://localhost:3000/api/members \
  -H "Authorization: Bearer {token}" > members_backup.json

# Export audit logs (from server console)
# Audit logs are in-memory — export before restart
```

### Restore Data
```bash
# Re-seed from backup
node scripts/seed.js

# Re-import members via API
curl -X POST http://localhost:3000/api/members \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d @members_backup.json
```

## Scaling

### Current Limits (In-Memory)
- Members: ~10,000 (before performance degradation)
- Habit records: ~100,000
- KPI records: ~100,000
- Alert log: unlimited (monitor memory usage)

### Production Migration
1. Replace in-memory storage with D1 (Cloudflare SQLite)
2. Add Redis for session management
3. Set up Sentry for error tracking
4. Configure Zalo webhook for alerts
5. Set up CI/CD pipeline

## Contact

- Team: PHỤNG SỰ 100 ĐỘ C
- Project: Droppii Sales Training OS
- Target: $500K ARR by Q1-2027
