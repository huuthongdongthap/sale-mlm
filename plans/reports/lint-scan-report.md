# Lint Scan Report
**Date:** 2026-07-09  
**Scope:** `/Users/mac/mekong-cli/SALE MLM` — src/, scripts/, hive-academy/, test/  
**Tools:** `node --check` (syntax), heuristic grep (require-bindings, imports)  
**No ESLint/JSHint config found** in project root — heuristics only.

## BLOCKER

| # | File | Line | Message |
|---|------|------|---------|
| 1 | src/integrations/zalo-webhook.js | 146 | SyntaxError: `• [số]` string literal missing opening quote — would crash at require-time |

## MAJOR

(Unresolved imports: none found after checking all relative paths in hive-academy workers.)

## MINOR

| # | File | Line | Message |
|---|------|------|---------|
| 1 | scripts/launch-checklist.js | 11 | `path` required but never referenced in file |
| 2 | test/api-jest.test.js | 7 | `jwt` required but never referenced in file |
| 3 | test/ops-jest.test.js | 5 | `request` required but never referenced in file |
| 4 | test/ops-jest.test.js | 6 | `jwt` required but never referenced in file |

## Cleared

- `node --check src/server.js` — PASS
- `node --check src/integrations/zalo-webhook.js` — PASS post-fix
- All relative `from './x.js'` imports in hive-academy resolve to existing files
- No missing semicolons on terminal statement-style lines found

## Unresolved

- ESLint rules undefined (no `.eslintrc*`); deeper patterns (shadowed vars, unreferenced function params) not scanned.
