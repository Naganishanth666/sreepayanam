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
  
  templesList: [String],
  priceBreakdown: { type: String },
  mealPlan: { type: String }, // e.g., "CP - Breakfast", "MAP - Breakfast + Dinner"
  
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
  
  packageId: { type: String, unique: true, required: true },
  isActive: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

packageSchema.pre('validate', function() {
  if (!this.packageId) {
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.packageId = `SP-PKG-${dateStr}-${randomChars}`;
  }
});

packageSchema.pre('save', function() {
  if (this.baseCost && this.offerPrice) {
    // Calculate profit margin based on user cost and sell price
    this.profitMarginPercent = Math.round(((this.offerPrice - this.baseCost) / this.baseCost) * 100);
  } else if (this.baseCost) {
    const margin = this.profitMarginPercent || 10;
    this.offerPrice = Math.round(this.baseCost * (1 + margin / 100));
  } else if (this.offerPrice) {
    const margin = this.profitMarginPercent || 10;
    this.baseCost = Math.round(this.offerPrice / (1 + margin / 100));
  } else if (this.originalPrice) {
    const margin = this.profitMarginPercent || 10;
    this.offerPrice = this.originalPrice;
    this.baseCost = Math.round(this.offerPrice / (1 + margin / 100));
  }
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Package', packageSchema);
