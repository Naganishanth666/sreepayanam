export const BUDGET_DISCLAIMER = 'This is an indicative budget, not a final quotation. Prices are subject to change upon confirmation based on availability, supplier rates, and applicable costs.';

// Published Chennai outstation tariff is a planning benchmark. The travel desk
// replaces it with a route-specific supplier quote before confirming a price.
const VEHICLES = {
  Sedan: { daily: 3850, seats: 4 },
  Ertiga: { daily: 5100, seats: 6 },
  Innova: { daily: 5100, seats: 6 },
  'Tempo Traveller': { daily: 7400, seats: 12 },
  'Mini Coach': { daily: 9700, seats: 21 },
  Coach: { daily: 17500, seats: 30 }
};
const DAILY_FOOD_ALLOWANCE = 1000;

export const estimateIndicativeBudget = ({ hotels, days, nights, rooms, travellers, vehicleType, mealPlan, country }) => {
  if (country?.toLowerCase() !== 'india') return null;
  const rates = (Array.isArray(hotels) ? hotels : []).filter(hotel =>
    Number.isFinite(hotel.nightlyEstimate) && hotel.nightlyEstimate >= 300 &&
    /^https:\/\//.test(hotel.sourceUrl || '') && hotel.checkedAt
  );
  const vehicle = VEHICLES[vehicleType];
  const dayCount = Number(days);
  const nightCount = Number(nights);
  const roomCount = Number(rooms);
  const people = Number(travellers);
  if (!vehicle || !Number.isInteger(dayCount) || dayCount < 1 ||
    !Number.isInteger(nightCount) || nightCount < 0 || (nightCount > 0 && rates.length < 2) ||
    !Number.isInteger(roomCount) || roomCount < 1 ||
    !Number.isInteger(people) || people < 1) return null;

  const averageRoomRate = rates.length ? Math.round(rates.reduce((total, hotel) => total + hotel.nightlyEstimate, 0) / rates.length) : 0;
  const vehicleCount = Math.ceil(people / vehicle.seats);
  // Public listings are room-only benchmarks, so requested hotel meal plans
  // cannot be treated as included before the property confirms its rate.
  const directEstimate = averageRoomRate * roomCount * nightCount + vehicle.daily * vehicleCount * dayCount + DAILY_FOOD_ALLOWANCE * people * dayCount;
  // Current SreePayanam policy: 10% contingency, then a 35% gross-margin target.
  const estimatedGroupBudget = Math.ceil(Math.round(directEstimate * 1.10 / 0.65) / 100) * 100;
  return {
    estimatedGroupBudget, averageRoomRate, roomCount, vehicleCount, hotelCount: rates.length,
    checkedAt: rates[0]?.checkedAt || new Date().toISOString(),
    hotelSources: rates.map(hotel => ({ name: hotel.name, url: hotel.sourceUrl })),
    vehicleSource: 'https://www.cabzii.in/tariff',
    mealSource: 'https://www.incredibleindia.gov.in/en/andhra-pradesh/visakhapatnam/holidays-under-10k-this-february',
    assumptions: `${roomCount} room${roomCount === 1 ? '' : 's'} × ${nightCount} night${nightCount === 1 ? '' : 's'}; ${vehicleCount} ${vehicleType} vehicle${vehicleCount === 1 ? '' : 's'} × ${dayCount} days; ₹1,000 daily food allowance for ${people} traveller${people === 1 ? '' : 's'}. Requested ${mealPlan || 'hotel'} meal service needs confirmation. Entry fees, guides, flights, trains, extra kilometres, tolls and taxes are not included.`
  };
};
