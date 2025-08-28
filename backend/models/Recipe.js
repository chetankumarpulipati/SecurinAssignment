const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  cuisine: { type: String },
  title: { type: String },
  rating: { type: Number, default: null },
  prep_time: { type: Number, default: null },
  cook_time: { type: Number, default: null },
  total_time: { type: Number, default: null },
  description: { type: String },
  nutrients: { type: Object },
  serves: { type: String }
});

module.exports = mongoose.model('Recipe', RecipeSchema);
