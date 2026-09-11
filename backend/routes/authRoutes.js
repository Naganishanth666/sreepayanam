const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, checkAdmin } = require('../middleware/auth');

const router = express.Router();
const jwtSecret = () => process.env.JWT_SECRET || '';
const cleanText = (value, maxLength) => typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9 ()-]{8,20}$/;

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { 
      fullName, mobile, email, password, role, 
      city, state, country, whatsappNumber,
      agencyName, officeAddress, businessCategory, // Agent fields
      preferredTravelCategory // Customer fields
    } = req.body;

    const safeName = cleanText(fullName, 120);
    const safeMobile = cleanText(mobile, 24);
    const safeEmail = cleanText(email, 160).toLowerCase();
    const safePassword = typeof password === 'string' ? password : '';
    const safeRole = role === 'Agent' ? 'Agent' : 'Customer';

    if (!safeName || !phonePattern.test(safeMobile) || !emailPattern.test(safeEmail) || safePassword.length < 6 || safePassword.length > 128) {
      return res.status(400).json({ message: 'Please provide a valid name, mobile number, email and password.' });
    }
    if (!jwtSecret()) {
      return res.status(503).json({ message: 'Authentication is not configured on the server.' });
    }

    // Check if user exists
    let user = await User.findOne({ email: safeEmail });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(safePassword, salt);

    // Create user
    user = new User({
      fullName: safeName, mobile: safeMobile, email: safeEmail, password: hashedPassword, role: safeRole,
      city, state, country, whatsappNumber,
      ...(safeRole === 'Agent' && { agencyName, officeAddress, businessCategory }),
      ...(safeRole === 'Customer' && { preferredTravelCategory })
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
      jwtSecret(),
      { expiresIn: '5h' },
      (err, token) => {
        if (err) {
          console.error('[Auth] Registration token issue:', err.message);
          return res.status(500).json({ message: 'Registration could not be completed.' });
        }
        res.status(201).json({ token, role: user.role, name: user.fullName, message: 'Registration successful' });
      }
    );
  } catch (err) {
    console.error('[Auth] Registration failed:', err.message);
    res.status(500).json({ message: 'Registration could not be completed.' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const email = cleanText(req.body?.email, 160).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!emailPattern.test(email) || !password || password.length > 128) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

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

    if (!jwtSecret()) {
      return res.status(503).json({ message: 'Authentication is not configured on the server.' });
    }

    jwt.sign(
      payload,
      jwtSecret(),
      { expiresIn: '5h' },
      (err, token) => {
        if (err) {
          console.error('[Auth] Login token issue:', err.message);
          return res.status(500).json({ message: 'Login could not be completed.' });
        }
        res.json({ token, role: user.role, name: user.fullName });
      }
    );
  } catch (err) {
    console.error('[Auth] Login failed:', err.message);
    res.status(500).json({ message: 'Login could not be completed.' });
  }
});

// GET current user profile (Protected)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('[Auth] Profile lookup failed:', err.message);
    res.status(500).json({ message: 'Could not load the profile.' });
  }
});

// POST Verify Admin password (Legacy/Dashboard Flow)
router.post('/verify-admin', checkAdmin, (req, res) => {
  res.json({ success: true, message: 'Admin authenticated successfully' });
});

module.exports = router;
