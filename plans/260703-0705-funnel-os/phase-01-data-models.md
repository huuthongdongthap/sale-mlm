# Phase 1: Data Models & In-Memory Store

**Priority:** P0 — Foundation for all funnel logic
**Status:** pending
**Files to create:** `src/models/lead.js`
**Files to edit:** `src/server.js` (register store import)

## Overview

Define the Lead entity that bridges prospects to the MLM funnel. Uses the same in-memory array pattern as `members[]` in `src/api/members.js`.

## Requirements

### Functional
- Create/read/update/delete leads
- Leads reference members (via `promotedFromId`) and assigned CTVs
- Factory-seeded `createSeededLeads()` for demo data

### Non-functional
- PDPA compliance — PII fields (name, phone, email) encrypted same as Member model
- Funnel level is an integer 0–4 (matches frontend `funnel_level` field)

## Architecture

```js
// Lead fields
{
  id: string (uuid),
  name: string (encrypted),
  phone: string (encrypted),
  email: string (encrypted),
  source: string,          // 'organic', 'referral', 'social', 'ads'
  funnelLevel: number,     // 0=Lead Magnet, 1=Trial, 2=Health Active, 3=Combo, 4=CTV Partner
  status: string,          // 'new', 'contacted', 'qualified', 'converted', 'lost'
  assignedCtvId: string | null,
  promotedFromId: string | null,  // member.id if converted from existing member
  quizAnswers: object | null,
  notes: string | null,
  createdAt: ISO string,
  updatedAt: ISO string,
  lastContactedAt: ISO string | null,
  metadata: object         // flexible payload for custom fields
}
```

## Implementation Steps

1. Create `src/models/lead.js` with Lead class mirroring Member patterns
2. Use `encrypt`/`decrypt` from `../utils/encryption` for PII fields
3. Static `createSeededLeads()` → 20 demo leads across 5 funnel levels
4. Export `{ Lead }` and `createSeededLeads`

## Todo List

- [ ] Create `src/models/lead.js`
- [ ] Implement PII encryption/decryption helpers
- [ ] Add validation: `isValidStatus()`, `isValidFunnelLevel()`
- [ ] Add `createSeededLeads()` — 20 leads mixed across levels
- [ ] Import in `src/server.js`

## Success Criteria
- `node -e "require('./src/models/lead')"` loads without errors
- `JSON.stringify(Lead.createSeededLeads())` returns 20 objects
