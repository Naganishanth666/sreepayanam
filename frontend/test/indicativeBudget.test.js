import test from 'node:test';
import assert from 'node:assert/strict';
import { BUDGET_DISCLAIMER, estimateIndicativeBudget } from '../src/utils/indicativeBudget.js';

const hotels = [
  { name: 'Stay A', nightlyEstimate: 3000, sourceUrl: 'https://example.com/stay-a', checkedAt: '2026-10-07' },
  { name: 'Stay B', nightlyEstimate: 5000, sourceUrl: 'https://example.com/stay-b', checkedAt: '2026-10-07' }
];

test('public estimate averages destination room rates and applies the 35% margin', () => {
  const result = estimateIndicativeBudget({ hotels, days: 3, nights: 2, rooms: 2, travellers: 4,
    vehicleType: 'Sedan', mealPlan: 'MAP', country: 'India' });
  assert.equal(result.averageRoomRate, 4000);
  assert.equal(result.estimatedGroupBudget, 67000);
  assert.equal(result.hotelCount, 2);
  assert.ok(result.assumptions.includes('taxes are not included'));
  assert.equal(BUDGET_DISCLAIMER, 'This is an indicative budget, not a final quotation. Prices are subject to change upon confirmation based on availability, supplier rates, and applicable costs.');
});

test('unsourced overnight rates cannot produce a public amount', () => {
  assert.equal(estimateIndicativeBudget({ hotels: [hotels[0], { ...hotels[1], sourceUrl: '' }], days: 3,
    nights: 2, rooms: 2, travellers: 4, vehicleType: 'Sedan', country: 'India' }), null);
});

test('a day trip has no hotel cost', () => {
  const result = estimateIndicativeBudget({ hotels: [], days: 1, nights: 0, rooms: 1, travellers: 2,
    vehicleType: 'Sedan', mealPlan: 'EP', country: 'India' });
  assert.equal(result.estimatedGroupBudget, 9900);
  assert.equal(result.hotelCount, 0);
});
