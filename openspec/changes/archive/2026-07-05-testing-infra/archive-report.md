# Archive Report: testing-infra

**Archived**: 2026-07-05
**Change**: testing-infra — Vitest + ESLint Infrastructure
**Mode**: hybrid (Engram + OpenSpec)
**Status**: ✅ Full archive — all 14 tasks complete, verify PASS

## Intent

Add test infrastructure (Vitest + jsdom) and linting (ESLint) to ReposteriaCalc. Extract pure functions from `app.js` into `src/calculations.js` as ESM exports, write unit and integration tests, and set up linting with flat config.

## Artifact Inventory

| Artifact | Filesystem | Engram ID |
|----------|-----------|-----------|
| Proposal | `proposal.md` | #397 |
| Design | `design.md` | #398 |
| Tasks | `tasks.md` | #399 |
| Apply Progress | `apply-progress.md` | #400 |
| Verify Report | `verify-report.md` | #402 |
| Archive Report | `archive-report.md` | (this file) |

## Task Completion

- **Total tasks**: 14
- **Complete**: 14 ✅
- **Incomplete**: 0
- **Stale checkbox reconciliation**: Not needed — all tasks correctly marked `[x]`

## Verification

- **Verdict**: PASS
- **Tests**: 34/34 passed
- **Lint**: 0 errors, 7 warnings (pre-existing, not introduced by this change)
- **CRITICAL issues**: None

## Delta Specs

No delta specs to sync — this change is developer infrastructure (testing + linting) with no new product capabilities.

## Storage

- **Archive location**: `openspec/changes/archive/2026-07-05-testing-infra/`
- **Engram topic key**: `sdd/testing-infra/archive-report`
- **Engram project**: reposteriacalc

## Key Learnings

- ES modules with `<script type="module">` enabled clean extraction without a bundler
- ESLint flat config required `.mjs` extension because `server.js` is CommonJS (`require`/`__dirname`)
- `globals: true` omitted from vitest.config.js — explicit test imports worked cleaner
- `formatCurrency` needed negative-handling fix (sign before currency symbol: `-$5.00` not `$-5.00`)
- Integration tests needed `<input>` elements (not `<div>`) for `.value` access in jsdom
- `@eslint/js` needs separate install even when `eslint` is installed
