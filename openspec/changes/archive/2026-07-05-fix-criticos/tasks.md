# Tasks: fix-criticos

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~25–30 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | size-exception |

```
Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low
```

## Phase 1: SW Offline Fix (independent)

- [x] 1.1 Bump `CACHE_NAME` from `reposteriacalc-v3` to `reposteriacalc-v4` in `sw.js` (line 1)
- [x] 1.2 Replace inline HTML catch block with `caches.match('/offline.html')` in navigation fetch handler (sw.js lines 53–62)

## Phase 2: app.js — Input Normalization

- [x] 2.1 Add `normalizeNumber(value)` helper at top of `app.js` (comma → period replacement)
- [x] 2.2 Wrap `parseFloat()` in `calculateAll()` at 8 call sites with `normalizeNumber()` (lines 82–86, 101–103)
- [x] 2.3 Wrap `parseFloat`/`parseInt` in `collectData()` with `normalizeNumber()` (lines 238–241)

## Phase 3: app.js — History Fields

- [x] 3.1 Add `laborCost` and `operatingCost` to `recipeEntry` object in `saveRecipe()` (line 338)
- [x] 3.2 Restore `labor-cost` and `operating-cost` inputs in `loadRecipe()` with `?? 0` fallback (after line 439)
