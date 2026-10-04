const BUFFER_PERCENT = 10;
const TARGET_MARGIN_PERCENT = 35;
const DISCOUNT_PERCENT = 0;

const priceTier = (directCost, passengerCount) => {
  const cost = Number(directCost);
  const passengers = Number(passengerCount);
  if (!Number.isFinite(cost) || cost <= 0 || !Number.isFinite(passengers) || passengers < 1) return null;
  const bufferedCost = cost + Math.round(cost * BUFFER_PERCENT / 100);
  const beforeDiscount = Math.ceil(bufferedCost / (1 - TARGET_MARGIN_PERCENT / 100));
  const discountAmount = 0;
  const total = beforeDiscount - discountAmount;
  return {
    beforeDiscount,
    discountAmount,
    total,
    perPerson: Math.round(total / passengers),
    currency: 'INR'
  };
};

module.exports = { BUFFER_PERCENT, TARGET_MARGIN_PERCENT, DISCOUNT_PERCENT, priceTier };
