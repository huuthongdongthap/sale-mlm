# Task: Coverage Threshold Remediation

## Goal
Push Jest coverage from current levels to meet `jest.config.js` thresholds.

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Statements | 57.8% (1118/1934) | ≥70% | +12.2% |
| Branches | 47.9% (691/1442) | ≥60% | +12.1% |
| Functions | 55.3% (209/378) | ≥60% | +4.7% |

## Scope
- Focus on `src/api/leads.js` (12.8KB — largest untested route file)
- Focus on `src/api/members.js` (members/ subdir: create/delete/list/detail/pii-logger/update/validation)
- Audit existing tests under /test/ for redundancy / dead code

## Deliverables
1. Coverage summary after changes (statements ≥70%)
2. List of files contributing most to uncovered statements (per-file coverage)
3. No new dependencies

## Constraints
- KISS: Prefer adding targeted tests over refactoring
- DRY: Reuse existing test helpers / fixtures
- YAGNI: No coverage tests for code not on go-live critical path

## Evidence
Coverage JSON: `coverage/coverage-summary.json` (lines60.7%, statements57.8%)
Config: `jest.config.js:15-19`
CI gate: `.github/workflows/ci.yml` — `test` job blocks on coverage threshold

## Acceptance
```bash
npx jest --coverage --silent --coverageReporters=json-summary
python3 -c "import json; d=json.load(open('coverage/coverage-summary.json')); t=d['total']; assert t['statements']['pct']>=70, f\"stmts {t['statements']['pct']}%\"; assert t['branches']['pct']>=60, f\"br {t['branches']['pct']}%\"; assert t['functions']['pct']>=60, f\"fn {t['functions']['pct']}%\""
```
Exit code0 = accepted.

---
Handoff: After coverage passes, delegate to `testing-expert` for verification.
