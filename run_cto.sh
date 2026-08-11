#!/bin/bash
# ═══════════════════════════════════════════════════
# 🐝 HIVE WARFARE OS — CTO Sequential Worker Script
# Runs Claude Code CLI workers one-by-one via local
# Qwen 3.5 27B (MLX Bridge on port 11435)
# ═══════════════════════════════════════════════════
set -e
cd "/Users/mac/mekong-cli/SALE MLM"
export CLAUDE_CONFIG_DIR=~/.claude-qwen-default

log() { echo ""; echo "$(date '+%H:%M:%S') ══ $1 ══"; }
run_worker() {
  local name="$1"; local prompt="$2"
  log "▶ $name"
  claude -p "$prompt" 2>&1 | tee "logs/${name}.log"
  log "✅ $name DONE"
}

mkdir -p logs src

# ─────────────────────────────────────────
# W1: Project Scaffold
# ─────────────────────────────────────────
run_worker "W1_scaffold" \
"You are a Senior Node.js Developer. Your ONLY job is to create files. No explanations.
Create these files in the current directory:
1. package.json — name: droppii-training-os, deps: express, cors, dotenv
2. src/server.js — Express server on port 3000 with routes: /api/habits, /api/members, /api/kpi, /api/alerts, /health
3. .env — PORT=3000
Create the directories: src/api/ src/models/ src/dashboard/ src/agents/"

# ─────────────────────────────────────────
# W2: Data Models
# ─────────────────────────────────────────
run_worker "W2_models" \
"You are a Senior Node.js Developer. Read src/server.js for context. Create 4 data model files. No explanations, only code.
1. src/models/member.js — class Member: id, name, phone, tier(1-3), psnId, buddyId, habitScore, joinDate, status(active/at_risk/graduated), energyScore(1-10)
2. src/models/psn.js — class PSN: id, name, leaderId, members[], score(0-100), memberCount getter
3. src/models/habit.js — class Habit: id, memberId, date, wakeUp5am(bool), connects(int), zoomAttend(bool), kaizenJournal(bool), orders(int). dailyScore getter: 5am=2pts, connects>=15=2pts, zoom=1pt, kaizen=1pt. Max 6.
4. src/models/kpi.js — class KPI: id, memberId, week, habitScore, conversionRate, revenue, leadsCount, ordersCount. weightedScore getter: habit*0.4 + conversion*0.3 + revenue*0.3"

# ─────────────────────────────────────────
# W3: Habit Tracker API
# ─────────────────────────────────────────
run_worker "W3_habits_api" \
"You are a Senior Node.js Developer. Read src/models/habit.js for context. Create src/api/habits.js — Express router. No explanations.
Routes:
- POST / — create habit entry
- GET /?memberId&date — filter habits
- POST /quick — ONE-CLICK habit report for low-tech users. Body: {memberId, action:'5am'|'zoom'|'kaizen'|'connect'|'order'}. Find or create today's habit, update field, respond with Vietnamese emoji message.
Use in-memory array store."

# ─────────────────────────────────────────
# W4: Members + KPI + Alerts APIs
# ─────────────────────────────────────────
run_worker "W4_remaining_apis" \
"You are a Senior Node.js Developer. Create 3 Express router files. No explanations.
1. src/api/members.js — CRUD for Members. POST/, GET/?tier&status, GET/:id, PATCH/:id
2. src/api/kpi.js — POST/, GET/?memberId&week, GET/leaderboard (rank by weightedScore)
3. src/api/alerts.js — 6 alert rules from Droppii plan: conversion<15%, leads<100/week, habit<3, psnAvg<3, retentionRisk=high, q2Tasks<40%. POST/check runs engine. GET/rules lists rules. GET/log shows history.
Read src/models/ for data shapes."

# ─────────────────────────────────────────
# W5: Install & Verify
# ─────────────────────────────────────────
run_worker "W5_verify" \
"You are a DevOps engineer. In the current directory:
1. Run: npm install
2. Run: node src/server.js (background, kill after test)
3. Test: curl http://localhost:3000/health
4. Test: curl -X POST http://localhost:3000/api/habits/quick -H 'Content-Type: application/json' -d '{\"memberId\":\"test\",\"action\":\"5am\"}'
5. Report pass/fail for each test. Fix any errors found."

log "🐝 ALL WORKERS COMPLETE"
echo "Check logs/ directory for individual worker outputs"
