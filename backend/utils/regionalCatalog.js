const { packages: legacyPilgrimagePackages, byId: legacyPilgrimageById } = require('../data/curatedRegionalCatalog');
const { packages: leisurePackages } = require('../data/curatedCatalogExpansion');

// Keep the former pilgrimage records available to authenticated editors while
// replacing them in the public catalogue with the commissioned leisure set.
const packages = [...leisurePackages, ...legacyPilgrimagePackages];
const byId = new Map([...leisurePackages, ...legacyPilgrimagePackages].map(pkg => [pkg.packageId, pkg]));
const forbiddenLabel = value => {
  const label = String(value || '').trim();
  return !['National', 'International', 'National Tours', 'International Tours'].includes(label)
    && /national|pilgrim|festival|cultur|irctc|temple|church|mosque|relig|hajj|umrah/i.test(label);
};
const allowedTourTypes = new Set([
  'Honeymoon Tours', 'Family Tours', 'Wildlife & Nature Tours', 'Adventure & Trekking Tours',
  'Hill Station & Leisure Tours', 'Beach & Coastal Tours', 'Luxury & Wellness Tours',
  'Corporate / MICE Tours', 'Budget Weekend Getaways', 'National Tours', 'International Tours'
]);
const hasLeisureClassification = pkg => ['Domestic', 'International'].includes(pkg.packageCategory)
  && allowedTourTypes.has(pkg.tourType)
  && Array.isArray(pkg.catalogCategories) && pkg.catalogCategories.length === 1
  && !forbiddenLabel(pkg.tourType)
  && pkg.catalogCategories.every(category => !forbiddenLabel(category));
const hasCompleteTranslations = pkg => ['en', 'ta', 'hi'].every(language => {
  const translation = pkg.translations?.[language];
  return translation && ['title', 'destination', 'overview', 'catalogCategory', 'tourType', 'bestTimeToVisit', 'expectedWeather', 'vehiclePlan', 'mealPlan', 'termsAndConditions', 'cancellationPolicy']
    .every(field => typeof translation[field] === 'string' && translation[field].trim())
    && Array.isArray(translation.importantBookingInfo) && translation.importantBookingInfo.length
    && Array.isArray(translation.inclusions) && translation.inclusions.length
    && Array.isArray(translation.exclusions) && translation.exclusions.length
    && Array.isArray(translation.itinerary) && translation.itinerary.length === Number(pkg.durationDays)
    && translation.itinerary.every(day => Array.isArray(day.schedule) && day.schedule.length
      && day.schedule.every((item, index) => /^([01]\d|2[0-3]):[0-5]\d$/.test(item.time || '')
        && String(item.title || '').trim() && String(item.description || '').trim()
        && (!index || item.time >= day.schedule[index - 1].time))
      && day.schedule.some(item => item.kind === 'visit' && String(item.place || '').trim()));
});
const hasBreakfastOnlyPlan = pkg => /daily breakfast included/i.test(pkg.mealPlan || '')
  && !/breakfast\s*(?:\+|&|and)\s*(?:lunch|dinner)|lunch\s*(?:\+|&|and)\s*dinner/i.test(pkg.mealPlan || '')
  && Array.isArray(pkg.inclusions) && pkg.inclusions.some(item => /daily breakfast included/i.test(item))
  && !pkg.inclusions.some(item => /\b(?:lunch|dinner)\b|மதிய உணவு|இரவு உணவு|दोपहर का भोजन|रात का भोजन/i.test(item))
  && Array.isArray(pkg.exclusions) && pkg.exclusions.some(item => /\bLunch\b/i.test(item))
  && pkg.exclusions.some(item => /\bDinner\b/i.test(item))
  && ['en', 'ta', 'hi'].every(language => {
    const translation = pkg.translations?.[language];
    if (!translation?.mealPlan || !Array.isArray(translation.inclusions) || !Array.isArray(translation.exclusions)) return false;
    const breakfastOnlyLabel = language === 'en' ? /breakfast only/i.test(translation.mealPlan)
      : language === 'ta' ? /காலை உணவு மட்டும்/.test(translation.mealPlan)
        : /केवल नाश्ता/.test(translation.mealPlan);
    const excludesLunchDinner = language === 'en'
      ? translation.exclusions.some(item => /\blunch\b/i.test(item)) && translation.exclusions.some(item => /\bdinner\b/i.test(item))
      : language === 'ta' ? translation.exclusions.some(item => /மதிய உணவு/.test(item)) && translation.exclusions.some(item => /இரவு உணவு/.test(item))
        : translation.exclusions.some(item => /दोपहर का भोजन/.test(item)) && translation.exclusions.some(item => /रात का भोजन/.test(item));
    return breakfastOnlyLabel && excludesLunchDinner
      && !translation.inclusions.some(item => /\b(?:lunch|dinner)\b|மதிய உணவு|இரவு உணவு|दोपहर का भोजन|रात का भोजन/i.test(item));
  });
const hasAllowedGeography = pkg => Array.isArray(pkg.destinationStates) && pkg.destinationStates.length > 0
  && (!pkg.destinationStates.includes('Tamil Nadu')
    || (pkg.regionScope === 'Tamil Nadu' && pkg.destinationStates.length === 1));

const hasNoReligiousVisitStops = pkg => (pkg.itinerary || []).every(day => (day.schedule || []).every(item =>
  item.kind !== 'visit' || !/pilgrim|temple|church|mosque|dargah|shrine|கோயில்|கோவில்|தேவாலயம்|மசூதி|தர்கா|யாத்திரை|मंदिर|चर्च|मस्जिद|दरगाह|तीर्थयात्रा/i.test(`${item.title || ''} ${item.place || ''}`)));

const hasTimedVisitEachDay = pkg => Number.isInteger(Number(pkg?.durationDays))
  && Array.isArray(pkg?.itinerary) && pkg.itinerary.length === Number(pkg.durationDays)
  && pkg.itinerary.every(day => Array.isArray(day.schedule) && day.schedule.length
    && day.schedule.every((item, index) => /^([01]\d|2[0-3]):[0-5]\d$/.test(item.time || '')
      && String(item.title || '').trim() && String(item.description || '').trim()
      && (!index || item.time >= day.schedule[index - 1].time))
    && day.schedule.some(item => item.kind === 'visit' && String(item.place || '').trim()
      && /^https:\/\//.test(item.sourceUrl || '')));

const isPublicPackage = (pkg, now = new Date()) => Boolean(pkg && pkg.isActive
  && ['Approved', 'Published'].includes(pkg.status)
  && hasLeisureClassification(pkg)
  && hasCompleteTranslations(pkg)
  && hasBreakfastOnlyPlan(pkg)
  && hasAllowedGeography(pkg)
  && hasNoReligiousVisitStops(pkg)
  && Array.isArray(pkg.locationTags) && pkg.locationTags.length
  && (!pkg.seasonStart || new Date(pkg.seasonStart) <= now)
  && (!pkg.seasonEnd || new Date(pkg.seasonEnd) >= now)
  && hasTimedVisitEachDay(pkg));

const withOverrides = databasePackages => {
  const overridden = new Set(databasePackages.map(pkg => pkg.packageId));
  return [...packages.filter(pkg => !overridden.has(pkg.packageId)), ...databasePackages];
};

module.exports = { packages, byId, legacyPilgrimagePackages, legacyPilgrimageById,
  leisurePackages, hasTimedVisitEachDay, hasLeisureClassification, hasCompleteTranslations,
  hasBreakfastOnlyPlan, hasAllowedGeography, isPublicPackage, withOverrides };
