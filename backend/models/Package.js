const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  destination: { type: String, required: true }, // e.g., Kerala, Dubai
  packageCategory: { 
    type: String, 
    enum: ['National', 'International'], 
    required: true 
  },
  tourType: { 
    type: String, 
    enum: [
      'Family Tours', 'Pilgrimage Tours', 'Honeymoon Tours', 'Hill Station Tours', 
      'Resort Packages', 'Weekend Tours', 'Group Tours', 'School / College Tours', 
      'Corporate Tours', 'Festival Tours', 'Cultural Tours', 'Medical Tours', 
      'Event / Sports Tours', 'Cruise Packages', 'Luxury Tours', 'Budget Tours', 'MICE Tours',
      'Education Tours', 'Adventure Tours'
    ],
    required: true
  },
  durationDays: { type: Number, required: true },
  durationNights: { type: Number, required: true },
  startingCity: { type: String },
  endingCity: { type: String },
  overview: { type: String, required: true },
  
  itinerary: [{
    day: Number,
    title: String,
    activities: String,
    hotel: String,
    mealPlan: String,
    transport: String
  }],
  
  inclusions: [String],
  exclusions: [String],
  optionalAddons: [String],
  
  termsAndConditions: { type: String },
  cancellationPolicy: { type: String },
  
  baseCost: { type: Number }, // Raw wholesale cost price to SreePayanam
  profitMarginPercent: { type: Number, default: 10 }, // Target margin markup percent
  
  originalPrice: { type: Number, required: true },
  offerPrice: { type: Number },
  isSpecialOffer: { type: Boolean, default: false },
  offerValidity: { type: Date },
  
  imageUrl: { type: String, required: true },
  brochureUrl: { type: String }, // PDF download
  
  // SEO fields
  seoTitle: { type: String },
  seoMetaDescription: { type: String },
  
  isActive: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

packageSchema.pre('save', function() {
  // Enforce a strict 10% profit margin standard on all tours
  this.profitMarginPercent = 10;
  if (this.baseCost) {
    this.offerPrice = Math.round(this.baseCost * 1.10);
  } else if (this.offerPrice) {
    this.baseCost = Math.round(this.offerPrice / 1.10);
  } else if (this.originalPrice) {
    this.baseCost = Math.round(this.originalPrice / 1.10);
    this.offerPrice = Math.round(this.baseCost * 1.10);
  }
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Package', packageSchema);
