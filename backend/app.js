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

// Recipe model
const Recipe = require('./models/Recipe');

// Placeholder route
app.get('/', (req, res) => {
  res.send('Recipe API is running');
});

// Helper function to parse numeric filter operators
const parseNumericFilter = (filterValue) => {
  if (!filterValue) return null;

  const match = filterValue.match(/(<=|>=|=|<|>)(\d+(\.\d+)?)/);
  if (match) {
    const opMap = {
      '<=': '$lte',
      '>=': '$gte',
      '=': '$eq',
      '<': '$lt',
      '>': '$gt'
    };
    return { [opMap[match[1]]]: parseFloat(match[2]) };
  }

  // If no operator, treat as exact match
  const numValue = parseFloat(filterValue);
  if (!isNaN(numValue)) {
    return { $eq: numValue };
  }

  return null;
};

// Helper function to extract numeric value from nutrients
const extractCalories = (nutrientsStr) => {
  if (!nutrientsStr) return null;
  const match = nutrientsStr.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
};

// GET /api/recipes - paginated, sorted by rating desc
app.get('/api/recipes', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 per page
    const skip = (page - 1) * limit;

    const total = await Recipe.countDocuments();

    // Add aggregation pipeline to extract calories as numeric field for sorting
    const data = await Recipe.aggregate([
      {
        $addFields: {
          caloriesNumeric: {
            $toDouble: {
              $arrayElemAt: [
                {
                  $split: [
                    { $ifNull: ["$nutrients.calories", "0"] },
                    " "
                  ]
                },
                0
              ]
            }
          }
        }
      },
      { $sort: { rating: -1, caloriesNumeric: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          cuisine: 1,
          title: 1,
          rating: 1,
          prep_time: 1,
          cook_time: 1,
          total_time: 1,
          description: 1,
          nutrients: 1,
          serves: 1,
          continent: 1,
          country_state: 1,
          url: 1,
          ingredients: 1,
          instructions: 1
        }
      }
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data
    });
  } catch (err) {
    console.error('Error in /api/recipes:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recipes/search - advanced filtering
app.get('/api/recipes/search', async (req, res) => {
  try {
    const pipeline = [];
    const matchStage = {};

    // Add calories as numeric field for filtering
    pipeline.push({
      $addFields: {
        caloriesNumeric: {
          $toDouble: {
            $arrayElemAt: [
              {
                $split: [
                  { $ifNull: ["$nutrients.calories", "0"] },
                  " "
                ]
              },
              0
            ]
          }
        }
      }
    });

    // Calories filter
    if (req.query.calories) {
      const caloriesFilter = parseNumericFilter(req.query.calories);
      if (caloriesFilter) {
        matchStage.caloriesNumeric = caloriesFilter;
      }
    }

    // Title filter (partial match, case-insensitive)
    if (req.query.title) {
      matchStage.title = { $regex: req.query.title, $options: 'i' };
    }

    // Cuisine filter (case-insensitive partial match)
    if (req.query.cuisine) {
      matchStage.cuisine = { $regex: req.query.cuisine, $options: 'i' };
    }

    // Total time filter
    if (req.query.total_time) {
      const timeFilter = parseNumericFilter(req.query.total_time);
      if (timeFilter) {
        matchStage.total_time = timeFilter;
      }
    }

    // Rating filter
    if (req.query.rating) {
      const ratingFilter = parseNumericFilter(req.query.rating);
      if (ratingFilter) {
        matchStage.rating = ratingFilter;
      }
    }

    // Prep time filter
    if (req.query.prep_time) {
      const prepTimeFilter = parseNumericFilter(req.query.prep_time);
      if (prepTimeFilter) {
        matchStage.prep_time = prepTimeFilter;
      }
    }

    // Cook time filter
    if (req.query.cook_time) {
      const cookTimeFilter = parseNumericFilter(req.query.cook_time);
      if (cookTimeFilter) {
        matchStage.cook_time = cookTimeFilter;
      }
    }

    // Serves filter (partial match)
    if (req.query.serves) {
      matchStage.serves = { $regex: req.query.serves, $options: 'i' };
    }

    // Add match stage if there are filters
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    // Sort by rating desc, then by calories desc
    pipeline.push({ $sort: { rating: -1, caloriesNumeric: -1 } });

    // Get total count for pagination
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Recipe.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add skip and limit for pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Project to exclude computed fields
    pipeline.push({
      $project: {
        cuisine: 1,
        title: 1,
        rating: 1,
        prep_time: 1,
        cook_time: 1,
        total_time: 1,
        description: 1,
        nutrients: 1,
        serves: 1,
        continent: 1,
        country_state: 1,
        url: 1,
        ingredients: 1,
        instructions: 1
      }
    });

    const data = await Recipe.aggregate(pipeline);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data
    });
  } catch (err) {
    console.error('Error in /api/recipes/search:', err);
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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
