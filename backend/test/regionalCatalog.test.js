const test = require('node:test');
const assert = require('node:assert/strict');
const { packages } = require('../data/curatedRegionalCatalog');
const { publicationProblems } = require('../utils/catalogReadiness');
const { isPublicPackage, withOverrides } = require('../utils/regionalCatalog');

test('regional routes have the requested distinct counts and source-backed daily visits', () => {
  assert.equal(packages.length, 220);
  assert.deepEqual(Object.fromEntries(['Tamil Nadu', 'South India', 'North India']
    .map(region => [region, packages.filter(pkg => pkg.regionScope === region).length])),
  { 'Tamil Nadu': 80, 'South India': 60, 'North India': 80 });
  assert.equal(new Set(packages.map(pkg => pkg.packageId)).size, 220);
  assert.equal(new Set(packages.map(pkg => pkg.routeSignature)).size, 220);
  for (const pkg of packages) {
    assert.deepEqual(publicationProblems(pkg), [], pkg.packageId);
    assert.ok(isPublicPackage(pkg), pkg.packageId);
    assert.equal(pkg.itinerary.length, pkg.durationDays);
    for (const day of pkg.itinerary) {
      assert.ok(day.schedule.some(stop => stop.kind === 'visit' && stop.place && stop.description
        && stop.sourceUrl.startsWith('https://')), `${pkg.packageId} day ${day.day}`);
      assert.ok(day.schedule.some(stop => stop.kind === 'meal'), `${pkg.packageId} day ${day.day} lacks a meal break`);
      assert.doesNotMatch(day.activities, /select specific visits|verify opening hours, access and transfer sequence/i);
      assert.doesNotMatch(day.activities, /heritage orientation/i);
    }
  }
});

test('ferry and long-yatra routes keep the venue window and a dedicated pilgrimage day', () => {
  const ferryPackage = packages.find(pkg => pkg.packageId === 'SP-REG-SI-058');
  const ferryVisit = ferryPackage.itinerary.flatMap(day => day.schedule)
    .find(stop => stop.place === 'Vivekananda Rock Memorial');
  assert.ok(ferryVisit.time < '16:00');
  const vaishno = packages.find(pkg => pkg.packageId === 'SP-REG-NI-057');
  const yatraDay = vaishno.itinerary.find(day => day.title.includes('Vaishno Devi yatra'));
  assert.ok(yatraDay);
  assert.equal(yatraDay.schedule.filter(stop => stop.kind === 'visit' && stop.place === 'Vaishno Devi Temple').length, 1);
  assert.ok(yatraDay.schedule.some(stop => stop.title.includes('uphill yatra')));
  assert.ok(vaishno.itinerary.some(day => day.schedule.some(stop => stop.place === 'Yatra Registration Centre, Katra')));
});

test('a draft or archived override hides its code-backed regional listing', () => {
  const original = packages[0];
  const override = { ...original, status: 'Draft', isActive: false };
  const merged = withOverrides([override]);
  assert.equal(merged.filter(pkg => pkg.packageId === original.packageId).length, 1);
  assert.equal(isPublicPackage(merged.find(pkg => pkg.packageId === original.packageId)), false);
});
