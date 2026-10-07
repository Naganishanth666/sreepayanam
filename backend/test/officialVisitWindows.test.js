const test = require('node:test');
const assert = require('node:assert/strict');
const { officialVisitWindows } = require('../utils/officialVisitWindows');

test('the researched Madurai venues use government opening windows only while fresh', () => {
  const now = Date.parse('2026-10-07T06:00:00Z');
  const records = officialVisitWindows(['Meenakshi Amman Temple', 'Thirumalai Nayakkar Palace'], now);
  assert.deepEqual(records[0].windows, [{ start: '05:00', end: '12:30' }, { start: '16:00', end: '22:00' }]);
  assert.equal(records[0].sourceUrl.includes('hrce.tn.gov.in'), true);
  assert.deepEqual(records[1].closedWeekdays, [5]);
  assert.equal(records[1].windows[0].start, '10:00');
  assert.deepEqual(officialVisitWindows(['Meenakshi Amman Temple'], Date.parse('2026-12-01T00:00:00Z')), []);
});
