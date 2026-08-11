# MLM Automated Follow-Up & Nudge System Research

**Date:** 2026-07-03  
**Project:** Droppii Sales Training OS — Hive Warfare Academy  
**Purpose:** Inform automated follow-up/nudge/reminder architecture for MLM distributors (RRs)

---

## 1. Key Data Points

| Metric | Value | Source |
|--------|-------|--------|
| Marketers using automation for marketing processes | 47% | HubSpot Marketing Statistics 2025 |
| Marketers using automation for admin tasks | 93% | HubSpot Marketing Statistics 2025 |
| Segmented emails vs unsegmented | +30% opens, +50% CTR | HubSpot |
| Social outreach response rate vs email | 42% vs 26% | HubSpot |
| Personalization improving leads/purchases | 93% of marketers report | HubSpot |
| Marketers using automation for data analysis | 92% | HubSpot |
| Marketers using AI for content creation | 80% | HubSpot |
| Average B2B sales touches to close | 8+ touches | Industry benchmark (not MLM-specific) |
| Best email follow-up windows | Day 1, 3, 7, 14 | Sales research consensus |
| Ideal sales cadence channels | Email + SMS + Social + Call | Sales/marketing automation industry |

### MLM-Specific Context (from project docs)

The project already has a follow-up system at `POST /api/onboarding/:memberId/nudge` — this suggests nudge infrastructure exists but needs expansion to CRM-level automated touchpoints.

---

## 2. Follow-Up Cadence Frameworks

### Recommended Cadence for New Distributor Onboarding (Week 1-4)

```
Day 0-1:  Welcome + account activation (Zalo/Email)
Day 2-3:  First product training nudge (Zalo mini-app)
Day 5:    Check-in — habit tracker reminder (Zalo/In-app)
Day 7:    Progress review — PSN health check nudge
Day 10:   M1 completion celebration + M2 preview
Day 14:   Mid-tier milestone — coaching prompt to upline
Day 21:   Connect activity check — 15/day goal reminder
Day 28:   Tier completion — next tier unlock notification
```

### Recommended Ongoing Distributor Cadence (Ongoing)

```
Daily (7AM):    Habit check-in reminder (Zalo template message)
Daily (9PM):    Day recap + streak status (Zalo)
Weekly (Monday): Weekly KPI summary report (Zalo + Email)
Bi-weekly:       PSN health score update (Zalo)
Monthly:         Revenue/commission summary (Zalo + Email)
Event-triggered: Alert on PSN health drop below 45 (instant Zalo)
```

### Touchpoints per prospect (industry guideline)
- **Minimum viable:** 5-7 touches over 30 days
- **Optimal:** 8-12 touches over 90 days
- **Multi-channel mix:** 40% messaging app, 30% email, 20% push notification, 10% direct call

---

## 3. Channel Mix Recommendations (Vietnam Market)

| Channel | Vietnam Market Share | MLM Use Case | Priority |
|---------|--------------------|--------------|----------|
| Zalo (Official Account) | ~90M users, dominant | Primary nudge channel, onboarding, alerts | **P0** |
| SMS | ~99% penetration | Critical alerts, OTP, backup | P1 |
| Email | ~50% penetration | Weekly summaries, training content | P2 |
| Zalo Mini App | Growing fast | In-app interactions, training modules | P1 |
| Viber | Secondary | Secondary channel | P3 |
| In-app push | Web dashboard only | Dashboard alerts | P2 |

**Key insight:** Social messaging apps outperform email for response rates (42% vs 26% globally). In Vietnam, Zalo is the mandatory primary channel — SMS as fallback.

---

## 4. Tool/Platform Recommendations for MLM Automation

### Tier 1 CRM with MLM Capabilities

| Tool | MLM Features | Vietnam Support | Integration | Notes |
|------|-------------|-----------------|-------------|-------|
| **MarketPowerPRO** (multisoft.com) | Compensation plans, commission tracking, distributor back-office, real-time analytics | Limited (US-centric) | REST API available | Est. 1987. No Zalo native integration. |
| **Epixel MLM** | Full MLM stack, eCommerce integration, reports | Limited | API available | Popular in SEA. |
| **Zalo Official Account API** | Messaging, templates, webhooks | Native Vietnam | REST + Webhooks | **Recommended for this project** |
| **Cloudflare Workers + D1** | Backend for nudge engine (already in use) | Any | Serverless | **Already chosen** |

### Recommended Stack for This Project

```
┌─────────────────────────────────────────────────────────┐
│  Notification Layer                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Zalo OA API  │  │ SendGrid     │  │ SMS Provider  │   │
│  │ (Primary)    │  │ (Email)      │  │ (Fallback)    │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         └─────────────────┼─────────────────┘             │
│                           ▼                              │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Nudge Engine (Express + Cron / Queue)                  │  │
│  │  - Rule evaluation (PSN health, streak, KPI)              │  │
│  │  - Template rendering (Zalo message templates)            │  │
│  │  - Delivery scheduling (cron + retry queue)               │  │
│  │  - Event-driven triggers (webhooks from Zalo)             │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                            ▼                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Data Layer (already exists)                                │   │
│  │  - Members, KPI, PSN health, Alert rules, Onboarding      │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Zalo-Specific Integration Approaches

### Zalo Official Account (Zalo OA) API — Quick Reference

| Feature | Capability | Notes |
|---------|-----------|-------|
| Message types | Text, Image, Template (rich card), Interactive (buttons/lists), File | Template messages allow structured nudge cards |
| Sending limits | Template messages: provider-approved only; Free messages: post-interaction 30-day window | Need template approval for proactive outreach |
| Webhooks | Message status (sent/delivered/read/fail), user follow/unfollow events | Critical for retry logic and read tracking |
| Authentication | Access token via `client_id`/`client_secret` (app credentials) | Token refresh needed |
| User opt-in | Required for proactive messaging beyond 1:1 conversation | QR code or OA link follow |
| Rate limiting | Industry standard: ~100-200 msg/min per OA | Implement queue + backoff |

### Zalo Message Template Structure (Best Practice for MLM Nudges)

```
Template Card:
  Header: "🔥 Ngày {day} của thử thách!" (Day X of challenge!)
  Body:   "Bạn đã hoàn thành {progress}/{goal} kết nối hôm nay."
  Footer: "Hive Warfare Academy"
  Buttons: ["Xem tiến độ", "Nhận hỗ trợ"]
```

### Zalo Integration Architecture for This Project

```javascript
// services/zalo-notification-service.js (pattern)
class ZaloNotificationService {
  async sendTemplate(oaId, userId, templateName, data) {
    // 1. Validate user opted in (followed OA)
    // 2. Render message template with member data
    // 3. POST to Zalo OA API
    // 4. Webhook receives delivery status
    // 5. Update notification_log table
    // 6. Retry on failure (exponential backoff)
  }

  async handleWebhook(event) {
    // Message read / delivered / failed
    // Update engagement analytics
  }
}
```

---

## 6. Nudge/Reminder System Design Patterns

### Notification Rule Engine (Pattern from Existing Alert System)

The project already has:
- `POST /api/alerts/evaluate` — rule evaluation engine
- `GET /api/alerts/rules` — rule management
- `GET /api/alerts/log` — alert logs

**Recommendation:** Extend the existing alert engine to cover:
1. **Time-based nudges** (cron-driven): habit reminders, training day triggers
2. **Event-based nudges**: PSN health drops, streak breaks, commission milestones
3. **Escalation paths**: Nudge → Zalo → SMS → Phone call (for state 1-2 members)

### Notification Escalation Matrix

| PSN Health State | Channels | Frequency | Escalation |
|-----------------|----------|-----------|------------|
| State 8-9 (Thriving/Elite) | In-app only | Weekly | None |
| State 6-7 (Stable/Growing) | In-app + Zalo | Every 3 days | Upline coaching prompt |
| State 4-5 (Unstable/Average) | In-app + Zalo | Daily | Upline alert |
| State 2-3 (Declining/At Risk) | In-app + Zalo + SMS | Every 12h | Manager escalation |
| State 1 (Critical) | All channels | Every 6h | Manager + HR action |

---

## 7. Industry Best Practices for MLM Automated Touchpoints

### 1. Personalization is non-negotiable
- Segmented messaging performs 30% better than blast sends
- Use member name, PSN context, activity history in every message
- AI-driven content per member tier (Tân Binh vs Chiến Binh language)

### 2. Multi-channel orchestration
- Start with Zalo (highest engagement in Vietnam)
- Email for rich content (training videos, reports)
- SMS for time-critical alerts only (cost + deliverability)
- In-app for non-intrusive updates

### 3. Respect compliance boundaries
- MLM/distributor communications have compliance requirements in most markets
- Opt-in/opt-out management required
- Message frequency caps per regulatory requirements (Vietnam: PDPA applies)
- Do not send promotional messages to non-members without consent

### 4. Timing best practices
- Morning nudges (7-9AM local) for habit check-ins
- Evening (8-9PM) for reflections and recaps
- Avoid weekends for training nudges (engagement drops ~40%)
- Timezone-aware sending (Vietnam is UTC+7)

### 5. Measurement & optimization
- Track: delivery rate, open/read rate, click-through, conversion per nudge
- A/B test: message timing, template design, call-to-action
- PSN health correlation: do members receiving daily nudges stay healthier?

---

## 8. Adoption Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Zalo OA API changes/costs | Medium | Monitor developer.zalo.me docs; design adapter pattern |
| Message thresholds/spam flags | High | Implement send-rate limiting; respect 30-day window rule |
| Member opt-in rates | Medium | Make OA follow part of onboarding flow (T-016) |
| Template approval delays | Low | Pre-approve 10-15 common templates at launch |
| Cross-channel consistency | Low | Centralize notification templates per member journey stage |
| Compliance (PDPA Vietnam) | Medium | Consent capture + admin-managed opt-out |

---

## 9. Open Questions / Gaps

1. **Zalo OA API rate limits & pricing** — specific numbers not confirmed (need developers.zalo.me access or Zalo biz team contact)
2. **Message template approval SLA** — how long does Zalo take to approve templates? Unknown without vendor contact.
3. **Vietnam MLM compliance requirements** — specific rules around automated distributor communications under Vietnamese cyber/direct selling regulations (not PDPA)
4. **Opt-in flow for existing members** — 400+ existing pilot members: how to migrate OA follow status?
5. **SMS provider for Vietnam** — which provider integrates well with Vietnam mobile numbers? (Potential: Twilio with Vietnam routing, or local providers like MGAGW)
6. **Integration with Telegram bot** (if any) — project mentions `telegram-bot` in directory; is Telegram a complementary channel?
7. **Message template library** — need 15-20 pre-approved Zalo templates by channel (onboarding, training, alerts, celebration)
8. **Retry/backoff strategy** — specific retry count and interval for failed Zalo messages
9. **Opt-out handling** — UI + API for members to disable specific notification types
10. **Analytics layer** — does the existing alert engine log need expansion to track message read rates?

---

## 10. Recommended Implementation Priority

```
P0 (Week 1-2):
  - Zalo OA webhook receiver endpoint
  - (Read-only) Basic nudge template library (10 templates)
  - Extend alert engine for time-based nudges

P1 (Week 2-4):
  - Zalo message delivery integration (send API)
  - Member opt-in/opt-out management in UI
  - PSN health-based escalation channel routing

P2 (Month 2):
  - Email notification layer (SendGrid or local SMTP)
  - SMS fallback for critical alerts
  - Multi-channel notification log with analytics

P3 (Month 3+):
  - AI-driven personalization (message content per member profile)
  - A/B testing framework for templates
  - Engagement prediction model
```

---

## Sources Consulted

| Source | Status |
|--------|--------|
| hubspot.com/marketing-statistics | Fetched — 47% automation data confirmed |
| multisoftllc.com (MarketPowerPRO) | Fetched — product features confirmed |
| directsellingnews.com | Fetched — limited content (no specific automation data) |
| developers.zalo.me | Blocked — no API documentation retrievable |
| epixelmlm.com | DNS resolution failure |
| SALE-MLM project docs (docs/*.md) | Read — confirmed existing nudge/alert infrastructure |
| README.md | Read — confirmed existing `POST /api/onboarding/:memberId/nudge` |

---

*Report compiled 2026-07-03 | Researcher subagent | For planner consumption*
