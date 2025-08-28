const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection (update the URI as needed)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipesdb';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Placeholder route
app.get('/', (req, res) => {
  res.send('Recipe API is running');
});

// Recipe model (simplified)
const Recipe = require('./models/Recipe');

// GET /recipes - list recipes, with optional filters (e.g., by name)
app.get('/recipes', async (req, res) => {
  try {
    const filter = {};
    // Example filter: ?name=chicken
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: 'i' };
    }
    // Add more filters as needed
    const recipes = await Recipe.find(filter).limit(100); // limit for safety
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /recipes/:id - get a single recipe by ID
app.get('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recipes - paginated, sorted by rating desc
app.get('/api/recipes', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await Recipe.countDocuments();
    const data = await Recipe.find()
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit);
    res.json({ page, limit, total, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recipes/search - advanced filtering
app.get('/api/recipes/search', async (req, res) => {
  try {
    const filter = {};
    // Calories filter (in nutrients)
    if (req.query.calories) {
      const match = req.query.calories.match(/(<=|>=|=|<|>)(\d+)/);
      if (match) {
        const opMap = { '<=': '$lte', '>=': '$gte', '=': '$eq', '<': '$lt', '>': '$gt' };
        filter['nutrients.calories'] = { [opMap[match[1]]]: Number(match[2]) };
      }
    }
    // Title filter (partial match)
    if (req.query.title) {
      filter.title = { $regex: req.query.title, $options: 'i' };
    }
    // Cuisine filter (exact match)
    if (req.query.cuisine) {
      filter.cuisine = req.query.cuisine;
    }
    // Total time filter
    if (req.query.total_time) {
      const match = req.query.total_time.match(/(<=|>=|=|<|>)(\d+)/);
      if (match) {
        const opMap = { '<=': '$lte', '>=': '$gte', '=': '$eq', '<': '$lt', '>': '$gt' };
        filter.total_time = { [opMap[match[1]]]: Number(match[2]) };
      }
    }
    // Rating filter
    if (req.query.rating) {
      const match = req.query.rating.match(/(<=|>=|=|<|>)([\d.]+)/);
      if (match) {
        const opMap = { '<=': '$lte', '>=': '$gte', '=': '$eq', '<': '$lt', '>': '$gt' };
        filter.rating = { [opMap[match[1]]]: Number(match[2]) };
      }
    }
    const data = await Recipe.find(filter).limit(100);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
