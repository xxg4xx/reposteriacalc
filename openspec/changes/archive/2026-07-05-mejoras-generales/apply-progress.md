# Apply Progress: Mejoras Generales

**Status**: ✅ 15/15 tasks complete — all phases done

## Phase 1: Foundation

- [x] 1.1 Created `package.json` with `name: "reposteriacalc"`, `version: "1.1.0"`, `scripts.start: "node server.js"`, `private: true`

## Phase 2: Core fixes (app.js)

- [x] 2.1 B4 — Added `!Number.isFinite(value)` guard at top of `formatCurrency()`, returns `$0.00` for NaN/Infinity
- [x] 2.2 B5 — Removed dead `const existingIndex` line in `saveRecipe()` — variable and `data.savedAt` were unused
- [x] 2.3 B6 — Changed `setTimeout(..., 250)` to `setTimeout(..., 300)` in remove-ingredient animation to match CSS transition (`0.3s`)
- [x] 2.4 B7 — Replaced DOM-based `escapeHtml()` with regex string replace chain (`&`, `<`, `>`, `"`, `'`)
- [x] 2.5 B8 — Fixed `safeStorageGet()`: replaced `memoryStorage[key] || null` with `key in memoryStorage ? memoryStorage[key] : null` to return `""` for empty strings
- [x] 2.6 B9 — Removed redundant `calculateAll()` calls and duplicate `setTimeout(openHistoryModal, 500)` in `init()`

## Phase 3: Security & robustness

- [x] 3.1 B10 — Added path traversal guard (`path.resolve()` + `startsWith(ROOT)`) in `server.js`
- [x] 3.2 B10 — Replaced hardcoded IP with `os.networkInterfaces()` dynamic detection (`getLocalIP()`) with `'localhost'` fallback
- [x] 3.3 B10 — Added security headers (`X-Content-Type-Options`, `X-Frame-Options`) and proper HTML 404/403 page via `sendPage()`
- [x] 3.4 B11 — Added `!(unit in TO_BASE)` validation guard in `toBaseUnit()`; returns raw `value` if unit unknown
- [x] 3.5 M5 — Added `isSameUnitGroup(unit1, unit2)` helper checking if both units belong to the same group in `UNIT_GROUPS`
- [x] 3.6 M5 — Modified `calculateIngredientCost()` to return `{ cost, warning }` object; `calculateAll()` toggles `.unit-warning` class on mismatched selects
- [x] 3.7 M5 — Added `.unit-warning` CSS class with orange border (`var(--warning)`) in `styles.css`
- [x] 3.8 M6 — Added `showToast('Error al guardar los datos')` and `showToast('Error al cargar los datos')` alongside existing `console.warn` in catch blocks

## Files Changed

| File | Action | Summary |
|------|--------|---------|
| `package.json` | **Created** | Project metadata with name, version, start script |
| `app.js` | **Modified** | 10 edits across 10 functions (safeStorageGet, toBaseUnit, isSameUnitGroup, calculateIngredientCost, formatCurrency, calculateAll, escapeHtml, saveData, loadData, saveRecipe, init, remove animation) |
| `server.js` | **Modified** | Path traversal guard, dynamic IP detection, security headers, HTML 404/403 pages |
| `styles.css` | **Modified** | Added `.unit-warning` class with orange border |

## Deviations from Design

- Used `isSameUnitGroup(unit1, unit2)` instead of `getUnitGroup(unit)` — functionally equivalent but provides a cleaner API for the comparison use case
- M5 CSS class is `.unit-warning` instead of `.unit-select-warning` — matches the user's stated preference and is more concise
- M6 keeps `console.warn` as secondary log while adding `showToast()` as the design specified

## Issues Found

None.

## Next

Ready for verify.
