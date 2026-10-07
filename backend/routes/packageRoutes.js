const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Package = require('../models/Package');
const CatalogCategory = require('../models/CatalogCategory');
const { ensureDefaults } = require('./catalogCategoryRoutes');
const { publicationProblems } = require('../utils/catalogReadiness');
const { checkAdmin } = require('../middleware/auth');
const { packages: curatedPackages, byId: curatedById, isPublicPackage, withOverrides } = require('../utils/regionalCatalog');

const safeEqual = (left, right) => {
  if (typeof left !== 'string' || typeof right !== 'string' || !left || !right) return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const isAdminRequest = req => safeEqual(req.headers['x-admin-password'], process.env.ADMIN_PASSWORD);

const normalized = value => String(value || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim();
const routeSignature = pkg => crypto.createHash('sha256').update(JSON.stringify([
  normalized(pkg.startingCity), normalized(pkg.endingCity), normalized(pkg.destination),
  Number(pkg.durationDays), (pkg.itinerary || []).map(day => normalized(day.title))
])).digest('hex');
const validateCategories = async names => {
  await ensureDefaults();
  const unique = [...new Set((Array.isArray(names) ? names : []).map(name => String(name).trim()).filter(Boolean))];
  const count = await CatalogCategory.countDocuments({ name: { $in: unique }, active: true });
  return count === unique.length;
};
const duplicatePublishedRoute = async (signature, pkg, exceptId) => {
  const candidates = await Package.find({
    isActive: true, status: { $in: ['Approved', 'Published'] },
    ...(exceptId ? { packageId: { $ne: exceptId } } : {}),
    $or: [{ routeSignature: signature }, { startingCity: pkg.startingCity, endingCity: pkg.endingCity, durationDays: pkg.durationDays }]
  }).select('packageId title routeSignature startingCity endingCity destination durationDays itinerary').lean();
  return candidates.find(candidate => (candidate.routeSignature || routeSignature(candidate)) === signature)
    || curatedPackages.find(candidate => candidate.packageId !== exceptId && routeSignature(candidate) === signature) || null;
};

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
const toPublicSummary = packageDocument => {
  const { packageId, title, destination, packageCategory, tourType, catalogCategories,
    regionScope, hotelCategories, startingCity, endingCity, durationDays, durationNights,
    overview, imageUrl, status } = toPublicPackage(packageDocument);
  return { packageId, title, destination, packageCategory, tourType, catalogCategories,
    regionScope, hotelCategories, startingCity, endingCity, durationDays, durationNights,
    overview, imageUrl, status };
};
const matchesFilters = (pkg, filters) => (!filters.durationDays || pkg.durationDays === Number(filters.durationDays))
  && (!filters.startingCity || normalized(pkg.startingCity) === normalized(filters.startingCity))
  && (!filters.endingCity || normalized(pkg.endingCity) === normalized(filters.endingCity))
  && (!filters.hotelCategory || pkg.hotelCategories?.includes(filters.hotelCategory))
  && (!filters.regionScope || pkg.regionScope === filters.regionScope);

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
    if (req.query.durationDays) {
      const days = Number(req.query.durationDays);
      if (!Number.isInteger(days) || days < 1 || days > 60) return res.status(400).json({ message: 'Choose a valid number of travel days.' });
      query.durationDays = days;
    }
    for (const field of ['startingCity', 'endingCity']) {
      if (req.query[field]) query[field] = new RegExp(`^${String(req.query[field]).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }
    if (req.query.hotelCategory) {
      if (!['3 Star', '4 Star', '5 Star'].includes(req.query.hotelCategory)) return res.status(400).json({ message: 'Choose a valid hotel category.' });
      query.hotelCategories = req.query.hotelCategory;
    }
    if (req.query.regionScope) {
      if (!['Tamil Nadu', 'South India', 'North India', 'India-wide', 'Other'].includes(req.query.regionScope)) return res.status(400).json({ message: 'Choose a valid route region.' });
      query.regionScope = req.query.regionScope;
    }
    
    const databasePackages = await Package.find(query).sort({ createdAt: -1 });
    // Fetch every curated-ID override, including drafts and archived records,
    // so an edited or removed listing never falls back to its code version.
    const overrides = await Package.find({ packageId: { $in: curatedPackages.map(pkg => pkg.packageId) } });
    const byPackageId = new Map([...databasePackages, ...overrides].map(pkg => [pkg.packageId, pkg]));
    const combined = withOverrides([...byPackageId.values()]);
    if (isAdmin) return res.json(combined.filter(pkg => matchesFilters(pkg, req.query)));
    res.json(combined.filter(pkg => isPublicPackage(pkg) && matchesFilters(pkg, req.query)).map(toPublicSummary));
  } catch (error) {
    console.error('[Packages] List failed:', error.message);
    res.status(500).json({ message: 'Could not load packages.' });
  }
});

// The menu is a curated subset of published packages, controlled in the CMS.
router.get('/menu', async (_req, res) => {
  try {
    const databasePackages = await Package.find({ showInMenu: true }).lean();
    const overrides = await Package.find({ packageId: { $in: curatedPackages.map(pkg => pkg.packageId) } })
      .select('packageId').lean();
    const overridden = new Set(overrides.map(pkg => pkg.packageId));
    const menu = [...curatedPackages.filter(pkg => !overridden.has(pkg.packageId)), ...databasePackages]
      .filter(pkg => pkg.showInMenu && isPublicPackage(pkg))
      .sort((a, b) => (a.menuOrder || 100) - (b.menuOrder || 100) || a.title.localeCompare(b.title))
      .slice(0, 12).map(pkg => ({ packageId: pkg.packageId, title: pkg.title }));
    res.json(menu);
  } catch (error) {
    console.error('[Packages] Menu failed:', error.message);
    res.status(500).json({ message: 'Could not load package menu.' });
  }
});

// GET single package (Public - denies draft access, Admin - returns it)
router.get('/brochures', async (_req, res) => {
  try {
    const now = new Date();
    const packages = await Package.find({ isActive: true, status: { $in: ['Approved', 'Published'] }, brochureUrl: /^https:\/\//,
      $and: [{ $or: [{ seasonStart: { $exists: false } }, { seasonStart: null }, { seasonStart: { $lte: now } }] },
        { $or: [{ seasonEnd: { $exists: false } }, { seasonEnd: null }, { seasonEnd: { $gte: now } }] }] })
      .select('packageId title destination durationDays brochureUrl').sort({ createdAt: -1 }).lean();
    res.json(packages.filter(pkg => /^https:\/\/[^\s]+\.pdf(?:[?#]|$)/i.test(pkg.brochureUrl || ''))
      .map(pkg => ({ packageId: pkg.packageId, title: pkg.title, destination: pkg.destination, durationDays: pkg.durationDays, url: pkg.brochureUrl })));
  } catch (error) {
    console.error('[Packages] Brochures failed:', error.message);
    res.status(500).json({ message: 'Could not load brochures.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const isAdmin = isAdminRequest(req);

    const pkg = await Package.findOne({ packageId: req.params.id }) || curatedById.get(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    if (!isAdmin && !isPublicPackage(pkg)) {
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
    if (data.packageId && curatedById.has(data.packageId)) return res.status(409).json({ message: 'Edit this regional listing instead of creating a second copy.' });
    if (!await validateCategories(data.catalogCategories)) return res.status(422).json({ message: 'Choose only active catalogue categories.' });
    data.routeSignature = routeSignature(data);
    
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
router.post('/default-catalog', checkAdmin, (_req, res) => res.status(410).json({
  message: 'Bulk publishing is retired. Add distinct routes as drafts and complete the review before publishing.'
}));

// PUT update a package (Admin only)
router.put('/:id', checkAdmin, async (req, res) => {
  try {
    const { ensureMandatoryPolicies } = require('../utils/policyConstants');
    const databaseExisting = await Package.findOne({ packageId: req.params.id });
    const existing = databaseExisting || curatedById.get(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Package not found' });
    
    let data = { ...req.body };
    data.isSpecialOffer = false;
    if (!await validateCategories(data.catalogCategories || existing.catalogCategories)) return res.status(422).json({ message: 'Choose only active catalogue categories.' });
    const prior = existing.toObject ? existing.toObject() : existing;
    data.routeSignature = routeSignature({ ...prior, ...data });
    
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
    if (['Approved', 'Published'].includes(data.status)) {
      const problems = publicationProblems(data);
      const duplicate = await duplicatePublishedRoute(data.routeSignature, { ...prior, ...data }, existing.packageId);
      if (duplicate) problems.push(`This route matches published package ${duplicate.packageId} (${duplicate.title}). Review and differentiate the route before publishing.`);
      if (problems.length) return res.status(422).json({ message: 'Complete content review before publishing this package.', problems });
    }
    
    const pkg = databaseExisting
      ? await Package.findOneAndUpdate({ packageId: req.params.id }, { ...data, updatedAt: new Date() }, { new: true, runValidators: true })
      : await new Package({ ...existing, ...data, packageId: req.params.id, updatedAt: new Date() }).save();
    res.json(pkg);
  } catch (error) {
    console.error('[Packages] Update failed:', error.message);
    res.status(400).json({ message: 'Package could not be updated. Check the package details.' });
  }
});

// Archive a package without losing its enquiry and quote history.
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    let pkg = await Package.findOneAndUpdate({ packageId: req.params.id },
      { isActive: false, archivedAt: new Date(), updatedAt: new Date() }, { new: true });
    if (!pkg && curatedById.has(req.params.id)) {
      pkg = await Package.create({ ...curatedById.get(req.params.id), isActive: false,
        status: 'Draft', archivedAt: new Date(), updatedAt: new Date() });
    }
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json({ message: 'Package archived successfully', package: pkg });
  } catch (error) {
    console.error('[Packages] Archive failed:', error.message);
    res.status(500).json({ message: 'Package could not be archived.' });
  }
});

router.post('/:id/restore', checkAdmin, async (req, res) => {
  try {
    let pkg = await Package.findOneAndUpdate({ packageId: req.params.id },
      { isActive: true, archivedAt: null, updatedAt: new Date() }, { new: true });
    if (!pkg && curatedById.has(req.params.id)) {
      pkg = await Package.create({ ...curatedById.get(req.params.id), isActive: true, archivedAt: null });
    }
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json({ message: 'Package restored successfully', package: pkg });
  } catch { res.status(500).json({ message: 'Package could not be restored.' }); }
});

module.exports = router;
