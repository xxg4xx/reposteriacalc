# Apply Progress: fix-criticos

**Status**: ✅ Complete
**Date**: 2026-07-05

## Phase 1: SW Offline Fix
- [x] 1.1 Bumped `CACHE_NAME` from `reposteriacalc-v3` → `reposteriacalc-v4` in `sw.js`
- [x] 1.2 Replaced inline HTML catch block with `caches.match('/offline.html')` — keeps existing fallback chain (index.html → / → offline.html)

## Phase 2: Input Normalization
- [x] 2.1 Added `normalizeNumber(value)` helper after `toBaseUnit()` — handles null/undefined/empty → 0, first comma → period
- [x] 2.2 Wrapped `parseFloat()` in `calculateAll()` with `normalizeNumber()` — 6 call sites (price, boughtQty, usedQty, profitMargin, laborCost, operatingCost)
  - Also wrapped `calculateIngredientCost()` defensively — 3 call sites (price, boughtQty, usedQty)
- [x] 2.3 Wrapped `parseFloat`/`parseInt` in `collectData()` — 4 call sites (piecesCount, profitMargin, laborCost, operatingCost)

## Phase 3: History Fields
- [x] 3.1 Added `laborCost` and `operatingCost` to `recipeEntry` in `saveRecipe()` after `profitMargin`
- [x] 3.2 Added `?? 0` fallbacks for `labor-cost` and `operating-cost` inputs in `loadRecipe()`

## Files Modified
- `sw.js` — CACHE_NAME bump, offline.html fallback
- `app.js` — normalizeNumber helper, wrapped parseFloat/parseInt calls, recipeEntry fields, loadRecipe fallbacks
