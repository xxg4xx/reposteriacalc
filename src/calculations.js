export const CURRENCY = '$'

export const UNIT_GROUPS = {
  weight: ['kg', 'g'],
  volume: ['L', 'ml'],
  count: ['Uni']
}

export const TO_BASE = {
  kg: 1000,
  g: 1,
  L: 1000,
  ml: 1,
  Uni: 1
}

export function normalizeNumber(value) {
  if (value == null || value === '') return 0
  if (typeof value === 'string') {
    value = value.replace(',', '.')
  }
  return value
}

export function toBaseUnit(value, unit) {
  if (!(unit in TO_BASE)) return value
  return value * TO_BASE[unit]
}

export function isSameUnitGroup(unit1, unit2) {
  if (!unit1 || !unit2) return true
  for (const group of Object.values(UNIT_GROUPS)) {
    if (group.includes(unit1) && group.includes(unit2)) return true
  }
  return false
}

export function calculateIngredientCost(ingredient) {
  const price = parseFloat(normalizeNumber(ingredient.price)) || 0
  const boughtQty = parseFloat(normalizeNumber(ingredient.boughtQty)) || 0
  const usedQty = parseFloat(normalizeNumber(ingredient.usedQty)) || 0
  const boughtUnit = ingredient.boughtUnit
  const usedUnit = ingredient.usedUnit

  if (price <= 0 || boughtQty <= 0 || usedQty <= 0) return { cost: 0, warning: false }

  const warning = boughtUnit && usedUnit && !isSameUnitGroup(boughtUnit, usedUnit)

  if (boughtUnit === usedUnit) {
    return { cost: (price / boughtQty) * usedQty, warning }
  }

  const boughtBase = toBaseUnit(boughtQty, boughtUnit)
  const usedBase = toBaseUnit(usedQty, usedUnit)
  return { cost: (price / boughtBase) * usedBase, warning }
}

export function formatCurrency(value) {
  if (!Number.isFinite(value)) return `${CURRENCY}0.00`
  if (value < 0) return `-${CURRENCY}${Math.abs(value).toFixed(2)}`
  return `${CURRENCY}${value.toFixed(2)}`
}

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
