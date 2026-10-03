const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeHotelSuggestions } = require('../utils/hotelSuggestions');

test('only cited HTTPS hotel listings can reach the public estimate', () => {
  const hotels = sanitizeHotelSuggestions({ hotels: [
    { name: 'River Garden', area: 'Srirangam', category: '3 Star', fitReason: 'Near the temple', nightlyEstimate: 3200, sourceUrl: 'https://hotels.example/river-garden?utm_source=openai', rateBasis: 'Room per night' },
    { name: 'Invented Stay', nightlyEstimate: 100, sourceUrl: 'https://bad.example/invented' },
    { name: 'Another Stay', nightlyEstimate: 4800, sourceUrl: 'http://hotels.example/another-stay' },
    { name: 'River Garden', nightlyEstimate: 9999, sourceUrl: 'https://hotels.example/river-garden' }
  ] }, [{ url: 'https://hotels.example/river-garden?utm_campaign=search' }], '2026-10-03T00:00:00Z');
  assert.equal(hotels.length, 1);
  assert.equal(hotels[0].name, 'River Garden');
  assert.equal(hotels[0].nightlyEstimate, 3200);
  assert.equal(hotels[0].sourceUrl, 'https://hotels.example/river-garden');
});

test('an unsupported or implausible price is omitted without losing the property', () => {
  const hotels = sanitizeHotelSuggestions({ hotels: [
    { name: 'Central Residency', nightlyEstimate: 900000, sourceUrl: 'https://hotels.example/central' }
  ] }, [{ url: 'https://hotels.example/central' }], '2026-10-03T00:00:00Z');
  assert.equal(hotels[0].nightlyEstimate, null);
  assert.equal(hotels[0].rateBasis, '');
});
