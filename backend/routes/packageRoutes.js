const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const { checkAdmin } = require('../middleware/auth');

// GET all packages (Public)
router.get('/', async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single package (Public)
router.get('/:id', async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new package (Admin only)
router.post('/', checkAdmin, async (req, res) => {
  try {
    // Map legacy fields to new schema fields for backwards compatibility
    const data = {
      ...req.body,
      overview: req.body.overview || req.body.description,
      originalPrice: req.body.originalPrice || req.body.price,
      packageCategory: req.body.packageCategory || 'National',
      tourType: req.body.tourType || 'Family Tours',
      durationNights: req.body.durationNights || (req.body.durationDays - 1) || 1,
      isActive: true,
    };
    const pkg = new Package(data);
    const newPackage = await pkg.save();
    res.status(201).json(newPackage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update a package (Admin only)
router.put('/:id', checkAdmin, async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json(pkg);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a package (Admin only)
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    await pkg.deleteOne();
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
