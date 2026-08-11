# Stitch MCP Integration — Claude Zunef Bridge
**Date:** 2026-07-22 **Status:** ✅ Bridge operational — Stitch MCP reachable

## What works (verified)
- `node scripts/stitch-mcp.js list_projects    → 6 projects returned`
- `node scripts/stitch-mcp.js list_screens     → project 7605682676390924803 returns 52 screens`
- `node scripts/stitch-mcp.js get_screen       → full HTML + screenshot URLs`
- `node scripts/stitch-mcp.js tools/list       → 35+ tools confirmed`

## Files created
- `scripts/stitch-mcp.js`                    — JSON-RPC bridge (auto-wraps to tools/call)
- `scripts/stitch-orchestrator.js`           — task-router for structured prompts
- `.stitch/mcp_settings.json`                — API key + default project config

## Config sources (do NOT duplicate)
- Primary: `/Users/mac/.claude/settings.json` (mcpServers.stitch, stitch-http, stitch-kit)
- Fallback HTTP key: `/Users/mac/.claude/.mcp.json`
- Bridge reads `.stitch/mcp_settings.json` first, then env vars

## User's MLM project (6555717882115447371)
- `list_projects` confirms it appears as "SALE MLM - Hệ thống quản trị bán hàng đa cấp"
- `list_screens` returns `{"screens":[]}` — either no screens yet or access scope mismatch

## Unresolved
- [ ] Why project 6555717882115447371 returns empty screens (different GCP linked?)
- [ ] Need to verify which API key has access to which project
- [ ] User requested Claude Zunef API routing — clarify if they want the bridge to handle subagent orchestration via Stitch

## Status Update — 2026-07-22

| Item | Status |
|------|--------|
| Stitch bridge (stitch-mcp.js) | Completed |
| Project 7605682676390924803 | Completed (public, 52 screens accessible) |
| Project 6555717882115447371 (MLM) | Blocked — PRIVATE project, API key scoped to 7605682676390924803 only |
| Screens readable from MLM project | Blocked |
| Design system CSS | Completed (created, linked, validated) |

### Access path for project 6555717882115447371
1. User shares API key with access to this GCP project
2. Add to `.stitch/mcp_settings.json` under `apiKeys.anomaly-v3`
3. Run: `node scripts/stitch-mcp.js list_screens '{"projectId":"6555717882115447371"}'`

### Workaround
Use screens from project 7605682676390924803 as reference for MLM dashboard HTML extraction and UX rules (see audit report).
