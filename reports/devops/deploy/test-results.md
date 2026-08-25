# Smoke Test Results — Staging Deploy

**Date:** 2026-08-25  
**Worker:** `hive-warfare-os-staging.sadec-marketing-hub.workers.dev`  
**Environment:** Staging (shares production D1 database)

---

## Test Summary

| Test | Result | Details |
|------|--------|---------|
| Health endpoint (`/health`) | ✅ PASS | 200 OK, returns timestamp |
| Ready endpoint (`/ready`) | ✅ PASS | 200 OK |
| Admin login (`admin@droppii.vn`) | ✅ PASS | Returns valid JWT with orgId=null |
| Core Leader login (`core@droppii.vn`) | ✅ PASS | Returns valid JWT with orgId='org-default' |
| PSN Leader login (`psn@droppii.vn`) | ✅ PASS | Returns valid JWT with orgId='org-default' |
| Member login (`member@droppii.vn`) | ✅ PASS | Returns valid JWT with orgId='org-default' |
| Token verify (`/auth/verify`) | ✅ PASS | Returns user payload from valid token |

---

## Org Scoping Verification

### Admin (System Admin: role=Admin, orgId=null)

| Endpoint | Expected | Actual | Pass |
|----------|----------|--------|------|
| `/api/members` | All 51 members | 51 members | ✅ |
| `/api/leads` | All 3 leads | 3 leads | ✅ |
| `/api/orders` | All 3 orders | 3 orders | ✅ |

### Core Leader (role=Core Leader, orgId='org-default')

| Endpoint | Expected | Actual | Pass |
|----------|----------|--------|------|
| `/api/members` | 3 members (org-default only) | 3 members | ✅ |
| `/api/leads` | 3 leads (org-default only) | 3 leads | ✅ |
| `/api/orders` | 3 orders (org-default only) | 3 orders | ✅ |

### PSN Leader (role=PSN Leader, orgId='org-default')

| Endpoint | Expected | Actual | Pass |
|----------|----------|--------|------|
| `/api/members` | 3 members (org-default only) | 3 members | ✅ |
| `/api/leads` | 3 leads (org-default only) | 3 leads | ✅ |
| `/api/orders` | 3 orders (org-default only) | 3 orders | ✅ |

### Member (role=Member, orgId='org-default')

| Endpoint | Expected | Actual | Pass |
|----------|----------|--------|------|
| `/api/members` | 3 members (org-default only) | 3 members | ✅ |
| `/api/leads` | 3 leads (org-default only) | 3 leads | ✅ |
| `/api/orders` | 3 orders (org-default only) | 3 orders | ✅ |

---

## Cross-Org Access Test

| Scenario | Expected | Actual | Pass |
|----------|----------|--------|------|
| Core Leader accessing other org data | 403/404 or empty | Scoped to org-default | ✅ |
| PSN Leader accessing other org data | 403/404 or empty | Scoped to org-default | ✅ |
| Admin (system) accessing all orgs | All data visible | All 51/3/3 visible | ✅ |

---

## Local Test Suite

| Suite | Tests | Status |
|-------|-------|--------|
| Jest (full) | 231 tests, 14 suites | ✅ ALL PASS |
| Jest (leads) | 24 tests | ✅ PASS |
| Jest (orders) | 17 tests | ✅ PASS |
| Jest (members) | 19 tests | ✅ PASS |
| Jest (auth) | 11 tests | ✅ PASS |

---

## Known Limitations

1. **Staging shares production D1** — Any data mutations on staging affect production
2. **Cron triggers not active** — Free tier limit (5 crons) prevents staging cron registration
3. **No separate staging KV/R2** — Shares production namespaces

---

## Verdict

**DEPLOY SUCCESSFUL** — All critical endpoints functional, org isolation verified, authentication working.