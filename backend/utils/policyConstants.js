/**
 * Mandatory policies to be included in all National packages.
 */
const MANDATORY_NATIONAL_POLICIES = {
  termsAndConditions: `General Terms & Conditions
• Package rates are subject to availability at the time of booking and are valid only for the dates, number of guests and services mentioned in the quotation. 
• Booking will be confirmed only after receipt of the required advance/payment and supplier confirmation. 
• Standard hotel check-in/check-out timings are generally 2:00 PM / 11:00 AM, subject to individual hotel policy. 
• Hotels of a similar category may be provided in case the proposed hotel is unavailable. 
• Transportation and sightseeing will be provided strictly as per the confirmed itinerary; vehicles are not at disposal unless specifically mentioned. 
• Sightseeing, temple visits and activities are subject to opening hours, weather, traffic, local regulations and operational conditions. 
• Only services specifically mentioned under Package Inclusions are included. All other services and personal expenses are extra. 
• Guests must carry valid Government-issued photo identification and are responsible for their personal belongings. 
• Any additional service, route change, extra sightseeing or extension requested by the guest will be charged additionally. 
• SreePayanam is not responsible for delays or changes caused by airlines, railways, weather, road closures, government restrictions, natural calamities or other circumstances beyond our reasonable control. 

Booking & Payment Policy
• The applicable advance amount will be mentioned in the quotation. 
• Balance payment must be made within the due date specified in the booking confirmation. 
• Flight/train tickets, special tickets and certain hotels may require 100% advance payment. 
• A booking is considered confirmed only after payment and written confirmation from SreePayanam. 
• Prices may change until the booking is confirmed. 

Date Change / Rescheduling Policy
• Date changes are subject to hotel, vehicle, ticket and supplier availability. 
• Fare differences and amendment/rescheduling charges, if any, must be paid by the guest. 
• Certain promotional, peak-season, festival and non-refundable bookings may not permit date changes. 
• If rescheduling is not permitted by the supplier, applicable cancellation terms will apply. 

Important Final-Quotation Clause
These are SreePayanam's standard general terms and policies. Package-specific pricing, payment terms, cancellation/refund conditions, date-change rules, itinerary, hotels, vehicles, inclusions and exclusions may vary. In all cases, the terms and conditions specifically mentioned in the FINAL CONFIRMED QUOTATION / BOOKING CONFIRMATION shall prevail.

SreePayanam International Pvt. Ltd.
Travel Smarter. Journey Better.`,

  cancellationPolicy: `Cancellation & Refund Policy
• Cancellation charges will depend on the travel date, hotel, transport and other supplier conditions. 
• Air/train tickets, special fares, VIP Darshan, activities and certain hotel bookings may be partially or fully non-refundable. 
• No refund will normally be provided for No Show, early departure or unused services after commencement of the tour. 
• Eligible refunds will be processed after receipt of the corresponding refund from the concerned service provider. 
• Any applicable bank/payment gateway or non-refundable supplier charges will be deducted.`
};

/**
 * Ensures that a package has the mandatory national policies if its category is National.
 * Prevents double-appending by checking if the policies are already present.
 */
function ensureMandatoryPolicies(packageData) {
  if (packageData.packageCategory === 'National') {
    const terms = MANDATORY_NATIONAL_POLICIES.termsAndConditions;
    const cancellation = MANDATORY_NATIONAL_POLICIES.cancellationPolicy;

    if (!packageData.termsAndConditions) {
      packageData.termsAndConditions = terms;
    } else if (!packageData.termsAndConditions.includes("Important Final-Quotation Clause")) {
      packageData.termsAndConditions = `${packageData.termsAndConditions.trim()}\n\n${terms}`.trim();
    }

    if (!packageData.cancellationPolicy) {
      packageData.cancellationPolicy = cancellation;
    } else if (!packageData.cancellationPolicy.includes("Cancellation & Refund Policy")) {
      packageData.cancellationPolicy = `${packageData.cancellationPolicy.trim()}\n\n${cancellation}`.trim();
    }
  }
  return packageData;
}

module.exports = {
  MANDATORY_NATIONAL_POLICIES,
  ensureMandatoryPolicies
};
