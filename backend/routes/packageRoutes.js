const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Package = require('../models/Package');
const { checkAdmin } = require('../middleware/auth');

const safeEqual = (left, right) => {
  if (typeof left !== 'string' || typeof right !== 'string' || !left || !right) return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const isAdminRequest = req => safeEqual(req.headers['x-admin-password'], process.env.ADMIN_PASSWORD);

const toPublicPackage = packageDocument => {
  const result = packageDocument?.toObject ? packageDocument.toObject() : { ...packageDocument };
  // Supplier rates, landed cost, markup and internal notes must never be sent
  // to the public planner or customer-facing package pages.
  delete result.baseCost;
  delete result.profitMarginPercent;
  delete result.priceBreakdown;
  delete result.costingBreakdown;
  return result;
};

// Helper to run costing calculation if costing fields are provided
function processCosting(body) {
  const hasCostingFields = body.costingBreakdown || 
    body.adultCount !== undefined || 
    body.hotelRoomRate !== undefined || 
    body.vehicleDailyRate !== undefined ||
    body.markupPercent !== undefined;
    
  if (hasCostingFields) {
    const { calculateCosting } = require('../utils/costingEngine');
    const input = {
      ...(body.costingBreakdown || {}),
      durationDays: body.durationDays || (body.costingBreakdown && body.costingBreakdown.vehicleDays) || 1,
      durationNights: body.durationNights || (body.costingBreakdown && body.costingBreakdown.hotelNights) || 1,
    };
    
    // Merge flat costing fields if they exist
    const fieldsToMerge = [
      'adultCount', 'childWithBedCount', 'childNoBedCount', 'infantCount',
      'hotelRooms', 'hotelExtraBeds', 'hotelRoomRate', 'hotelExtraBedRate', 'hotelCnbRate',
      'vehicleType', 'vehicleDailyRate', 'vehicleDays', 'vehicleKm', 'vehicleRatePerKm', 'vehicleNightCharges', 'vehicleCalculationMode',
      'mealPlanRate', 'mealNights', 'sightseeingCostPerPax', 'activityCostPerPax',
      'guideCostPerDay', 'tollPermitParkingCost', 'driverAllowancePerDay', 'escortCostPerDay', 'insuranceCostPerPax', 'miscCost',
      'bufferPercent', 'markupPercent', 'taxPercent', 'discountPercent', 'discountAmount', 'discountType'
    ];
    
    fieldsToMerge.forEach(field => {
      if (body[field] !== undefined) {
        input[field] = body[field];
      }
    });
    
    try {
      return calculateCosting(input);
    } catch (err) {
      console.error('Error running calculateCosting in packageRoutes:', err);
    }
  }
  return body.costingBreakdown;
}

// GET all packages (Public - filters drafts, Admin - returns all)
router.get('/', async (req, res) => {
  try {
    const isAdmin = isAdminRequest(req);
    
    let query = { isActive: true };
    if (!isAdmin) {
      query.status = { $ne: 'Draft' };
    }
    
    const packages = await Package.find(query).sort({ createdAt: -1 });
    res.json(isAdmin ? packages : packages.map(toPublicPackage));
  } catch (error) {
    console.error('[Packages] List failed:', error.message);
    res.status(500).json({ message: 'Could not load packages.' });
  }
});

// GET single package (Public - denies draft access, Admin - returns it)
router.get('/:id', async (req, res) => {
  try {
    const isAdmin = isAdminRequest(req);

    const pkg = await Package.findOne({ packageId: req.params.id });
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    
    if (!isAdmin && pkg.status === 'Draft') {
      return res.status(403).json({ message: 'Access denied. Package is in draft status.' });
    }
    
    res.json(isAdmin ? pkg : toPublicPackage(pkg));
  } catch (error) {
    console.error('[Packages] Detail failed:', error.message);
    res.status(500).json({ message: 'Could not load the package.' });
  }
});

// POST a new package (Admin only)
router.post('/', checkAdmin, async (req, res) => {
  try {
    const { ensureMandatoryPolicies } = require('../utils/policyConstants');
    
    // Map legacy fields to new schema fields for backwards compatibility
    let data = {
      ...req.body,
      overview: req.body.overview || req.body.description,
      originalPrice: req.body.originalPrice || req.body.price,
      packageCategory: req.body.packageCategory || 'National',
      tourType: req.body.tourType || 'Family Tours',
      durationNights: req.body.durationNights || (req.body.durationDays - 1) || 1,
      isActive: true,
    };
    
    // Process and run costing engine calculation if fields are present
    const calculatedCost = processCosting(req.body);
    if (calculatedCost) {
      data.costingBreakdown = calculatedCost;
    }
    
    // Ensure mandatory policies for National packages
    data = ensureMandatoryPolicies(data);
    
    const pkg = new Package(data);
    const newPackage = await pkg.save();
    res.status(201).json(newPackage);
  } catch (error) {
    console.error('[Packages] Create failed:', error.message);
    res.status(400).json({ message: 'Package could not be saved. Check the package details.' });
  }
});

// PUT update a package (Admin only)
router.put('/:id', checkAdmin, async (req, res) => {
  try {
    const { ensureMandatoryPolicies } = require('../utils/policyConstants');
    
    let data = { ...req.body };
    
    // Process and run costing engine calculation if fields are present
    const calculatedCost = processCosting(req.body);
    if (calculatedCost) {
      data.costingBreakdown = calculatedCost;
    }
    
    // Ensure mandatory policies for National packages
    data = ensureMandatoryPolicies(data);
    
    const pkg = await Package.findOneAndUpdate(
      { packageId: req.params.id },
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json(pkg);
  } catch (error) {
    console.error('[Packages] Update failed:', error.message);
    res.status(400).json({ message: 'Package could not be updated. Check the package details.' });
  }
});

// DELETE a package (Admin only)
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    const pkg = await Package.findOne({ packageId: req.params.id });
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    await pkg.deleteOne();
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('[Packages] Delete failed:', error.message);
    res.status(500).json({ message: 'Package could not be deleted.' });
  }
});

module.exports = router;
