const test = require('node:test');
const assert = require('node:assert/strict');
const { buildDaySchedule, coordinateDistanceKm } = require('../utils/routeSchedule');

test('distant stops are held for another day instead of overcrowding the clock plan', () => {
  const result = buildDaySchedule({
    dayIndex: 1, durationDays: 3, durationNights: 2,
    places: ['First shrine', 'Far shrine'],
    coordinates: { 'First shrine': { lat: 10, lon: 78 }, 'Far shrine': { lat: 10, lon: 81 } }
  });
  assert.deepEqual(result.placed, ['First shrine']);
  assert.ok(result.schedule.some(item => item.label === 'Lunch and rest'));
  assert.ok(result.assumptions.some(item => item.includes('no road routing')));
});

test('a long transfer leaves a meal break en route', () => {
  const result = buildDaySchedule({
    dayIndex: 1, durationDays: 3, durationNights: 2,
    places: ['First shrine', 'Second shrine'],
    coordinates: { 'First shrine': { lat: 10, lon: 78 }, 'Second shrine': { lat: 10, lon: 78.55 } }
  });
  assert.deepEqual(result.placed, ['First shrine', 'Second shrine']);
  const lunch = result.schedule.find(item => item.label === 'Lunch and rest');
  assert.equal(lunch.start, '12:00');
  assert.ok(result.schedule.some(item => item.label === 'Continue to Second shrine'));
  assert.ok(coordinateDistanceKm({ lat: 10, lon: 78 }, { lat: 10, lon: 78.55 }) > 50);
});
