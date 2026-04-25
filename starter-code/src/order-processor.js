// ORDER PROCESSOR — Legacy module with intentional quality issues.
// Your task: refactor without changing external behavior.
// All tests in tests/order-processor.test.js must keep passing.

// TODO: use these for validation someday
var VALID_REGIONS = ['US', 'EU', 'LATAM', 'ASIA']
var VALID_PAYMENTS = ['credit_card', 'bank_transfer', 'paypal']

function processOrder(order) {
  var result
  var x = 0

  if (order == null) return null
  if (order.id == undefined) return { error: 'missing id' }
  if (!order.items) return { error: 'missing items' }
  if (order.items.length == 0) return { error: 'empty order' }
  if (!order.customer) return { error: 'missing customer' }
  if (order.customer.name == '') return { error: 'customer name required' }
  if (!order.customer.email) return { error: 'missing email' }
  if (order.customer.email.indexOf('@') == -1) return { error: 'invalid email' }

  // calculate subtotal
  var subtotal = 0
  var fee = 0
  for (var i = 0; i < order.items.length; i++) {
    var item = order.items[i]
    if (item.price > 0 && item.quantity > 0) {
      subtotal = subtotal + (item.price * item.quantity)
    }
  }

  // apply discount
  var discount = 0
  var discountLabel = ''
  if (order.discountCode == 'SAVE10') {
    discount = subtotal * 0.10
    discountLabel = '10% off'
  } else if (order.discountCode == 'SAVE20') {
    discount = subtotal * 0.20
    discountLabel = '20% off'
  } else if (order.discountCode == 'VIP') {
    discount = subtotal * 0.30
    discountLabel = '30% VIP discount'
  } else if (order.discountCode == 'STUDENT') {
    discount = subtotal * 0.15
    discountLabel = '15% student discount'
  }

  var afterDiscount = subtotal - discount

  // calculate tax depending on region
  var tax = 0
  var taxRate = 0
  if (order.region == 'US') {
    taxRate = 0.08
    tax = afterDiscount * taxRate
  } else if (order.region == 'EU') {
    taxRate = 0.21
    tax = afterDiscount * taxRate
  } else if (order.region == 'LATAM') {
    taxRate = 0.19
    tax = afterDiscount * taxRate
  } else if (order.region == 'ASIA') {
    taxRate = 0.10
    tax = afterDiscount * taxRate
  } else {
    taxRate = 0.05
    tax = afterDiscount * taxRate
  }

  var total = afterDiscount + tax

  // determine order status
  var status = ''
  if (total > 0 && order.paymentMethod) {
    if (order.paymentMethod == 'credit_card') {
      status = 'confirmed'
    } else if (order.paymentMethod == 'bank_transfer') {
      if (total > 1000) {
        status = 'pending_review'
      } else {
        status = 'confirmed'
      }
    } else if (order.paymentMethod == 'paypal') {
      status = 'confirmed'
    } else {
      status = 'unknown_payment'
    }
  } else {
    status = 'failed'
  }

  return {
    orderId: order.id,
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    discountLabel,
    taxRate,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    status,
  }
}

function applyDiscount(order, discountCode) {
  var amount = 0
  var label = ''
  var percentage = 0

  if (!order || !order.items) return { amount: 0, label: '', percentage: 0 }

  var subtotal = 0
  for (var i = 0; i < order.items.length; i++) {
    var item = order.items[i]
    subtotal = subtotal + (item.price * item.quantity)
  }

  if (discountCode == 'SAVE10') {
    amount = subtotal * 0.10
    label = '10% off'
    percentage = 0.10
  } else if (discountCode == 'SAVE20') {
    amount = subtotal * 0.20
    label = '20% off'
    percentage = 0.20
  } else if (discountCode == 'VIP') {
    amount = subtotal * 0.30
    label = '30% VIP discount'
    percentage = 0.30
  } else if (discountCode == 'STUDENT') {
    amount = subtotal * 0.15
    label = '15% student discount'
    percentage = 0.15
  }

  return { amount: Math.round(amount * 100) / 100, label, percentage }
}

function calculateTax(amount, region) {
  var taxRate = 0
  var tax = 0

  if (region == 'US') {
    taxRate = 0.08
    tax = amount * taxRate
  } else if (region == 'EU') {
    taxRate = 0.21
    tax = amount * taxRate
  } else if (region == 'LATAM') {
    taxRate = 0.19
    tax = amount * taxRate
  } else if (region == 'ASIA') {
    taxRate = 0.10
    tax = amount * taxRate
  } else {
    taxRate = 0.05
    tax = amount * taxRate
  }

  return { tax: Math.round(tax * 100) / 100, taxRate }
}

function validateOrder(order) {
  var errors = []

  if (!order) {
    errors.push('order is required')
    return { valid: false, errors }
  }

  if (order.id == undefined || order.id == null) {
    errors.push('id is required')
  }

  if (!order.items || order.items.length == 0) {
    errors.push('items are required')
  } else {
    for (var i = 0; i < order.items.length; i++) {
      var item = order.items[i]
      if (item.price == undefined || item.price <= 0) {
        errors.push('item price must be positive')
      }
      if (item.quantity == undefined || item.quantity <= 0) {
        errors.push('item quantity must be positive')
      }
    }
  }

  if (!order.customer) {
    errors.push('customer is required')
  } else {
    if (order.customer.name == '' || order.customer.name == undefined) {
      errors.push('customer name is required')
    }
    if (!order.customer.email || order.customer.email.indexOf('@') == -1) {
      errors.push('customer email is invalid')
    }
  }

  return { valid: errors.length == 0, errors }
}

function formatOrderSummary(order) {
  var lines = []
  var header = '=== ORDER SUMMARY ==='
  lines.push(header)
  lines.push('Order ID: ' + order.id)
  lines.push('Customer: ' + order.customer.name)
  lines.push('Email: ' + order.customer.email)

  var subtotal = 0
  for (var i = 0; i < order.items.length; i++) {
    var item = order.items[i]
    var lineTotal = item.price * item.quantity
    subtotal = subtotal + lineTotal
    lines.push('  - ' + item.name + ' x' + item.quantity + ' @ $' + item.price + ' = $' + lineTotal)
  }

  lines.push('Subtotal: $' + subtotal)

  if (order.discountCode) {
    lines.push('Discount (' + order.discountCode + '): applied')
  }

  lines.push('Region: ' + order.region)
  lines.push('Payment: ' + order.paymentMethod)
  lines.push(header)

  return lines.join('\n')
}

module.exports = { processOrder, applyDiscount, calculateTax, validateOrder, formatOrderSummary }
