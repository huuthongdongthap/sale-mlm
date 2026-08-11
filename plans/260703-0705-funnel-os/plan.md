# Funnel OS — Implementation Plan

**Team:** PHỤNG SỰ 100 ĐỘ C | **Target:** $500K ARR | **Date:** 2026-07-03

## Overview

Complete the Funnel OS layer between existing leads/funnel frontend views and the Express backend. Frontend already calls `/api/leads` and `/api/analytics/funnel` but those endpoints do not exist.

## Current State

| Layer | Status |
|-------|--------|
| Frontend (funnel-view.js) | ✅ Exists — reads `/api/analytics/funnel` |
| Frontend (leads-view.js) | ✅ Exists — calls `/api/leads*` |
| Backend API | ❌ No `/api/leads` or `/api/analytics/funnel` |
| Data model | ❌ No leads/funnel model |
| Funnel stages | 🔲 To design |
| Alerts integration | 🔲 To wire |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 0 | Bootstrap + env verification | in_progress |
| 1 | Lead model + seeded data | pending |
| 2 | Leads CRUD API (8 endpoints) | pending |
| 3 | Funnel analytics API (3 endpoints) | pending |
| 4 | Stage-transition + automation | pending |
| 5 | Alert rules integration | pending |
| 6 | Route wiring + Workers mirror | pending |
| 7 | Frontend integration test | pending |

## Key Files

- `src/models/lead.js` — Lead model (create)
- `src/api/leads.js` — Leads CRUD routes (create)
- `src/api/analytics-funnel.js` — Funnel metrics (create)
- `src/server.js` — Wire new routers (edit)
- `src/workers/index.js` — Cloudflare port (mirror routes)
- `src/dashboard/leads-view.js` — Already exists
- `src/dashboard/funnel-view.js` — Already exists

## Dual-Target Architecture

| Layer | Dev | Prod |
|-------|-----|------|
| Runtime | Express.js (`src/server.js`) | Cloudflare Workers (`src/workers/index.js`) |
| Storage | In-memory arrays | D1 SQLite (preferred) / KV |
| Auth | JWT middleware | JWT signed with `JWT_SECRET` |
| RBAC | `src/middleware/requireRole.js` | Port to Workers-friendly wrapper |

## Estimated Scope

~10 files touched, ~800 LOC total.
