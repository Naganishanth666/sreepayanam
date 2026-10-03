const BUFFER_PERCENT = 10;
const MARKUP_PERCENT = 40;
const DISCOUNT_PERCENT = 5;

const priceTier = (directCost, passengerCount) => {
  const cost = Number(directCost);
  const passengers = Number(passengerCount);
  if (!Number.isFinite(cost) || cost <= 0 || !Number.isFinite(passengers) || passengers < 1) return null;
  const contingency = Math.round(cost * BUFFER_PERCENT / 100);
  const bufferedCost = cost + contingency;
  const markup = Math.round(bufferedCost * MARKUP_PERCENT / 100);
  const beforeDiscount = bufferedCost + markup;
  const discountAmount = Math.round(beforeDiscount * DISCOUNT_PERCENT / 100);
  const total = beforeDiscount - discountAmount;
  return {
    beforeDiscount,
    discountAmount,
    total,
    perPerson: Math.round(total / passengers),
    currency: 'INR'
  };
};

module.exports = { BUFFER_PERCENT, MARKUP_PERCENT, DISCOUNT_PERCENT, priceTier };
