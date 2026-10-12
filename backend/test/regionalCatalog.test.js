const test = require('node:test');
const assert = require('node:assert/strict');
const { packages: legacyPackages } = require('../data/curatedRegionalCatalog');
const { packages, counts, REQUIRED_CATEGORIES } = require('../data/curatedCatalogExpansion');
const { publicationProblems } = require('../utils/catalogReadiness');
const { isPublicPackage, withOverrides } = require('../utils/regionalCatalog');

test('public catalogue contains 60 reviewed, localized timed routes in each of 11 categories', () => {
  assert.equal(packages.length, 660);
  assert.deepEqual(counts, Object.fromEntries(REQUIRED_CATEGORIES.map(category => [category, 60])));
  assert.equal(new Set(packages.map(pkg => pkg.packageId)).size, 660);
  assert.equal(new Set(packages.map(pkg => pkg.routeSignature)).size, 660);

  const categoryByLocation = new Map();
  for (const pkg of packages) {
    assert.deepEqual(publicationProblems(pkg), [], pkg.packageId);
    assert.ok(isPublicPackage(pkg), pkg.packageId);
    assert.equal(pkg.itinerary.length, pkg.durationDays, pkg.packageId);
    assert.equal(pkg.catalogCategories.length, 1, pkg.packageId);
    for (const location of pkg.locationTags) {
      const existingCategory = categoryByLocation.get(location);
      assert.ok(!existingCategory || existingCategory === pkg.catalogCategories[0], `${location} crosses categories`);
      categoryByLocation.set(location, pkg.catalogCategories[0]);
    }
    for (const language of ['en', 'ta', 'hi']) {
      assert.equal(pkg.translations[language].itinerary.length, pkg.durationDays, `${pkg.packageId} ${language}`);
      for (const day of pkg.translations[language].itinerary) {
        assert.ok(day.schedule.some(stop => stop.kind === 'meal'), `${pkg.packageId} ${language} day ${day.day} lacks a meal break`);
        assert.ok(day.schedule.some(stop => stop.kind === 'visit' && stop.place && stop.description && stop.sourceUrl.startsWith('https://')),
          `${pkg.packageId} ${language} day ${day.day} lacks a sourced visit`);
        assert.ok(day.schedule.every((stop, index) => !index || stop.time >= day.schedule[index - 1].time),
          `${pkg.packageId} ${language} day ${day.day} is not chronological`);
      }
    }
    assert.equal(pkg.mealPlan.includes('Daily Breakfast Included'), true, pkg.packageId);
    assert.equal(pkg.exclusions.some(item => /\bLunch\b/i.test(item)) && pkg.exclusions.some(item => /\bDinner\b/i.test(item)), true, pkg.packageId);
    assert.ok(!pkg.itinerary.some(day => day.schedule.some(stop => stop.kind === 'visit'
      && /temple|church|mosque|dargah|shrine|கோயில்|கோவில்|தேவாலயம்|மசூதி|மந்திர்|मंदिर|चर्च|मस्जिद|दरगाह/i.test(`${stop.title} ${stop.place}`))), pkg.packageId);
    if (pkg.destinationStates.includes('Tamil Nadu')) {
      assert.equal(pkg.regionScope, 'Tamil Nadu', pkg.packageId);
      assert.deepEqual(pkg.destinationStates, ['Tamil Nadu'], pkg.packageId);
    }
  }
});

test('the earlier 220 regional pilgrimage packages remain stored and excluded from public listings', () => {
  assert.equal(legacyPackages.length, 220);
  assert.deepEqual(Object.fromEntries(['Tamil Nadu', 'South India', 'North India']
    .map(region => [region, legacyPackages.filter(pkg => pkg.regionScope === region).length])),
  { 'Tamil Nadu': 80, 'South India': 60, 'North India': 80 });
  assert.ok(legacyPackages.every(pkg => !isPublicPackage(pkg)));
});

test('a draft or archived override hides its code-backed catalogue listing', () => {
  const original = packages[0];
  const override = { ...original, status: 'Draft', isActive: false };
  const merged = withOverrides([override]);
  assert.equal(merged.filter(pkg => pkg.packageId === original.packageId).length, 1);
  assert.equal(isPublicPackage(merged.find(pkg => pkg.packageId === original.packageId)), false);
});
