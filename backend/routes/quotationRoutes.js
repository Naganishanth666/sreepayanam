const express = require('express');
const crypto = require('crypto');
const { calculateCosting, HOTEL_RATES, VEHICLE_RATES, MEAL_RATES } = require('../utils/costingEngine');
const { checkAdmin } = require('../middleware/auth');

const router = express.Router();
const FIXED_MARKUP_PERCENT = 30;
const FIXED_TAX_PERCENT = 5;
const FIXED_BUFFER_PERCENT = 3;

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
      taxPercent: FIXED_TAX_PERCENT,
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
      tax: {
        label: `Estimated taxes (${FIXED_TAX_PERCENT}%)`,
        amount: costing.taxAmount
      },
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

module.exports = router;
