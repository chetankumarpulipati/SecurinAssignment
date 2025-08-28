const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  cuisine: { type: String, index: true },
  title: { type: String, index: true },
  rating: { type: Number, default: null, index: true },
  prep_time: { type: Number, default: null },
  cook_time: { type: Number, default: null },
  total_time: { type: Number, default: null, index: true },
  description: { type: String },
  nutrients: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  serves: { type: String },
  // Additional fields that were previously ignored
  continent: { type: String, index: true },
  country_state: { type: String, index: true },
  url: { type: String },
  ingredients: [{ type: String }],
  instructions: [{ type: String }]
}, {
  timestamps: true
});

// Add indexes for better query performance
RecipeSchema.index({ rating: -1 });
RecipeSchema.index({ cuisine: 1, rating: -1 });
RecipeSchema.index({ total_time: 1 });
RecipeSchema.index({ title: 'text', description: 'text' });
RecipeSchema.index({ continent: 1, country_state: 1 });

module.exports = mongoose.model('Recipe', RecipeSchema);
