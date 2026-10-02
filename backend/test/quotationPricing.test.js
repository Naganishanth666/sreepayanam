const test = require('node:test');
const assert = require('node:assert/strict');
const { BUFFER_PERCENT, MARKUP_PERCENT, priceTier } = require('../utils/quotationPricing');

test('SRS example applies contingency before markup, without guessing GST', () => {
  assert.equal(BUFFER_PERCENT, 10);
  assert.equal(MARKUP_PERCENT, 25);
  assert.deepEqual(priceTier(100000, 2), {
    total: 137500,
    perPerson: 68750,
    currency: 'INR'
  });
});

test('per-person pricing uses the same group total and rejects missing costs', () => {
  assert.deepEqual(priceTier(80000, 4), { total: 110000, perPerson: 27500, currency: 'INR' });
  assert.equal(priceTier(0, 2), null);
  assert.equal(priceTier('unknown', 2), null);
  assert.equal(priceTier(100000, 0), null);
});
