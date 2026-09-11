const HOTEL_RATES = {
  'Budget': { room: 1500, extraBed: 500, cnb: 150 },
  '3 Star': { room: 3000, extraBed: 1000, cnb: 300 },
  '4 Star': { room: 6000, extraBed: 2000, cnb: 600 },
  '5 Star': { room: 12000, extraBed: 4000, cnb: 1200 }
};

const VEHICLE_RATES = {
  'Sedan': 2000,
  'Ertiga': 2500,
  'Innova': 3500,
  'Tempo Traveller': 5500,
  'Mini Coach': 8000,
  'Coach': 12000,
  'Multiple Coaches': 20000
};

const MEAL_RATES = {
  'EP': 0,
  'CP': 200,
  'MAP': 600,
  'AP': 1000
};

function allocateRooms(adults) {
  if (!adults || adults <= 0) return { rooms: 0, extraBeds: 0 };
  if (adults === 1) return { rooms: 1, extraBeds: 0 };
  if (adults % 2 === 0) {
    return { rooms: adults / 2, extraBeds: 0 };
  } else {
    return { rooms: Math.floor(adults / 2), extraBeds: 1 };
  }
}

function allocateVehicle(pax) {
  if (!pax || pax <= 0) return 'Sedan';
  if (pax <= 2) return 'Sedan';
  if (pax <= 4) return 'Ertiga';
  if (pax <= 6) return 'Innova';
  if (pax <= 12) return 'Tempo Traveller';
  if (pax <= 20) return 'Mini Coach';
  if (pax <= 35) return 'Coach';
  return 'Multiple Coaches';
}

function calculateCosting(params) {
  const adultCount = Number(params.adultCount) || 2;
  const childWithBedCount = Number(params.childWithBedCount) || 0;
  const childNoBedCount = Number(params.childNoBedCount) || 0;
  const childCount = childWithBedCount + childNoBedCount;
  const infantCount = Number(params.infantCount) || 0;
  const paxCount = adultCount + childCount;

  const durationDays = Number(params.durationDays) || 1;
  const durationNights = Number(params.durationNights) || (durationDays - 1 || 1);

  const hotelCategory = params.hotelCategory || '3 Star';
  const hotelDefault = HOTEL_RATES[hotelCategory] || HOTEL_RATES['3 Star'];
  
  const adultAlloc = allocateRooms(adultCount);
  const rooms = params.hotelRooms !== undefined && params.hotelRooms !== null && params.hotelRooms !== '' 
    ? Number(params.hotelRooms) 
    : adultAlloc.rooms;
  
  const adultExtraBeds = adultAlloc.extraBeds;
  const extraBeds = params.hotelExtraBeds !== undefined && params.hotelExtraBeds !== null && params.hotelExtraBeds !== '' 
    ? Number(params.hotelExtraBeds) 
    : (adultExtraBeds + childWithBedCount);

  const hotelRoomRate = params.hotelRoomRate !== undefined && params.hotelRoomRate !== null && params.hotelRoomRate !== ''
    ? Number(params.hotelRoomRate)
    : hotelDefault.room;
  
  const hotelExtraBedRate = params.hotelExtraBedRate !== undefined && params.hotelExtraBedRate !== null && params.hotelExtraBedRate !== ''
    ? Number(params.hotelExtraBedRate)
    : hotelDefault.extraBed;

  const hotelCnbRate = params.hotelCnbRate !== undefined && params.hotelCnbRate !== null && params.hotelCnbRate !== ''
    ? Number(params.hotelCnbRate)
    : hotelDefault.cnb;

  const hotelCost = (rooms * hotelRoomRate * durationNights) + 
                    (extraBeds * hotelExtraBedRate * durationNights) + 
                    (childNoBedCount * hotelCnbRate * durationNights);

  const autoVehicle = allocateVehicle(paxCount);
  const vehicleType = params.vehicleType || autoVehicle;
  const vehicleDefaultRate = VEHICLE_RATES[vehicleType] || VEHICLE_RATES['Sedan'];
  const vehicleDailyRate = params.vehicleDailyRate !== undefined && params.vehicleDailyRate !== null && params.vehicleDailyRate !== ''
    ? Number(params.vehicleDailyRate)
    : vehicleDefaultRate;
  
  const vehicleDays = params.vehicleDays !== undefined && params.vehicleDays !== null && params.vehicleDays !== ''
    ? Number(params.vehicleDays)
    : durationDays;
  
  const vehicleCalculationMode = params.vehicleCalculationMode || 'Daily';
  const transportCost = vehicleCalculationMode === 'Daily'
    ? vehicleDailyRate * vehicleDays
    : (Number(params.vehicleKm) || 0) * (Number(params.vehicleRatePerKm) || 15) + (Number(params.vehicleNightCharges) || 0);

  const mealPlan = params.mealPlan || 'MAP';
  let mealKey = 'MAP';
  if (mealPlan.includes('EP')) mealKey = 'EP';
  else if (mealPlan.includes('CP')) mealKey = 'CP';
  else if (mealPlan.includes('MAP')) mealKey = 'MAP';
  else if (mealPlan.includes('AP')) mealKey = 'AP';
  
  const mealPlanDefaultRate = MEAL_RATES[mealKey] || MEAL_RATES['MAP'];
  const mealPlanRate = params.mealPlanRate !== undefined && params.mealPlanRate !== null && params.mealPlanRate !== ''
    ? Number(params.mealPlanRate)
    : mealPlanDefaultRate;
  
  const mealNights = params.mealNights !== undefined && params.mealNights !== null && params.mealNights !== ''
    ? Number(params.mealNights)
    : durationNights;
  
  const mealCost = mealPlanRate * paxCount * mealNights;

  const sightseeingCostPerPax = params.sightseeingCostPerPax !== undefined && params.sightseeingCostPerPax !== null && params.sightseeingCostPerPax !== ''
    ? Number(params.sightseeingCostPerPax)
    : 500;
  const sightseeingCost = sightseeingCostPerPax * paxCount;

  const activityCostPerPax = params.activityCostPerPax !== undefined && params.activityCostPerPax !== null && params.activityCostPerPax !== ''
    ? Number(params.activityCostPerPax)
    : 500;
  const activityCost = activityCostPerPax * paxCount;

  const guideCostPerDay = params.guideCostPerDay !== undefined && params.guideCostPerDay !== null && params.guideCostPerDay !== ''
    ? Number(params.guideCostPerDay)
    : 0;
  const guideCost = guideCostPerDay * durationDays;

  const tollPermitParkingCost = params.tollPermitParkingCost !== undefined && params.tollPermitParkingCost !== null && params.tollPermitParkingCost !== ''
    ? Number(params.tollPermitParkingCost)
    : 1500;
  
  const driverAllowancePerDay = params.driverAllowancePerDay !== undefined && params.driverAllowancePerDay !== null && params.driverAllowancePerDay !== ''
    ? Number(params.driverAllowancePerDay)
    : 500;
  const driverAllowance = driverAllowancePerDay * durationDays;

  const escortCostPerDay = params.escortCostPerDay !== undefined && params.escortCostPerDay !== null && params.escortCostPerDay !== ''
    ? Number(params.escortCostPerDay)
    : 0;
  const escortCost = escortCostPerDay * durationDays;

  const insuranceCostPerPax = params.insuranceCostPerPax !== undefined && params.insuranceCostPerPax !== null && params.insuranceCostPerPax !== ''
    ? Number(params.insuranceCostPerPax)
    : 200;
  const insuranceCost = insuranceCostPerPax * paxCount;

  const miscCost = params.miscCost !== undefined && params.miscCost !== null && params.miscCost !== ''
    ? Number(params.miscCost)
    : 0;

  const supplierCost = hotelCost + transportCost + mealCost + sightseeingCost + activityCost + 
                       guideCost + tollPermitParkingCost + driverAllowance + escortCost + insuranceCost + miscCost;

  const bufferPercent = params.bufferPercent !== undefined && params.bufferPercent !== null && params.bufferPercent !== ''
    ? Number(params.bufferPercent)
    : 3;
  const bufferAmount = Math.round(supplierCost * (bufferPercent / 100));
  const landedCost = supplierCost + bufferAmount;

  const markupPercent = params.markupPercent !== undefined && params.markupPercent !== null && params.markupPercent !== ''
    ? Number(params.markupPercent)
    : 30;
  const markupAmount = Math.round(landedCost * (markupPercent / 100));
  const sellingPrice = landedCost + markupAmount;

  const taxPercent = params.taxPercent !== undefined && params.taxPercent !== null && params.taxPercent !== ''
    ? Number(params.taxPercent)
    : 5;
  const taxAmount = Math.round(sellingPrice * (taxPercent / 100));

  const discountType = params.discountType || 'Percentage';
  const discountPercent = params.discountPercent !== undefined && params.discountPercent !== null && params.discountPercent !== ''
    ? Number(params.discountPercent)
    : 0;
  
  const discountAmount = discountType === 'Percentage'
    ? Math.round(sellingPrice * (discountPercent / 100))
    : params.discountAmount !== undefined && params.discountAmount !== null && params.discountAmount !== ''
      ? Number(params.discountAmount)
      : 0;

  const customerPrice = sellingPrice + taxAmount - discountAmount;

  const netProfit = (sellingPrice - discountAmount) - supplierCost;
  const profitMarginPercent = customerPrice > 0 ? Math.round((netProfit / customerPrice) * 100) : 0;

  return {
    adultCount,
    childWithBedCount,
    childNoBedCount,
    childCount,
    infantCount,
    
    hotelCost,
    hotelRooms: rooms,
    hotelExtraBeds: extraBeds,
    hotelNights: durationNights,
    hotelRoomRate,
    hotelExtraBedRate,
    hotelCnbRate,
    hotelCnbCount: childNoBedCount,
    hotelCwbCount: childWithBedCount,

    transportCost,
    vehicleType,
    vehicleDailyRate,
    vehicleDays,
    vehicleKm: Number(params.vehicleKm) || 0,
    vehicleRatePerKm: Number(params.vehicleRatePerKm) || 15,
    vehicleNightCharges: Number(params.vehicleNightCharges) || 0,
    vehicleCalculationMode,

    mealCost,
    mealPlanRate,
    mealNights,

    sightseeingCost,
    sightseeingCostPerPax,
    activityCost,
    activityCostPerPax,

    guideCost,
    guideCostPerDay,
    tollPermitParkingCost,
    driverAllowance,
    driverAllowancePerDay,
    escortCost,
    escortCostPerDay,
    insuranceCost,
    insuranceCostPerPax,
    miscCost,

    supplierCost,
    bufferPercent,
    bufferAmount,
    landedCost,
    markupPercent,
    markupAmount,
    sellingPrice,
    taxPercent,
    taxAmount,
    discountPercent,
    discountAmount,
    discountType,
    customerPrice,
    netProfit,
    profitMarginPercent
  };
}

module.exports = {
  HOTEL_RATES,
  VEHICLE_RATES,
  MEAL_RATES,
  allocateRooms,
  allocateVehicle,
  calculateCosting
};
