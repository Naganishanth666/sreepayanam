const publicationProblems = pkg => {
  const problems = [];
  const text = value => typeof value === 'string' && value.trim().length > 0;
  const checkedDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '')
    && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && value <= new Date().toISOString().slice(0, 10);
  const forbidden = value => !['National', 'International', 'National Tours', 'International Tours'].includes(String(value || '').trim())
    && /national|pilgrim|festival|cultur|irctc|temple|church|mosque|relig|hajj|umrah/i.test(String(value || ''));
  const days = Number(pkg.durationDays);
  if (!Array.isArray(pkg.catalogCategories) || !pkg.catalogCategories.length) problems.push('Choose at least one active catalogue category.');
  if (!['Domestic', 'International'].includes(pkg.packageCategory) || pkg.packageCategory === 'National' || forbidden(pkg.tourType)
    || !Array.isArray(pkg.catalogCategories) || pkg.catalogCategories.length !== 1
    || pkg.catalogCategories.some(forbidden)) problems.push('Choose exactly one permitted non-pilgrimage, non-cultural leisure category.');
  if (!['Tamil Nadu', 'South India', 'North India', 'West India', 'Northeast India', 'Islands', 'India-wide', 'Other'].includes(pkg.regionScope)) problems.push('Tag the route region.');
  if (!Array.isArray(pkg.destinationStates) || !pkg.destinationStates.length) problems.push('List every state or territory visited.');
  if ((pkg.regionScope === 'Tamil Nadu' || pkg.destinationStates?.includes('Tamil Nadu')) && (!Array.isArray(pkg.destinationStates)
    || pkg.destinationStates.length !== 1 || pkg.destinationStates[0] !== 'Tamil Nadu')) {
    problems.push('Tamil Nadu packages may include destinations only within Tamil Nadu.');
  }
  if (!Array.isArray(pkg.locationTags) || !pkg.locationTags.length) problems.push('Tag every named destination and stop so route overlap can be reviewed.');
  if (!Array.isArray(pkg.hotelCategories) || !pkg.hotelCategories.length) problems.push('Choose the hotel categories available for this package.');
  if (!text(pkg.title) || !text(pkg.destination) || !text(pkg.startingCity) || !text(pkg.endingCity)) problems.push('Complete the title, destination and route start/end.');
  if (!Number.isInteger(days) || days < 1 || !Array.isArray(pkg.itinerary) || pkg.itinerary.length !== days
    || pkg.itinerary.some(day => !text(day.title) || !text(day.activities) || !text(day.hotel) || !text(day.mealPlan) || !text(day.transport))) {
    problems.push('Provide a complete day itinerary with stay, meals and travel mode for every day.');
  }
  if (!Array.isArray(pkg.itinerary) || pkg.itinerary.some(day => !Array.isArray(day.schedule) || !day.schedule.length
    || day.schedule.some((item, index) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time || '')
      || !text(item.title) || !text(item.description)
      || (index > 0 && item.time < day.schedule[index - 1].time))
    || !day.schedule.some(item => item.kind === 'visit' && text(item.place)
      && /^https:\/\//.test(item.sourceUrl || '')))) {
    problems.push('Add a chronologically timed programme and a named, source-linked visit with a location brief to every day.');
  }
  if (Array.isArray(pkg.itinerary) && pkg.itinerary.some(day => (day.schedule || []).some(item => item.kind === 'visit'
    && /pilgrim|temple|church|mosque|dargah|shrine|கோயில்|கோவில்|தேவாலயம்|மசூதி|தர்கா|யாத்திரை|मंदिर|चर्च|मस्जिद|दरगाह|तीर्थयात्रा/i.test(`${item.title || ''} ${item.place || ''}`)))) {
    problems.push('Religious and pilgrimage stops are outside the current leisure package catalogue.');
  }
  if (!text(pkg.journeyTimeNotes) || !text(pkg.journeyDistanceNotes)) problems.push('Record approximate journey times and distances with their basis.');
  if (!Array.isArray(pkg.inclusions) || !pkg.inclusions.length || !Array.isArray(pkg.exclusions) || !pkg.exclusions.length || !text(pkg.mealPlan)) problems.push('Complete inclusions, exclusions and the meal plan.');
  if (!/daily breakfast included/i.test(pkg.mealPlan || '')
    || !Array.isArray(pkg.inclusions) || !pkg.inclusions.some(item => /daily breakfast included/i.test(item))
    || !Array.isArray(pkg.exclusions) || !pkg.exclusions.some(item => /\blunch\b/i.test(item))
    || !pkg.exclusions.some(item => /\bdinner\b/i.test(item))
    || pkg.inclusions?.some(item => /\b(?:lunch|dinner)\b|மதிய உணவு|இரவு உணவு|दोपहर का भोजन|रात का भोजन/i.test(item))
    || /breakfast\s*(?:\+|&|and)\s*(?:lunch|dinner)|lunch\s*(?:\+|&|and)\s*dinner/i.test(pkg.mealPlan || '')) {
    problems.push('Use Breakfast Only and explicitly state “Daily Breakfast Included”; exclude all other meals.');
  }
  for (const language of ['en', 'ta', 'hi']) {
    const translation = pkg.translations?.[language];
    if (!translation || !['title', 'destination', 'overview', 'catalogCategory', 'tourType', 'bestTimeToVisit', 'expectedWeather', 'vehiclePlan', 'mealPlan', 'termsAndConditions', 'cancellationPolicy']
      .every(field => text(translation[field]))
      || !Array.isArray(translation.importantBookingInfo) || !translation.importantBookingInfo.length
      || !Array.isArray(translation.itinerary) || translation.itinerary.length !== days
      || translation.itinerary.some(day => !Array.isArray(day.schedule) || !day.schedule.length
        || !day.schedule.some(item => item.kind === 'visit' && text(item.place) && text(item.description)))
      || !Array.isArray(translation.inclusions) || !translation.inclusions.length
      || !Array.isArray(translation.exclusions) || !translation.exclusions.length) {
      problems.push(`Complete the itinerary, inclusions, exclusions, weather, booking information and package text in ${language === 'en' ? 'English' : language === 'ta' ? 'Tamil' : 'Hindi'}.`);
    } else {
      const breakfastOnlyLabel = language === 'en' ? /breakfast only/i.test(translation.mealPlan)
        : language === 'ta' ? /காலை உணவு மட்டும்/.test(translation.mealPlan)
          : /केवल नाश्ता/.test(translation.mealPlan);
      const lunchDinnerExcluded = language === 'en'
        ? translation.exclusions.some(item => /\blunch\b/i.test(item)) && translation.exclusions.some(item => /\bdinner\b/i.test(item))
        : language === 'ta' ? translation.exclusions.some(item => /மதிய உணவு/.test(item)) && translation.exclusions.some(item => /இரவு உணவு/.test(item))
          : translation.exclusions.some(item => /दोपहर का भोजन/.test(item)) && translation.exclusions.some(item => /रात का भोजन/.test(item));
      if (!breakfastOnlyLabel || !lunchDinnerExcluded || translation.inclusions.some(item => /\b(?:lunch|dinner)\b|மதிய உணவு|இரவு உணவு|दोपहर का भोजन|रात का भोजन/i.test(item))) {
        problems.push(`Use Breakfast Only and exclude lunch and dinner in the ${language === 'en' ? 'English' : language === 'ta' ? 'Tamil' : 'Hindi'} package content.`);
      }
    }
  }
  if (!text(pkg.bestTimeToVisit) || !text(pkg.expectedWeather)) problems.push('Record the best travel season and typical peak-season temperatures.');
  if (!text(pkg.vehiclePlan)) problems.push('Describe the included vehicle and transfer plan.');
  if (!Array.isArray(pkg.importantBookingInfo) || !pkg.importantBookingInfo.length) problems.push('Add booking notes for check-in, access, tickets, permits or required gear.');
  if (!text(pkg.accessibilityNotes) || !text(pkg.seasonConstraints)) problems.push('Record accessibility or fitness guidance and seasonal constraints.');
  if (!text(pkg.termsAndConditions) || !text(pkg.cancellationPolicy)) problems.push('Complete payment/booking and cancellation terms.');
  if (!text(pkg.imageUrl) || !text(pkg.imageRightsNote)) problems.push('Record the image source and its usage rights.');
  if (!Array.isArray(pkg.destinationReferences) || !pkg.destinationReferences.length || pkg.destinationReferences.some(ref => !/^https:\/\//.test(ref.url || '') || !text(ref.sourceType) || !checkedDate(ref.lastChecked))) problems.push('Add checked HTTPS destination reference links with source type and a valid check date.');
  if (!text(pkg.contentReviewedBy) || !checkedDate(pkg.contentReviewedAt)) problems.push('Record the content reviewer and a valid last review date.');
  if (!text(pkg.uniquenessReviewedBy) || !checkedDate(pkg.uniquenessReviewedAt)) problems.push('Review route uniqueness and record the reviewer and date.');
  return problems;
};

module.exports = { publicationProblems };
