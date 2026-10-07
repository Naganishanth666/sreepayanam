const publicationProblems = pkg => {
  const problems = [];
  const text = value => typeof value === 'string' && value.trim().length > 0;
  const checkedDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '')
    && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && value <= new Date().toISOString().slice(0, 10);
  const days = Number(pkg.durationDays);
  if (!Array.isArray(pkg.catalogCategories) || !pkg.catalogCategories.length) problems.push('Choose at least one active catalogue category.');
  if (!['Tamil Nadu', 'South India', 'India-wide', 'Other'].includes(pkg.regionScope)) problems.push('Tag the route region.');
  if (!Array.isArray(pkg.hotelCategories) || !pkg.hotelCategories.length) problems.push('Choose the hotel categories available for this package.');
  if (!text(pkg.title) || !text(pkg.destination) || !text(pkg.startingCity) || !text(pkg.endingCity)) problems.push('Complete the title, destination and route start/end.');
  if (!Number.isInteger(days) || days < 1 || !Array.isArray(pkg.itinerary) || pkg.itinerary.length !== days
    || pkg.itinerary.some(day => !text(day.title) || !text(day.activities) || !text(day.hotel) || !text(day.mealPlan) || !text(day.transport))) {
    problems.push('Provide a complete day itinerary with stay, meals and travel mode for every day.');
  }
  if (!text(pkg.journeyTimeNotes) || !text(pkg.journeyDistanceNotes)) problems.push('Record approximate journey times and distances with their basis.');
  if (!Array.isArray(pkg.inclusions) || !pkg.inclusions.length || !Array.isArray(pkg.exclusions) || !pkg.exclusions.length || !text(pkg.mealPlan)) problems.push('Complete inclusions, exclusions and the meal plan.');
  if (!text(pkg.accessibilityNotes) || !text(pkg.seasonConstraints)) problems.push('Record accessibility or fitness guidance and seasonal constraints.');
  if (!text(pkg.termsAndConditions) || !text(pkg.cancellationPolicy)) problems.push('Complete payment/booking and cancellation terms.');
  if (!text(pkg.imageUrl) || !text(pkg.imageRightsNote)) problems.push('Record the image source and its usage rights.');
  if (!Array.isArray(pkg.destinationReferences) || !pkg.destinationReferences.length || pkg.destinationReferences.some(ref => !/^https:\/\//.test(ref.url || '') || !text(ref.sourceType) || !checkedDate(ref.lastChecked))) problems.push('Add checked HTTPS destination reference links with source type and a valid check date.');
  if (!text(pkg.contentReviewedBy) || !checkedDate(pkg.contentReviewedAt)) problems.push('Record the content reviewer and a valid last review date.');
  if (!text(pkg.uniquenessReviewedBy) || !checkedDate(pkg.uniquenessReviewedAt)) problems.push('Review route uniqueness and record the reviewer and date.');
  return problems;
};

module.exports = { publicationProblems };
