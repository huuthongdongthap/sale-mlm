# Phase 2: Leads CRUD API

**Priority:** P0 — Core data layer
**Status:** pending
**Files to create:** `src/api/leads.js`

## API Endpoints

| Method | Path | RBAC | Description |
|--------|------|------|-------------|
| GET | `/api/leads` | Auth | Paginated lead list (RBAC-scoped) |
| GET | `/api/leads/:id` | Auth | Single lead detail |
| POST | `/api/leads` | PSN Leader+ | Create lead |
| PATCH | `/api/leads/:id` | PSN Leader+ | Update lead |
| DELETE | `/api/leads/:id` | Admin | Delete (soft: archived=true) |
| GET | `/api/leads/:id/journey` | Auth | Stage transition history |
| POST | `/api/leads/:id/assign` | PSN Leader+ | Assign to CTV |
| POST | `/api/leads/:id/transition` | PSN Leader+ | Move to next stage |

## RBAC Scoping (same as Members)

```js
function getVisibleLeadScope(userRole, userId, psnId) {
  // Member: own leads only (where assignedCtvId === userId)
  // PSN Leader: all leads in their PSN tree
  // Core/Admin: all leads
}
```

## Query Params
- `page`, `limit` — pagination
- `status` — filter by status
- `funnel_level` — filter by stage
- `assigned_ctv_id` — filter by assignee

## Todo List

- [ ] Implement `getVisibleLeadScope()` in leads.js
- [ ] GET /api/leads with pagination + filtering
- [ ] GET /api/leads/:id with PII mask check
- [ ] POST /api/leads with validation
- [ ] PATCH /api/leads/:id with audit logging
- [ ] DELETE /api/leads/:id (soft delete)
- [ ] GET /api/leads/:id/journey from transition log
- [ ] POST /api/leads/:id/assign with validation
- [ ] POST /api/leads/:id/transition with prerequisite checks

## Success Criteria
- `GET /api/leads?page=1&limit=10` returns `{ leads: [], total: 20, page: 1, totalPages: 2 }`
- RBAC scoping works: Member sees own, PSN Leader sees downline
