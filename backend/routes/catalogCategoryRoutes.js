const express = require('express');
const CatalogCategory = require('../models/CatalogCategory');
const Package = require('../models/Package');
const { packages: curatedPackages, isPublicPackage } = require('../utils/regionalCatalog');
const { categoryLabels } = require('../data/curatedLeisureCatalog');
const { checkAdmin } = require('../middleware/auth');

const router = express.Router();
const DEFAULTS = Object.keys(categoryLabels);
const isForbiddenCategory = value => /national|pilgrim|festival|cultur|irctc|temple|church|mosque|relig|hajj|umrah/i.test(String(value || ''));

const ensureDefaults = async () => {
  await CatalogCategory.bulkWrite(DEFAULTS.map((name, order) => ({
    updateOne: { filter: { name }, update: { $setOnInsert: { name, order, active: true } }, upsert: true }
  })), { ordered: false });
};

router.get('/', async (_req, res) => {
  try {
    await ensureDefaults();
    const categories = await CatalogCategory.find({ active: true }).sort({ order: 1, name: 1 }).lean();
    const databasePackages = await Package.find({ isActive: true, status: { $in: ['Approved', 'Published'] } })
      .select('packageId title destination packageCategory tourType catalogCategories regionScope destinationStates locationTags translations mealPlan inclusions itinerary isActive status seasonStart seasonEnd').lean();
    const usedCategories = new Set([
      ...curatedPackages.filter(pkg => isPublicPackage(pkg)).flatMap(pkg => pkg.catalogCategories || []),
      ...databasePackages.filter(pkg => isPublicPackage(pkg)).flatMap(pkg => pkg.catalogCategories || [])
    ]);
    res.json(categories.filter(category => !isForbiddenCategory(category.name)
      && (DEFAULTS.includes(category.name) || usedCategories.has(category.name))).map(({ name, order }) => ({ name, order })));
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
    if (isForbiddenCategory(name)) return res.status(422).json({ message: 'This category is not available in the current leisure catalogue.' });
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
    if (isForbiddenCategory(name)) return res.status(422).json({ message: 'This category is not available in the current leisure catalogue.' });
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
