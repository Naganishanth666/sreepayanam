const express = require('express');
const Enquiry = require('../models/Enquiry');
// Assuming we'll have an auth middleware later
// const auth = require('../middleware/auth'); 

const router = express.Router();

// Submit a new enquiry (Public)
router.post('/', async (req, res) => {
  try {
    const newEnquiry = new Enquiry(req.body);
    await newEnquiry.save();
    res.status(201).json({ message: 'Enquiry submitted successfully', enquiry: newEnquiry });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all enquiries (Admin only - basic implementation)
router.get('/', async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update enquiry status (Admin only)
router.put('/:id/status', async (req, res) => {
  try {
    const { status, note } = req.body;
    let enquiry = await Enquiry.findById(req.params.id);
    
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    enquiry.status = status;
    if (note) {
      enquiry.notes.push({ text: note }); // Simplified for now without auth ID
    }

    await enquiry.save();
    res.json(enquiry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
