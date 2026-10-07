const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeDestinationGuide } = require('../routes/aiRoutes');

test('near-aliases of the same attraction appear once in destination suggestions', () => {
  const guide = sanitizeDestinationGuide({ country: 'India', groups: [
    { kind: 'recommended', places: ['Thirumalai Nayakkar Palace', 'Alagar Koyil'] },
    { kind: 'nearby', places: ['Tirumalai Nayakkar Palace', 'Azhagar Kovil', 'Meenakshi Amman Temple'] }
  ] }, 'Madurai');
  assert.deepEqual(guide.groups.flatMap(group => group.places),
    ['Thirumalai Nayakkar Palace', 'Alagar Koyil', 'Meenakshi Amman Temple']);
});
