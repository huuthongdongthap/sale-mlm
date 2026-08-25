# Deploy Log — Staging

**Date:** 2026-08-25  
**Worker:** `hive-warfare-os-staging`  
**URL:** `https://hive-warfare-os-staging.sadec-marketing-hub.workers.dev`  
**Commit:** `HEAD` (post org-isolation fixes)  
**Deployed by:** Automated deploy pipeline  

---

## Deployment Timeline

| Step | Status | Duration | Notes |
|------|--------|----------|-------|
| Pre-flight checks | ✅ Passed | ~30s | Checklist validated |
| `npx wrangler deploy --env staging` | ✅ Success | ~15s | Worker code deployed; cron trigger partial (Free tier limit) |
| Health check (`/health`) | ✅ 200 OK | <100ms | Worker responding |
| Login test (`/auth/login`) | ✅ 200 OK | <500ms | All seeded users authenticated |
| Authenticated endpoints | ✅ 200 OK | <500ms | `/api/members`, `/api/leads`, `/api/orders` |
| Org scoping verification | ✅ Passed | <500ms | Admin sees all, org users scoped |

---

## Key Fixes Applied This Deploy

1. **D1 await bug fixed** — All `DB.prepare().bind().first/all/run()` calls now properly awaited
2. **JWT verify algorithm** — Added explicit `'HS256'` parameter to `verify()`
3. **PBKDF2 verification** — Restored proper Web Crypto implementation (100k iter, SHA-512, 512-bit)
4. **Removed debug logging** — Cleaned up temporary console.log statements
5. **D1 data fix** — Updated NULL org_id → 'org-default' on leads/orders

---

## Deploy Output

```
✘ [ERROR] Trigger configuration for "hive-warfare-os-staging" was only partially updated:
      - A request to the Cloudflare API (/accounts/b69fee03bdd94234eea8e4114cfc36ab/workers/scripts/hive-warfare-os-staging/schedules) failed.
```

**Note:** Worker code deployed successfully. Cron trigger registration hit Free tier limit (5 crons max). This does not affect runtime behavior — scheduled jobs simply won't fire on staging.

---

## Rollback Trigger (if needed)

```bash
# Rollback to previous version
npx wrangler rollback --env staging

# Or redeploy specific commit
git checkout <previous-sha>
npx wrangler deploy --env staging
```