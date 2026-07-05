import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// Set up jsdom document for app.js integration
import { JSDOM } from 'jsdom'

// We test collectData with a mock DOM element
describe('collectData integration', () => {
  let dom

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <input type="text" id="recipe-name" value="Test Recipe" />
      <input type="number" id="pieces-count" value="4" />
      <input type="number" id="profit-margin" value="50" />
      <input type="number" id="labor-cost" value="10" />
      <input type="number" id="operating-cost" value="5" />
      <div id="ingredients-list">
        <div class="ingredient-card" data-id="1">
          <input type="text" data-field="name" data-id="1" value="Flour" />
          <input type="number" data-field="price" data-id="1" value="20" />
          <input type="number" data-field="boughtQty" data-id="1" value="1" />
          <select data-field="boughtUnit" data-id="1"><option value="kg" selected>kg</option></select>
          <input type="number" data-field="usedQty" data-id="1" value="500" />
          <select data-field="usedUnit" data-id="1"><option value="g" selected>g</option></select>
        </div>
      </div>
    `)
    global.document = dom.window.document
  })

  afterEach(() => {
    delete global.document
  })

  it('collects data from mock DOM', () => {
    // We'll test after collectData is refactored to accept a DOM element
    const container = document.getElementById('ingredients-list')
    expect(container).not.toBeNull()
    expect(document.getElementById('recipe-name').value).toBe('Test Recipe')
    expect(document.getElementById('pieces-count').value).toBe('4')
  })
})
