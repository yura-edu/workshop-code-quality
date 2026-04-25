const { processOrder, applyDiscount, calculateTax, validateOrder, formatOrderSummary } = require('../src/order-processor')

function makeOrder(overrides = {}) {
  return {
    id: 'ORD-001',
    items: [{ name: 'Widget', price: 100, quantity: 2 }],
    customer: { name: 'Ana García', email: 'ana@example.com' },
    region: 'US',
    paymentMethod: 'credit_card',
    ...overrides,
  }
}

describe('validateOrder', () => {
  it('returns valid for a correct order', () => {
    const r = validateOrder(makeOrder())
    expect(r.valid).toBe(true)
    expect(r.errors).toHaveLength(0)
  })
  it('returns invalid when order is null', () => {
    const r = validateOrder(null)
    expect(r.valid).toBe(false)
  })
  it('returns error for missing id', () => {
    const r = validateOrder(makeOrder({ id: undefined }))
    expect(r.valid).toBe(false)
    expect(r.errors.some(e => e.toLowerCase().includes('id'))).toBe(true)
  })
  it('returns error for empty items', () => {
    const r = validateOrder(makeOrder({ items: [] }))
    expect(r.valid).toBe(false)
    expect(r.errors.some(e => e.toLowerCase().includes('item'))).toBe(true)
  })
  it('returns error for invalid email', () => {
    const r = validateOrder(makeOrder({ customer: { name: 'Ana', email: 'not-an-email' } }))
    expect(r.valid).toBe(false)
    expect(r.errors.some(e => e.toLowerCase().includes('email'))).toBe(true)
  })
  it('returns error for missing customer', () => {
    const r = validateOrder(makeOrder({ customer: undefined }))
    expect(r.valid).toBe(false)
    expect(r.errors.some(e => e.toLowerCase().includes('customer'))).toBe(true)
  })
})

describe('calculateTax', () => {
  it('applies 8% for US', () => {
    const r = calculateTax(100, 'US')
    expect(r.taxRate).toBe(0.08)
    expect(r.tax).toBe(8)
  })
  it('applies 21% for EU', () => {
    const r = calculateTax(100, 'EU')
    expect(r.taxRate).toBe(0.21)
    expect(r.tax).toBe(21)
  })
  it('applies 19% for LATAM', () => {
    const r = calculateTax(100, 'LATAM')
    expect(r.taxRate).toBe(0.19)
    expect(r.tax).toBe(19)
  })
  it('applies 10% for ASIA', () => {
    const r = calculateTax(100, 'ASIA')
    expect(r.taxRate).toBe(0.10)
    expect(r.tax).toBe(10)
  })
  it('applies default 5% for unknown region', () => {
    const r = calculateTax(100, 'OTHER')
    expect(r.taxRate).toBe(0.05)
    expect(r.tax).toBe(5)
  })
})

describe('applyDiscount', () => {
  const order = makeOrder()

  it('applies 10% for SAVE10', () => {
    const r = applyDiscount(order, 'SAVE10')
    expect(r.amount).toBe(20)
    expect(r.percentage).toBe(0.10)
  })
  it('applies 20% for SAVE20', () => {
    const r = applyDiscount(order, 'SAVE20')
    expect(r.amount).toBe(40)
    expect(r.percentage).toBe(0.20)
  })
  it('applies 30% for VIP', () => {
    const r = applyDiscount(order, 'VIP')
    expect(r.amount).toBe(60)
    expect(r.percentage).toBe(0.30)
  })
  it('applies 15% for STUDENT', () => {
    const r = applyDiscount(order, 'STUDENT')
    expect(r.amount).toBe(30)
    expect(r.percentage).toBe(0.15)
  })
  it('applies no discount for unknown code', () => {
    const r = applyDiscount(order, 'INVALID')
    expect(r.amount).toBe(0)
  })
  it('returns zero discount for missing order', () => {
    const r = applyDiscount(null, 'SAVE10')
    expect(r.amount).toBe(0)
  })
})

describe('processOrder', () => {
  it('returns null for null order', () => {
    expect(processOrder(null)).toBeNull()
  })
  it('returns error for missing id', () => {
    const r = processOrder(makeOrder({ id: undefined }))
    expect(r.error).toBeDefined()
  })
  it('returns error for empty items', () => {
    const r = processOrder(makeOrder({ items: [] }))
    expect(r.error).toBeDefined()
  })
  it('calculates subtotal correctly', () => {
    const r = processOrder(makeOrder())
    expect(r.subtotal).toBe(200)
  })
  it('applies SAVE10 discount', () => {
    const r = processOrder(makeOrder({ discountCode: 'SAVE10' }))
    expect(r.discount).toBe(20)
  })
  it('calculates US tax correctly', () => {
    const r = processOrder(makeOrder())
    expect(r.tax).toBe(16)
    expect(r.total).toBe(216)
  })
  it('combines discount and tax correctly', () => {
    // subtotal 200, SAVE10: -20, afterDiscount 180, EU 21%: 37.80, total 217.80
    const r = processOrder(makeOrder({ discountCode: 'SAVE10', region: 'EU' }))
    expect(r.discount).toBe(20)
    expect(r.tax).toBe(37.8)
    expect(r.total).toBe(217.8)
  })
  it('sets status to confirmed for credit_card', () => {
    const r = processOrder(makeOrder())
    expect(r.status).toBe('confirmed')
  })
  it('sets status to confirmed for paypal', () => {
    const r = processOrder(makeOrder({ paymentMethod: 'paypal' }))
    expect(r.status).toBe('confirmed')
  })
  it('sets status to pending_review for large bank_transfer', () => {
    const r = processOrder(makeOrder({
      items: [{ name: 'Server', price: 600, quantity: 2 }],
      paymentMethod: 'bank_transfer',
    }))
    expect(r.status).toBe('pending_review')
  })
  it('sets status to confirmed for small bank_transfer', () => {
    const r = processOrder(makeOrder({ paymentMethod: 'bank_transfer' }))
    expect(r.status).toBe('confirmed')
  })
  it('sets status to failed when paymentMethod is missing', () => {
    const r = processOrder(makeOrder({ paymentMethod: undefined }))
    expect(r.status).toBe('failed')
  })
})

describe('formatOrderSummary', () => {
  it('returns a string', () => {
    expect(typeof formatOrderSummary(makeOrder())).toBe('string')
  })
  it('includes order id', () => {
    expect(formatOrderSummary(makeOrder())).toContain('ORD-001')
  })
  it('includes customer name', () => {
    expect(formatOrderSummary(makeOrder())).toContain('Ana García')
  })
  it('includes item name', () => {
    expect(formatOrderSummary(makeOrder())).toContain('Widget')
  })
})
