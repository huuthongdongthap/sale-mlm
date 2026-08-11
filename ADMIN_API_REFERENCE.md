# Admin API Reference — Droppii Sales Training OS
Work context: `/Users/mac/mekong-cli/SALE MLM`

## Base URLs
- Local dev: `http://localhost:3000`
- Health: `GET /health`
- Auth: `POST /auth/login`

## Auth
| Method | Path | Role | Purpose |
|--------|------|------|---------|
| POST | /auth/login | public | Login → JWT |
| POST | /auth/verify | authed | Verify token |
| GET | /auth/users | admin | List users |

## Members
| Method | Path | Role | Purpose |
|--------|------|------|---------|
| POST | /api/members | PSN Leader+ | Create member |
| GET | /api/members | authed | List (own/PSN/all) |
| GET | /api/members/:id | authed | Get details |
| PATCH | /api/members/:id | authed | Update |
| DELETE | /api/members/:id | Admin | Delete |

## Habits
| Method | Path | Role | Purpose |
|--------|------|------|---------|
| POST | /api/habits/checkin | authed | Daily check-in |
| GET | /api/habits/ | authed | List check-ins |
| GET | /api/habits/streak/:memberId | authed | Streak |
| POST | /api/habits/snapshot | authed | Daily snapshot |
| POST | /api/habits/quick | authed | Quick check-in |
| GET | /api/habits/cron/midnight-snapshot | internal | Cron snapshot |

## Leads
| Method | Path | Role | Purpose |
|--------|------|------|---------|
| GET | /api/leads | authed | List leads |
| GET | /api/leads/:id | authed | Lead detail |
| POST | /api/leads | PSN Leader | Create lead |
| PATCH | /api/leads/:id | PSN Leader | Update lead |
| DELETE | /api/leads/:id | authed | Delete lead |
| GET | /api/leads/:id/journey | authed | Journey map |
| POST | /api/leads/:id/assign | PSN Leader | Assign lead |
| POST | /api/leads/:id/transition | PSN Leader | Transition stage |
| POST | /api/leads/:id/note | PSN Leader | Add note |

## Orders
| Method | Path | Role | Purpose |
|--------|------|------|---------|
| GET | /api/orders | admin/manager/ctv | List orders |
| GET | /api/orders/:id | admin/manager/ctv | Order detail |
| POST | /api/orders | authed | Create order |
| PATCH | /api/orders/:id | admin/manager | Update order |
| DELETE | /api/orders/:id | Admin | Delete order |
| GET | /api/orders/leads/:leadId | admin/manager/ctv | Orders by lead |

## KPI
| Method | Path | Role | Purpose |
|--------|------|------|---------|
| POST | /api/kpi | Admin/Core/PSN | Create KPI |
| GET | /api/kpi/:member_id | authed | Member KPI |
| GET | /api/kpi/leaderboard | authed | Leaderboard |

## Training
| Method | Path | Role | Purpose |
|--------|------|------|---------|
| POST | /api/training/assign | authed | Assign curriculum |
| POST | /api/training/progress | authed | Update progress |
| GET | /api/training/:memberId | authed | Training record |
| GET | /api/training/:memberId/progress | authed | Progress detail |
| GET | /api/training/active | authed | Active trainees |
| GET | /api/training/attention | authed | Needs attention |
| GET | /api/training/psn/:psnId | authed | PSN training view |

## Onboarding
| Method | Path | Role | Purpose |
|--------|------|------|---------|
| POST | /api/onboarding/start | authed | Start session |
| GET | /api/onboarding/:memberId | authed | Session detail |
| POST | /api/onboarding/:memberId/advance | authed | Next day |
| POST | /api/onboarding/:memberId/nudge | authed | Generate nudge |
| POST | /api/onboarding/:memberId/habit | authed | Log habit |
| POST | /api/onboarding/:memberId/order | authed | Log order |
| GET | /api/onboarding/:memberId/progress | authed | Progress summary |
| GET | /api/onboarding/active | authed | Active sessions |

## Alerts
| Method | Path | Role | Purpose |
|--------|------|------|---------|
| GET | /api/alerts/rules | authed | List rules |
| POST | /api/alerts/evaluate | authed | Evaluate metrics |
| GET | /api/alerts/log | authed | Alert log |
| GET | /api/alerts/summary | authed | Alert summary |
| POST | /api/alerts/:id/acknowledge | authed | Ack alert |

## Analytics / PSN Health
| Method | Path | Role | Purpose |
|--------|------|------|---------|
| POST | /api/analytics/psn-health | authed | PSN health score |
| GET | /api/analytics/funnel | authed | Funnel stats |
| GET | /api/analytics/funnel/stats | authed | Funnel summary |
| POST | /api/analytics/funnel/export | PSN Leader | Export funnel |

## Monitoring
| Method | Path | Role | Purpose |
|--------|------|------|---------|
| GET | /health | public | Service health |
| GET | /api/monitoring/errors | authed | Error log |
| GET | /api/monitoring/summary | authed | Error summary |

## Env Vars (Production)
| Variable | Required | Notes |
|----------|----------|-------|
| JWT_SECRET | yes | 32-byte hex |
| ENCRYPTION_KEY | yes | 32-byte hex |
| ALLOWED_ORIGIN | yes | CORS origin |
| SENTRY_DSN | no | Error tracking |
| ZALO_ALERT_WEBHOOK | no | Alert webhook |
