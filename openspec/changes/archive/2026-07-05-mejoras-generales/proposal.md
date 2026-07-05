# Proposal: Mejoras Generales — Remaining Bugs and Improvements

## Intent

Resolver los 8 bugs restantes (B4–B11) y 3 mejoras (M5–M7) de la auditoría general, después del batch crítico `fix-criticos` (B1–B3, M1–M4). Eliminar bugs visuales, memory leaks, código muerto, datos corruptos, path traversal, y falta de metadata de proyecto.

## Scope

### In Scope
- B4: Sanitizar Infinity/NaN en `formatCurrency`
- B5: Eliminar código muerto (`existingIndex`) y fix duplicados en `saveRecipe`
- B6: Sincronizar timeout animación (250ms → 300ms) con transición CSS
- B7: Refactorizar `escapeHtml` sin crear nodos DOM huérfanos
- B8: Fix `safeStorageGet` devolviendo `null` para strings vacías
- B9: Eliminar `calculateAll()` redundantes y doble `setTimeout` en `init()`
- B10: Fix path traversal + IP hardcodeada en `server.js`
- B11: Validar datos corruptos de localStorage (unidades inválidas en `TO_BASE`)
- M5: Advertencia visual al combinar unidades de tipo distinto (peso vs volumen)
- M6: Toast de error cuando localStorage falla
- M7: Crear `package.json` con metadatos y `start` script

### Out of Scope
- Tests (no hay infraestructura)
- Cambios arquitectónicos (sigue siendo vanilla JS)
- Bundlers o build tooling
- Cache-busting del SW (M3 — cubierto en `fix-criticos`)

## Capabilities

### New Capabilities
- `data-validation`: schema checking de localStorage y validación de unidades en `TO_BASE`
- `unit-consistency`: advertencia visual al combinar tipos de unidad incompatibles
- `storage-feedback`: notificación al usuario cuando localStorage falla

### Modified Capabilities
- None (pure bugfixes and UX polish at implementation level)

## Approach

| Tipo | Cambio | Archivos |
|------|--------|----------|
| Sanitización | `formatCurrency` guard contra Infinity/NaN | app.js |
| Fix animación | timeout 250→300ms, sync con CSS transition | app.js |
| Cleanup | `existingIndex` muerto, init redundante, escapeHtml sin DOM | app.js |
| Robustez | `safeStorageGet` `\|\|` → `??`, validar `TO_BASE` keys | app.js |
| Seguridad | `path.resolve` + `startsWith(ROOT)` en server.js | server.js |
| UX | toast en `saveData` catch, unit-group warning | app.js, styles.css |
| Proyecto | `package.json` con name, version, start | package.json |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app.js` | Modified | 10 cambios puntuales: formatCurrency, safeStorageGet, escapeHtml, saveRecipe, init, remove animation, unit validation |
| `server.js` | Modified | Path traversal fix + IP dinámica |
| `styles.css` | Modified | Estilos para unit-group warning |
| `package.json` | New | Metadatos del proyecto y script start |

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Regression en cálculos por cambios en `app.js` | Low | Verify manual contra recetas guardadas conocidas |
| Toast duplicado en flujo M6 | Low | Single `showToast`, evitar spam en `input` events |
| `server.js` no arranca | Low | Verificar con `node server.js` + `curl localhost:8080` |

## Rollback Plan

Revertir el commit completo del batch. Cada fix es independiente pero el batch es pequeño y atómico — si alguna corrección rompe un flujo crítico (cálculos, guardado), revertir completo y re-aplicar excluyendo ese fix.

## Dependencies

None.

## Success Criteria

- [ ] `formatCurrency` muestra `$0.00` para Infinity/NaN en lugar de `$Infinity.00`/`$NaN.00`
- [ ] `saveRecipe` no duplica entradas en historial; `existingIndex` se usa o se elimina
- [ ] Animación de eliminar ingrediente sin "jump" visual (timeout = transition)
- [ ] `escapeHtml` no crea nodos DOM huérfanos (usa replace/regex)
- [ ] `safeStorageGet` devuelve `""` para strings vacías en memoryStorage
- [ ] `init()` llama `calculateAll()` una sola vez por flujo; modal de historial no se abre dos veces
- [ ] `server.js` rechaza path traversal (`../../../etc/passwd`), muestra IP dinámica en log
- [ ] Datos corruptos con unidades inválidas no producen Infinity en los cálculos
- [ ] Unidades incompatibles (kg + ml) muestran advertencia visual
- [ ] Falla de localStorage muestra un toast al usuario
- [ ] `npm start` ejecuta `server.js` correctamente
