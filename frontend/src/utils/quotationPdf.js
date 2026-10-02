import { createStayDetails, createStaySummary } from './stayPlan.js';
import { buildStandardQuotationPdfBlob, buildStandardRouteBriefPdfBlob } from './standardQuotationPdf.js';

const clean = value => String(value ?? '').trim();
const positiveNumber = value => Math.max(0, Number(value) || 0);
const safeFilePart = value => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'custom-route';

const mapSearchUrl = (place, destination) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([place, destination].filter(Boolean).join(', '))}`;

const createUnpricedQuote = ({ form = {}, draft, selectedPackage, selectedDestinations = [] }) => {
  if (!draft) throw new Error('A route draft is required.');
  const days = Array.isArray(draft.itinerary) ? draft.itinerary : [];
  const durationDays = positiveNumber(draft.durationDays || form.durationDays) || days.length || 1;
  const durationNights = positiveNumber(draft.durationNights ?? form.durationNights ?? Math.max(durationDays - 1, 0));
  const destination = clean(draft.destination || form.destination || selectedPackage?.destination);
  const hotelRequest = createStaySummary({ ...form, destination }, durationNights);
  const children = positiveNumber(form.childWithBedCount) + positiveNumber(form.childNoBedCount);
  const places = [...new Set(selectedDestinations.map(clean).filter(Boolean))];
  const itinerary = days.map((day, index) => ({
    ...day,
    day: positiveNumber(day.day) || index + 1,
    places: Array.isArray(day.places) ? day.places.map(clean).filter(Boolean) : [],
    hotel: day.hotel?.name || day.hotel?.desc
      ? day.hotel
      : createStayDetails({ ...form, destination }, day, index, durationNights),
    meal: clean(day.meal) || `${clean(form.mealPlan) || 'Requested'} meal plan; ${clean(form.mealPreference) || 'food preference to confirm'}`,
    transit: clean(day.transit) || `${clean(form.vehicleType) || 'Local'} vehicle requested; journey time to confirm`
  }));
  const stayPlan = `Requested: ${hotelRequest}`;
  const included = [
    'Requested for review: day-by-day route planning for the selected places',
    ...(durationNights ? [stayPlan] : []),
    `Requested for review: ${clean(form.mealPlan) || 'selected'} meal plan and ${clean(form.vehicleType) || 'local'} transport`,
    ...(form.entryTickets === 'Yes' ? ['Entry tickets requested; availability to confirm'] : []),
    ...(form.guideRequired === 'Yes' ? ['Local guide requested; availability to confirm'] : [])
  ];
  const excluded = [
    'Supplier-confirmed properties, rooms, meals, vehicle and tickets until staff approval',
    'Personal expenses, unlisted meals, tips and insurance unless later confirmed',
    'Prices, tax and payment terms until an approved quotation is issued'
  ];
  const routeNotes = [
    clean(draft.planningReview?.summary),
    ...(draft.planningReview?.unplacedPlaces?.length ? [`Places needing route review: ${draft.planningReview.unplacedPlaces.join(', ')}`] : []),
    clean(form.notes)
  ].filter(Boolean).join(' | ');

  return {
    enquiryReference: clean(draft.planReference) || 'Pending enquiry reference',
    createdAt: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' }),
    customer: {
      name: clean(form.fullName),
      mobile: clean(form.mobileNumber),
      email: clean(form.email),
      adults: positiveNumber(form.adultCount) || 1,
      children,
      childAges: clean(form.childAges).split(',').map(age => age.trim()).filter(Boolean),
      infants: positiveNumber(form.infantCount),
      rooms: positiveNumber(form.hotelRooms) || null,
      preferredTier: clean(form.preferredTier),
      mealPreference: [form.mealPlan, form.mealPreference].map(clean).filter(Boolean).join(' / '),
      vehicleType: clean(form.vehicleType),
      accessibilityNeeds: clean(form.accessibilityNeeds),
      foodRestrictions: clean(form.foodRestrictions),
      visitTimingPreferences: clean(form.visitTimingPreferences)
    },
    route: {
      packageCategory: clean(selectedPackage?.category || 'Custom route'),
      packageName: clean(selectedPackage?.name || draft.title),
      title: clean(draft.title),
      destination,
      startingCity: clean(draft.startingCity || form.departureCity),
      endingCity: clean(draft.endingCity || form.returnCity),
      travelStartDate: clean(draft.travelStartDate || form.travelStartDate),
      returnDate: clean(draft.returnDate || form.returnDate),
      durationDays,
      durationNights,
      itinerary
    },
    hotelRequest,
    selectedPlaces: places,
    destinationReferences: places.map(name => ({
      name,
      url: mapSearchUrl(name, destination),
      sourceType: 'Map search; staff verification pending',
      lastChecked: ''
    })),
    tiers: ['Economic', 'Deluxe', 'Premium'].map(name => ({
      name,
      accommodation: `${stayPlan}\nProperty and room type for ${name} to be set by staff`,
      transport: `${clean(form.vehicleType) || 'Local vehicle'} requested; supplier to confirm`,
      meals: `${clean(form.mealPlan) || 'Meal plan'} requested; supplier to confirm`
    })),
    terms: {
      inclusions: included,
      exclusions: excluded,
      specialNotes: routeNotes || 'Travel-desk route and timing review pending',
      routeReviewNote: clean(draft.planningReview?.summary)
    }
  };
};

export const buildRouteBriefPdfBlob = input => buildStandardRouteBriefPdfBlob(createUnpricedQuote(input));

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const downloadQuotationPdf = async input => {
  if (!input.draft) return false;
  await document.fonts?.ready;
  downloadBlob(await buildRouteBriefPdfBlob(input),
    `SreePayanam_Standard_Format_Route_Draft_${safeFilePart(input.selectedPackage?.name || input.draft.destination)}_${safeFilePart(input.draft.planReference || 'draft')}.pdf`);
  return true;
};

export const buildApprovedQuotationPdfBlob = quote => buildStandardQuotationPdfBlob(quote);

export const downloadApprovedQuotationPdf = async quote => {
  await document.fonts?.ready;
  downloadBlob(await buildApprovedQuotationPdfBlob(quote),
    `SreePayanam_Quotation_${clean(quote.reference).replace(/[^a-zA-Z0-9-]/g, '')}.pdf`);
  return true;
};
