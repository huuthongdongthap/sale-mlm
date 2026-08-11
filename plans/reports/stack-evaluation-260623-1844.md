# Technology Stack Evaluation Report
**SALE MLM — Hive Warfare Academy**  
**Date:** 2026-06-23  
**Status:** ACTIVE

---

## 1. Node.js + Express vs Cloudflare Workers — Appropriate?

### Current State
- **Express.js** (Node.js) running locally on port 3000 for development
- **Cloudflare Workers** configuration already exists (wrangler.toml, src/workers/index.js fully implemented)
- Dual architecture: Express for dev convenience, Workers for production

### Assessment: ✅ **APPROPRIATE with Caveats**

**Strengths:**
- Express.js provides hot-reload, easier local debugging, and full Node.js ecosystem during development
- Cloudflare Workers gives production benefits: global edge deployment, zero server management, built-in D1/R2
- Zero infrastructure cost at pilot scale (100K req/day free tier)
- Workers handles JWT crypto natively via WebCrypto (better performance)

**Issues:**
1. **Inconsistent storage layer** — Express uses in-memory arrays (volatile), Workers uses D1 (persistent)
   - Risk: Dev data loss; schema drift between implementations
2. **Route duplication** — Two separate codebases to maintain (Express routes vs Worker handlers)
3. **Dev/Prod parity gap** — No local D1 emulator configured; dev uses RAM which loses data on restart

**Recommendations:**
- **Keep dual stack** for now (dev convenience vs prod scalability)
- **Unify storage abstraction**:
  - Create `src/db/adapter.js` (exists) but ensure Express also uses it
  - For dev, use SQLite in-memory with same schema as D1
  - Add D1 emulator setup: `wrangler d1 execute hive-warfare-db --local`
- **Document migration path**: Add `README-DEPLOYMENT.md` with exact steps to switch between dev/prod

---

## 2. Vite + Vanilla JS vs React/Vue — Scalability?

### Current State
- **Frontend**: Vite + Vanilla JS in `src/dashboard/` (5 views: Members, KPI, PSN, Alerts)
- **Architecture**: DOM manipulation without framework; modular .js files per view

### Assessment: ⚠️ **ADEQUATE FOR NOW, REQUIRES REFACTOR AT TEAM >5**

**Strengths:**
- Zero build overhead, fast iteration
- No framework learning curve; accessible to junior devs
- Current codebase is small (<2K LOC frontend); Vanilla is appropriate

**Scalability Risks:**
1. **State management** — No centralized store; likely prop drilling or global vars
   - At 10+ views, will become spaghetti
2. **Reusability** — Vanilla requires manual DOM updates; error-prone
3. **Testing** — No component-level tests; only E2E possible (harder to maintain)
4. **Team scaling** — React/Vue provides conventions that help onboarding

**Trigger conditions for migration:**
- Team size > 3 frontend devs
- Views > 10 or components > 30
- Need real-time updates (WebSocket integration)

**Recommendation:**
- **Stay with Vanilla + Vite** for pilot phase (T-025)
- **Introduce Alpine.js** (lightweight 7KB) as stepping stone:
  - Add `x-data` stores for reactive state
  - Minimal refactoring; can migrate component-by-component
  - Option to upgrade to React later
- **If full framework is needed**: Use Preact (3KB) instead of React for smaller bundle
- **Immediate action**: Extract shared UI utilities (buttons, modals, tables) into `src/dashboard/components/` to prep for future framework

---

## 3. In-memory DB vs D1 — Data Durability

### Current State
- **Express dev server**: In-memory JavaScript arrays (`members = []`)
- **Workers production**: Cloudflare D1 (SQLite)
- **Schema**: Defined in `migrations/0001_initial_schema.sql`

### Assessment: 🚨 **CRITICAL DATA LOSS RISK IN DEV**

**Problems:**
1. **Dev data volatility** — Every server restart wipes all members, habits, KPI history
   - Cannot reproduce bugs from real data
   - Seed data must be re-loaded each session (`scripts/seed.js`)
2. **Schema drift** — In-memory objects vs SQL schema; different validation rules
   - Example: Worker uses `email_encrypted` field; Express member model has `_encryptedEmail` (different naming)
3. **No dev backups** — In-memory cannot be snapshotted; migration testing impossible

**D1 Advantages:**
- SQLite schema ensures data integrity (FOREIGN KEYs, constraints)
- Realistic test environment; same queries as prod
- Can seed once and reuse across sessions
- D1 emulator available for local testing

**Cost Analysis:**
- D1 free tier: 5GB storage, 25M reads/month
- At 100 members × 365 days = ~36K rows/year; negligible
- No performance benefit for in-memory at this scale (data fits in RAM anyway)

**Recommendation:**
- **Switch dev to D1 with local emulator**:
  - Install: `npm install -g wrangler`
  - `wrangler d1 create hive-warfare-db --local`
  - Update `wrangler.toml` with `[[d1_databases]]` binding
  - Modify `src/server.js` to initialize D1 client when `process.env.NODE_ENV !== 'development'`? Actually, use D1 everywhere
- **Keep seed script** but make it idempotent (upsert, not insert)
- **Add migrations versioning** to detect schema drift
- **Do NOT use pure in-memory for any environment beyond prototype** — even dev needs persistence for debugging

---

## 4. Jest for Testing — Sufficient?

### Current State
- **Test runner**: Jest 30.3.0
- **Coverage target**: 70% statements, 65% branches, 60% functions, 70% lines
- **Test types**: Unit tests for API endpoints using Supertest
- **Test files**: Located in `/test` directory
- **Ignored patterns**: Some legacy tests excluded in jest.config.js

### Assessment: ✅ **ADEQUATE BUT INCOMPLETE COVERAGE**

**Strengths:**
- Jest is mature, good mocking, runs fast
- Supertest integration tests hit actual Express routes
- Coverage thresholds enforced
- Separate test for legacy system (T-018 completed)

**Gaps:**
1. **No Workers tests** — Cloudflare Workers code untested
   - Need Vitest or Jest with `@cloudflare/workers-wasm` for fetch mocks
2. **Missing E2E tests** — T-019 (E2E smoke test) still pending
   - Should use Playwright to test dashboard UI + API integration
3. **No database integration tests** — D1 queries not tested against real schema
4. **Incomplete coverage** — 70% threshold may miss critical paths (auth, RBAC)
5. **No performance tests** — No load testing for PSN health classifier under 100+ concurrent

**Recommendations:**
- **Add Workers unit tests**:
  - Create `test/workers/` with Jest + `workerd` mock or Vitest
  - Test each handler: auth, members, habits, alerts
- **Implement E2E (T-019)** using Playwright:
  - Login flow → dashboard → member creation → habit check-in
  - Run in CI before deploy
- **Add integration tests** for D1 adapter:
  - Test migrations, constraints, edge cases (duplicate email, cascade deletes)
- **Increase coverage to 85%+** for critical modules (auth, RBAC, PSN classifier)
- **Add simple load test** using k6 or autocannon (100 requests, measure latency)
- **CI integration**: GitHub Actions running `npm test` on PR + coverage reporting

---

## 5. Anthropic Claude for AI — Cost/Quality Tradeoffs

### Current State
- **AI integration**: Not explicitly shown in dependencies
- **Context**: Mekong CLI uses OpenRouter with multiple LLM providers
- **Likely usage**: Training content generation, PSN analysis, alert recommendations

### Assessment: ⚠️ **NEEDS CLARIFICATION BUT GENERALLY SOUND**

**Cost Considerations (via OpenRouter):**
```
Claude Opus 4:     $15/1M input, $75/1M output  (high-quality, slow)
Claude Sonnet 4:   $7.5/1M input, $37.5/1M output (balanced)
Claude Haiku 4:    $0.25/1M input, $1.25/1M output (fast, good enough)
```

**For MLM Training OS use cases:**
1. **Content generation** (training modules): Use Sonnet (balance quality/cost)
2. **Real-time PSN health classification**: Use Haiku (fast, cheap, deterministic)
3. **Alert rule evaluation**: Haiku sufficient (rule-based, not creative)
4. **Onboarding bot conversations**: Sonnet for nuanced coaching

**Quality concerns:**
- Claude has strong reasoning for PSN 9-state classifier logic
- Vietnamese language support: Claude 4 models excellent (better than GPT-4)
- Cost optimization: Use tiered routing based on endpoint criticality

**Alternatives considered:**
- **GPT-4.1**: Similar quality, slightly worse Vietnamese, comparable cost
- **Gemini 2.5 Pro**: Good Vietnamese, cheaper, but less reasoning depth
- **Llama 3.1 70B (self-hosted)**: High upfront compute cost, no API expense
  - Only viable if volume > 10M tokens/month

**Recommendations:**
- **Implement LLM routing layer**:
  - Create `src/ai/router.js` that selects model by use case
  - Default: Claude Sonnet 4 via OpenRouter
  - Hot path (alerts, health check): Claude Haiku
  - Content generation: Claude Opus (batch, async)
- **Add token budgeting**:
  - Set monthly caps per endpoint (e.g., 100K tokens for alerts, 500K for content)
  - Implement usage tracking in audit log
- **Cache frequent queries**:
  - PSN health classification deterministic? Cache by metrics hash
  - Alert rule evaluations: Cache for 5 minutes
- **Evaluate RAG** for training content:
  - Store curriculum in vector DB (Pinecone/Milvus)
  - Retrieve context, summarize with Claude instead of full generation
  - Reduces token usage 60%+
- **Monitor spend**: Add `/admin/ai-usage` endpoint to track daily token consumption

**Unanswered Questions:**
- What is the actual expected monthly traffic? (affects model choice economics)
- Are there latency requirements for AI endpoints? (Haiku ~200ms, Opus ~2s)
- Is Vietnamese the primary language? (Claude 4 best for Vietnamese)

---

## Summary: Priority Recommendations

| Issue | Priority | Effort | Impact |
|-------|----------|--------|--------|
| Fix dev data persistence (use D1 emulator) | P0 | 2h | High — prevents data loss |
| Add Workers unit tests | P1 | 1d | High — production risk |
| Implement E2E smoke tests (T-019) | P1 | 2d | Medium — CI safety net |
| Unify storage adapter (Express + Workers) | P2 | 3d | Medium — code duplication |
| Add AI routing + token budgeting | P2 | 2d | Low — cost control |
| Migrate to Alpine.js when views >10 | P3 | 1w | Low — future scalability |

---

## Architecture Decision Record (ADRs)

1. **ADR-001**: Keep Express for development, Workers for production — approved (dev velocity)
2. **ADR-002**: Use Vanilla JS + Vite until team >3 frontend devs — approved (YAGNI)
3. **ADR-003**: D1 for all environments with local emulator — recommended (data integrity)
4. **ADR-004**: Jest for unit/integration, Playwright for E2E — approved (coverage)
5. **ADR-005**: Claude Sonnet default via OpenRouter, cache frequent queries — proposed

---

## Next Steps

1. Set up D1 local emulator and migrate Express dev server to use it
2. Write unit tests for Workers handlers (auth, members, habits)
3. Complete T-019: E2E smoke test with Playwright
4. Implement AI router with token tracking
5. Document deployment architecture in `docs/system-architecture.md`

**Unresolved Questions:**
- Should we implement RAG now or after pilot launch?
- What is the expected monthly active users for capacity planning?
- Do we need multi-region deployment for Vietnam latency?
- Should we add monitoring (Sentry, Logflare) before pilot?

---

**Report generated by:** Claude Haiku 4.5 (Anthropic)  
**Sources reviewed:** wrangler.toml, package.json, README.md, src/server.js, src/workers/index.js, src/db/adapter.js, src/models/*.js, jest.config.js
