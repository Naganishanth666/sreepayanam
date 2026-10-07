const mongoose = require('mongoose');

const catalogCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80, unique: true },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 100 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CatalogCategory', catalogCategorySchema);
