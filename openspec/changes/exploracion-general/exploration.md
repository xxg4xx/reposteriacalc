# Exploration: Auditoría General de Bugs y Mejoras

## Current State

ReposteriaCalc es una PWA funcional de calculadora de costos de repostería. Stack 100% vanilla: JS (ES6) en un solo archivo de 608 líneas, CSS3 con custom properties (1073 líneas), HTML5 semántico, Service Worker básico, y servidor Node.js estático de desarrollo. Sin tests, sin bundlers, sin typechecker, sin package.json.

La app resuelve un problema real — calcular costo de recetas con conversión de unidades — pero arrastra **11 bugs confirmados** (3 críticos, 4 medios, 4 bajos) y **7 oportunidades de mejora de alto impacto**, producto de haber crecido sin auditoría externa.

---

## Affected Areas

| Archivo | Líneas | Rol | Hallazgos |
|---------|--------|-----|-----------|
| `app.js` | 608 | Toda la lógica de negocio | 8 bugs, 4 mejoras |
| `sw.js` | 83 | Service Worker | 2 bugs, 2 mejoras |
| `server.js` | 38 | Servidor dev | 1 bug de seguridad |
| `index.html` | 222 | Shell de la app | 1 bug de validación |
| `styles.css` | 1073 | Todos los estilos | Sin bugs funcionales |
| `manifest.json` | 86 | PWA manifest | 1 mejora (screenshots) |
| `offline.html` | 47 | Página offline | 1 bug (nunca se usa) |

---

## Findings

### 🔴 BUGS (concretos, con ubicación exacta)

#### B1 [CRÍTICO] — `laborCost` y `operatingCost` no se persisten en el historial

**Ubicación**: `app.js` líneas 338-347 (`saveRecipe`)

**Problema**: Al guardar una receta en el historial, `saveRecipe()` construye `recipeEntry` con solo estos campos:
```js
const recipeEntry = {
  id: Date.now().toString(),
  name: recipeName,
  piecesCount: data.piecesCount,
  profitMargin: data.profitMargin,
  ingredients: data.ingredients,
  nextId: data.nextId,
  createdAt: now,
  updatedAt: now
};
```
**NO incluye** `laborCost` ni `operatingCost`. Al cargar una receta guardada desde el historial (`loadRecipe`, línea 429), estos valores se pierden y quedan en 0.

**Impacto**: Un usuario que guarda una receta con $15 de mano de obra y $5 de costos operativos, al recargarla desde el historial encuentra esos campos en $0. El cálculo de precio final es incorrecto.

**Evidencia**: Verificado con script — las propiedades no existen en el objeto guardado.

---

#### B2 [CRÍTICO] — El SW cachea `offline.html` pero nunca lo sirve

**Ubicación**: `sw.js` línea 6 (en `STATIC_ASSETS`) vs líneas 40-64 (fetch handler)

**Problema**: `offline.html` se cachea durante el `install` pero el fetch handler para navegaciones (líneas 43-64) nunca lo usa. En su lugar, si falla `caches.match('/index.html')` y `caches.match('/')`, el catch final devuelve un HTML inline feo (líneas 57-61):
```js
return new Response(
  '<html><body style="font-family:system-ui;..."><h1 ...>Sin conexion</h1>...',
  { headers: { 'Content-Type': 'text/html' } }
);
```

**Impacto**: `offline.html` (con diseño consistente y emoji 🧁) es código muerto. El usuario ve un HTML feo sin estilos en lugar de la página offline diseñada.

---

#### B3 [CRÍTICO] — `parseFloat` no maneja coma decimal (locale es_AR / es_ES)

**Ubicación**: `app.js` líneas 54-56, 82-86, 101-103 (`calculateIngredientCost`, `calculateAll`)

**Problema**: En los países hispanohablantes, el separador decimal es la coma (`,`), no el punto (`.`). `parseFloat("1,5")` devuelve `1` (trunca la parte decimal). Un usuario que escribe `1,5` kg de harina a `10,00` está poniendo `parseFloat("10,00")` = `10`, y `"1,5"` = `1`. El cálculo pierde toda la fracción.

**Evidencia**:
```
parseFloat("1,5") → 1      (pierde .5)
parseFloat("10,00") → 10   (correcto por casualidad)
```

**Impacto**: **ALTO** — Todos los usuarios hispanohablantes que usan coma decimal obtendrán resultados sistemáticamente incorrectos sin ninguna advertencia.

---

#### B4 [ALTO] — `formatCurrency` no sanitiza Infinity/NaN

**Ubicación**: `app.js` líneas 70-72 (`formatCurrency`)

**Problema**: Si algún valor llega como `Infinity` o `NaN` a `formatCurrency()`, `toFixed(2)` no falla pero produce:
- `Infinity.toFixed(2)` → `"Infinity"` → muestra `$Infinity.00`
- `NaN.toFixed(2)` → `"NaN"` → muestra `$NaN.00`

Esto puede ocurrir si el usuario:
- Escribe `Infinity` en un campo numérico (ej: precio)
- Carga datos corruptos de localStorage con unidades inválidas
- Divide por cero indirectamente (unidad desconocida → `TO_BASE[unit]` = `undefined` → `boughtQty * undefined` = `NaN`)

**Impacto**: La UI muestra strings como `$Infinity.00` sin que el usuario entienda qué pasó.

---

#### B5 [ALTO] — ID matching en `saveRecipe()` es código muerto, siempre duplica entradas

**Ubicación**: `app.js` línea 335

**Problema**: La función intenta encontrar una receta existente para actualizarla:
```js
const existingIndex = history.findIndex(r => r.id === data.recipeName + '_' + (data.savedAt || ''));
```
Pero los IDs de receta son `Date.now().toString()` (timestamp), no `"nombre_fecha"`. Esta condición NUNCA matchea. Peor aún, `existingIndex` se calcula pero **nunca se usa** — la función siempre hace `history.unshift(recipeEntry)` creando un nuevo entry.

**Impacto**: Cada vez que se clickea "Guardar Receta" se crea una entrada duplicada en el historial. El usuario acumula duplicados sin saberlo. Además `data.savedAt` no existe en `collectData()` (línea 236), siempre es `undefined`.

---

#### B6 [MEDIO] — Animación de eliminar ingrediente: timeout vs transición desincronizados

**Ubicación**: `app.js` líneas 211-218

**Problema**: 
```js
card.style.transition = 'all 0.3s ease';   // 300ms
card.style.opacity = '0';
card.style.transform = 'translateX(20px)';
setTimeout(() => {
  card.remove();           // ← ocurre a los 250ms
  calculateAll();
}, 250);                   // ← 250ms ≠ 300ms
```

La transición CSS es de 300ms pero el timeout es 250ms. El elemento se elimina cuando la animación está al ~83% de completarse, causando un "jump" visual donde la card desaparece abruptamente antes de terminar la transición.

**Impacto**: Pequeño glitch visual en cada eliminación de ingrediente.

---

#### B7 [MEDIO] — `escapeHtml()` crea nodos DOM huérfanos (memory leak leve)

**Ubicación**: `app.js` líneas 140-144

**Problema**: Cada llamado crea un `document.createElement('div')` que nunca se anexa al DOM ni se limpia:
```js
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```
Se llama en cada render de card y cada render de historial. Los nodos quedan en memoria como huérfanos hasta que el GC los recolecte (o no, si hay referencias circulares).

**Impacto**: En uso prolongado con muchas recetas, la memoria del heap del DOM crece innecesariamente.

---

#### B8 [MEDIO] — `safeStorageGet` devuelve `null` para strings vacías en fallback

**Ubicación**: `app.js` línea 37

**Problema**: 
```js
function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return memoryStorage[key] || null;   // ← '' → null
  }
}
```
Si `memoryStorage[key]` es `""` (string vacío), `"" || null` devuelve `null` por el short-circuit de `||`.

**Impacto**: En el raro caso de que localStorage esté lleno y se use memoryStorage como fallback, un valor guardado como string vacío se recupera como `null`, cambiando semántica.

---

#### B9 [BAJO] — `init()` llama `calculateAll()` 2-3 veces redundantes

**Ubicación**: `app.js` líneas 585-603

**Problema**: Flujo de init:
1. `addIngredient()` (línea 588) → ya llama `calculateAll()` internamente (línea 232)
2. Luego `calculateAll()` explícito (línea 589)
3. Luego OTRO `calculateAll()` (línea 594)
4. Para `action === 'new'` además: `clearAllNoConfirm()` → `addIngredient()` → `calculateAll()` (líneas 601-602)

Para `action === 'history'`: `setTimeout(openHistoryModal, 500)` aparece DOS veces (líneas 586 y 599-600), abriendo el modal duplicado (aunque idempotente).

**Impacto**: Ineficiencia en carga inicial, destello extra de UI.

---

#### B10 [BAJO] — `server.js` tiene path traversal y expone en `0.0.0.0`

**Ubicación**: `server.js` líneas 20, 35

**Problema**: 
```js
let filePath = path.join(ROOT, req.url === '/' ? 'index.html' : req.url);
```
`req.url` puede contener `../../../etc/passwd` (path traversal). Con `path.join`, resolviendo desde la raíz del proyecto se puede escalar fuera del directorio.

Además el servidor escucha en `0.0.0.0` (todas las interfaces de red), accesible desde cualquier dispositivo en la LAN, y el mensaje muestra una IP hardcodeada (`192.168.3.200`).

**Impacto**: Riesgo de seguridad bajo para dev server. IP hardcodeada confunde al usuario si su red es diferente.

---

#### B11 [BAJO] — Sin validación contra datos corruptos de localStorage

**Ubicación**: `app.js` líneas 53-68, 268-277

**Problema**: Si localStorage se corrompe (edición manual, versión anterior, cuota excedida), `loadData()` hace `JSON.parse(raw)` que puede devolver cualquier estructura. No hay schema validation. Un ingrediente con unidad desconocida (ej: `"oz"` que no está en `TO_BASE`) produce `NaN` en el cálculo y cascada a `Infinity`.

**Impacto**: Datos corruptos → cálculos rotos sin feedback al usuario.

---

### 🟢 MEJORAS (priorizadas por impacto)

#### M1 [ALTO] — Normalizar input numérico para aceptar coma decimal

**Contexto**: App en español, usuarios hispanohablantes usan coma como separador decimal.

**Propuesta**: Antes de `parseFloat`, reemplazar coma por punto:
```js
function parseDecimal(value) {
  if (typeof value === 'string') value = value.replace(',', '.');
  const n = parseFloat(value);
  return isNaN(n) || !isFinite(n) ? 0 : n;
}
```
Aplicar en todos los campos numéricos (precio, cantidades, margen, costos).

**Impacto**: Corrige el B3 y previene el B4.

---

#### M2 [ALTO] — Agregar campos `laborCost` y `operatingCost` al historial

**Contexto**: B1 — datos perdidos al guardar.

**Propuesta**: Incluir en `recipeEntry` y restaurar en `loadRecipe()`.

---

#### M3 [ALTO] — Cache-busting para SW y assets

**Contexto**: No hay forma de que los usuarios obtengan la última versión sin cerrar todas las pestañas.

**Propuesta**: Implementar versión semántica con `SKIP_WAITING` message, o al menos un `version` en el SW que fuerce actualización.

---

#### M4 [MEDIO] — Usar `offline.html` en el SW en lugar del HTML inline

**Contexto**: B2 — código muerto.

**Propuesta**: Modificar el fetch handler de navegaciones para servir `offline.html` desde cache cuando falla la red.

---

#### M5 [MEDIO] — Validación de consistencia entre unidades

**Contexto**: El usuario puede comprar en kg y usar en ml (peso vs volumen) sin advertencia.

**Propuesta**: Agrupar unidades por tipo (weight: kg/g, volume: L/ml, count: Uni) y mostrar advertencia visual si boughtUnit y usedUnit son de grupos diferentes.

---

#### M6 [BAJO] — Feedback visual cuando localStorage falla

**Contexto**: `saveData()` silencia errores de cuota excedida (línea 264: solo `console.warn`).

**Propuesta**: Mostrar toast al usuario cuando no se puede guardar.

---

#### M7 [BAJO] — Agregar `package.json` y scripts

**Contexto**: No hay metadata de proyecto, no hay `npm start`, no hay `engines`.

**Propuesta**: Crear `package.json` mínimo con `"start": "node server.js"`.

---

## Recommendation

**Prioridad 0 — Bugs que afectan directamente la precisión de los cálculos:**
1. B3 + M1 (coma decimal) — **corrige errores de cálculo para TODOS los usuarios hispanohablantes**
2. B1 + M2 (labor/operating cost en historial) — **datos que se pierden al guardar**

**Prioridad 1 — Bugs de UX que confunden al usuario:**
3. B5 (duplicados en historial)
4. B4 (Infinity/NaN en UI)
5. B2 (offline.html muerto)

**Prioridad 2 — Mejoras de robustez:**
6. B6 (timing de animación)
7. B7 (escapeHtml memory leak)
8. M5 (validación de unidades)
9. M6 (feedback de storage)

**Prioridad 3 — Mantenibilidad:**
10. B9 (init redundante)
11. B10 (server security)
12. M3 (cache-busting)
13. M7 (package.json)

---

## Risks

- **R1**: Corregir B3 (coma decimal) requiere cambiar TODOS los `parseFloat` de `app.js` — riesgo de regression si se omite algún campo.
- **R2**: Agregar campos al historial (B1) requiere migración de datos existentes o aceptar que recetas viejas tengan `laborCost`/`operatingCost` en `undefined`.
- **R3**: Cambios en el SW (M3, M4) requieren probar en todos los navegadores objetivo (Chrome, Safari, WebView). Un SW mal escrito puede dejar a usuarios atrapados en una versión anterior.
- **R4**: No hay tests automatizados — cualquier cambio debe verificarse manualmente.

---

## Ready for Proposal

**Sí**, el análisis es suficientemente completo para proponer cambios. 

Recomiendo dividir en al menos 2 propuestas:
1. **Propuesta A**: Corrección de bugs críticos (B1, B3, B5) + M1 + M2
2. **Propuesta B**: Mejoras de UX y robustez (B2, B4, B6, B7, B9, M3, M4, M5, M6, M7)

La Propuesta A tiene más urgencia porque afecta la corrección de los cálculos que el usuario obtiene.
