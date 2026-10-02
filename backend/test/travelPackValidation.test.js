const test = require('node:test');
const assert = require('node:assert/strict');
const { requiredFields, sanitizeFields, completionProblems, unfinished } = require('../utils/travelPackValidation');

const quote = {
  status: 'Approved',
  route: { itinerary: Array.from({ length: 5 }, (_, index) => ({ day: index + 1 })) }
};

test('combined pack covers all eleven follow-on forms and every itinerary day', () => {
  const fields = requiredFields(quote);
  assert.deepEqual([...new Set(fields.map(item => item.section))], [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.ok(fields.some(item => item.key === '97:5:4'));
  assert.ok(fields.some(item => item.key === '54:1:1'));
  assert.ok(fields.some(item => item.key === 'p:102'));
});

test('a pack with template placeholders or unreviewed sections cannot be finalized', () => {
  const pack = { fields: { '54:1:1': 'SPT/INV/FY____/______' }, completedSections: [1], checks: {} };
  const problems = completionProblems(quote, pack);
  assert.ok(problems.some(problem => problem.includes('document 02')));
  assert.ok(problems.some(problem => problem.includes('document 03')));
  assert.ok(problems.some(problem => problem.includes('accountant')));
  assert.equal(unfinished('☐ TAX INVOICE  ☐ BILL OF SUPPLY'), true);
  assert.equal(unfinished('☒ TAX INVOICE  ☐ BILL OF SUPPLY'), false);
});

test('a completed pack accepts reviewed N/A values but discards unknown field keys', () => {
  const raw = Object.fromEntries(requiredFields(quote).map(item => [item.key, 'N/A']));
  raw['malicious:field'] = 'private data';
  const fields = sanitizeFields(raw, quote);
  assert.equal(fields['malicious:field'], undefined);
  const pack = {
    fields,
    completedSections: Array.from({ length: 12 }, (_, index) => index + 1),
    checks: { accountantReviewed: true, paymentVerified: true, suppliersConfirmed: true, reconciliationReviewed: true }
  };
  assert.deepEqual(completionProblems(quote, pack), []);
});
