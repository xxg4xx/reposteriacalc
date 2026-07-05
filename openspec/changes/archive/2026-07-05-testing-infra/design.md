# Design: testing-infra

## Technical Approach

Extract 6 pure functions from `app.js` into `src/calculations.js` as ES module exports. `app.js` imports them via `<script type="module">`. Vitest runs unit tests against the extracted module and integration tests against a jsdom-rendered DOM. ESLint enforces code quality with flat config.

## Architecture Decisions

### Decision: ES module extraction strategy

**Choice**: Extract to `src/calculations.js` as ESM; change `<script src="app.js">` to `<script type="module" src="app.js">` in `index.html`; `app.js` uses `import` from `./src/calculations.js`.

**Alternatives considered**:
- Inline copy in `app.js` + export from `src/calculations.js` (duplication)
- IIFE wrapper (adds complexity, no real benefit)

**Rationale**: ES modules are natively supported in all modern browsers. The app already runs on `server.js` (CORS-safe). No bundler needed. Single source of truth, zero duplication.

### Decision: collectData() testability

**Choice**: Add `fromElement = document` parameter to `collectData()`.

**Alternatives considered**: Extract DOM reading into separate function (over-engineered for this scope).

**Rationale**: Minimal change — one default parameter. Tests pass a mock DOM element; production passes nothing (defaults to `document`). No API change for existing callers.

### Decision: Vitest environment

**Choice**: `jsdom` environment in `vitest.config.js` with `globals: true`.

**Alternatives considered**: `happy-dom` (less mature), `node` environment only (insufficient for DOM tests).

**Rationale**: jsdom is Vitest's recommended DOM environment, well-tested, matches proposal scope.

### Decision: ESLint config format

**Choice**: Flat config (`eslint.config.js`) with `@eslint/js` recommended rules, `env: { browser: true, es2022: true }`.

**Alternatives considered**: Legacy `.eslintrc` (deprecated in ESLint 9+).

**Rationale**: ESLint 9 defaults to flat config. Future-proof.

## Data Flow

```
index.html
  └─ <script type="module" src="app.js">
       └─ import { normalizeNumber, toBaseUnit, ... } from './src/calculations.js'

Tests:
  src/__tests__/calculations.test.js  →  import from src/calculations.js
  src/__tests__/integration.test.js   →  import from src/calculations.js + jsdom DOM
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/calculations.js` | Create | 6 pure functions + `UNIT_GROUPS`, `TO_BASE`, `CURRENCY` constants exported as ESM |
| `app.js` | Modify | Remove extracted function bodies, add `import { ... } from './src/calculations.js'` at top. Remove `UNIT_GROUPS`, `TO_BASE`, `CURRENCY` constant declarations (now imported). |
| `index.html` | Modify | Change `<script src="app.js">` → `<script type="module" src="app.js">` |
| `src/__tests__/calculations.test.js` | Create | Unit tests for all 6 functions |
| `src/__tests__/integration.test.js` | Create | `collectData()` with mock DOM, full calculation flow, history save/load |
| `vitest.config.js` | Create | `environment: 'jsdom'`, `globals: true` |
| `eslint.config.js` | Create | Flat config: recommended + browser env + ES2022 |
| `package.json` | Modify | Add scripts (`test`, `test:watch`, `lint`, `lint:fix`), devDependencies |

## Interfaces / Contracts

```js
// src/calculations.js — exports
export const UNIT_GROUPS = { weight: ['kg', 'g'], volume: ['L', 'ml'], count: ['Uni'] }
export const TO_BASE = { kg: 1000, g: 1, L: 1000, ml: 1, Uni: 1 }
export const CURRENCY = '$'

export function normalizeNumber(value)          // → number
export function toBaseUnit(value, unit)         // → number
export function isSameUnitGroup(unit1, unit2)   // → boolean
export function calculateIngredientCost(ingredient) // → { cost: number, warning: boolean }
export function formatCurrency(value)           // → string
export function escapeHtml(text)                // → string
```

```js
// app.js — collectData signature after refactor
function collectData(fromElement = document) {
  // reads from fromElement.querySelector instead of document.querySelector
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `normalizeNumber`, `toBaseUnit`, `isSameUnitGroup`, `calculateIngredientCost`, `formatCurrency`, `escapeHtml` | Pure function tests with edge cases: null, undefined, empty, zero, Infinity, NaN, comma→period, mixed units, HTML entities |
| Integration | `collectData()` with mock DOM, full calculation flow, history save/load cycle | jsdom: build DOM tree, call functions, assert output. Mock `localStorage` via `vi.stubGlobal` |

## Migration / Rollout

No data migration. Single atomic change — extract → import → add tests → add lint.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `<script type="module">` changes loading behavior (deferred by default) | Low | `DOMContentLoaded` listener in `app.js` handles this already |
| ES module requires HTTP server (no `file://`) | None | App already requires `server.js` for PWA/Service Worker |
| Extracted constants break existing `app.js` references | Low | Import them at top of `app.js` — same global names, just imported |

## Open Questions

- [ ] None — all decisions resolved in proposal
