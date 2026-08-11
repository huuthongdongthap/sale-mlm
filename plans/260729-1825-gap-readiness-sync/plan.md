---
title: "Gap Readiness Sync — 6 Module Inventory"
description: "Synthesize missing module inventory, prioritized fixes, and readiness checklist"
status: pending
priority: P1
effort: 73.5h
branch: main
tags: [planning, readiness, gap-analysis, security, data-integrity]
created: 2026-07-29
---

## Phases

1. **Sprint 0: Security Baseline** (17.5h, 3d) — fake PBKDF2, unauth endpoints, demo creds, fallback secrets, JWT bugs, schema mismatch
2. **Sprint 1: Data Persistence** (24h, 4d) — migrate 5 in-memory stores to D1 + KV cache
3. **Sprint 2: Revenue-Critical Endpoints** (12h, 2d) — mark-paid, referral auto-assign, recommendation, public pages
4. **Sprint 3: Training + Onboarding + Alerts** (18h, 3d) — content, UI, Zalo webhook, notification pipeline
5. **Sprint 4: Scale Preparation** (22h, 4d) — KV cache full rollout, rate limiting, DB indexes, CI/CD

## Readiness Checklist (Go/No-Go per module)

- /funnel: metrics endpoint works + CSS vars + public access
- /orders: mark-paid + checkout flow operational
- /leads: referral auto-assign + recommendation engine + public quiz
- /training: content exists + UI exists + progress persists across restart
- /alerts: rules persist + log persists + notification fire-and-forget
- /onboarding: session persists + nudge/delivery pipeline wired

## Unresolved Questions

1. Multi-tenancy scope: SaaS expansion deferred or needed now?
2. Sentry budget: open-source vs $26/mo?
3. Zalo OA sandbox: verified or still pending?
4. Commission payout threshold: per-order or batch-monthly?
5. CTV self-register vs Leader-created accounts?
6. Coverage threshold path to 70%: which files get tests first?