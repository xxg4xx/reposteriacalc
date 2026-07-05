# Archive Report

**Change**: mejoras-generales
**Archived**: 2026-07-05
**Previous location**: `openspec/changes/mejoras-generales/`
**Archive location**: `openspec/changes/archive/2026-07-05-mejoras-generales/`

## Change Summary

Pure bugfix and improvement batch — 11 fixes (B4–B11) and improvements (M5–M7) from the general audit, following the `fix-criticos` batch. No new capabilities or spec changes.

- **B4**: `formatCurrency` Infinity/NaN guard
- **B5**: Remove dead code in `saveRecipe`
- **B6**: Animation timing sync (250ms → 300ms)
- **B7**: Regex-based `escapeHtml` (no DOM orphans)
- **B8**: `safeStorageGet` empty string fix
- **B9**: Remove redundant `calculateAll()` calls in `init()`
- **B10**: Path traversal guard + dynamic IP + security headers in `server.js`
- **B11**: `toBaseUnit` validation guard for corrupt data
- **M5**: Unit group consistency warning (visual)
- **M6**: Toast on localStorage failure
- **M7**: `package.json` project metadata

## Task Completion

| Metric | Value |
|--------|-------|
| Total tasks | 15 |
| Completed | 15 |
| Incomplete | 0 |

## Verification

**Status**: PASS WITH WARNINGS
**Critical issues**: None
**Warnings**: No test infrastructure, all scenarios UNTESTED (by source inspection only)

## Delta Specs

No delta specs existed for this change — pure bugfix and improvement work, no new capabilities requiring specification changes.

## Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Proposal | `openspec/changes/archive/2026-07-05-mejoras-generales/proposal.md` | ✅ |
| Design | `openspec/changes/archive/2026-07-05-mejoras-generales/design.md` | ✅ |
| Tasks | `openspec/changes/archive/2026-07-05-mejoras-generales/tasks.md` | ✅ (15/15 complete) |
| Apply Progress | `openspec/changes/archive/2026-07-05-mejoras-generales/apply-progress.md` | ✅ |
| Verify Report | `openspec/changes/archive/2026-07-05-mejoras-generales/verify-report.md` | ✅ (PASS) |
| Archive Report | `openspec/changes/archive/2026-07-05-mejoras-generales/archive-report.md` | ✅ |

## Files Changed

| File | Action |
|------|--------|
| `package.json` | Created |
| `app.js` | Modified (10 surgical edits) |
| `server.js` | Modified (path traversal, dynamic IP, security headers) |
| `styles.css` | Modified (.unit-warning class) |

## Notes

- Archive is intentional and clean — no delta specs to merge, no destructive operations
- Design deviations were documented and accepted: `isSameUnitGroup` vs `getUnitGroup`, `.unit-warning` vs `.unit-select-warning`, dual `showToast` + `console.warn`
