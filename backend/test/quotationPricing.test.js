const test = require('node:test');
const assert = require('node:assert/strict');
const { BUFFER_PERCENT, TARGET_MARGIN_PERCENT, DISCOUNT_PERCENT, priceTier } = require('../utils/quotationPricing');

test('SRS v1.5 applies contingency then 35% gross margin, without guessing GST', () => {
  assert.equal(BUFFER_PERCENT, 10);
  assert.equal(TARGET_MARGIN_PERCENT, 35);
  assert.equal(DISCOUNT_PERCENT, 0);
  assert.deepEqual(priceTier(100000, 2), {
    beforeDiscount: 169231,
    discountAmount: 0,
    total: 169231,
    perPerson: 84616,
    currency: 'INR'
  });
});

test('per-person pricing uses the same group total and rejects missing costs', () => {
  assert.deepEqual(priceTier(80000, 4), { beforeDiscount: 135385, discountAmount: 0, total: 135385, perPerson: 33846, currency: 'INR' });
  assert.equal(priceTier(30000, 2).total, 50770);
  assert.equal(priceTier(0, 2), null);
  assert.equal(priceTier('unknown', 2), null);
  assert.equal(priceTier(100000, 0), null);
});
