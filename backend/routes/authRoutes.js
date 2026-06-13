const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { 
      fullName, mobile, email, password, role, 
      city, state, country, whatsappNumber,
      agencyName, officeAddress, businessCategory, // Agent fields
      preferredTravelCategory // Customer fields
    } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      fullName, mobile, email, password: hashedPassword, role,
      city, state, country, whatsappNumber,
      ...(role === 'Agent' && { agencyName, officeAddress, businessCategory }),
      ...(role === 'Customer' && { preferredTravelCategory })
    });

    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'sreepayanam_secret_key',
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token, role: user.role, message: 'Registration successful' });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    if (user.role === 'Agent' && !user.isApproved) {
      return res.status(403).json({ message: 'Agent account pending admin approval' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'sreepayanam_secret_key',
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, role: user.role, name: user.fullName });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET current user profile (Protected)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
