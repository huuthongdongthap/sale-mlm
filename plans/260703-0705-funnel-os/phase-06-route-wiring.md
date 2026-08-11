# Phase 6: Route Wiring + Cloudflare Workers Mirror

**Priority:** P1 — stich everything together  
**Status:** pending

## Files to Edit

| File | Change |
|------|--------|
| `src/server.js` | `app.use('/api/leads', require('./api/leads'))` |
| `src/server.js` | `app.use('/api/analytics/funnel', require('./api/analytics-funnel'))` |
| `src/server.js` | Load `Lead` model: `const { Lead, createSeededLeads } = require('./models/lead')` |
| `src/middleware/requireRole.js` | Ensure `getVisibleLeadScope()` is exported (reuse from leads.js) |

## Files to Create

| File | Description |
|------|-------------|
| `src/api/leads.js` | Leads CRUD router |
| `src/api/analytics-funnel.js` | Analytics router |
| `src/models/lead.js` | Lead model |

## Cloudflare Workers Porting Notes

- `src/workers/index.js` uses `fetch(req, env, ctx)` event handler
- Replace `req.body` → `await parseBody(req)`
- Replace `res.json()` → body + CORS headers
- Replace `members[]` array → use D1 SQLite via `env.DB`
- Authentication: port JWT verify via `crypto.subtle` (Web Crypto API)

## Birds-eye Wire Diagram

```
Client (dashboard/)  
  │  
  ├─ GET /api/leads → src/api/leads.js → src/models/lead.js (in-memory)  
  ├─ PATCH /api/leads/:id → src/api/leads.js → Lead.update()  
  └─ GET /api/analytics/funnel → src/api/analytics-funnel.js → Lead.getAll()  

Workers port:  
  src/workers/index.js  
    ├─ GET /api/leads → D1 SELECT  
    ├─ PATCH /api/leads/:id → D1 UPDATE  
    └─ GET /api/analytics/funnel → D1 aggregation
```

## Todo List

- [ ] Wire `/api/leads` in `src/server.js`
- [ ] Wire `/api/analytics/funnel` in `src/server.js`
- [ ] Import Lead model into server.js
- [ ] Verify Workers index.js mirror (deferred to prod phase)
- [ ] Run `node src/server.js` smoke test: `curl http://localhost:3000/api/leads`
