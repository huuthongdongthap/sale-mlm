# Droppii Sales Training OS — Hive Warfare Academy

> AI-operated MLM Training Platform | Team: PHỤNG SỰ 100 ĐỘ C | Target: $500K ARR

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Start dashboard (separate terminal)
npm run dev:dashboard
```

Server runs at `http://localhost:3000`

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Frontend: Vite + Vanilla JS (dark luxury theme)    │
│  src/dashboard/ — 5 views: Members, KPI, PSN, Alerts│
├─────────────────────────────────────────────────────┤
│  Backend: Express.js + in-memory storage            │
│  src/api/ — auth, members, habits, kpi, alerts      │
│  src/analytics/ — PSN health (9-state classifier)   │
│  src/agents/ — onboarding bot, training ops         │
├─────────────────────────────────────────────────────┤
│  Content: Tier 1 training modules (4 × 7 days)      │
│  content/tier1/ — m1-mindset, m2-product,           │
│                   m3-connect, m4-close              │
└─────────────────────────────────────────────────────┘
```

## API Endpoints

### Auth
- `POST /auth/login` — Login with email/password → JWT

### Members
- `GET /api/members` — List members (auth required)
- `POST /api/members` — Create member (PSN Leader+)
- `GET /api/members/:id` — Get member details
- `PATCH /api/members/:id` — Update member
- `DELETE /api/members/:id` — Delete member (Admin only)

### Habits
- `POST /api/habits/checkin` — Daily habit check-in
- `GET /api/habits/streak/:member_id` — Get streak
- `POST /api/habits/snapshot` — Daily snapshot

### KPI
- `GET /api/kpi/:member_id` — Member KPI rollup
- `POST /api/kpi` — Create KPI record
- `GET /api/kpi/team` — Team KPI summary

### Analytics
- `POST /api/analytics/psn-health` — PSN 9-state classification
- `POST /api/alerts/evaluate` — Evaluate alert rules
- `GET /api/alerts/rules` — List rules
- `GET /api/alerts/log` — Alert log
- `GET /api/alerts/summary` — Alert summary

### Onboarding
- `POST /api/onboarding/start` — Start onboarding for new member
- `GET /api/onboarding/:memberId` — Get session
- `POST /api/onboarding/:memberId/advance` — Advance to next day
- `POST /api/onboarding/:memberId/nudge` — Generate daily nudge
- `GET /api/onboarding/:memberId/progress` — Progress summary

### Training
- `POST /api/training/assign` — Auto-assign curriculum
- `POST /api/training/progress` — Update progress
- `GET /api/training/active` — Active trainees
- `GET /api/training/attention` — Trainees needing attention

### Monitoring
- `GET /health` — System health with subsystem status
- `GET /api/monitoring/errors` — Error log
- `GET /api/monitoring/summary` — Error summary

## Roles & Permissions

| Role | Members | PSN | Core | Admin |
|------|---------|-----|------|-------|
| View members | Own | PSN | All | All |
| Create members | ❌ | ✅ | ✅ | ✅ |
| Edit members | Own | PSN | All | All |
| Delete members | ❌ | ❌ | ❌ | ✅ |
| View KPI | Own | PSN | All | All |
| Manage alerts | ❌ | ✅ | ✅ | ✅ |

## Training Architecture

### Tier 1: Tân Binh → Chiến Binh (4 weeks)
- M1: Mindset Reset — 5AM Club
- M2: Product Mastery — Droppii Ecosystem
- M3: Connect Engine — 15 Connects/Day
- M4: First Close — Follow-Up Mastery

### Tier 2: Chiến Binh → Chỉ Huy (8 weeks)
- M5: Recruitment Funnel
- M6: Leader DNA — DISC Coaching
- M7: PSN Management
- M8: Coaching Conversations

### Tier 3: Chỉ Huy → Tướng Quân (12 weeks)
- M9: Sun Tzu Applied — 13 Chapters
- M10: Campaign Warfare
- M11: Data Commander
- M12: Legacy Builder

## PSN Health — Cửu Địa 9 States

| State | Name | Score | Color |
|-------|------|-------|-------|
| 1 | Tử Địa — Critical | <25 | 🔴 |
| 2 | Phạp Địa — Declining | 25-34 | 🟠 |
| 3 | Vi Địa — At Risk | 35-44 | 🟡 |
| 4 | Giao Địa — Unstable | 45-54 | 🟢 |
| 5 | Cù Địa — Average | 55-64 | 🟢 |
| 6 | Trọng Địa — Stable | 65-74 | 💚 |
| 7 | Tranh Địa — Growing | 75-84 | 📈 |
| 8 | Khinh Địa — Thriving | 85-94 | ⭐ |
| 9 | Tán Địa — Elite | 95+ | 👑 |

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npx jest test/auth-jest.test.js
```

Coverage target: 70%+ statements, 65%+ branches, 60%+ functions, 70%+ lines

## Deployment

### Cloudflare Pages (Frontend)
```bash
cd src/dashboard && npm run build
# Deploy dist/ to Cloudflare Pages
```

### Cloudflare Workers (Backend)
```bash
# Configure wrangler.toml
wrangler deploy
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `JWT_SECRET` | JWT signing secret | (change in prod!) |
| `SENTRY_DSN` | Sentry DSN for error tracking | (disabled) |
| `ZALO_ALERT_WEBHOOK` | Zalo webhook for critical alerts | (disabled) |
| `NODE_ENV` | Environment | development |

## Seed Data

```bash
node scripts/seed.js
```

Creates 10 pilot members across 2 PSNs with 14-day history.

## Project Status

- [x] Auth + RBAC (T-001)
- [x] Member CRUD + PDPA (T-002)
- [x] Habit tracker (T-003)
- [x] KPI rollup (T-004)
- [x] PSN health score (T-005)
- [x] Alert rules engine (T-006)
- [x] Dashboard shell (T-007)
- [x] Members table (T-008)
- [x] KPI panel (T-009)
- [x] PSN health view (T-010)
- [x] Alerts inbox (T-011)
- [x] Tier-1 Module 1 (T-012)
- [x] Tier-1 Module 2 (T-013)
- [x] Tier-1 Module 3 (T-014)
- [x] Tier-1 Module 4 (T-015)
- [x] Onboarding bot (T-016)
- [x] Training ops agent (T-017)
- [x] Test harness (T-018)
- [ ] E2E smoke test (T-019)
- [ ] CI pipeline (T-020)
- [ ] Cloudflare deploy (T-021)
- [ ] Monitoring (T-022)
- [x] Seed data (T-023)
- [ ] Admin docs (T-024)
- [ ] Pilot launch (T-025)
