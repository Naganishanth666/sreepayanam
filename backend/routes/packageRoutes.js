const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Package = require('../models/Package');
const { publicationProblems } = require('../utils/catalogReadiness');
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
  delete result.originalPrice;
  delete result.offerPrice;
  delete result.price;
  delete result.isSpecialOffer;
  delete result.offerValidity;
  delete result.brochureUrl;
  delete result.catalogSeedKey;
  delete result.isDefaultCatalogPackage;
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
    
    let query = {};
    if (!isAdmin) {
      const now = new Date();
      query = { isActive: true, status: { $in: ['Approved', 'Published'] },
        $and: [{ $or: [{ seasonStart: { $exists: false } }, { seasonStart: null }, { seasonStart: { $lte: now } }] },
          { $or: [{ seasonEnd: { $exists: false } }, { seasonEnd: null }, { seasonEnd: { $gte: now } }] }] };
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
    
    const now = new Date();
    if (!isAdmin && (!pkg.isActive || !['Approved', 'Published'].includes(pkg.status)
      || (pkg.seasonStart && pkg.seasonStart > now) || (pkg.seasonEnd && pkg.seasonEnd < now))) {
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
      originalPrice: req.body.originalPrice || req.body.price || undefined,
      packageCategory: req.body.packageCategory || 'National',
      tourType: req.body.tourType || 'Family Tours',
      durationNights: req.body.durationNights || (req.body.durationDays - 1) || 1,
      isActive: true,
      status: 'Draft',
      isSpecialOffer: false,
    };
    
    // Process and run costing engine calculation if fields are present
    const calculatedCost = processCosting(req.body);
    if (calculatedCost?.supplierCost > 0) {
      data.costingBreakdown = calculatedCost;
      data.markupPercent = 35;
      data.discountPercent = 0;
      data.originalPrice = calculatedCost.sellingPrice;
      data.offerPrice = calculatedCost.customerPrice;
      data.baseCost = calculatedCost.supplierCost;
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

// Publish the user's requested price-free standard catalogue in one idempotent Admin action.
router.post('/default-catalog', checkAdmin, async (_req, res) => {
  try {
    const { buildDefaultCatalog, DEFAULT_CATALOG_TOTAL, DEFAULT_CATALOG_CATEGORIES } = require('../utils/defaultCatalog');
    const { ensureMandatoryPolicies } = require('../utils/policyConstants');
    const catalog = buildDefaultCatalog().map(item => ensureMandatoryPolicies({ ...item }));
    if (catalog.length !== DEFAULT_CATALOG_TOTAL) {
      return res.status(500).json({ message: 'The default catalogue is incomplete and was not published.' });
    }

    const operations = catalog.map(item => ({
      updateOne: {
        filter: { catalogSeedKey: item.catalogSeedKey },
        update: { $setOnInsert: item },
        upsert: true
      }
    }));
    const result = await Package.bulkWrite(operations, { ordered: false });
    const seedKeys = catalog.map(item => item.catalogSeedKey);
    const published = await Package.find({
      catalogSeedKey: { $in: seedKeys },
      isActive: true,
      status: { $in: ['Approved', 'Published'] }
    }).select('+catalogSeedKey packageId catalogCategories').lean();

    const categoryCounts = DEFAULT_CATALOG_CATEGORIES.map(category => ({
      category,
      published: published.filter(item => item.catalogCategories?.includes(category)).length
    }));
    res.json({
      success: true,
      total: DEFAULT_CATALOG_TOTAL,
      created: result.upsertedCount || 0,
      alreadyPresent: DEFAULT_CATALOG_TOTAL - (result.upsertedCount || 0),
      published: published.length,
      categoryCounts
    });
  } catch (error) {
    console.error('[Packages] Default catalogue publish failed:', error.message);
    res.status(500).json({ message: 'The default package catalogue could not be published.' });
  }
});

// PUT update a package (Admin only)
router.put('/:id', checkAdmin, async (req, res) => {
  try {
    const { ensureMandatoryPolicies } = require('../utils/policyConstants');
    const existing = await Package.findOne({ packageId: req.params.id });
    if (!existing) return res.status(404).json({ message: 'Package not found' });
    
    let data = { ...req.body };
    data.isSpecialOffer = false;
    
    // Process and run costing engine calculation if fields are present
    const calculatedCost = processCosting(req.body);
    if (calculatedCost?.supplierCost > 0) {
      data.costingBreakdown = calculatedCost;
      data.markupPercent = 35;
      data.discountPercent = 0;
      data.originalPrice = calculatedCost.sellingPrice;
      data.offerPrice = calculatedCost.customerPrice;
      data.baseCost = calculatedCost.supplierCost;
    }
    
    // Ensure mandatory policies for National packages
    data = ensureMandatoryPolicies(data);
    if (['Approved', 'Published'].includes(data.status) && !['Approved', 'Published'].includes(existing.status)) {
      const problems = publicationProblems(data);
      if (problems.length) return res.status(422).json({ message: 'Complete content review before publishing this package.', problems });
    }
    
    const pkg = await Package.findOneAndUpdate(
      { packageId: req.params.id },
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    res.json(pkg);
  } catch (error) {
    console.error('[Packages] Update failed:', error.message);
    res.status(400).json({ message: 'Package could not be updated. Check the package details.' });
  }
});

// Archive a package without losing its enquiry and quote history.
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    const pkg = await Package.findOneAndUpdate({ packageId: req.params.id },
      { isActive: false, archivedAt: new Date(), updatedAt: new Date() }, { new: true });
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json({ message: 'Package archived successfully', package: pkg });
  } catch (error) {
    console.error('[Packages] Archive failed:', error.message);
    res.status(500).json({ message: 'Package could not be archived.' });
  }
});

router.post('/:id/restore', checkAdmin, async (req, res) => {
  try {
    const pkg = await Package.findOneAndUpdate({ packageId: req.params.id },
      { isActive: true, archivedAt: null, updatedAt: new Date() }, { new: true });
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json({ message: 'Package restored successfully', package: pkg });
  } catch { res.status(500).json({ message: 'Package could not be restored.' }); }
});

module.exports = router;
