# Task: D1 Staging/Prod Database Isolation

## Goal
Split staging and production to use separate Cloudflare D1 databases.

## Current Gap
`wrangler.toml` lines43-46 + lines58-61 — both `[env.staging.d1_databases]` and `[env.production.d1_databases]` use the SAME `database_id: "def140e1-c5bb-48e5-a79f-e9368321c9d0"` — data collision risk.

## Scope
1. Create new D1 database for staging (via `wrangler d1 create` or CF Dashboard)
2. Update `[env.staging.d1_databases]: database_name + database_id` with new staging DB
3. Keep production DB unchanged
4. Document migration of existing staging data (if any) to new DB

## Constraints
- KISS: Use `wrangler d1 create` — no Terraform
- YAGNI: Only split D1 — leave KV/R2 shared (same bucket for simplicity)
- DRY: Reuse existing `database_name: "hive-warfare-db"` pattern

## Evidence
- `wrangler.toml` confirmed: staging + prod blocks identical D1 id
- `plan.md:67` documents D1 vs Postgres decision (D1 chosen for Phase3)
- RUNBOOK §174: "Replace in-memory storage with D1 (Cloudflare SQLite)" — migration already done, isolation pending

## Acceptance
```bash
# wrangler.toml diff shows staging + prod have different database_id
grep -A2 '\[env.staging.d1_databases\]' wrangler.toml
grep -A2 '\[env.production.d1_databases\]' wrangler.toml
# database_id values must differ
```
Exit code0 = accepted.

---
Handoff: To `coo` for operator coordination + CF secret sync.
