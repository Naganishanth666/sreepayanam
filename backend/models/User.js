const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  mobile: { type: String, required: true, trim: true, maxlength: 24 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
  password: { type: String, required: true },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  whatsappNumber: { type: String },
  role: { 
    type: String, 
    enum: ['Admin', 'Agent', 'Customer'], 
    default: 'Customer' 
  },
  
  // Agent specific fields
  agencyName: { type: String },
  officeAddress: { type: String },
  businessCategory: { type: String },
  isApproved: { type: Boolean, default: false }, // Agents need admin approval
  
  // Customer specific preferences
  preferredTravelCategory: { type: String },
  consentForAlerts: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
