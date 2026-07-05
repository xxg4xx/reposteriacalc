# Tasks: Mejoras Generales

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~150–200 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | All 11 fixes | Single PR | All independent, ~150–200 lines total, well under budget |

## Phase 1: Foundation

- [x] 1.1 Create `package.json` with `name: "reposteriacalc"`, `version: "1.1.0"`, `scripts.start: "node server.js"`, `private: true`

## Phase 2: Core fixes (app.js)

- [x] 2.1 B4 — Add `!Number.isFinite(value)` guard at top of `formatCurrency()`, return `$0.00` if not finite
- [x] 2.2 B5 — Remove dead `const existingIndex` line in `saveRecipe()`
- [x] 2.3 B6 — Change `setTimeout(..., 250)` to `setTimeout(..., 300)` in remove-ingredient animation
- [x] 2.4 B7 — Replace DOM-based `escapeHtml()` with regex string replace chain (`&`, `<`, `>`, `"`, `'`)
- [x] 2.5 B8 — Fix `safeStorageGet()`: replace `||` with `hasOwnProperty` check to return `""` for empty strings
- [x] 2.6 B9 — Remove redundant `calculateAll()` calls in `init()`; deduplicate `setTimeout(openHistoryModal, 500)`

## Phase 3: Security & robustness

- [x] 3.1 B10 — Add path traversal guard (`path.resolve()` + `startsWith(ROOT)`) in `server.js`
- [x] 3.2 B10 — Replace hardcoded IP with `os.networkInterfaces()` dynamic detection (localhost fallback)
- [x] 3.3 B10 — Add security headers (`X-Content-Type-Options`, `X-Frame-Options`) and proper HTML 404 page in `server.js`
- [x] 3.4 B11 — Add `unit in TO_BASE` validation guard in `toBaseUnit()`; fallback to `value` if unit unknown
- [x] 3.5 M5 — Add `isSameUnitGroup(unit1, unit2)` helper in `app.js` checking UNIT_GROUPS membership
- [x] 3.6 M5 — Return `{ cost, warning }` from `calculateIngredientCost()`; toggle `.unit-warning` class on mismatched selects in `calculateAll()`
- [x] 3.7 M5 — Add `.unit-warning` CSS class with orange border in `styles.css`
- [x] 3.8 M6 — Add `showToast()` alongside `console.warn` in `saveData()` and `loadData()` catch blocks
