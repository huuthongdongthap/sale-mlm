# Rollback Plan — Staging Deploy

**Date:** 2026-08-25  
**Worker:** `hive-warfare-os-staging`  
**Current Version:** Post org-isolation fixes (HEAD)  

---

## Rollback Triggers

Rollback if ANY of the following occur within 30 minutes post-deploy:

- [ ] Health endpoints return 5xx for >5 consecutive requests
- [ ] Authentication fails for ALL seeded users
- [ ] Org scoping broken (e.g., non-admin users see cross-org data)
- [ ] Critical API endpoints return 500 errors
- [ ] Worker CPU time exceeds limits consistently

---

## Rollback Procedures

### Option 1: Wrangler Rollback (Fastest — ~30 seconds)

```bash
cd /Users/mac/mekong-cli/SALE\ MLM
npx wrangler rollback --env staging
```

**Effect:** Reverts to previous deployed version instantly. No code changes needed.

### Option 2: Git Rollback + Redeploy (Complete — ~2 minutes)

```bash
cd /Users/mac/mekong-cli/SALE\ MLM

# 1. Identify previous stable commit
git log --oneline -10

# 2. Checkout previous commit
git checkout <previous-stable-sha>

# 3. Redeploy staging
npx wrangler deploy --env staging

# 4. Return to current branch
git checkout main  # or feature branch
```

### Option 3: Database Rollback (If schema changes caused issue)

```bash
# Only if D1 schema changes are the root cause
# Current schema: org_id columns + habit/energy/join_date on members

# To revert schema (run each separately):
npx wrangler d1 execute hive-warfare-db --remote --command "ALTER TABLE members DROP COLUMN org_id;"
npx wrangler d1 execute hive-warfare-db --remote --command "ALTER TABLE leads DROP COLUMN org_id;"
npx wrangler d1 execute hive-warfare-db --remote --command "ALTER TABLE orders DROP COLUMN org_id;"
npx wrangler d1 execute hive-warfare-db --remote --command "ALTER TABLE psn DROP COLUMN org_id;"
npx wrangler d1 execute hive-warfare-db --remote --command "ALTER TABLE members DROP COLUMN habit_score;"
npx wrangler d1 execute hive-warfare-db --remote --command "ALTER TABLE members DROP COLUMN energy_score;"
npx wrangler d1 execute hive-warfare-db --remote --command "ALTER TABLE members DROP COLUMN join_date;"

# Then Option 1 or 2 to rollback worker code
```

---

## Verification After Rollback

Run these checks to confirm rollback succeeded:

```bash
BASE="https://hive-warfare-os-staging.sadec-marketing-hub.workers.dev"

# 1. Health check
curl -s "$BASE/health" | grep -q '"ok":true' && echo "✅ Health OK"

# 2. Admin login
TOKEN=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@droppii.vn","password":"password123"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))")

if [ -n "$TOKEN" ]; then echo "✅ Login OK"; else echo "❌ Login FAILED"; fi

# 3. Authenticated endpoint
curl -s "$BASE/api/members" -H "Authorization: Bearer $TOKEN" | grep -q '"success":true' && echo "✅ API OK"

# 4. Org scoping (admin should see data)
curl -s "$BASE/api/leads" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json;d=json.load(sys.stdin);print('Leads:',d.get('total',0))"
```

---

## Post-Rollback Actions

1. **Document the failure** — Add entry to `reports/devops/deploy/rollback-history.md`
2. **Root cause analysis** — Use `/ck:debug` or `/incident-respond`
3. **Fix and re-deploy** — Address root cause, then run full deploy pipeline again
4. **Notify stakeholders** — If production impact possible (staging shares prod D1)

---

## Contact / Escalation

- **On-call:** Check `~/.config/opencode/AGENTS.md` for current rotation
- **Slack:** #mekong-deployments
- **Emergency:** Use `/incident-respond` skill for structured response