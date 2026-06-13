const mongoose = require('mongoose');

const paymentLogSchema = new mongoose.Schema({
  paymentId: { 
    type: String, 
    required: true,
    default: () => 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase()
  },
  amount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['UPI', 'Card', 'Net Banking', 'Bank Transfer'], 
    required: true 
  },
  transactionId: { type: String, required: true }, // UTR, Card Txn Ref, or IMPS Ref
  paymentDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Pending Verification', 'Success', 'Failed'], 
    default: 'Pending Verification' 
  },
  notes: { type: String }
});

const staffNoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  addedBy: { type: String, default: 'System' }, // Admin or staff name
  addedAt: { type: Date, default: Date.now }
});

const bookingSchema = new mongoose.Schema({
  bookingId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  packageId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Package',
    default: null
  },
  packageName: { type: String }, // Cached package title
  customerName: { type: String, required: true },
  emailId: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  travelDate: { type: Date, required: true },
  numberOfPassengers: { type: Number, required: true, default: 1 },
  adultCount: { type: Number, required: true, default: 1 },
  childCount: { type: Number, default: 0 },
  
  // Custom travel fields (if booking custom services or packages)
  fromLocation: { type: String },
  toLocation: { type: String },
  travelDetails: {
    category: { type: String }, // hotel, flight, train, car, package
    hotelCategory: { type: String },
    flightClass: { type: String },
    trainClass: { type: String },
    carType: { type: String }
  },
  
  // Financial status
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, required: true },
  
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Fully Paid', 'Refunded'],
    default: 'Unpaid'
  },
  
  bookingStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  
  payments: [paymentLogSchema],
  remarks: { type: String },
  notes: [staffNoteSchema],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook to calculate pending amount
bookingSchema.pre('save', function() {
  this.pendingAmount = Math.max(0, this.totalAmount - this.paidAmount);
  
  // Auto-promote payment status
  if (this.paidAmount >= this.totalAmount && this.totalAmount > 0) {
    this.paymentStatus = 'Fully Paid';
  } else if (this.paidAmount > 0 && this.paidAmount < this.totalAmount) {
    this.paymentStatus = 'Partially Paid';
  } else {
    this.paymentStatus = 'Unpaid';
  }
  
  this.updatedAt = new Date();
});

module.exports = mongoose.model('Booking', bookingSchema);
