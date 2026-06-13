const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Package = require('../models/Package');
const { checkAdmin } = require('../middleware/auth');

// HELPER: Generate a unique, professional Booking Reference ID (e.g., SP-202605-A7B9)
const generateBookingId = () => {
  const dateStr = new Date().toISOString().slice(0, 7).replace('-', ''); // YYYYMM
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 random alpha-numeric
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

    // Validate core fields
    if (!customerName || !emailId || !mobileNumber || !travelDate || !numberOfPassengers) {
      return res.status(400).json({ message: 'Missing required customer contact or travel parameter.' });
    }

    // Resolve pricing
    let totalAmount = 0;
    let packageName = 'Custom Booking';

    if (packageId) {
      const pkg = await Package.findById(packageId);
      if (!pkg) {
        return res.status(404).json({ message: 'Requested tour package not found.' });
      }
      packageName = pkg.title;
      const basePrice = pkg.offerPrice || pkg.originalPrice || pkg.price || 0;
      // Total amount = base price * passengers + 5% GST/Taxes
      const subtotal = basePrice * Number(numberOfPassengers);
      const tax = subtotal * 0.05; // 5% GST
      totalAmount = Math.round(subtotal + tax);
    } else {
      // For custom bookings, totalAmount is passed from request or calculated dynamically
      totalAmount = req.body.totalAmount || 0;
    }

    if (totalAmount <= 0) {
      return res.status(400).json({ message: 'Booking amount must be positive.' });
    }

    const bookingId = generateBookingId();

    const bookingData = {
      bookingId,
      packageId: packageId || null,
      packageName,
      customerName,
      emailId,
      mobileNumber,
      travelDate: new Date(travelDate),
      numberOfPassengers: Number(numberOfPassengers),
      adultCount: Number(adultCount || numberOfPassengers),
      childCount: Number(childCount || 0),
      fromLocation,
      toLocation,
      travelDetails: travelDetails || {},
      remarks,
      totalAmount,
      paidAmount: 0,
      pendingAmount: totalAmount,
      payments: []
    };

    // If customer has submitted payment credentials immediately during checkout, log it!
    if (paymentMethod && transactionId && paymentAmount) {
      const amountNum = Number(paymentAmount);
      
      // UPI validation security safeguard
      let secureNotes = '';
      if (paymentMethod === 'UPI') {
        const upiSuffix = process.env.UPI_SUFFIX || 'upi';
        secureNotes = `Locked to Official UPI Destination VPA: 9443217654@${upiSuffix}`;
      }

      bookingData.payments.push({
        amount: amountNum,
        paymentMethod,
        transactionId: transactionId.trim(),
        status: 'Pending Verification',
        notes: `Initial checkout payment claim. ${secureNotes}`.trim()
      });
    }

    const booking = new Booking(bookingData);
    await booking.save();

    res.status(201).json({
      message: 'Booking created successfully! Awaiting payment verification.',
      booking
    });

  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Server checkout error', error: err.message });
  }
});

// 2. Submit/Record another Payment Transaction claim for a Booking (Public or Admin)
router.post('/:id/payment', async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId, notes } = req.body;
    
    if (!amount || !paymentMethod || !transactionId) {
      return res.status(400).json({ message: 'Missing transaction details: amount, method, or transaction reference.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking reference not found.' });
    }

    let secureNotes = notes || '';
    if (paymentMethod === 'UPI') {
      const upiSuffix = process.env.UPI_SUFFIX || 'upi';
      secureNotes = `Locked to Official UPI Destination VPA: 9443217654@${upiSuffix}. ${secureNotes}`.trim();
    }

    booking.payments.push({
      amount: Number(amount),
      paymentMethod,
      transactionId: transactionId.trim(),
      status: 'Pending Verification',
      notes: secureNotes
    });

    await booking.save();
    res.json({ message: 'Payment reference logged successfully. Pending verification.', booking });

  } catch (err) {
    console.error('Payment submission error:', err);
    res.status(500).json({ message: 'Server payment logging error', error: err.message });
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
    const { bookingStatus } = req.body;
    
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
    const { text, addedBy } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Note text cannot be empty.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking reference not found.' });
    }

    booking.notes.push({
      text: text.trim(),
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
