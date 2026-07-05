# Proposal: testing-infra

## Intent

Add test infrastructure (Vitest) and linting (ESLint) to ReposteriaCalc to prevent regression, ensure code quality, and enable confident refactoring. Currently zero tests exist — all validation is manual browser testing.

## Scope

### In Scope
1. Install and configure **Vitest** (test runner + jsdom for DOM-dependent tests)
2. Install and configure **ESLint** (recommended + minimal stylistic rules)
3. Extract pure functions from `app.js` into `src/calculations.js`:
   `normalizeNumber()`, `calculateIngredientCost()`, `toBaseUnit()`, `formatCurrency()`, `isSameUnitGroup()`, `escapeHtml()`
4. **Unit tests** covering: null, undefined, empty strings, zero, negative, Infinity, comma→period conversion, mixed units, HTML special chars
5. **Integration tests**: full calculation flow (jsdom DOM mock), history save/load cycle (localStorage mock)
6. `npm run test` and `npm run lint` scripts in `package.json`
7. `eslint.config.js` (flat config) + `vitest.config.js`

### Out of Scope
- CI pipeline (GitHub Actions), coverage thresholds, E2E/browser tests
- Refactoring `app.js` beyond extracting pure functions
- Changes to existing app functionality

## Capabilities

None — this is developer infrastructure only. No new product capabilities.

## Approach

1. `npm install -D vitest eslint` (package.json already exists)
2. Create `src/calculations.js` — extract pure functions, import `TO_BASE`, `UNIT_GROUPS`, `CURRENCY` constants
3. `app.js` imports from `./src/calculations.js` instead of defining them globally
4. Create `vitest.config.js` with `jsdom` environment
5. Write unit tests `src/__tests__/calculations.test.js`
6. Write integration tests `src/__tests__/integration.test.js`
7. Create `eslint.config.js` (flat config, recommended + env: browser/es2022)
8. Update `package.json` scripts

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app.js` | Modified | Remove extracted functions, add import |
| `src/calculations.js` | **New** | Pure functions + constants |
| `src/__tests__/calculations.test.js` | **New** | Unit tests |
| `src/__tests__/integration.test.js` | **New** | Integration tests |
| `vitest.config.js` | **New** | Vitest config (jsdom) |
| `eslint.config.js` | **New** | ESLint flat config |
| `package.json` | Modified | Scripts + devDependencies |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Extraction breaks global refs in `app.js` | Low | Extract → import → verify all call sites in original file |
| jsdom environment mismatch with real browser | Low | Keep integration tests minimal; manual sanity check after |
| ESLint flags existing code patterns | Low | Use recommended + minimal; fix or add inline disables |

## Rollback Plan

```bash
git checkout -- app.js package.json     # restore originals
rm -rf src/ vitest.config.js eslint.config.js
npm install                              # restore clean node_modules
```

## Dependencies

- `vitest` ^3.x, `jsdom` (Vitest peer), `eslint` ^9.x

## Success Criteria

- [ ] `npm test` passes (unit + integration tests green)
- [ ] `npm run lint` passes with zero errors
- [ ] `src/calculations.js` exports all 6 functions with same signatures
- [ ] App loads and runs correctly in browser (manual sanity check)
