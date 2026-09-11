const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const router = express.Router();
const Booking = require('../models/Booking');
const Package = require('../models/Package');
const { checkAdmin } = require('../middleware/auth');

// Card and net-banking flows are intentionally disabled until a PCI-compliant
// payment provider is integrated. The app must not simulate a payment gateway.
const PAYMENT_METHODS = new Set(['UPI', 'Bank Transfer']);
const BOOKING_STATUSES = new Set(['Pending', 'Confirmed', 'Completed', 'Cancelled']);
const cleanText = (value, maxLength) => typeof value === 'string'
  ? value.replace(/[<>\u0000-\u001F]/g, '').trim().slice(0, maxLength)
  : '';
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validPhone = value => /^\+?[0-9 ()-]{8,20}$/.test(value);
const boundedNumber = (value, fallback, min, max) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, min), max);
};
const publicBooking = booking => ({
  bookingId: booking.bookingId,
  packageName: booking.packageName,
  bookingStatus: booking.bookingStatus,
  paymentStatus: booking.paymentStatus,
  totalAmount: booking.totalAmount,
  pendingAmount: booking.pendingAmount,
  createdAt: booking.createdAt
});

// HELPER: Generate a unique, professional Booking Reference ID (e.g., SP-202605-A7B9)
const generateBookingId = () => {
  const dateStr = new Date().toISOString().slice(0, 7).replace('-', ''); // YYYYMM
  const randomChars = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `SP-${dateStr}-${randomChars}`;
};

// 1. Create a Booking (Public Checkout)
router.post('/', async (req, res) => {
  try {
    const {
      packageId,
      customerName,
      emailId,
      mobileNumber,
      travelDate,
      numberOfPassengers,
      adultCount,
      childCount,
      fromLocation,
      toLocation,
      travelDetails,
      remarks,
      paymentMethod,
      transactionId,
      paymentAmount
    } = req.body;

    const safeCustomerName = cleanText(customerName, 120);
    const safeEmail = cleanText(emailId, 160).toLowerCase();
    const safeMobile = cleanText(mobileNumber, 24);
    const safePackageId = cleanText(packageId, 80);
    const safeTravelDate = new Date(travelDate);
    const passengerCount = boundedNumber(String(numberOfPassengers).replace('+', ''), 0, 1, 100);
    const safeAdultCount = boundedNumber(adultCount, passengerCount, 1, passengerCount);
    const safeChildCount = boundedNumber(childCount, 0, 0, Math.max(passengerCount - safeAdultCount, 0));

    if (!safeCustomerName || !validEmail(safeEmail) || !validPhone(safeMobile) || !Number.isFinite(safeTravelDate.getTime()) || !passengerCount) {
      return res.status(400).json({ message: 'Please provide valid customer, contact and travel details.' });
    }

    // Resolve pricing on the server. Client-submitted totals are not trusted
    // when a published package is selected.
    let totalAmount = 0;
    let packageName = 'Custom Booking';

    if (safePackageId) {
      const pkg = await Package.findOne({ packageId: safePackageId, isActive: true, status: { $ne: 'Draft' } });
      if (!pkg) {
        return res.status(404).json({ message: 'Requested tour package not found.' });
      }
      packageName = cleanText(pkg.title, 180);
      const basePrice = Number(pkg.offerPrice || pkg.originalPrice || 0);
      if (!Number.isFinite(basePrice) || basePrice <= 0) {
        return res.status(409).json({ message: 'This package is not ready for online booking.' });
      }
      // Total amount = base price * passengers + 5% GST/Taxes
      const subtotal = basePrice * passengerCount;
      const tax = subtotal * 0.05; // 5% GST
      totalAmount = Math.round(subtotal + tax);
    } else {
      // Custom quotes must use the planner enquiry flow; accepting a client
      // supplied total here would allow a caller to underpay a booking.
      return res.status(400).json({ message: 'Select a published package before starting checkout.' });
    }

    if (totalAmount <= 0) {
      return res.status(400).json({ message: 'Booking amount must be positive.' });
    }

    const bookingId = generateBookingId();

    const bookingData = {
      bookingId,
      packageId: safePackageId || null,
      packageName,
      customerName: safeCustomerName,
      emailId: safeEmail,
      mobileNumber: safeMobile,
      travelDate: safeTravelDate,
      numberOfPassengers: passengerCount,
      adultCount: safeAdultCount,
      childCount: safeChildCount,
      fromLocation: cleanText(fromLocation, 120),
      toLocation: cleanText(toLocation, 120),
      travelDetails: {
        category: cleanText(travelDetails?.category, 40),
        hotelCategory: cleanText(travelDetails?.hotelCategory, 60),
        flightClass: cleanText(travelDetails?.flightClass, 60),
        trainClass: cleanText(travelDetails?.trainClass, 60),
        carType: cleanText(travelDetails?.carType, 60)
      },
      remarks: cleanText(remarks, 2000),
      totalAmount,
      paidAmount: 0,
      pendingAmount: totalAmount,
      payments: []
    };

    // If the customer submitted a payment claim, validate it against the
    // server-calculated total before writing it to the booking ledger.
    if (paymentMethod || transactionId || paymentAmount) {
      const amountNum = Number(paymentAmount);
      const safePaymentMethod = cleanText(paymentMethod, 40);
      const safeTransactionId = cleanText(transactionId, 120);
      if (!PAYMENT_METHODS.has(safePaymentMethod) || !safeTransactionId || !Number.isFinite(amountNum) || amountNum <= 0 || amountNum > totalAmount) {
        return res.status(400).json({ message: 'Payment details are invalid or exceed the booking amount.' });
      }
      
      // UPI validation security safeguard
      let secureNotes = '';
      if (safePaymentMethod === 'UPI') {
        const upiSuffix = process.env.UPI_SUFFIX || 'upi';
        secureNotes = `Locked to Official UPI Destination VPA: 9443217654@${upiSuffix}`;
      }

      bookingData.payments.push({
        amount: amountNum,
        paymentMethod: safePaymentMethod,
        transactionId: safeTransactionId,
        status: 'Pending Verification',
        notes: `Initial checkout payment claim. ${secureNotes}`.trim()
      });
    }

    const booking = new Booking(bookingData);
    await booking.save();

    res.status(201).json({
      message: 'Booking created successfully! Awaiting payment verification.',
      booking: publicBooking(booking)
    });

  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Server checkout error. Please try again.' });
  }
});

// 2. Submit/Record another Payment Transaction claim for a Booking (Public or Admin)
router.post('/:id/payment', async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId, notes } = req.body;
    const amountNum = Number(amount);
    const safePaymentMethod = cleanText(paymentMethod, 40);
    const safeTransactionId = cleanText(transactionId, 120);

    if (!Number.isFinite(amountNum) || amountNum <= 0 || !PAYMENT_METHODS.has(safePaymentMethod) || !safeTransactionId) {
      return res.status(400).json({ message: 'Missing transaction details: amount, method, or transaction reference.' });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Booking reference not found.' });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking reference not found.' });
    }

    if (booking.payments.some(payment => payment.transactionId === safeTransactionId)) {
      return res.status(409).json({ message: 'This payment reference has already been logged.' });
    }

    if (amountNum > booking.pendingAmount) {
      return res.status(400).json({ message: 'Payment amount exceeds the outstanding booking balance.' });
    }

    let secureNotes = cleanText(notes, 1000);
    if (safePaymentMethod === 'UPI') {
      const upiSuffix = process.env.UPI_SUFFIX || 'upi';
      secureNotes = `Locked to Official UPI Destination VPA: 9443217654@${upiSuffix}. ${secureNotes}`.trim();
    }

    booking.payments.push({
      amount: amountNum,
      paymentMethod: safePaymentMethod,
      transactionId: safeTransactionId,
      status: 'Pending Verification',
      notes: secureNotes
    });

    await booking.save();
    res.json({ message: 'Payment reference logged successfully. Pending verification.', booking: publicBooking(booking) });

  } catch (err) {
    console.error('Payment submission error:', err);
    res.status(500).json({ message: 'Server payment logging error. Please try again.' });
  }
});

// 3. Fetch All Bookings (Admin Only CRM)
router.get('/', checkAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error('CRM Fetch error:', err);
    res.status(500).json({ message: 'Server CRM fetch error' });
  }
});

// 4. Update Booking Status (Admin Only CRM)
router.put('/:id/status', checkAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    const bookingStatus = cleanText(req.body?.bookingStatus, 30);
    if (!BOOKING_STATUSES.has(bookingStatus)) {
      return res.status(400).json({ message: 'Invalid booking status.' });
    }
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    booking.bookingStatus = bookingStatus;
    
    // Add history log note
    booking.notes.push({
      text: `Booking status updated to ${bookingStatus}`,
      addedBy: 'Admin Console'
    });

    await booking.save();
    res.json({ message: 'Booking status updated successfully', booking });

  } catch (err) {
    console.error('CRM status update error:', err);
    res.status(500).json({ message: 'Server update error' });
  }
});

// 5. Verify & Audit a Pending Payment Claim (Admin Only CRM)
router.put('/:id/verify-payment/:paymentId', checkAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id) || !mongoose.isValidObjectId(req.params.paymentId)) {
      return res.status(404).json({ message: 'Booking or payment reference not found.' });
    }
    const { action } = req.body; // 'approve' or 'reject'
    
    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Action must be approve or reject.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Locate the payment record
    const payment = booking.payments.id(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Transaction record not found in booking ledger.' });
    }

    if (payment.status !== 'Pending Verification') {
      return res.status(400).json({ message: 'This transaction was already audited and processed.' });
    }

    if (action === 'approve' && payment.amount > booking.pendingAmount) {
      return res.status(400).json({ message: 'This payment exceeds the remaining booking balance.' });
    }

    if (action === 'approve') {
      payment.status = 'Success';
      booking.paidAmount += payment.amount;
      
      // Auto-promote booking status to Confirmed if fully paid and currently pending
      if (booking.paidAmount >= booking.totalAmount && booking.bookingStatus === 'Pending') {
        booking.bookingStatus = 'Confirmed';
      }

      booking.notes.push({
        text: `Verified & Approved ${payment.paymentMethod} Payment Ref: ${payment.transactionId} of ₹${payment.amount}.`,
        addedBy: 'Admin Auditor'
      });
    } else {
      payment.status = 'Failed';
      booking.notes.push({
        text: `Audited & Rejected ${payment.paymentMethod} Payment Ref: ${payment.transactionId} of ₹${payment.amount} as invalid.`,
        addedBy: 'Admin Auditor'
      });
    }

    await booking.save();
    res.json({ message: `Payment reference successfully ${action}d.`, booking });

  } catch (err) {
    console.error('CRM payment verification error:', err);
    res.status(500).json({ message: 'Server verification audit error' });
  }
});

// 6. Append Administrative/Staff CRM Notes (Admin Only CRM)
router.post('/:id/notes', checkAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Booking reference not found.' });
    }
    const text = cleanText(req.body?.text, 1000);
    const addedBy = cleanText(req.body?.addedBy, 120);
    
    if (!text) {
      return res.status(400).json({ message: 'Note text cannot be empty.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking reference not found.' });
    }

    booking.notes.push({
      text,
      addedBy: addedBy || 'Admin'
    });

    await booking.save();
    res.json({ message: 'Private note appended to CRM file.', booking });

  } catch (err) {
    console.error('CRM note append error:', err);
    res.status(500).json({ message: 'Server CRM note error' });
  }
});

module.exports = router;
