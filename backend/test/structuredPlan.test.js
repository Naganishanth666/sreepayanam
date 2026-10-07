const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeStructuredPlan } = require('../routes/aiRoutes');

test('a second selected stop moves to the next day when temple opening hours delay day one', () => {
  const selectedDestinations = ['Meenakshi Amman Temple', 'Thirumalai Nayakkar Palace'];
  const route = sanitizeStructuredPlan({ itinerary: [
    { day: 1, places: selectedDestinations },
    { day: 2, places: [] }
  ] }, {
    destination: 'Madurai', travelStartDate: '2026-11-01', returnDate: '2026-11-02',
    durationDays: 2, durationNights: 1, arrivalTime: '12:00', selectedDestinations,
    visitResearch: [
      { name: selectedDestinations[0], windows: [{ start: '05:00', end: '12:30' }, { start: '16:00', end: '22:00' }], closedWeekdays: [] },
      { name: selectedDestinations[1], windows: [{ start: '10:00', end: '17:00' }], closedWeekdays: [5] }
    ]
  });
  assert.deepEqual(route.itinerary.map(day => day.places), [[selectedDestinations[0]], [selectedDestinations[1]]]);
  assert.deepEqual(route.planningReview.unplacedPlaces, []);
  assert.deepEqual(route.itinerary.map(day => day.schedule.find(item => item.kind === 'visit').start), ['16:00', '10:00']);
});
