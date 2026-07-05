# Design: fix-criticos

## 1. Input Normalization (fixes B3 + M1)

**Files**: `app.js`
**Mechanism**: Add a `normalizeNumber(value)` helper at the top of the file that replaces commas with periods. Apply it before every `parseFloat()` call in `calculateAll()` and `collectData()`.

```js
function normalizeNumber(value) {
  return String(value).replace(/,/g, '.');
}
```

**Integration**: 8 call sites in `app.js`:
- `calculateAll()` lines 82–86, 101–103: normalize each `parseFloat(card.querySelector(...).value)`
- `collectData()` lines 238–241: normalize before `parseInt`/`parseFloat` on recipe-level fields

Each `parseFloat(normalizeNumber(x))` replaces the raw `parseFloat(x)`. No event-level interception — the normalization lives only in the calculation path, keeping the DOM values untouched.

**Edge cases**: `null`/`undefined` → `String()` produces `"null"`/`"undefined"` → `parseFloat` returns `NaN` → `|| 0` fallback handles it. Empty string → `""` → `normalizeNumber` returns `""` → `parseFloat("")` returns `NaN` → `|| 0` handles it. Already-correct values (e.g., `"1.5"`) pass through unchanged.

---

## 2. History Fields (fixes B1 + M2)

**Files**: `app.js`
**Mechanism**: Extend `recipeEntry` in `saveRecipe()` to include `laborCost` and `operatingCost` from `collectData()`. Restore them in `loadRecipe()` with `?? 0` fallback.

**Integration**:
- `saveRecipe()` (line 338): add two fields to the `recipeEntry` object literal:
  ```js
  laborCost: data.laborCost ?? 0,
  operatingCost: data.operatingCost ?? 0,
  ```
- `loadRecipe()` (after line 439): restore the inputs:
  ```js
  document.getElementById('labor-cost').value = recipe.laborCost ?? 0;
  document.getElementById('operating-cost').value = recipe.operatingCost ?? 0;
  ```

**Edge cases**: Old history entries without these fields → `?? 0` returns `0`, matching current behavior. New saves persist both values.

---

## 3. SW Offline Page + Cache-Bust (fixes B2 + M3)

**Files**: `sw.js`
**Mechanism**: Bump `CACHE_NAME` from `reposteriacalc-v3` to `reposteriacalc-v4`. Replace the inline HTML catch block in the navigation handler with `caches.match('/offline.html')`.

**Integration**:
- Line 1: `reposteriacalc-v4` → triggers `skipWaiting()` + `clients.claim()` (already implemented at lines 24, 36)
- Lines 53–62: Replace inline HTML with:
  ```js
  .catch(() => caches.match('/offline.html'))
  ```

**Edge cases**: `offline.html` missing from cache (first install) → `caches.match` returns `undefined` → falls back gracefully (empty response). Users on v3 get the forced update on next navigation.

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| SW update delayed on mobile | `skipWaiting()` + `clients.claim()` already in place; cache name bump forces update |
| Old history entries without labor/operating | `?? 0` fallback preserves existing behavior |
| `normalizeNumber` on non-numeric inputs | `parseFloat` returns `NaN` → `\|\| 0` handles it |

## Files Changed Summary

| File | Change |
|------|--------|
| `app.js` | Add `normalizeNumber()` helper; apply before 8 `parseFloat` calls; extend `recipeEntry` with 2 fields; restore them in `loadRecipe()` |
| `sw.js` | Bump `CACHE_NAME` to v4; replace inline HTML with `caches.match('/offline.html')` |
