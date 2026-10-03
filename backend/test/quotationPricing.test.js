const test = require('node:test');
const assert = require('node:assert/strict');
const { BUFFER_PERCENT, MARKUP_PERCENT, DISCOUNT_PERCENT, priceTier } = require('../utils/quotationPricing');

test('SRS example applies contingency before markup, without guessing GST', () => {
  assert.equal(BUFFER_PERCENT, 10);
  assert.equal(MARKUP_PERCENT, 40);
  assert.equal(DISCOUNT_PERCENT, 5);
  assert.deepEqual(priceTier(100000, 2), {
    beforeDiscount: 154000,
    discountAmount: 7700,
    total: 146300,
    perPerson: 73150,
    currency: 'INR'
  });
});

test('per-person pricing uses the same group total and rejects missing costs', () => {
  assert.deepEqual(priceTier(80000, 4), { beforeDiscount: 123200, discountAmount: 6160, total: 117040, perPerson: 29260, currency: 'INR' });
  assert.equal(priceTier(0, 2), null);
  assert.equal(priceTier('unknown', 2), null);
  assert.equal(priceTier(100000, 0), null);
});
