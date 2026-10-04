const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  enquiry: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', required: true, index: true },
  reference: { type: String, required: true, unique: true },
  version: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['Draft', 'Approved'], default: 'Draft', required: true },
  enquiryReference: { type: String, required: true },
  customer: { type: mongoose.Schema.Types.Mixed, required: true },
  route: { type: mongoose.Schema.Types.Mixed, required: true },
  selectedPlaces: [{ type: String, maxlength: 160 }],
  destinationReferences: [{
    name: { type: String, required: true },
    url: String,
    sourceType: String,
    lastChecked: String
  }],
  tiers: [{
    name: { type: String, enum: ['Economic', 'Deluxe', 'Premium'], required: true },
    directCost: Number,
    sourceReference: String,
    sourceCheckedAt: String,
    minimumSellingPrice: Number,
    benchmarkStatus: { type: String, enum: ['Verified', 'Provisional'], default: 'Provisional' },
    benchmarkNote: String,
    benchmarkMedian: Number,
    marketComparables: [{ url: String, total: Number, currency: String, taxTreatment: String, checkedAt: String, comparisonNote: String }],
    accommodation: String,
    transport: String,
    meals: String,
    activities: String,
    price: { beforeDiscount: Number, discountAmount: Number, total: Number, perPerson: Number, currency: String }
  }],
  terms: {
    validUntil: String,
    taxNote: String,
    paymentSchedule: String,
    cancellationTerms: String,
    assumptions: String,
    specialNotes: String,
    inclusions: [String],
    exclusions: [String],
    routeReviewNote: String
  },
  pricingRule: {
    bufferPercent: { type: Number, default: 10 },
    markupPercent: Number, // Historical snapshots only.
    targetMarginPercent: { type: Number, default: 35 },
    formulaVersion: String,
    discountPercent: { type: Number, default: 0 },
    offerStartDate: String,
    offerEndDate: String
  },
  approval: {
    actor: String,
    displayName: String,
    method: String,
    note: String,
    at: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

quotationSchema.index({ enquiry: 1, version: 1 }, { unique: true });
quotationSchema.index({ enquiry: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'Draft' } });

module.exports = mongoose.model('Quotation', quotationSchema);
