# Archive Report: fix-criticos

**Archived**: 2026-07-05
**From**: `openspec/changes/fix-criticos/`
**To**: `openspec/changes/archive/2026-07-05-fix-criticos/`
**Mode**: hybrid (Engram + openspec)

## Intent

Fix three critical bugs affecting all users: (1) `laborCost` and `operatingCost` are lost when saving to history; (2) Hispanic users typing decimal commas (e.g., `1,5`) silently lose the fractional part; (3) offline navigation falls back to an unstyled inline HTML blob instead of `offline.html`.

## Spec Sync

No delta specs existed — this was a pure bugfix with no new capabilities. Spec sync skipped.

## Archive Contents

| Artifact | Status |
|----------|--------|
| proposal.md | ✅ Present |
| design.md | ✅ Present |
| tasks.md | ✅ Present (7/7 tasks complete) |
| apply-progress.md | ✅ Present (completed 2026-07-05) |
| verify-report.md | ✅ Present |
| archive-report.md | ✅ Present (this file) |

## Task Completion

All 7 implementation tasks checked `[x]` in tasks.md. No unchecked tasks remain.

## Verification Verdict

**PASS WITH WARNINGS** — No CRITICAL issues. Two warnings documented:
1. `normalizeNumber` returns `0` for null/empty instead of string (functionally equivalent).
2. SW catch block includes extra fallbacks (index.html, root) before offline.html (more robust than design).

## Active Changes Cleanup

Change folder removed from `openspec/changes/`. Active directory now contains only: `archive/`, `exploracion-general/`.

## SDD Cycle Complete

This change has been fully planned, implemented, verified, and archived.
