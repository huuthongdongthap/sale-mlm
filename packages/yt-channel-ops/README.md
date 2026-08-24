# yt-channel-ops

Post-publish YouTube channel operations for the SALE MLM content side-vertical.
Companion to `../yt-shorts-pipeline` (video generation). Nothing here touches
the Sales Training OS core (`src/`).

Pattern adapted from
[darkzOGx/youtube-automation-agent](https://github.com/darkzOGx/youtube-automation-agent)
(MIT): channel-learning loop, approval gates, scheduled ops — reduced to the
pieces a fresh channel actually needs.

## Components

| Module | Purpose |
|---|---|
| `src/learning/engine.js` | Performance snapshots vs the channel's own history (median baseline), delta scoring, confidence tiers. Simulated metrics are stored but flagged `unverified` and **never** enter baselines or recommendations. |
| `src/learning/store.js` | SQLite persistence (better-sqlite3). Snapshots unique per `(video_id, window_hours)`; recommendations are a pending → approved/rejected state machine. |
| `src/scheduler.js` | Minute-tick job runner (fixed-minute + interval + day-of-week specs). No cron dependency. |
| `src/publish-gate.js` | Single-use upload approval tokens, bound to one videoId, 24h TTL, require a ≥10-char who+why note. No token → no upload. |
| `src/cli.js` | Human interface for approvals and learning decisions. |

## Invariants

1. **Simulated analytics never learn.** They are persisted as unverified
   evidence only.
2. **Recommendations stay pending until an explicit decision.**
   `engine.decide(id, 'approved'|'rejected', note)` is the only path.
3. **No upload without a consumed token.** The pipeline's upload step must
   verify `--approve <token>` via this package before pushing to YouTube.

## Usage

```bash
node src/cli.js approve <videoId> "approved by Thong after factual review"
node src/cli.js verify <token> <videoId>
node src/cli.js recommendations pending
node src/cli.js decide outperform:vid:24h:views approved "validated"
```

Data lives in `$YT_CHANNEL_OPS_DATA` (default `./data/channel-ops/`) — add it
to `.gitignore`; it is runtime state, not source.

## Tests

```bash
npx jest   # 20 tests
```

## License

MIT. Prompt structure in `yt-shorts-pipeline/verticals/seo.py` adapted from
the external repo above.
