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
  
  status: { 
    type: String, 
    enum: ['Draft', 'Approved'], 
    default: 'Draft' 
  },
  
  costingBreakdown: {
    hotelCost: { type: Number, default: 0 },
    hotelRooms: { type: Number, default: 0 },
    hotelExtraBeds: { type: Number, default: 0 },
    hotelNights: { type: Number, default: 0 },
    hotelRoomRate: { type: Number, default: 0 },
    hotelExtraBedRate: { type: Number, default: 0 },
    hotelCnbRate: { type: Number, default: 0 },
    hotelCnbCount: { type: Number, default: 0 },
    hotelCwbCount: { type: Number, default: 0 },
    
    transportCost: { type: Number, default: 0 },
    vehicleType: { type: String },
    vehicleDailyRate: { type: Number, default: 0 },
    vehicleDays: { type: Number, default: 0 },
    vehicleKm: { type: Number, default: 0 },
    vehicleRatePerKm: { type: Number, default: 0 },
    vehicleNightCharges: { type: Number, default: 0 },
    vehicleCalculationMode: { type: String, enum: ['Daily', 'KM'], default: 'Daily' },

    mealCost: { type: Number, default: 0 },
    mealPlanRate: { type: Number, default: 0 },
    mealNights: { type: Number, default: 0 },

    sightseeingCost: { type: Number, default: 0 },
    sightseeingCostPerPax: { type: Number, default: 0 },
    activityCost: { type: Number, default: 0 },
    activityCostPerPax: { type: Number, default: 0 },

    guideCost: { type: Number, default: 0 },
    guideCostPerDay: { type: Number, default: 0 },
    tollPermitParkingCost: { type: Number, default: 0 },
    driverAllowance: { type: Number, default: 0 },
    driverAllowancePerDay: { type: Number, default: 0 },
    escortCost: { type: Number, default: 0 },
    escortCostPerDay: { type: Number, default: 0 },
    insuranceCost: { type: Number, default: 0 },
    insuranceCostPerPax: { type: Number, default: 0 },
    miscCost: { type: Number, default: 0 },

    supplierCost: { type: Number, default: 0 },
    bufferPercent: { type: Number, default: 3 },
    bufferAmount: { type: Number, default: 0 },
    landedCost: { type: Number, default: 0 },
    markupPercent: { type: Number, default: 25 },
    markupAmount: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 5 },
    taxAmount: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    discountType: { type: String, enum: ['Fixed', 'Percentage'], default: 'Percentage' },
    customerPrice: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    profitMarginPercent: { type: Number, default: 0 },
    
    adultCount: { type: Number, default: 2 },
    childCount: { type: Number, default: 0 },
    infantCount: { type: Number, default: 0 }
  },

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
  if (this.costingBreakdown && this.costingBreakdown.supplierCost > 0) {
    this.baseCost = this.costingBreakdown.supplierCost;
    this.originalPrice = this.costingBreakdown.sellingPrice;
    this.offerPrice = this.costingBreakdown.customerPrice;
    this.profitMarginPercent = this.costingBreakdown.profitMarginPercent;
  } else {
    if (this.baseCost && this.offerPrice) {
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
  }
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Package', packageSchema);
