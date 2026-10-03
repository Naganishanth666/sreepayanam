const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Booking = require('../models/Booking');
const { checkAdmin } = require('../middleware/auth');

// Card and net-banking flows are intentionally disabled until a PCI-compliant
// payment provider is integrated. The app must not simulate a payment gateway.
const PAYMENT_METHODS = new Set(['UPI', 'Bank Transfer']);
const BOOKING_STATUSES = new Set(['Pending', 'Confirmed', 'Completed', 'Cancelled']);
const cleanText = (value, maxLength) => typeof value === 'string'
  ? value.replace(/[<>\u0000-\u001F]/g, '').trim().slice(0, maxLength)
  : '';
const publicBooking = booking => ({
  bookingId: booking.bookingId,
  packageName: booking.packageName,
  bookingStatus: booking.bookingStatus,
  paymentStatus: booking.paymentStatus,
  totalAmount: booking.totalAmount,
  pendingAmount: booking.pendingAmount,
  createdAt: booking.createdAt
});

// A customer booking needs an accepted, staff-approved quotation and an
// accountant-approved tax amount. The legacy package-price checkout is retired.
router.post('/', (_req, res) => res.status(409).json({
  message: 'Request a tailored quotation first. Online booking opens after staff approval and acceptance.'
}));

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
