const express = require('express');
const crypto = require('crypto');
const { calculateCosting, HOTEL_RATES, VEHICLE_RATES, MEAL_RATES } = require('../utils/costingEngine');
const { checkAdmin, authAdmin } = require('../middleware/auth');
const Enquiry = require('../models/Enquiry');
const Quotation = require('../models/Quotation');
const User = require('../models/User');
const { BUFFER_PERCENT, MARKUP_PERCENT, priceTier } = require('../utils/quotationPricing');

const router = express.Router();
const FIXED_MARKUP_PERCENT = MARKUP_PERCENT;
const FIXED_BUFFER_PERCENT = BUFFER_PERCENT;

const numberInRange = (value, fallback, min, max) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, min), max);
};

const cleanText = (value, maxLength = 160) => {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, maxLength);
};

const createQuoteReference = () => {
  const date = new Date().toISOString().slice(0, 7).replace('-', '');
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `SP-Q-${date}-${suffix}`;
};

const buildPublicBreakdown = (costing) => {
  const categoryCosts = [
    { label: 'Stay planning', raw: costing.hotelCost },
    { label: 'Local transport', raw: costing.transportCost },
    { label: 'Meals', raw: costing.mealCost },
    { label: 'Sightseeing & activities', raw: costing.sightseeingCost + costing.activityCost },
    { label: 'Travel support', raw: costing.guideCost + costing.tollPermitParkingCost + costing.driverAllowance + costing.escortCost + costing.insuranceCost + costing.miscCost }
  ];
  const rawTotal = categoryCosts.reduce((sum, item) => sum + Math.max(Number(item.raw) || 0, 0), 0) || 1;
  let assigned = 0;
  return categoryCosts.map((item, index) => {
    const isLast = index === categoryCosts.length - 1;
    const amount = isLast
      ? Math.max(Math.round(costing.sellingPrice - assigned), 0)
      : Math.max(Math.round(costing.sellingPrice * ((Number(item.raw) || 0) / rawTotal)), 0);
    assigned += amount;
    return { label: item.label, amount };
  });
};

// Commercial pricing remains an internal/admin operation. The public planner
// requests a route draft instead and never receives costing fields.
router.post('/preview', checkAdmin, async (req, res) => {
  try {
    const body = req.body || {};
    const adultCount = numberInRange(body.adultCount, 2, 1, 50);
    const childWithBedCount = numberInRange(body.childWithBedCount, 0, 0, 30);
    const childNoBedCount = numberInRange(body.childNoBedCount, 0, 0, 30);
    const infantCount = numberInRange(body.infantCount, 0, 0, 20);
    const durationDays = numberInRange(body.durationDays, 5, 1, 60);
    const durationNights = numberInRange(body.durationNights, Math.max(durationDays - 1, 0), 0, 59);
    const hotelCategory = Object.prototype.hasOwnProperty.call(HOTEL_RATES, body.hotelCategory)
      ? body.hotelCategory
      : '3 Star';
    const vehicleType = Object.prototype.hasOwnProperty.call(VEHICLE_RATES, body.vehicleType)
      ? body.vehicleType
      : undefined;
    const mealPlan = Object.prototype.hasOwnProperty.call(MEAL_RATES, body.mealPlan)
      ? body.mealPlan
      : 'MAP';

    // The server intentionally ignores client markup, tax, discount and raw
    // price fields. They are commercial controls, not customer input.
    const costing = calculateCosting({
      adultCount,
      childWithBedCount,
      childNoBedCount,
      infantCount,
      durationDays,
      durationNights,
      hotelCategory,
      hotelRooms: numberInRange(body.hotelRooms, undefined, 0, 30),
      hotelExtraBeds: numberInRange(body.hotelExtraBeds, undefined, 0, 30),
      vehicleType,
      vehicleDailyRate: numberInRange(body.vehicleDailyRate, undefined, 0, 100000),
      vehicleDays: numberInRange(body.vehicleDays, durationDays, 1, 60),
      vehicleKm: numberInRange(body.vehicleKm, 0, 0, 10000),
      vehicleRatePerKm: numberInRange(body.vehicleRatePerKm, 15, 0, 1000),
      vehicleNightCharges: numberInRange(body.vehicleNightCharges, 0, 0, 100000),
      vehicleCalculationMode: body.vehicleCalculationMode === 'KM' ? 'KM' : 'Daily',
      mealPlan,
      mealPlanRate: numberInRange(body.mealPlanRate, undefined, 0, 10000),
      mealNights: numberInRange(body.mealNights, durationNights, 0, 60),
      sightseeingCostPerPax: numberInRange(body.sightseeingCostPerPax, 500, 0, 100000),
      activityCostPerPax: numberInRange(body.activityCostPerPax, 500, 0, 100000),
      guideCostPerDay: numberInRange(body.guideCostPerDay, 0, 0, 100000),
      tollPermitParkingCost: numberInRange(body.tollPermitParkingCost, 1500, 0, 1000000),
      driverAllowancePerDay: numberInRange(body.driverAllowancePerDay, 500, 0, 100000),
      escortCostPerDay: numberInRange(body.escortCostPerDay, 0, 0, 100000),
      insuranceCostPerPax: numberInRange(body.insuranceCostPerPax, 200, 0, 100000),
      miscCost: numberInRange(body.miscCost, 0, 0, 1000000),
      bufferPercent: FIXED_BUFFER_PERCENT,
      markupPercent: FIXED_MARKUP_PERCENT,
      taxPercent: 0,
      discountPercent: 0,
      discountAmount: 0,
      discountType: 'Percentage'
    });

    const selectedDestinations = Array.isArray(body.selectedDestinations)
      ? body.selectedDestinations.filter(item => typeof item === 'string').slice(0, 40).map(item => cleanText(item, 140))
      : [];
    const quote = {
      quoteReference: createQuoteReference(),
      issuedAt: new Date().toISOString(),
      currency: 'INR',
      packageId: cleanText(body.packageId, 80),
      packageName: cleanText(body.packageName, 160),
      durationDays,
      durationNights,
      travellers: { adultCount, childCount: childWithBedCount + childNoBedCount, infantCount },
      selectedDestinationCount: selectedDestinations.length,
      subtotal: costing.sellingPrice,
      tax: { label: 'GST extra/as applicable after accountant review', amount: null },
      customerPrice: costing.customerPrice,
      breakdown: buildPublicBreakdown(costing),
      paymentNote: 'Advance and balance-payment timing will be confirmed in the final booking confirmation.',
      validityDays: 7,
      disclaimer: 'Estimate subject to availability, seasonality, supplier confirmation and final quotation.'
    };

    res.json({ quote });
  } catch (error) {
    console.error('[QuotationRoute] Preview failed:', error.message);
    res.status(400).json({ message: 'We could not calculate this estimate. Check the trip details and try again.' });
  }
});

const dateOnly = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day ? value : '';
};

const todayInIndia = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' });

const cleanLines = value => (Array.isArray(value) ? value : String(value || '').split('\n'))
  .map(item => cleanText(item, 320)).filter(Boolean).slice(0, 20);

const safeUrl = value => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && url.href.length <= 700 ? url.href : '';
  } catch {
    return '';
  }
};

const dateFromEnquiry = value => value instanceof Date && !Number.isNaN(value.getTime())
  ? value.toISOString().slice(0, 10) : '';

const routeFromEnquiry = enquiry => {
  const source = enquiry.detailedPreferences?.routeDraft;
  if (!source || !Array.isArray(source.itinerary) || !source.itinerary.length) return null;
  return {
    planReference: cleanText(source.planReference || enquiry.quoteReference, 80),
    title: cleanText(source.title, 160),
    destination: cleanText(source.destination || enquiry.toLocation, 180),
    startingCity: cleanText(source.startingCity || enquiry.fromLocation, 160),
    endingCity: cleanText(source.endingCity || enquiry.toLocation, 160),
    travelStartDate: dateOnly(source.travelStartDate) || dateFromEnquiry(enquiry.travelDate),
    returnDate: dateOnly(source.returnDate) || dateFromEnquiry(enquiry.returnDate),
    durationDays: numberInRange(source.durationDays, 1, 1, 60),
    durationNights: numberInRange(source.durationNights, 0, 0, 59),
    overview: cleanText(source.overview, 1200),
    planningReview: {
      status: ['workable', 'tight', 'not_feasible'].includes(source.planningReview?.status) ? source.planningReview.status : 'tight',
      summary: cleanText(source.planningReview?.summary, 700),
      unplacedPlaces: cleanLines(source.planningReview?.unplacedPlaces)
    },
    itinerary: source.itinerary.slice(0, 60).map((day, index) => ({
      day: index + 1,
      title: cleanText(day?.title, 120),
      base: cleanText(day?.base, 120),
      places: cleanLines(day?.places).slice(0, 10),
      activities: cleanText(day?.activities, 1200),
      transit: cleanText(day?.transit, 700),
      meal: cleanText(day?.meal, 700),
      hotel: {
        name: cleanText(day?.hotel?.name, 160),
        rating: cleanText(day?.hotel?.rating, 80),
        desc: cleanText(day?.hotel?.desc, 400)
      }
    }))
  };
};

const editedRouteFromInput = (enquiry, requested, selectedPlaces) => {
  const route = routeFromEnquiry(enquiry);
  if (!route) return null;
  const days = Array.isArray(requested?.itinerary) ? requested.itinerary : [];
  route.itinerary = route.itinerary.map((day, index) => {
    const input = days[index] || {};
    const hotel = input.hotel && typeof input.hotel === 'object' ? input.hotel : {};
    return {
      ...day,
      title: cleanText(input.title ?? day.title, 120),
      base: cleanText(input.base ?? day.base, 120),
      places: cleanLines(input.places ?? day.places).slice(0, 10),
      activities: cleanText(input.activities ?? day.activities, 1200),
      transit: cleanText(input.transit ?? day.transit, 700),
      meal: cleanText(input.meal ?? day.meal, 700),
      hotel: {
        name: cleanText(hotel.name ?? day.hotel.name, 160),
        rating: cleanText(hotel.rating ?? day.hotel.rating, 80),
        desc: cleanText(hotel.desc ?? day.hotel.desc, 400)
      }
    };
  });
  const planned = new Set(route.itinerary.flatMap(day => day.places).map(name => name.toLowerCase()));
  route.planningReview.unplacedPlaces = selectedPlaces.filter(name => !planned.has(name.toLowerCase()));
  if (route.planningReview.unplacedPlaces.length && route.planningReview.status === 'workable') route.planningReview.status = 'tight';
  return route;
};

const quotationInput = (body, enquiry, existing) => {
  const selectedPlaces = [...new Map((enquiry.selectedDestinations || [])
    .map(name => cleanText(name, 160)).filter(Boolean)
    .map(name => [name.toLowerCase(), name])).values()].slice(0, 40);
  const inputReferences = Array.isArray(body.destinationReferences) ? body.destinationReferences : [];
  const inputTiers = Array.isArray(body.tiers) ? body.tiers : [];
  const names = ['Economic', 'Deluxe', 'Premium'];
  const passengerCount = Math.max(1, Number(enquiry.adultCount || 0) + Number(enquiry.childCount || 0));
  return {
    enquiryReference: cleanText(enquiry.quoteReference || String(enquiry._id), 80),
    customer: {
      name: cleanText(enquiry.customerName, 120),
      email: cleanText(enquiry.emailId, 160),
      mobile: cleanText(enquiry.mobileNumber, 24),
      adults: Number(enquiry.adultCount) || 1,
      children: Number(enquiry.childCount) || 0,
      passengers: passengerCount
    },
    route: editedRouteFromInput(enquiry, body.route, selectedPlaces),
    selectedPlaces,
    destinationReferences: selectedPlaces.map(name => {
      const input = inputReferences.find(item => String(item?.name || '').trim().toLowerCase() === name.toLowerCase()) || {};
      return {
        name,
        url: safeUrl(input.url),
        sourceType: ['Official', 'Tourism board', 'Government', 'Maps', 'Third party'].includes(input.sourceType) ? input.sourceType : '',
        lastChecked: dateOnly(input.lastChecked)
      };
    }),
    tiers: names.map(name => {
      const input = inputTiers.find(item => item?.name === name) || {};
      const directCost = numberInRange(input.directCost, 0, 0, 100000000);
      return {
        name,
        directCost,
        sourceReference: cleanText(input.sourceReference, 300),
        sourceCheckedAt: dateOnly(input.sourceCheckedAt),
        accommodation: cleanText(input.accommodation, 240),
        transport: cleanText(input.transport, 240),
        meals: cleanText(input.meals, 240),
        activities: cleanText(input.activities, 240),
        price: priceTier(directCost, passengerCount)
      };
    }),
    terms: {
      validUntil: dateOnly(body.terms?.validUntil),
      taxNote: cleanText(body.terms?.taxNote, 500),
      paymentSchedule: cleanText(body.terms?.paymentSchedule, 800),
      cancellationTerms: cleanText(body.terms?.cancellationTerms, 1200),
      assumptions: cleanText(body.terms?.assumptions, 1200),
      inclusions: cleanLines(body.terms?.inclusions),
      exclusions: cleanLines(body.terms?.exclusions),
      routeReviewNote: cleanText(body.terms?.routeReviewNote, 800)
    },
    pricingRule: { bufferPercent: BUFFER_PERCENT, markupPercent: MARKUP_PERCENT },
    updatedAt: new Date(),
    reference: existing?.reference,
    version: existing?.version
  };
};

const approvalProblems = quote => {
  const problems = [];
  const today = todayInIndia();
  if (!quote.route?.itinerary?.length) problems.push('The day-by-day route is missing.');
  if (quote.route?.itinerary?.some(day => !day.title || !day.activities)) problems.push('Each day needs a title and a reviewed plan.');
  if (!quote.selectedPlaces?.length) problems.push('The selected-place list is missing.');
  if (quote.destinationReferences?.length !== quote.selectedPlaces?.length) problems.push('Each selected place needs its own detail reference.');
  for (const reference of quote.destinationReferences || []) {
    if (!reference.url || !reference.sourceType || !reference.lastChecked) problems.push(`Add a checked detail reference for ${reference.name}.`);
    if (reference.lastChecked > today) problems.push(`The check date for ${reference.name} cannot be in the future.`);
  }
  if (quote.tiers?.length !== 3) problems.push('All three quotation tiers are required.');
  for (const tier of quote.tiers || []) {
    if (!tier.price?.total || !tier.sourceReference || !tier.sourceCheckedAt || !tier.accommodation || !tier.transport || !tier.meals) {
      problems.push(`Complete the verified cost source and scope for ${tier.name}.`);
    }
    if (tier.sourceCheckedAt > today) problems.push(`The supplier source date for ${tier.name} cannot be in the future.`);
  }
  const terms = quote.terms || {};
  if (!terms.validUntil || !terms.taxNote || !terms.paymentSchedule || !terms.cancellationTerms || !terms.assumptions || !terms.inclusions?.length || !terms.exclusions?.length) {
    problems.push('Complete validity, accountant-approved tax wording, payment and cancellation terms, assumptions, inclusions and exclusions.');
  }
  if (terms.validUntil && terms.validUntil < today) problems.push('The price validity date has passed.');
  if (!terms.routeReviewNote) problems.push('Record the travel-desk review of route timing and selected places.');
  return problems;
};

// A quote is created only from a saved enquiry route. The staff console may
// prepare drafts; approval freezes a version and unlocks its download data.
router.get('/enquiry/:enquiryId', checkAdmin, async (req, res) => {
  try {
    const quotes = await Quotation.find({ enquiry: req.params.enquiryId }).sort({ version: -1 }).lean();
    res.json({ quotes });
  } catch {
    res.status(400).json({ message: 'Could not load quotations for this enquiry.' });
  }
});

router.put('/enquiry/:enquiryId/draft', checkAdmin, async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.enquiryId);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found.' });
    if (!routeFromEnquiry(enquiry)) return res.status(409).json({ message: 'This enquiry has no saved day-by-day route. Ask the customer to resubmit its route brief.' });
    let quote = await Quotation.findOne({ enquiry: enquiry._id, status: 'Draft' });
    if (!quote) {
      const latest = await Quotation.findOne({ enquiry: enquiry._id }).sort({ version: -1 }).select('version');
      quote = new Quotation({
        enquiry: enquiry._id,
        reference: createQuoteReference(),
        version: (latest?.version || 0) + 1,
        status: 'Draft'
      });
    }
    quote.set(quotationInput(req.body || {}, enquiry, quote));
    await quote.save();
    res.json({ quote });
  } catch (error) {
    console.error('[QuotationRoute] Save failed:', error.message);
    res.status(400).json({ message: 'Could not save the quotation draft. Check the fields and try again.' });
  }
});

router.post('/:id/approve', authAdmin, async (req, res) => {
  try {
    const approver = await User.findById(req.user.id).select('fullName role');
    if (!approver || approver.role !== 'Admin') return res.status(403).json({ message: 'A current named Admin account is required to approve quotations.' });
    const quote = await Quotation.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: 'Quotation not found.' });
    if (quote.status !== 'Draft') return res.status(409).json({ message: 'This quotation is already approved and locked.' });
    const problems = approvalProblems(quote);
    if (problems.length) return res.status(422).json({ message: 'Complete the quotation before approval.', problems });
    const note = cleanText(req.body?.note, 800);
    if (!note || req.body?.verifiedSources !== true) {
      return res.status(422).json({ message: 'Enter a review note and confirm the supplier sources were verified.' });
    }
    const updated = await Quotation.findOneAndUpdate(
      { _id: quote._id, status: 'Draft' },
      { $set: {
        status: 'Approved',
        approval: {
          actor: String(approver._id),
          displayName: approver.fullName,
          method: 'Admin account',
          note,
          at: new Date()
        },
        updatedAt: new Date()
      } },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(409).json({ message: 'This quotation was changed by another administrator.' });
    res.json({ quote: updated });
  } catch (error) {
    console.error('[QuotationRoute] Approval failed:', error.message);
    res.status(400).json({ message: 'Could not approve this quotation.' });
  }
});

router.get('/:id/download-data', checkAdmin, async (req, res) => {
  try {
    const quote = await Quotation.findById(req.params.id).lean();
    if (!quote) return res.status(404).json({ message: 'Quotation not found.' });
    if (quote.status !== 'Approved') return res.status(403).json({ message: 'Only approved quotations can be downloaded.' });
    res.json({ quote: {
      reference: quote.reference,
      version: quote.version,
      status: quote.status,
      enquiryReference: quote.enquiryReference,
      customer: quote.customer,
      route: quote.route,
      selectedPlaces: quote.selectedPlaces,
      destinationReferences: quote.destinationReferences,
      tiers: quote.tiers.map(({ name, price, sourceCheckedAt, accommodation, transport, meals, activities }) => ({
        name, price, sourceCheckedAt, accommodation, transport, meals, activities
      })),
      terms: quote.terms,
      approvedAt: quote.approval.at,
      approvedBy: quote.approval.displayName
    } });
  } catch {
    res.status(400).json({ message: 'Could not prepare the approved quotation.' });
  }
});

module.exports = router;
