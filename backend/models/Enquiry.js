const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  enquiryType: { 
    type: String, 
    enum: [
      'General', 'General Enquiry', 'Tour Package', 'Tour Package Enquiry', 
      'Visa', 'Visa Services', 'Hotel Booking', 'Hotel Enquiry', 
      'Flight Booking', 'Flight Enquiry', 'Train Booking', 'Train Enquiry', 
      'Bus Booking', 'Bus Enquiry', 'Car Rental', 'Car Rental Enquiry', 
      'Corporate Travel', 'Corporate Travel Enquiry', 'Education Tour', 
      'Education Tour Enquiry', 'Medical Tour', 'Medical Tour Enquiry', 
      'MICE', 'MICE Enquiry'
    ],
    required: true
  },
  customerName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  emailId: { type: String },
  travelDate: { type: Date },
  fromLocation: { type: String },
  toLocation: { type: String },
  numberOfPassengers: { type: Number },
  adultCount: { type: Number },
  childCount: { type: Number },
  budget: { type: Number },
  preferredCategory: { type: String },
  remarks: { type: String },
  documentUrl: { type: String }, // For uploaded documents
  
  // Specialized Booking Fields
  returnDate: { type: Date },
  hotelCheckIn: { type: Date },
  hotelCheckOut: { type: Date },
  hotelRooms: { type: Number },
  hotelCategory: { type: String },
  flightClass: { type: String },
  flightType: { type: String },
  trainClass: { type: String },
  carType: { type: String },
  carDriverOption: { type: String },
  
  // Internal Tracking
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Quotation Sent', 'Follow-up Required', 'Payment Pending', 'Confirmed', 'Cancelled', 'Closed'],
    default: 'New'
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin or staff ID
  notes: [{
    text: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  
  // Optional reference to a specific package
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Enquiry', enquirySchema);
