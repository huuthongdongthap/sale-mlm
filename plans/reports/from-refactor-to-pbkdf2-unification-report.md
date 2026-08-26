# Refactor — PBKDF2 Unification + Dead Worker Entry Removal

## Session Info
- 2026-08-26 (16:30–17:00 ICT), CWD `/Users/mac/mekong-cli/SALE MLM`, branch main
- Trigger: `/refactor` following CORS-lock session findings

## What was done

### 1. Shared password module (`4001d7a`)
**New `src/auth/password.js`** — single source of truth for PBKDF2:
- `ITERATIONS=100000, KEY_LENGTH=64, DIGEST='sha512'`
- `hashPassword()` — Node sync path (Express login)
- `verifyWebCrypto()` — Workers async path with constant-time compare

**Bug fixed by the refactor:** Express used **600k** iterations; Worker used **100k**. Same
password → different hashes → login worked on exactly one surface. Verified computationally
before refactoring (`7c38ae54…` vs `f1352ba0…`). 100k chosen because WebCrypto `deriveBits`
caps there — the only value that works on both surfaces.

Consumers migrated:
- `src/api/auth.js` — inline 600k `hashPassword` deleted, uses shared module
- `src/workers/index-native.js` — 20-line inline WebCrypto block → `verifyWebCrypto()`
- `test/setup.js` + `test/referral-leaderboard-jest.test.js` — hand-rolled pbkdf2Sync → shared module

### 2. Dead code deletion
`src/workers/index.js` (90 LOC) removed — express-adapter Worker variant. `wrangler.toml main`
→ `index-native.js`; zero imports anywhere; it also echoed arbitrary CORS origins.

## Verification
| Gate | Result |
|------|--------|
| Jest | ✅ 240/240 (15 suites), 3.1s in-band |
| `600000` references remaining | ✅ 0 |
| Worker dry-run bundle | ✅ 92.88 KiB / gzip 22.69 KiB |
| CI on push | ✅ success (`32954848502`) |
| Prod `/health` post-deploy | ✅ `{"ok":true}` |
| Staging deploy | ✅ uploaded |

## Caveats
- **Prod D1 has exactly 1 member**: `bee@hive.test` with `password_hash = 'abc123'` (plaintext
  placeholder, created 2026-06-06). The "4 seed accounts with f1352ba0 hashes" from the earlier
  audit report are NOT in prod — they exist only as test fixtures. Login cannot succeed for any
  real account until seed members are inserted with proper hashes.
- `scripts/migrate-password-hash.js` already used 100k — consistent with new module, no change needed.

## Unresolved questions
1. Who seeds pilot accounts into prod D1? `scripts/seed.js` has 10 pilot members but no password
   column logic visible — needs a seeding run with `hashPassword()` before pilot launch.
