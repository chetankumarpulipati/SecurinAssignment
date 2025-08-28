const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Recipe = require('../models/Recipe');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipesdb';
const JSON_PATH = path.join(__dirname, '../../US_recipes.json');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  try {
    // Read file and replace NaN with null to make it valid JSON
    const rawData = fs.readFileSync(JSON_PATH, 'utf-8');
    const validJsonData = rawData.replace(/:\s*NaN/g, ': null');
    const recipesObject = JSON.parse(validJsonData);

    // Convert object to array
    const recipes = Object.values(recipesObject);
    console.log(`Found ${recipes.length} recipes in JSON file`);

    if (recipes.length > 0) {
      // Clean existing recipes first
      await Recipe.deleteMany({});
      console.log('Cleared existing recipes');

      // Clean and map recipes to required fields
      const cleanedRecipes = recipes.map(recipe => ({
        cuisine: recipe.cuisine || null,
        title: recipe.title || null,
        rating: typeof recipe.rating === 'number' && !isNaN(recipe.rating) ? recipe.rating : null,
        prep_time: typeof recipe.prep_time === 'number' && !isNaN(recipe.prep_time) ? recipe.prep_time : null,
        cook_time: typeof recipe.cook_time === 'number' && !isNaN(recipe.cook_time) ? recipe.cook_time : null,
        total_time: typeof recipe.total_time === 'number' && !isNaN(recipe.total_time) ? recipe.total_time : null,
        description: recipe.description || null,
        nutrients: recipe.nutrients || {},
        serves: recipe.serves || null
      }));

      // Insert in batches to avoid memory issues
      const batchSize = 1000;
      for (let i = 0; i < cleanedRecipes.length; i += batchSize) {
        const batch = cleanedRecipes.slice(i, i + batchSize);
        await Recipe.insertMany(batch);
        console.log(`Imported batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(cleanedRecipes.length/batchSize)} (${batch.length} recipes)`);
      }

      console.log(`Successfully imported ${cleanedRecipes.length} recipes!`);
    } else {
      console.error('No recipes found in the JSON file.');
    }
  } catch (err) {
    console.error('Error importing recipes:', err);
  } finally {
    mongoose.disconnect();
  }
});
