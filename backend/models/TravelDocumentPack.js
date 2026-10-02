const mongoose = require('mongoose');

const travelDocumentPackSchema = new mongoose.Schema({
  quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true, unique: true },
  status: { type: String, enum: ['Draft', 'Finalized'], default: 'Draft' },
  fields: { type: mongoose.Schema.Types.Mixed, default: {} },
  documentNumbers: { type: [String], default: [] },
  completedSections: { type: [Number], default: [] },
  checks: {
    accountantReviewed: { type: Boolean, default: false },
    paymentVerified: { type: Boolean, default: false },
    suppliersConfirmed: { type: Boolean, default: false },
    reconciliationReviewed: { type: Boolean, default: false }
  },
  finalizedBy: String,
  finalizedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

travelDocumentPackSchema.index({ documentNumbers: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('TravelDocumentPack', travelDocumentPackSchema);
