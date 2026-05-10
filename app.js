const STORAGE_KEY = 'reposteriacalc_data';
const HISTORY_KEY = 'reposteriacalc_history';
const CURRENCY = '$';

const UNIT_GROUPS = {
  weight: ['kg', 'g'],
  volume: ['L', 'ml'],
  count: ['Uni']
};

const TO_BASE = {
  kg: 1000,
  g: 1,
  L: 1000,
  ml: 1,
  Uni: 1
};

let ingredientIdCounter = 0;
let deferredPrompt = null;
let isWebView = false;
let memoryStorage = {};

function detectEnvironment() {
  const ua = navigator.userAgent || '';
  isWebView = /wv/.test(ua) ||
              (/Android/.test(ua) && !/Chrome/.test(ua)) ||
              window.location.protocol === 'file:' ||
              (window.Android !== undefined);
  console.log('Environment:', isWebView ? 'WebView (APK)' : 'Browser');
}

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return memoryStorage[key] || null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    memoryStorage[key] = value;
  }
}

function toBaseUnit(value, unit) {
  return value * TO_BASE[unit];
}

function calculateIngredientCost(ingredient) {
  const price = parseFloat(ingredient.price) || 0;
  const boughtQty = parseFloat(ingredient.boughtQty) || 0;
  const usedQty = parseFloat(ingredient.usedQty) || 0;
  const boughtUnit = ingredient.boughtUnit;
  const usedUnit = ingredient.usedUnit;

  if (price <= 0 || boughtQty <= 0 || usedQty <= 0) return 0;
  if (boughtUnit === usedUnit) {
    return (price / boughtQty) * usedQty;
  }

  const boughtBase = toBaseUnit(boughtQty, boughtUnit);
  const usedBase = toBaseUnit(usedQty, usedUnit);
  return (price / boughtBase) * usedBase;
}

function formatCurrency(value) {
  return `${CURRENCY}${value.toFixed(2)}`;
}

function calculateAll() {
  const cards = document.querySelectorAll('.ingredient-card');
  let totalCost = 0;
  const breakdown = [];

  cards.forEach(card => {
    const id = card.dataset.id;
    const name = card.querySelector(`[data-field="name"][data-id="${id}"]`).value || 'Sin nombre';
    const price = parseFloat(card.querySelector(`[data-field="price"][data-id="${id}"]`).value) || 0;
    const boughtQty = parseFloat(card.querySelector(`[data-field="boughtQty"][data-id="${id}"]`).value) || 0;
    const boughtUnit = card.querySelector(`[data-field="boughtUnit"][data-id="${id}"]`).value;
    const usedQty = parseFloat(card.querySelector(`[data-field="usedQty"][data-id="${id}"]`).value) || 0;
    const usedUnit = card.querySelector(`[data-field="usedUnit"][data-id="${id}"]`).value;

    const cost = calculateIngredientCost({ price, boughtQty, boughtUnit, usedQty, usedUnit });
    totalCost += cost;

    const costEl = card.querySelector('.ingredient-cost-value');
    if (costEl) costEl.textContent = formatCurrency(cost);

    if (boughtQty > 0 && usedQty > 0) {
      breakdown.push({ name, cost });
    }
  });

  const recipeName = document.getElementById('recipe-name').value || 'Sin nombre';
  const piecesCount = parseInt(document.getElementById('pieces-count').value) || 1;
  const profitMargin = parseFloat(document.getElementById('profit-margin').value) || 0;
  const laborCost = parseFloat(document.getElementById('labor-cost').value) || 0;
  const operatingCost = parseFloat(document.getElementById('operating-cost').value) || 0;

  const grandTotalCost = totalCost + laborCost + operatingCost;
  const unitCost = piecesCount > 0 ? grandTotalCost / piecesCount : 0;
  const salePrice = unitCost * (1 + profitMargin / 100);
  const profitPerUnit = salePrice - unitCost;

  document.getElementById('summary-recipe-name').textContent = recipeName;
  document.getElementById('summary-pieces').textContent = `${piecesCount} pieza${piecesCount !== 1 ? 's' : ''}`;
  document.getElementById('summary-margin').textContent = `${profitMargin}% margen`;
  document.getElementById('total-cost').textContent = formatCurrency(totalCost);
  document.getElementById('labor-cost-display').textContent = formatCurrency(laborCost);
  document.getElementById('operating-cost-display').textContent = formatCurrency(operatingCost);
  document.getElementById('unit-cost').textContent = formatCurrency(unitCost);
  document.getElementById('sale-price').textContent = formatCurrency(salePrice);
  document.getElementById('profit-per-unit').textContent = formatCurrency(profitPerUnit);

  const breakdownEl = document.getElementById('cost-breakdown');
  const breakdownList = document.getElementById('breakdown-list');

  if (breakdown.length > 0) {
    breakdownEl.classList.remove('hidden');
    breakdownList.innerHTML = breakdown
      .map(item => `
        <div class="breakdown-item">
          <span class="name">${escapeHtml(item.name)}</span>
          <span class="cost">${formatCurrency(item.cost)}</span>
        </div>
      `)
      .join('');
  } else {
    breakdownEl.classList.add('hidden');
  }

  saveData();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function createIngredientCard(data = {}) {
  const id = ++ingredientIdCounter;
  const card = document.createElement('div');
  card.className = 'ingredient-card';
  card.dataset.id = id;

  const name = data.name || '';
  const price = data.price || '';
  const boughtQty = data.boughtQty || '';
  const boughtUnit = data.boughtUnit || 'g';
  const usedQty = data.usedQty || '';
  const usedUnit = data.usedUnit || 'g';

  card.innerHTML = `
    <div class="ingredient-header">
      <span class="ingredient-number">Ingrediente #${id}</span>
      <button class="btn-remove" aria-label="Eliminar ingrediente">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="ingredient-grid">
      <div class="form-group">
        <label>Nombre</label>
        <input type="text" data-field="name" data-id="${id}" value="${escapeHtml(name)}" placeholder="Ej: Harina de trigo" autocomplete="off">
      </div>
      <div class="form-group">
        <label>Precio</label>
        <input type="number" data-field="price" data-id="${id}" value="${price}" placeholder="0.00" min="0" step="0.01">
      </div>
      <div class="form-group">
        <label>Cant. Comprada</label>
        <div class="qty-unit-row">
          <input type="number" data-field="boughtQty" data-id="${id}" value="${boughtQty}" placeholder="0" min="0" step="any" class="qty-input">
          <select data-field="boughtUnit" data-id="${id}" class="unit-select-inline" autocomplete="off">
            <option value="g" ${boughtUnit === 'g' ? 'selected' : ''}>g</option>
            <option value="kg" ${boughtUnit === 'kg' ? 'selected' : ''}>kg</option>
            <option value="ml" ${boughtUnit === 'ml' ? 'selected' : ''}>ml</option>
            <option value="L" ${boughtUnit === 'L' ? 'selected' : ''}>L</option>
            <option value="Uni" ${boughtUnit === 'Uni' ? 'selected' : ''}>Uni</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Cant. a Usar</label>
        <div class="qty-unit-row">
          <input type="number" data-field="usedQty" data-id="${id}" value="${usedQty}" placeholder="0" min="0" step="any" class="qty-input">
          <select data-field="usedUnit" data-id="${id}" class="unit-select-inline" autocomplete="off">
            <option value="g" ${usedUnit === 'g' ? 'selected' : ''}>g</option>
            <option value="kg" ${usedUnit === 'kg' ? 'selected' : ''}>kg</option>
            <option value="ml" ${usedUnit === 'ml' ? 'selected' : ''}>ml</option>
            <option value="L" ${usedUnit === 'L' ? 'selected' : ''}>L</option>
            <option value="Uni" ${usedUnit === 'Uni' ? 'selected' : ''}>Uni</option>
          </select>
        </div>
      </div>
    </div>
    <div class="ingredient-cost">
      <span>Costo:</span>
      <strong class="ingredient-cost-value">${CURRENCY}0.00</strong>
    </div>
  `;

  card.querySelector('.btn-remove').addEventListener('click', () => {
    card.style.transition = 'all 0.3s ease';
    card.style.opacity = '0';
    card.style.transform = 'translateX(20px)';
    setTimeout(() => {
      card.remove();
      calculateAll();
    }, 250);
  });

  card.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('input', calculateAll);
  });

  return card;
}

function addIngredient(data = {}) {
  const list = document.getElementById('ingredients-list');
  const card = createIngredientCard(data);
  list.appendChild(card);
  calculateAll();
  return card;
}

function collectData() {
  const recipeName = document.getElementById('recipe-name').value;
  const piecesCount = parseInt(document.getElementById('pieces-count').value) || 1;
  const profitMargin = parseFloat(document.getElementById('profit-margin').value) || 0;
  const laborCost = parseFloat(document.getElementById('labor-cost').value) || 0;
  const operatingCost = parseFloat(document.getElementById('operating-cost').value) || 0;

  const ingredients = [];
  document.querySelectorAll('.ingredient-card').forEach(card => {
    const id = card.dataset.id;
    ingredients.push({
      name: card.querySelector(`[data-field="name"][data-id="${id}"]`).value,
      price: card.querySelector(`[data-field="price"][data-id="${id}"]`).value,
      boughtQty: card.querySelector(`[data-field="boughtQty"][data-id="${id}"]`).value,
      boughtUnit: card.querySelector(`[data-field="boughtUnit"][data-id="${id}"]`).value,
      usedQty: card.querySelector(`[data-field="usedQty"][data-id="${id}"]`).value,
      usedUnit: card.querySelector(`[data-field="usedUnit"][data-id="${id}"]`).value
    });
  });

  return { recipeName, piecesCount, profitMargin, laborCost, operatingCost, ingredients, nextId: ingredientIdCounter + 1 };
}

function saveData() {
  try {
    const data = collectData();
    safeStorageSet(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save data:', e);
  }
}

function loadData() {
  try {
    const raw = safeStorageGet(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not load data:', e);
    return null;
  }
}

function restoreData(data) {
  if (!data) return;

  document.getElementById('recipe-name').value = data.recipeName || '';
  document.getElementById('pieces-count').value = data.piecesCount || 1;
  document.getElementById('profit-margin').value = data.profitMargin ?? 50;
  document.getElementById('labor-cost').value = data.laborCost ?? 0;
  document.getElementById('operating-cost').value = data.operatingCost ?? 0;

  if (data.ingredients && data.ingredients.length > 0) {
    data.ingredients.forEach(ing => addIngredient(ing));
  }

  if (data.nextId) {
    ingredientIdCounter = data.nextId;
  }
}

function clearAll() {
  if (!confirm('¿Estás seguro de que deseas limpiar todos los datos?')) return;
  clearAllNoConfirm();
}

function clearAllNoConfirm() {
  document.getElementById('recipe-name').value = '';
  document.getElementById('pieces-count').value = 1;
  document.getElementById('profit-margin').value = 50;
  document.getElementById('labor-cost').value = 0;
  document.getElementById('operating-cost').value = 0;
  document.getElementById('ingredients-list').innerHTML = '';
  ingredientIdCounter = 0;

  addIngredient();
  calculateAll();
  showToast('Nueva receta creada');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.add('hidden'), 3000);
}

function saveRecipe() {
  const data = collectData();
  const recipeName = data.recipeName || 'Sin nombre';
  if (!data.recipeName) {
    showToast('Escribe un nombre para la receta');
    document.getElementById('recipe-name').focus();
    return;
  }

  const history = loadHistory();
  const existingIndex = history.findIndex(r => r.id === data.recipeName + '_' + (data.savedAt || ''));
  const now = new Date().toISOString();

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

  history.unshift(recipeEntry);
  if (history.length > 50) history.pop();

  safeStorageSet(HISTORY_KEY, JSON.stringify(history));
  showToast(`"${recipeName}" guardada en historial`);
}

function loadHistory() {
  try {
    const raw = safeStorageGet(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function renderHistory() {
  const history = loadHistory();
  const list = document.getElementById('history-list');

  if (history.length === 0) {
    list.innerHTML = `
      <div class="history-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <p>No hay recetas guardadas aún</p>
      </div>
    `;
    return;
  }

  list.innerHTML = history.map(recipe => {
    const date = new Date(recipe.updatedAt);
    const dateStr = date.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    const ingCount = recipe.ingredients ? recipe.ingredients.length : 0;

    return `
      <div class="history-item" data-id="${recipe.id}">
        <div class="history-item-info">
          <span class="history-item-name">${escapeHtml(recipe.name)}</span>
          <span class="history-item-meta">${ingCount} ingrediente${ingCount !== 1 ? 's' : ''} · ${recipe.piecesCount} pieza${recipe.piecesCount !== 1 ? 's' : ''} · ${dateStr} ${timeStr}</span>
        </div>
        <div class="history-item-actions">
          <button class="btn-history-load" data-id="${recipe.id}" aria-label="Cargar receta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button class="btn-history-dup" data-id="${recipe.id}" aria-label="Duplicar receta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
          <button class="btn-history-del" data-id="${recipe.id}" aria-label="Eliminar receta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.btn-history-load').forEach(btn => {
    btn.addEventListener('click', () => loadRecipe(btn.dataset.id));
  });
  list.querySelectorAll('.btn-history-dup').forEach(btn => {
    btn.addEventListener('click', () => duplicateRecipe(btn.dataset.id));
  });
  list.querySelectorAll('.btn-history-del').forEach(btn => {
    btn.addEventListener('click', () => deleteRecipe(btn.dataset.id));
  });
}

function loadRecipe(id) {
  const history = loadHistory();
  const recipe = history.find(r => r.id === id);
  if (!recipe) {
    showToast('Receta no encontrada');
    return;
  }

  document.getElementById('recipe-name').value = recipe.name;
  document.getElementById('pieces-count').value = recipe.piecesCount || 1;
  document.getElementById('profit-margin').value = recipe.profitMargin ?? 50;
  document.getElementById('ingredients-list').innerHTML = '';
  ingredientIdCounter = 0;

  if (recipe.ingredients && recipe.ingredients.length > 0) {
    recipe.ingredients.forEach(ing => addIngredient(ing));
  } else {
    addIngredient();
  }

  if (recipe.nextId) {
    ingredientIdCounter = recipe.nextId;
  }

  calculateAll();
  closeHistoryModal();
  showToast(`"${recipe.name}" cargada`);
}

function duplicateRecipe(id) {
  const history = loadHistory();
  const recipe = history.find(r => r.id === id);
  if (!recipe) {
    showToast('Receta no encontrada');
    return;
  }

  const dup = JSON.parse(JSON.stringify(recipe));
  dup.id = Date.now().toString();
  dup.name = recipe.name + ' (copia)';
  dup.createdAt = new Date().toISOString();
  dup.updatedAt = dup.createdAt;

  history.unshift(dup);
  safeStorageSet(HISTORY_KEY, JSON.stringify(history));
  renderHistory();
  showToast(`"${dup.name}" creada`);
}

function deleteRecipe(id) {
  const history = loadHistory();
  const recipe = history.find(r => r.id === id);
  if (!recipe) return;

  if (!confirm(`¿Eliminar "${recipe.name}" del historial?`)) return;

  const filtered = history.filter(r => r.id !== id);
  safeStorageSet(HISTORY_KEY, JSON.stringify(filtered));
  renderHistory();
  showToast(`"${recipe.name}" eliminada`);
}

function openHistoryModal() {
  renderHistory();
  document.getElementById('history-modal').classList.remove('hidden');
}

function closeHistoryModal() {
  document.getElementById('history-modal').classList.add('hidden');
}

function setupInstallPrompt() {
  if (isWebView) return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById('install-banner');
    if (banner) banner.classList.remove('hidden');
  });

  const installBtn = document.getElementById('install-btn');
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('¡App instalada exitosamente!');
      }
      deferredPrompt = null;
      const banner = document.getElementById('install-banner');
      if (banner) banner.classList.add('hidden');
    });
  }

  const dismissBtn = document.getElementById('dismiss-install');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      const banner = document.getElementById('install-banner');
      if (banner) banner.classList.add('hidden');
    });
  }

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const banner = document.getElementById('install-banner');
    if (banner) banner.classList.add('hidden');
    showToast('¡ReposteriaCalc instalada!');
  });
}

function setupOfflineDetection() {
  if (isWebView) return;

  window.addEventListener('online', () => showToast('Conexión restaurada'));
  window.addEventListener('offline', () => showToast('Sin conexión - Modo offline'));
}

function registerServiceWorker() {
  if (isWebView) return;
  if (!('serviceWorker' in navigator)) return;
  if (window.location.protocol === 'file:') return;

  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    } catch (error) {
      console.warn('SW registration skipped:', error.message);
    }
  });
}

function init() {
  detectEnvironment();

  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');

  document.getElementById('add-ingredient').addEventListener('click', () => addIngredient());
  document.getElementById('save-recipe').addEventListener('click', saveRecipe);
  document.getElementById('open-history').addEventListener('click', openHistoryModal);
  document.getElementById('close-history').addEventListener('click', closeHistoryModal);
  document.getElementById('clear-all').addEventListener('click', clearAll);

  document.getElementById('history-modal').addEventListener('click', (e) => {
    if (e.target.id === 'history-modal') closeHistoryModal();
  });

  document.getElementById('pieces-count').addEventListener('input', calculateAll);
  document.getElementById('profit-margin').addEventListener('input', calculateAll);
  document.getElementById('recipe-name').addEventListener('input', calculateAll);
  document.getElementById('labor-cost').addEventListener('input', calculateAll);
  document.getElementById('operating-cost').addEventListener('input', calculateAll);

  const saved = loadData();
  if (action === 'history') {
    setTimeout(openHistoryModal, 500);
  } else if (action === 'new' || !saved || !saved.ingredients || saved.ingredients.length === 0) {
    addIngredient();
    calculateAll();
  } else {
    restoreData(saved);
  }

  calculateAll();
  setupInstallPrompt();
  setupOfflineDetection();
  registerServiceWorker();

  if (action === 'history') {
    setTimeout(openHistoryModal, 500);
  } else if (action === 'new') {
    clearAllNoConfirm();
  }

  window.history.replaceState({}, '', '/');
}

document.addEventListener('DOMContentLoaded', init);
