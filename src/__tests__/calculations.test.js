import { describe, it, expect } from 'vitest'
import {
  normalizeNumber,
  toBaseUnit,
  calculateIngredientCost,
  formatCurrency,
  isSameUnitGroup,
  escapeHtml,
} from '../calculations.js'

// normalizeNumber tests
describe('normalizeNumber', () => {
  it('returns 0 for null', () => expect(normalizeNumber(null)).toBe(0))
  it('returns 0 for undefined', () => expect(normalizeNumber(undefined)).toBe(0))
  it('returns 0 for empty string', () => expect(normalizeNumber('')).toBe(0))
  it('replaces comma with period', () => expect(normalizeNumber('1,5')).toBe('1.5'))
  it('leaves period as-is', () => expect(normalizeNumber('1.5')).toBe('1.5'))
  it('handles multiple commas', () => expect(normalizeNumber('1,234,56')).toBe('1.234,56'))
  it('returns non-numeric string as-is', () => expect(normalizeNumber('abc')).toBe('abc'))
})

// toBaseUnit tests
describe('toBaseUnit', () => {
  it('converts kg to g', () => expect(toBaseUnit(2, 'kg')).toBe(2000))
  it('converts L to ml', () => expect(toBaseUnit(1.5, 'L')).toBe(1500))
  it('keeps g as-is', () => expect(toBaseUnit(500, 'g')).toBe(500))
  it('returns raw value for unknown unit', () => expect(toBaseUnit(5, 'invalid')).toBe(5))
})

// calculateIngredientCost tests
describe('calculateIngredientCost', () => {
  it('calculates same-unit cost', () => {
    const result = calculateIngredientCost({ price: 10, boughtQty: 2, boughtUnit: 'g', usedQty: 1, usedUnit: 'g' })
    expect(result.cost).toBe(5)
    expect(result.warning).toBe(false)
  })

  it('calculates cross-unit cost (kg to g)', () => {
    const result = calculateIngredientCost({ price: 100, boughtQty: 1, boughtUnit: 'kg', usedQty: 250, usedUnit: 'g' })
    expect(result.cost).toBe(25)
    expect(result.warning).toBe(false)
  })

  it('returns 0 cost when price is 0', () => {
    const result = calculateIngredientCost({ price: 0, boughtQty: 2, boughtUnit: 'g', usedQty: 1, usedUnit: 'g' })
    expect(result.cost).toBe(0)
  })

  it('flags warning on incompatible units (kg vs ml)', () => {
    const result = calculateIngredientCost({ price: 10, boughtQty: 1, boughtUnit: 'kg', usedQty: 500, usedUnit: 'ml' })
    expect(result.warning).toBe(true)
  })

  it('returns 0 when boughtQty is 0', () => {
    const result = calculateIngredientCost({ price: 10, boughtQty: 0, boughtUnit: 'g', usedQty: 1, usedUnit: 'g' })
    expect(result.cost).toBe(0)
  })
})

// formatCurrency tests
describe('formatCurrency', () => {
  it('formats normal value', () => expect(formatCurrency(10.5)).toBe('$10.50'))
  it('formats zero', () => expect(formatCurrency(0)).toBe('$0.00'))
  it('returns $0.00 for Infinity', () => expect(formatCurrency(Infinity)).toBe('$0.00'))
  it('returns $0.00 for NaN', () => expect(formatCurrency(NaN)).toBe('$0.00'))
  it('returns $0.00 for -Infinity', () => expect(formatCurrency(-Infinity)).toBe('$0.00'))
  it('handles negative values', () => expect(formatCurrency(-5)).toBe('-$5.00'))
})

// isSameUnitGroup tests
describe('isSameUnitGroup', () => {
  it('returns true for same group (g and kg)', () => expect(isSameUnitGroup('g', 'kg')).toBe(true))
  it('returns true for same unit', () => expect(isSameUnitGroup('ml', 'ml')).toBe(true))
  it('returns false for different groups', () => expect(isSameUnitGroup('kg', 'L')).toBe(false))
  it('returns true when one input is null', () => expect(isSameUnitGroup(null, 'g')).toBe(true))
})

// escapeHtml tests
describe('escapeHtml', () => {
  it('escapes &', () => expect(escapeHtml('&')).toBe('&amp;'))
  it('escapes <', () => expect(escapeHtml('<')).toBe('&lt;'))
  it('escapes >', () => expect(escapeHtml('>')).toBe('&gt;'))
  it('escapes double quotes', () => expect(escapeHtml('"')).toBe('&quot;'))
  it('escapes single quotes', () => expect(escapeHtml("'")).toBe('&#039;'))
  it('handles normal text', () => expect(escapeHtml('hello')).toBe('hello'))
  it('handles mixed content', () => expect(escapeHtml('<script>alert("xss")</script>'))
    .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'))
})
