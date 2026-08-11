#!/usr/bin/env python3
import subprocess, json

DIR = "/Users/mac/mekong-cli/SALE MLM"
DB = "hive-warfare-db"
W = lambda cmd: ["wrangler", "d1", "execute", DB, "--local", "--command", cmd]

seeds = [
    "INSERT INTO members (id, name, email, password_hash, role, tier) VALUES ('m_01', 'Test Bee', 'bee@hive.test', 'hash', 'Member', 1)",
    "INSERT INTO habits (member_id, date, items, streak) VALUES ('m_01', '2026-06-06', '[]', 3)",
    "INSERT OR REPLACE INTO onboarding_sessions (member_id, current_week, current_day, habit_scores, orders_count, status, started_at, updated_at) VALUES ('m_01', 2, 3, '[4,5,3]', 1, 'active', '2026-06-01', '2026-06-06')",
    "INSERT OR REPLACE INTO training_records (member_id, member_name, tier, curriculum_name, completed_days, total_days, status, last_activity) VALUES ('m_01', 'Test Bee', 1, 'Tân Binh', 5, 28, 'active', '2026-06-06')",
]

for sql in seeds:
    r = subprocess.run(W(sql), capture_output=True, text=True, cwd=DIR)
    status = "OK" if r.returncode == 0 else f"FAIL: {r.stderr[:80]}"
    print(f"  {status}: {sql[:60]}")

# Verify counts
for sql, label in [
    ("SELECT COUNT(*) as n FROM members", "members"),
    ("SELECT COUNT(*) as n FROM habits WHERE member_id='m_01'", "habits"),
    ("SELECT COUNT(*) as n FROM onboarding_sessions WHERE member_id='m_01'", "onboarding"),
    ("SELECT COUNT(*) as n FROM training_records WHERE member_id='m_01'", "training"),
]:
    r = subprocess.run(W(sql), capture_output=True, text=True, cwd=DIR)
    print(f"  {label}: {r.stdout.strip()[:100]}")

# Curl handlers
import urllib.request
BASE = "http://localhost:8788"
for route in ["/api/alerts/rules", "/api/alerts/summary", "/api/onboarding/active"]:
    try:
        r = urllib.request.urlopen(f"{BASE}{route}")
        print(f"  GET {route}: {r.status} OK")
    except Exception as e:
        print(f"  GET {route}: FAIL — {e}")
for route in ["/api/habits?memberId=m_01"]:
    try:
        r = urllib.request.urlopen(f"{BASE}{route}")
        print(f"  GET {route}: {r.status} — {r.read()[:80]}")
    except Exception as e:
        print(f"  GET {route}: FAIL — {e}")
