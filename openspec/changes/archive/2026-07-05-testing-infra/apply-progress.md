# Apply Progress: testing-infra

**Date**: 2026-07-05
**Status**: 14/14 tasks complete — Ready for verify

## Phase 1: Foundation — Dependencies + Module + Configs

- [x] 1.1 Install `vitest` and `jsdom` as devDependencies
- [x] 1.2 Create `src/calculations.js` with extracted ESM exports
- [x] 1.3 Create `vitest.config.js` with `environment: 'jsdom'`

## Phase 2: Refactor app.js + index.html for ESM

- [x] 2.1 Add import statements at top of `app.js`
- [x] 2.2 Remove extracted function bodies and constant declarations from `app.js`
- [x] 2.3 Add `fromElement = document` parameter to `collectData()`
- [x] 2.4 Update `index.html` to `<script type="module" src="app.js">`

## Phase 3: Write Tests

- [x] 3.1 Create `src/__tests__/calculations.test.js` (33 unit tests)
- [x] 3.2 Create `src/__tests__/integration.test.js` (1 integration test)
- [x] 3.3 Verify `npm test` passes (34 tests green)

## Phase 4: ESLint + Package Scripts

- [x] 4.1 Install `eslint` + `@eslint/js` as devDependencies
- [x] 4.2 Create `eslint.config.mjs` (flat config with file-specific environments)
- [x] 4.3 Add scripts to `package.json`: `test`, `test:watch`, `lint`, `lint:fix`
- [x] 4.4 Verify `npm run lint` passes (0 errors, warnings only)

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `src/calculations.js` | Created | 6 pure functions + 3 constants exported as ESM |
| `src/__tests__/calculations.test.js` | Created | 33 unit tests |
| `src/__tests__/integration.test.js` | Created | jsdom-based collectData integration test |
| `app.js` | Modified | Import from ESM, removed extracted functions, refactored collectData |
| `index.html` | Modified | Changed to `<script type="module">` |
| `vitest.config.js` | Created | Vitest config with jsdom environment |
| `eslint.config.mjs` | Created | Flat config with per-file environments |
| `package.json` | Modified | Added test/lint scripts, devDependencies |
| `package-lock.json` | Modified | Updated by npm install |

## Deviations from Design

- ESLint config uses `.mjs` extension (not `.js`) because `package.json` lacks `"type": "module"` (server.js is CommonJS)
- ESLint config uses `files` pattern for per-environment globals instead of single global set
- `globals: true` omitted from vitest.config.js (not needed with explicit test imports)
- `formatCurrency` implementation updated to handle negatives with sign before currency symbol (`-$5.00` not `$-5.00`)
- Integration test uses `<input>` elements for DOM fields (not `<div>`) to match real app structure

## Test Results

```
✓ src/__tests__/calculations.test.js (33 tests)
✓ src/__tests__/integration.test.js   (1 test)

Test Files  2 passed (2)
     Tests  34 passed (34)
```

## Lint Results

```
0 errors, 7 warnings
```

Warnings are for unused imports in `app.js` (toBaseUnit, isSameUnitGroup, UNIT_GROUPS, TO_BASE) and unused catch params — all acceptable.
