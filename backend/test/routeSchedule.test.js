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

test('a cited afternoon session moves a visit past the midday closure', () => {
  const result = buildDaySchedule({
    dayIndex: 0, durationDays: 2, durationNights: 1, arrivalTime: '12:00',
    travelStartDate: '2026-11-01', places: ['Temple'],
    visitingHours: { Temple: { windows: [{ start: '05:00', end: '12:30' }, { start: '16:00', end: '21:00' }] } }
  });
  assert.deepEqual(result.placed, ['Temple']);
  assert.equal(result.schedule.find(item => item.label === 'Visit Temple').start, '16:00');
  assert.ok(result.schedule.some(item => item.label === 'Lunch and rest'));
});

test('a published weekly closure keeps a selected stop for review', () => {
  const result = buildDaySchedule({
    dayIndex: 0, durationDays: 2, durationNights: 1, travelStartDate: '2026-11-02',
    places: ['Closed museum', 'Open temple'],
    visitingHours: { 'Closed museum': { windows: [{ start: '10:00', end: '17:00' }], closedWeekdays: [1] } }
  });
  assert.deepEqual(result.placed, ['Open temple']);
});
