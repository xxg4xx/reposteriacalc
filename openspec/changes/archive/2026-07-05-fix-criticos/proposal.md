# Proposal: Fix Critical Bugs in Cost Calculator and Offline Experience

## Intent

Fix three critical bugs affecting all users: (1) `laborCost` and `operatingCost` are lost when saving to history, making re-loaded recipes always show $0 for labor/overhead; (2) Hispanic users typing decimal commas (e.g., `1,5`) silently lose the fractional part due to raw `parseFloat`; (3) offline navigation falls back to an unstyled inline HTML blob instead of the designed `offline.html` page.

## Scope

### In Scope
- **B1**: Persist `laborCost`/`operatingCost` in the history `recipeEntry` object and on load from history (fallback to `0` for old recipes — no migration)
- **B3**: Automatic comma-to-period normalization on all numeric inputs before `parseFloat` (price, boughtQty, usedQty, profitMargin, laborCost, operatingCost, piecesCount)
- **B2**: Serve `offline.html` in SW navigation fallback instead of inline HTML; bump cache name for forced update
- **M1–M3**: Companion improvements tied to each bug (normalization fn, history fields, cache-busting)

### Out of Scope
- Medium/low priority bugs (other B-items from exploration)
- Migrating old history entries (new saves only)
- Adding tests, linting, or build tooling
- Any UI/UX changes beyond the offline page (which already exists)

## Capabilities

### New Capabilities
- None (pure bugfix — no new spec-level behavior)

### Modified Capabilities
- None (behavior changes are internal/corrective, no public-facing requirements change)

## Approach

1. **Input normalization**: Add a `normalizeNumberInput(value)` helper that replaces `,` with `.`, then use it before every `parseFloat` call in `app.js`
2. **History persistence**: Extend `recipeEntry` in `saveRecipe()` to include `laborCost` and `operatingCost` from `collectData()`. In `loadRecipe()`, read them with `?? 0` fallback
3. **SW offline fix**: Change `CACHE_NAME` from `reposteriacalc-v3` to `reposteriacalc-v4`. Replace the inline HTML catch block with `caches.match('/offline.html')`
4. **SW forced update**: The cache name bump + `skipWaiting()` + `clients.claim()` already triggers update on next navigation

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app.js` | Modified | Add normalization fn, apply before parseFloat; add laborCost/operatingCost to recipeEntry; read them on load |
| `sw.js` | Modified | Bump CACHE_NAME to v4; serve offline.html on navigation fallback |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| SW update delayed on mobile (some browsers defer until next visit/close) | Medium | `skipWaiting()` + `clients.claim()` already called; controlled via cache name bump |
| Old history entries lose laborCost/operatingCost on load | Low | `?? 0` fallback ensures they show 0 instead of NaN — user decision not to migrate |

## Rollback Plan

1. **Revert SW**: Change `CACHE_NAME` back to `reposteriacalc-v3`; users on v3 cache unaffected, v4 visitors fall back to v3
2. **Revert app.js**: Remove normalization helper and restore `parseFloat` calls; remove history fields (old entries without them still load correctly)
3. Re-deploy and verify

## Dependency

- None (vanilla JS, no packages)

## Success Criteria

- [ ] Comma decimal input resolved: typing `1,5` in price, boughtQty, or usedQty yields 1.5 in calculations
- [ ] History persistence: saving a recipe with non-zero laborCost/operatingCost preserves those values on reload
- [ ] Offline page: navigating to the app offline shows the designed `offline.html` with cupcake icon and styled retry button
- [ ] SW updated: `caches.keys()` shows `reposteriacalc-v4` and old caches are cleaned up
