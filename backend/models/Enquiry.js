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
  
  // MICE / Corporate Tours
  companyName: { type: String },
  eventType: { type: String },
  eventDurationDays: { type: Number },
  venuePreference: { type: String },
  roomOccupancy: { type: String },
  meetingRoomRequired: { type: String },
  audioVisualRequired: { type: String },
  teamBuildingActivities: { type: String },
  galaDinnerRequired: { type: String },
  approximatePax: { type: Number },

  // Medical Tours
  patientName: { type: String },
  patientAge: { type: Number },
  patientGender: { type: String },
  medicalCondition: { type: String },
  preferredTreatmentCountry: { type: String },
  treatmentCategory: { type: String },
  hospitalPreference: { type: String },
  medicalHistoryDetails: { type: String },
  visaAssistanceRequired: { type: String },
  translatorRequired: { type: String },
  accommodationForAttendants: { type: String },
  wheelchairAssistance: { type: String },

  // Cruise Packages
  cruiseLinePreference: { type: String },
  cabinCategory: { type: String },
  destinationCruise: { type: String },
  durationNights: { type: Number },
  shoreExcursions: { type: String },
  diningPreference: { type: String },
  onboardGratuitiesPrepaid: { type: String },

  // Educational Tours
  institutionName: { type: String },
  departmentGrade: { type: String },
  contactPersonDesignation: { type: String },
  numberOfStudents: { type: Number },
  numberOfTeachers: { type: Number },
  studySubjectFocus: { type: String },
  industrialVisitRequired: { type: String },
  guideLectureRequired: { type: String },
  certificateOfParticipation: { type: String },
  supervisorAccommodationSharing: { type: String },

  // Honeymoon Tours
  coupleNames: { type: String },
  marriageDate: { type: Date },
  honeymoonTheme: { type: String },
  complimentaryBenefits: [{ type: String }],
  roomViewPreference: { type: String },
  privatePoolVilla: { type: String },
  photographyService: { type: String },

  // Pilgrimage Tours
  deityTempleName: { type: String },
  primaryDestination: { type: String },
  specialDarshanPasses: { type: String },
  ritualPoojaArrangements: { type: String },
  seniorCitizenAssistance: { type: String },
  vegetarianJainFood: { type: String },
  physicalDisabilityAssistance: { type: String },
  dressCodeGuidelinesAccepted: { type: String },
  
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
  
  detailedPreferences: { type: mongoose.Schema.Types.Mixed },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Enquiry', enquirySchema);
