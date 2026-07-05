# Tasks: Testing Infrastructure — Vitest + ESLint

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350–400 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Testing infrastructure + ESM extraction + all tests | PR 1 | Single PR — all developer infra |

## Phase 1: Foundation — Dependencies + Module + Configs

- [x] 1.1 Install `vitest` and `jsdom` as devDependencies (`npm install -D vitest jsdom`)
- [x] 1.2 Create `src/calculations.js` with extracted ESM exports: `normalizeNumber`, `toBaseUnit`, `isSameUnitGroup`, `calculateIngredientCost`, `formatCurrency`, `escapeHtml` + constants `UNIT_GROUPS`, `TO_BASE`, `CURRENCY`
- [x] 1.3 Create `vitest.config.js` with `environment: 'jsdom'` and `globals: true`

## Phase 2: Refactor app.js + index.html for ESM

- [x] 2.1 Add import statements at top of `app.js` for all 6 functions + 3 constants from `./src/calculations.js`
- [x] 2.2 Remove the 6 extracted function bodies and the 3 constant declarations from `app.js`
- [x] 2.3 Add optional `fromElement = document` parameter to `collectData()` signature, replace `document.querySelector` with `fromElement.querySelector`
- [x] 2.4 Update `index.html`: change `<script src="app.js">` to `<script type="module" src="app.js">`

## Phase 3: Write Tests

- [x] 3.1 Create `src/__tests__/calculations.test.js` with unit tests for all 6 functions covering: null, undefined, empty, zero, negative, Infinity, NaN, comma→period, mixed units, HTML entities
- [x] 3.2 Create `src/__tests__/integration.test.js` with: `collectData()` using mock DOM element, full calculation flow via jsdom, history save/load cycle with localStorage mock via `vi.stubGlobal`
- [x] 3.3 Verify `npx vitest run` passes (all unit + integration tests green)

## Phase 4: ESLint + Package Scripts

- [x] 4.1 Install `eslint` as devDependency (`npm install -D eslint`)
- [x] 4.2 Create `eslint.config.mjs` (flat config, `@eslint/js` recommended, env: browser + es2022, no semicolons, 2-space indent)
- [x] 4.3 Add scripts to `package.json`: `test`, `test:watch`, `lint`, `lint:fix`
- [x] 4.4 Verify `npm run lint` passes with zero errors
