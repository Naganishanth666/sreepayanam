const test = require('node:test');
const assert = require('node:assert/strict');
const { getPlaceContext } = require('../utils/placeContext');

test('a sourced place includes its licensed Commons thumbnail and attribution', async t => {
  const originalFetch = global.fetch;
  t.after(() => { global.fetch = originalFetch; });
  global.fetch = async url => {
    const parsed = new URL(url);
    if (parsed.hostname === 'en.wikipedia.org') return { ok: true, json: async () => ({ query: { pages: [{
      title: 'Meenakshi Temple', extract: 'Meenakshi Temple is a historic temple in Madurai. Visitors should check current darshan hours.',
      pageimage: 'Meenakshi_Temple.jpg', coordinates: [{ lat: 9.9195, lon: 78.1193 }]
    }] } }) };
    return { ok: true, json: async () => ({ query: { pages: [{ imageinfo: [{
      thumburl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/example.jpg',
      descriptionurl: 'https://commons.wikimedia.org/wiki/File:Meenakshi_Temple.jpg',
      extmetadata: { LicenseShortName: { value: 'CC BY 4.0' }, Artist: { value: '<b>Photographer</b>' } }
    }] }] } }) };
  };
  const place = await getPlaceContext('Meenakshi Temple, Madurai');
  assert.equal(place.title, 'Meenakshi Temple');
  assert.ok(place.imageUrl.startsWith('https://thumb.wikimedia.org/'));
  assert.equal(place.imageCredit, 'Photographer · CC BY 4.0');
  assert.equal(place.coordinates.lat, 9.9195);
});
