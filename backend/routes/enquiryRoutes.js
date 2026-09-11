const express = require('express');
const mongoose = require('mongoose');
const Enquiry = require('../models/Enquiry');
const { checkAdmin } = require('../middleware/auth');
const { sendEnquiryEmail } = require('../utils/mailer');

const router = express.Router();

const PUBLIC_FIELDS = [
  'enquiryType', 'travelDate', 'fromLocation', 'toLocation', 'numberOfPassengers', 'adultCount', 'childCount',
  'budget', 'preferredCategory', 'remarks', 'returnDate', 'hotelCheckIn', 'hotelCheckOut', 'hotelRooms',
  'hotelCategory', 'flightClass', 'flightType', 'trainClass', 'carType', 'carDriverOption', 'companyName',
  'eventType', 'eventDurationDays', 'venuePreference', 'roomOccupancy', 'meetingRoomRequired',
  'audioVisualRequired', 'teamBuildingActivities', 'galaDinnerRequired', 'approximatePax', 'patientName',
  'patientAge', 'patientGender', 'medicalCondition', 'preferredTreatmentCountry', 'treatmentCategory',
  'hospitalPreference', 'medicalHistoryDetails', 'visaAssistanceRequired', 'translatorRequired',
  'accommodationForAttendants', 'wheelchairAssistance', 'cruiseLinePreference', 'cabinCategory',
  'destinationCruise', 'durationNights', 'shoreExcursions', 'diningPreference', 'onboardGratuitiesPrepaid',
  'institutionName', 'departmentGrade', 'contactPersonDesignation', 'numberOfStudents', 'numberOfTeachers',
  'studySubjectFocus', 'industrialVisitRequired', 'guideLectureRequired', 'certificateOfParticipation',
  'supervisorAccommodationSharing', 'coupleNames', 'marriageDate', 'honeymoonTheme', 'complimentaryBenefits',
  'roomViewPreference', 'privatePoolVilla', 'photographyService', 'deityTempleName', 'primaryDestination',
  'specialDarshanPasses', 'ritualPoojaArrangements', 'seniorCitizenAssistance', 'vegetarianJainFood',
  'physicalDisabilityAssistance', 'dressCodeGuidelinesAccepted', 'packageId', 'detailedPreferences',
  'quoteReference', 'quotedAmount', 'quoteIssuedAt', 'selectedDestinations'
];

const sanitise = (value, depth = 0) => {
  if (depth > 4) return undefined;
  if (typeof value === 'string') {
    return value.replace(/[<>\u0000-\u001F]/g, '').trim().slice(0, 4000);
  }
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    return value.slice(0, 60).map(item => sanitise(item, depth + 1)).filter(item => item !== undefined);
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((result, [key, item]) => {
      if (key.startsWith('$') || key.includes('.')) return result;
      const cleaned = sanitise(item, depth + 1);
      if (cleaned !== undefined) result[key.slice(0, 80)] = cleaned;
      return result;
    }, {});
  }
  return undefined;
};

const safeResponse = enquiry => ({
  id: enquiry._id,
  quoteReference: enquiry.quoteReference || null,
  status: enquiry.status,
  createdAt: enquiry.createdAt
});

const validEmail = email => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validPhone = phone => /^\+?[0-9 ()-]{8,20}$/.test(phone);
const pickPublicFields = body => PUBLIC_FIELDS.reduce((result, key) => {
  if (body[key] !== undefined) result[key] = body[key];
  return result;
}, {});

// Submit a new enquiry. This is intentionally public, but bounded, sanitised
// and idempotent when it comes from the quote flow.
router.post('/', async (req, res) => {
  try {
    const body = sanitise(req.body || {}) || {};
    const customerName = String(body.customerName || '').trim().slice(0, 120);
    const mobileNumber = String(body.mobileNumber || '').trim().slice(0, 24);
    const emailId = String(body.emailId || '').trim().slice(0, 160);

    if (!customerName || !mobileNumber) {
      return res.status(400).json({ message: 'Name and mobile number are required.' });
    }
    if (!validPhone(mobileNumber)) {
      return res.status(400).json({ message: 'Enter a valid mobile number.' });
    }
    if (!validEmail(emailId)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }

    if (body.quoteReference) {
      const existing = await Enquiry.findOne({ quoteReference: String(body.quoteReference).slice(0, 80) });
      if (existing) {
        return res.status(200).json({ message: 'Enquiry already received.', enquiry: safeResponse(existing), idempotent: true });
      }
    }

    const publicFields = pickPublicFields(body);

    const newEnquiry = new Enquiry({
      ...publicFields,
      customerName,
      mobileNumber,
      emailId: emailId || undefined,
      quoteReference: body.quoteReference ? String(body.quoteReference).slice(0, 80) : undefined,
      quotedAmount: Number.isFinite(Number(body.quotedAmount)) ? Math.max(Number(body.quotedAmount), 0) : undefined,
      selectedDestinations: Array.isArray(body.selectedDestinations) ? body.selectedDestinations.slice(0, 40) : undefined,
      enquiryType: body.enquiryType || 'Tour Package Enquiry'
    });
    await newEnquiry.save();

    // Email dispatch is deliberately best-effort; the customer response does
    // not wait on an external mail provider.
    sendEnquiryEmail(newEnquiry.toObject()).catch(err => {
      console.error('[EnquiryRoute] Email dispatch error:', err.message);
    });

    return res.status(201).json({ message: 'Enquiry submitted successfully.', enquiry: safeResponse(newEnquiry) });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Some enquiry details are invalid. Check the form and try again.' });
    }
    if (err.code === 11000 && req.body?.quoteReference) {
      const existing = await Enquiry.findOne({ quoteReference: String(req.body.quoteReference).slice(0, 80) });
      if (existing) return res.status(200).json({ message: 'Enquiry already received.', enquiry: safeResponse(existing), idempotent: true });
    }
    console.error('[EnquiryRoute] Create failed:', err.message);
    return res.status(500).json({ message: 'We could not save the enquiry. Please try again.' });
  }
});

// CRM reads and updates are admin-only. Public clients never need this data.
router.get('/', checkAdmin, async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 }).limit(500);
    return res.json(enquiries);
  } catch (err) {
    console.error('[EnquiryRoute] CRM fetch failed:', err.message);
    return res.status(500).json({ message: 'Could not load enquiries.' });
  }
});

router.put('/:id/status', checkAdmin, async (req, res) => {
  try {
    const body = sanitise(req.body || {}) || {};
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Enquiry not found.' });
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found.' });

    if (body.status) enquiry.status = body.status;
    if (body.note) enquiry.notes.push({ text: String(body.note).slice(0, 1000) });
    await enquiry.save();
    return res.json(enquiry);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Invalid enquiry status.' });
    console.error('[EnquiryRoute] Status update failed:', err.message);
    return res.status(500).json({ message: 'Could not update the enquiry.' });
  }
});

router.put('/:id', checkAdmin, async (req, res) => {
  try {
    const body = sanitise(req.body || {}) || {};
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Enquiry not found.' });
    delete body._id;
    delete body.createdAt;
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true, runValidators: true, context: 'query' }
    );
    if (!updatedEnquiry) return res.status(404).json({ message: 'Enquiry not found.' });
    return res.json(updatedEnquiry);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Some enquiry details are invalid.' });
    console.error('[EnquiryRoute] Update failed:', err.message);
    return res.status(500).json({ message: 'Could not update the enquiry.' });
  }
});

module.exports = router;
