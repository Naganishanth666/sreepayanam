const express = require('express');
const CatalogCategory = require('../models/CatalogCategory');
const Package = require('../models/Package');
const { packages: curatedPackages } = require('../data/curatedRegionalCatalog');
const { checkAdmin } = require('../middleware/auth');

const router = express.Router();
const DEFAULTS = [
  'National Tours', 'International Tours', 'Pilgrimage Tours', 'Honeymoon Packages',
  'Family Holidays', 'Hill Station Tours', 'Educational Tours', 'Medical Tourism',
  'Corporate & MICE', 'Festival & Cultural Tours', 'Cruise Holidays', 'IRCTC Rail Tours',
  'Tamil Nadu Pilgrimages', 'South India Pilgrimages', 'North India Pilgrimages', 'India-wide Pilgrimages'
];

const ensureDefaults = async () => {
  await CatalogCategory.bulkWrite(DEFAULTS.map((name, order) => ({
    updateOne: { filter: { name }, update: { $setOnInsert: { name, order, active: true } }, upsert: true }
  })), { ordered: false });
};

router.get('/', async (_req, res) => {
  try {
    await ensureDefaults();
    const categories = await CatalogCategory.find({ active: true }).sort({ order: 1, name: 1 }).lean();
    res.json(categories.map(({ name, order }) => ({ name, order })));
  } catch (error) {
    console.error('[Categories] List failed:', error.message);
    res.status(500).json({ message: 'Could not load catalogue categories.' });
  }
});

router.get('/admin', checkAdmin, async (_req, res) => {
  try {
    await ensureDefaults();
    res.json(await CatalogCategory.find().sort({ order: 1, name: 1 }).lean());
  } catch (error) {
    console.error('[Categories] Admin list failed:', error.message);
    res.status(500).json({ message: 'Could not load catalogue categories.' });
  }
});

router.post('/', checkAdmin, async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim().slice(0, 80);
    if (!name) return res.status(400).json({ message: 'Enter a category name.' });
    const category = await CatalogCategory.create({ name, order: Number.isFinite(Number(req.body?.order)) ? Number(req.body.order) : 100 });
    res.status(201).json(category);
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({ message: error.code === 11000 ? 'This category already exists.' : 'Category could not be created.' });
  }
});

router.put('/:id', checkAdmin, async (req, res) => {
  try {
    const category = await CatalogCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    const name = String(req.body?.name || '').trim().slice(0, 80);
    if (!name) return res.status(400).json({ message: 'Enter a category name.' });
    if (name !== category.name && (await Package.exists({ catalogCategories: category.name })
      || curatedPackages.some(pkg => pkg.catalogCategories.includes(category.name)))) {
      return res.status(409).json({ message: 'Move packages out of this category before renaming it.' });
    }
    category.name = name;
    if (Number.isFinite(Number(req.body?.order))) category.order = Number(req.body.order);
    if (typeof req.body?.active === 'boolean') category.active = req.body.active;
    category.updatedAt = new Date();
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({ message: error.code === 11000 ? 'This category already exists.' : 'Category could not be updated.' });
  }
});

router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    const category = await CatalogCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    if (await Package.exists({ catalogCategories: category.name })
      || curatedPackages.some(pkg => pkg.catalogCategories.includes(category.name))) {
      return res.status(409).json({ message: 'Move packages out of this category before removing it.' });
    }
    category.active = false;
    category.updatedAt = new Date();
    await category.save();
    res.json({ message: 'Category removed from menus.' });
  } catch {
    res.status(400).json({ message: 'Category could not be removed.' });
  }
});

module.exports = router;
module.exports.ensureDefaults = ensureDefaults;
