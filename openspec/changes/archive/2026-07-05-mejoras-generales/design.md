# Design: Mejoras Generales

## Technical Approach

11 independent, low-risk fixes applied to a vanilla JS PWA. All changes are surgical — no architectural shifts, no new dependencies. Each fix targets a specific function or code path in `app.js`, `server.js`, or `styles.css`.

## Architecture Decisions

### Decision: Guard clause vs try/catch for Infinity/NaN

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `isFinite()` guard | Clean, no overhead, handles NaN/Infinity/-Infinity | **Chosen** |
| try/catch around toFixed | Slower, hides real errors | Rejected |

### Decision: Regex escapeHtml vs DOM-based escapeHtml

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Regex string replace | No DOM creation, faster, no orphan nodes | **Chosen** |
| DOM-based (current) | Creates/destroys DOM nodes per call | Rejected — memory leak |

### Decision: Dedup strategy in saveRecipe

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Remove dead code, always create new | Simple, no behavior change, user saves are intentional | **Chosen** |
| Match by recipe name + replace | Complex, may surprise user who wants versioning | Deferred |

### Decision: Dynamic IP detection vs localhost-only

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `os.networkInterfaces()` | Works on LAN, but may fail on some setups | **Chosen** — with localhost fallback |
| Hardcoded IP | Breaks on network changes | Rejected |

## Data Flow

```
init()
  ├─ detectEnvironment()
  ├─ loadData() ──→ safeStorageGet() ──→ JSON.parse()
  ├─ restoreData() / addIngredient()
  │     └─ addIngredient() calls calculateAll()
  └─ calculateAll() (single call at end)
        ├─ calculateIngredientCost() per card
        │     ├─ toBaseUnit() (with validation)
        │     └─ isSameUnitGroup() (M5 warning)
        ├─ formatCurrency() (with Infinity guard)
        └─ saveData() ──→ safeStorageSet()
```

## File Changes

| File | Action | Changes |
|------|--------|---------|
| `app.js` | Modify | 9 surgical edits (B4-B9, B11, M5, M6) |
| `server.js` | Modify | Path traversal guard, dynamic IP, 404 page, security headers |
| `styles.css` | Modify | Add `.unit-select-warning` class for M5 |
| `package.json` | Create | Project metadata + `npm start` script |

## Detailed Fixes

### B4 — formatCurrency Infinity guard

**File**: `app.js:78-80`
**Mechanism**: Add `isFinite(value)` check before `toFixed()`. Return `$0.00` for non-finite values.
**Edge cases**: `NaN`, `Infinity`, `-Infinity`, `undefined`, `null`.

```js
function formatCurrency(value) {
  if (!Number.isFinite(value)) return `${CURRENCY}0.00`;
  return `${CURRENCY}${value.toFixed(2)}`;
}
```

### B5 — Remove dead existingIndex in saveRecipe

**File**: `app.js:343`
**Mechanism**: Delete line 343 (`const existingIndex = ...`). The variable is never read. No dedup logic added — saving always creates a new entry.
**Edge cases**: None — pure dead code removal.

### B6 — Animation timing sync

**File**: `app.js:226`
**Mechanism**: Change `setTimeout(..., 250)` to `setTimeout(..., 300)` to match the CSS `animation: slideIn 0.3s ease` (line 344 of styles.css).
**Edge cases**: None — values are now synchronized.

### B7 — Regex escapeHtml

**File**: `app.js:148-152`
**Mechanism**: Replace DOM-based approach with string replace chain:
```js
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```
**Edge cases**: `null`, `undefined`, numbers — `String()` coercion handles all.

### B8 — safeStorageGet empty string fix

**File**: `app.js:37`
**Mechanism**: Replace `memoryStorage[key] || null` with `key in memoryStorage ? memoryStorage[key] : null`.
**Edge cases**: Empty string `""` now correctly returned instead of `null`.

### B9 — Remove redundant init() calls

**File**: `app.js:596-615`
**Mechanism**: Restructure init flow:
1. Remove `calculateAll()` at line 601 (inside `addIngredient` branch) — already called by `addIngredient()`.
2. Remove `calculateAll()` at line 606 — redundant with the one inside `restoreData()` → `addIngredient()` path, and with the one in `clearAllNoConfirm()`.
3. Keep single `calculateAll()` at line 606 ONLY for the case where `restoreData` loaded data (since `addIngredient` inside `restoreData` already calls it, this is still redundant — remove it too).
4. Remove duplicate `setTimeout(openHistoryModal, 500)` at line 612 — keep only the one at line 598.

**Final init() flow**:
```js
const saved = loadData();
if (action === 'history') {
  setTimeout(openHistoryModal, 500);
} else if (action === 'new' || !saved || !saved.ingredients || saved.ingredients.length === 0) {
  addIngredient(); // calls calculateAll() internally
} else {
  restoreData(saved); // calls addIngredient() → calculateAll() per ingredient
}
// Single final calculateAll() not needed — already called by addIngredient/restoreData
```

**Edge cases**: Verify that `restoreData` → `addIngredient` chain produces correct totals without the final `calculateAll()`.

### B10 — Path traversal + server improvements

**File**: `server.js:19-38`
**Mechanism**:
1. After `path.join(ROOT, req.url)`, resolve with `path.resolve()` and check `resolvedPath.startsWith(ROOT)`.
2. Replace hardcoded IP with `os.networkInterfaces()` detection (fallback to `localhost`).
3. Add proper HTML 404 page.
4. Add security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`.

```js
const os = require('os');
// ... inside handler:
const resolvedPath = path.resolve(filePath);
if (!resolvedPath.startsWith(ROOT)) {
  res.writeHead(403);
  res.end('Forbidden');
  return;
}
```

### B11 — Validate localStorage unit data

**Files**: `app.js:49-51`, `app.js:61-76`
**Mechanism**: In `toBaseUnit()`, check `unit in TO_BASE` before multiplying. Return `value` (no conversion) if unit is unknown. In `calculateIngredientCost()`, validate units exist before calling `toBaseUnit()`.

```js
function toBaseUnit(value, unit) {
  if (!(unit in TO_BASE)) return value; // fallback: no conversion
  return value * TO_BASE[unit];
}
```

**Edge cases**: `null`, `undefined`, empty string, corrupted JSON with missing unit fields.

### M5 — Unit group consistency warning

**Files**: `app.js` (new helper + modify `calculateIngredientCost`), `styles.css` (new class)
**Mechanism**:
1. Add `getUnitGroup(unit)` helper — returns `'weight'`, `'volume'`, `'count'`, or `null`.
2. In `calculateIngredientCost()`, after computing cost, check if `getUnitGroup(boughtUnit) !== getUnitGroup(usedUnit)`. Return a result object `{ cost, warning: boolean }` instead of plain number.
3. In `calculateAll()`, when reading card values, check the warning flag and toggle `.unit-select-warning` class on the card's unit selects.
4. Add CSS: `.unit-select-warning { border-color: var(--warning); }` with dark mode variant.

**Edge cases**: Same group (kg→g) should NOT warn. Different group (kg→ml) SHOULD warn. Unknown unit → no warning.

### M6 — Toast on localStorage failure

**File**: `app.js:267-274`, `app.js:276-285`
**Mechanism**: Replace `console.warn` with `showToast()` in `saveData()` catch block and `loadData()` catch block. Keep `console.warn` as secondary log.

### M7 — package.json

**File**: `package.json` (new)
**Content**:
```json
{
  "name": "reposteriacalc",
  "version": "1.1.0",
  "description": "Bakery cost calculator PWA",
  "main": "server.js",
  "scripts": { "start": "node server.js" },
  "private": true
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Manual | formatCurrency with Infinity, NaN, normal values | Browser console |
| Manual | saveRecipe creates new entry (no duplicate logic) | Save same recipe twice, verify 2 entries |
| Manual | Remove animation finishes before card disappears | Click remove, observe smooth exit |
| Manual | escapeHtml handles `<script>` tags | Type in ingredient name |
| Manual | safeStorageGet returns "" for empty string | localStorage full → memory fallback |
| Manual | init() does not spam calculateAll() | Add breakpoint, count calls |
| Manual | server.js rejects `../../../etc/passwd` | curl with crafted URL |
| Manual | Corrupt localStorage with bad unit doesn't crash | Edit localStorage directly |
| Manual | Unit mismatch shows orange border | Select kg + ml |
| Manual | localStorage failure shows toast | Disable localStorage in devtools |

## Migration / Rollout

No migration required. All changes are backward-compatible. localStorage schema is unchanged. No new dependencies.

## Open Questions

None — all decisions are resolved.
