const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeVisitResearch } = require('../utils/visitResearch');

test('only searched sources and selected places can set visit windows or events', () => {
  const source = 'https://example.org/temple/hours';
  const research = sanitizeVisitResearch({ places: [
    { name: 'Temple', sourceUrl: source, windows: [{ start: '05:00', end: '12:30' }, { start: '16:00', end: '21:00' }],
      closedWeekdays: ['Mon'], event: { date: '2026-11-01', description: 'Festival', sourceUrl: source } },
    { name: 'Museum', sourceUrl: 'https://unsearched.example/hours', windows: [{ start: '09:00', end: '17:00' }] },
    { name: 'Unselected', sourceUrl: source, windows: [{ start: '09:00', end: '17:00' }] }
  ] }, [{ url: source }], ['Temple', 'Museum'], '2026-11-01', '2026-11-03', '2026-10-07T06:00:00Z');
  assert.equal(research.length, 1);
  assert.equal(research[0].windows.length, 2);
  assert.deepEqual(research[0].closedWeekdays, [1]);
  assert.equal(research[0].event.date, '2026-11-01');
});
