# Integration Assessment — darkzOGx/youtube-automation-agent → SALE MLM

Date: 2026-08-24 | Source repo: https://github.com/darkzOGx/youtube-automation-agent (master, **MIT**, 2537★, JavaScript/CommonJS, Node 18+)
Question: *"xem xét repo này và có thể tích hợp gì vào dự án"* — what is worth integrating?

## Verdict

**Do NOT import the repo wholesale.** Its video-generation half duplicates `packages/yt-shorts-pipeline` (Verticals v3) which we already own end-to-end (research → script → voice → captions → ffmpeg → upload). The distinctive value is its **post-publish layer**: channel-learning loop, cron automation, human-in-the-loop approval gates, and engagement tooling. Those do not exist anywhere in our stack.

Recommended target: a new sibling package `packages/yt-channel-ops/` (Node, mirrors external stack) that consumes metadata published by Verticals v3. Nothing touches `src/` core (Sales Training OS domain: members/orders/commissions/training).

## What the external repo actually contains (verified)

| Area | Files | Notes |
|---|---|---|
| 7 agents | `agents/*.js` (script-writer, seo-optimizer, thumbnail-designer, content-strategy, production-management, publishing-scheduling, analytics-optimization) | One stage each; strategy→script→thumbnail/SEO→production→publishing→analytics DAG with feedback loop |
| Channel Learning Engine | `utils/channel-learning-engine.js` (542 LOC) | Performance snapshots per video/window; baseline = channel's own history; delta scoring; confidence tiers; **simulated analytics excluded** from baselines/recommendations; recommendations stay *pending* until operator approves |
| Daily automation | `schedules/daily-automation.js` (678 LOC, node-cron) | Content 06:00, publish queue */15min, analytics 09:00, weekly strategy Sun 08:00, optimization 22:00, DB maintenance Sat 03:00; health-check loop |
| Approval gates | README + Review Studio | Factual/provenance review, media-rights attestation, explicit privacy+schedule confirmation; **simulated output cannot publish**; approved/scheduled productions locked against repair |
| Growth experiments | `utils/growth-experiment-service.js`, reports/growth/ | A/B title+thumbnail arms, 24–168h windows, min-impression floors, 95% CTR evidence threshold, control restore after final arm |
| Engagement | `utils/audience-engagement-service.js` | Comment sync (4h cadence), theme/sentiment classification, draft replies (never auto-post), spam quarantine (never delete on-platform), `ENGAGEMENT_DAILY_REPLY_CAP=50`, audience-requested idea mining (≥3 askers) |
| Scene retention | `utils/scene-retention-engine.js` | Maps YouTube 100-point retention curve onto stored scene durations → per-scene drop-off signals |
| Infra | `utils/credential-manager.js`, `generation-recovery-service.js` (persist provider task IDs before polling), SQLite db, oauth-server, dashboard UI | Recovery + credential handling are directly portable ideas |

## Overlap map vs our assets

| Capability | External repo | Ours today | Action |
|---|---|---|---|
| Research/script/TTS/captions/ffmpeg/upload | ✅ | ✅ Verticals v3 (`packages/yt-shorts-pipeline/verticals/*.py`) | **Skip — redundant** |
| Thumbnail/image gen | ✅ | ✅ (Gemini Imagen, `verticals/thumbnail.py`) | Skip |
| Post-publish learning loop | ✅ | ❌ none | **Adopt (core of the value)** |
| Cron scheduler | ✅ node-cron | ❌ (only express-rate-limit dep; no scheduler) | Adopt |
| Approval gates before publish | ✅ | Partial (upload.py is private/manual) | Adopt pattern |
| SEO/title/tags optimization | ✅ agent prompts | Prompt-only inside draft.py | Port prompts, cheap |
| Comment engagement | ✅ | ❌ | Phase-later (needs `youtube.force-ssl` scope; we have `scripts/setup_youtube_oauth.py`) |
| Growth experiments / retention curves | ✅ | ❌ | Later phase — needs volume first |

License is MIT → adopting code or patterns is fine with attribution in package README.

## Proposed plan (phases, smallest first)

### Phase 1 — `packages/yt-channel-ops` skeleton + learning engine port
- New Node package (CommonJS, Jest) mirroring monorepo style; zero deps beyond `node-cron`.
- Port `channel-learning-engine.js` concepts: performance snapshot store (SQLite via better-sqlite3 v13 — note `.get()` not `.first()`, single `bind()` per statement), baseline/delta/confidence, simulated-metrics exclusion, pending-recommendation state machine requiring explicit approval.
- Input contract: JSON file emitted by Verticals v3 after upload (videoId, topic, niche, publishedAt) + YouTube Analytics API pull.
- Tests: snapshot normalization, baseline math, simulated-exclusion, approval gating. Target ≤200 LOC/file per house rules.

### Phase 2 — Scheduler + approval-gated publish hook
- `daily-automation` pattern reduced to our needs: nightly analytics capture (off-peak minute, avoid :00), weekly learning review, health check.
- Publish gate: Verticals v3 upload step requires an explicit `--approve <token>` artifact produced by the ops package; no token → dry-run only. Mirrors "simulated output cannot publish".

### Phase 3 — SEO prompt port
- Lift seo-optimizer prompt structure (title variants, description, tags, hook styles) into `packages/yt-shorts-pipeline/verticals/draft.py` as an optional enrichment call. Python-side, no new deps.

### Phase 4 (defer until channel has ≥20 published shorts)
- Comment engagement drafts (read-only first), growth experiments, scene-retention mapping.

## Risks / notes
- External repo's dashboard/OAuth-server/multi-provider plumbing: **not adopted** — heavy, duplicative of our auth posture.
- better-sqlite3 version pitfalls learned this session apply if we share the adapter pattern (do NOT copy their db.js).
- YouTube API quota: analytics pulls must be cached/daily-batched (their 4h comment sync is aggressive for a fresh channel).
- Keep `src/` untouched in all phases — this is a marketing side-vertical, not Sales OS domain.

## Unresolved questions
1. Where should the upload-approval gate live: CLI flag on Verticals v3, or a tiny local endpoint? (Default: CLI flag — KISS.)
2. Do we want the ops package to read/write the shared D1/local DB adapter, or its own SQLite file? (Default: own file — isolation.)
