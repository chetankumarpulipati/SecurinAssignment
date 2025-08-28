import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactStars from 'react-rating-stars-component';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Drawer, IconButton, Collapse, TextField, Button, TablePagination,
  Typography, Box, Grid, Card, CardContent, Divider, Chip, Alert,
  CircularProgress, InputAdornment, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import {
  ExpandLess, ExpandMore, Close, Search, FilterList, Star, StarBorder,
  AccessTime, Restaurant, Person
} from '@mui/icons-material';
import './App.css';

// Backend API base URL
const API_BASE_URL = 'http://localhost:5000';

const nutrientFields = [
  { key: 'calories', label: 'Calories' },
  { key: 'carbohydrateContent', label: 'Carbohydrates' },
  { key: 'cholesterolContent', label: 'Cholesterol' },
  { key: 'fiberContent', label: 'Fiber' },
  { key: 'proteinContent', label: 'Protein' },
  { key: 'saturatedFatContent', label: 'Saturated Fat' },
  { key: 'sodiumContent', label: 'Sodium' },
  { key: 'sugarContent', label: 'Sugar' },
  { key: 'fatContent', label: 'Total Fat' }
];

function App() {
  // State
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    title: '',
    cuisine: '',
    rating: '',
    total_time: '',
    calories: '',
    serves: ''
  });
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandTimes, setExpandTimes] = useState(false);
  const [searchMode, setSearchMode] = useState(false);

  // Fetch paginated recipes
  const fetchRecipes = async (pageNum = page + 1, limitNum = limit, useFilters = false) => {
    setLoading(true);
    setError(null);

    try {
      let url = `${API_BASE_URL}/api/recipes?page=${pageNum}&limit=${limitNum}`;

      if (useFilters) {
        const params = Object.entries(filters)
          .filter(([k, v]) => v && v.trim() !== '')
          .map(([k, v]) => `${k}=${encodeURIComponent(v.trim())}`)
          .join('&');

        if (params) {
          url = `${API_BASE_URL}/api/recipes/search?${params}&page=${pageNum}&limit=${limitNum}`;
        }
      }

      const response = await axios.get(url);
      const data = response.data;

      setRecipes(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to fetch recipes. Please try again.');
      setRecipes([]);
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRecipes(1, limit, false);
  }, []);

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    fetchRecipes(newPage + 1, limit, searchMode);
  };

  // Handle rows per page change
  const handleLimitChange = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setLimit(newLimit);
    setPage(0);
    fetchRecipes(1, newLimit, searchMode);
  };

  // Handle search
  const handleSearch = () => {
    setPage(0);
    setSearchMode(true);
    fetchRecipes(1, limit, true);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      title: '',
      cuisine: '',
      rating: '',
      total_time: '',
      calories: '',
      serves: ''
    });
    setPage(0);
    setSearchMode(false);
    fetchRecipes(1, limit, false);
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Handle row click
  const handleRowClick = (recipe) => {
    setSelectedRecipe(recipe);
    setDrawerOpen(true);
  };

  // Close drawer
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedRecipe(null);
    setExpandTimes(false);
  };

  // Truncate text
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Format rating display
  const formatRating = (rating) => {
    if (!rating || isNaN(rating)) return 'N/A';
    return parseFloat(rating).toFixed(1);
  };

  // Format time display
  const formatTime = (minutes) => {
    if (!minutes || isNaN(minutes)) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Format serves
  const formatServes = (serves) => {
    if (!serves) return 'N/A';
    return serves;
  };

  return (
    <div className="App">
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Recipe Collection
        </Typography>

        {/* Filters Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
              Search & Filter Recipes
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Recipe Title"
                  value={filters.title}
                  onChange={(e) => handleFilterChange('title', e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Cuisine"
                  value={filters.cuisine}
                  onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Rating (e.g., >=4.5)"
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  size="small"
                  placeholder=">=4.5"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Total Time (e.g., <=60)"
                  value={filters.total_time}
                  onChange={(e) => handleFilterChange('total_time', e.target.value)}
                  size="small"
                  placeholder="<=60"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Calories (e.g., <=400)"
                  value={filters.calories}
                  onChange={(e) => handleFilterChange('calories', e.target.value)}
                  size="small"
                  placeholder="<=400"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleSearch}
                    disabled={loading}
                    size="small"
                  >
                    Search
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={clearFilters}
                    disabled={loading}
                    size="small"
                  >
                    Clear
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* No Results */}
        {!loading && recipes.length === 0 && !error && (
          <Card sx={{ textAlign: 'center', py: 4 }}>
            <CardContent>
              <Restaurant sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {searchMode ? 'No recipes found matching your criteria' : 'No recipes available'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {searchMode ? 'Try adjusting your search filters' : 'Please check back later'}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Recipes Table */}
        {!loading && recipes.length > 0 && (
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Title</strong></TableCell>
                    <TableCell><strong>Cuisine</strong></TableCell>
                    <TableCell align="center"><strong>Rating</strong></TableCell>
                    <TableCell align="center"><strong>Total Time</strong></TableCell>
                    <TableCell align="center"><strong>Serves</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recipes.map((recipe, index) => (
                    <TableRow
                      key={recipe._id || index}
                      hover
                      onClick={() => handleRowClick(recipe)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography variant="body2" title={recipe.title}>
                          {truncateText(recipe.title, 40)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={recipe.cuisine || 'Unknown'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ReactStars
                            count={5}
                            value={recipe.rating || 0}
                            size={20}
                            edit={false}
                            activeColor="#ffd700"
                            emptyIcon={<StarBorder />}
                            filledIcon={<Star />}
                          />
                          <Typography variant="caption" sx={{ ml: 1 }}>
                            {formatRating(recipe.rating)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                          {formatTime(recipe.total_time)}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Person sx={{ fontSize: 16, mr: 0.5 }} />
                          {formatServes(recipe.serves)}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[15, 25, 50]}
              component="div"
              count={total}
              rowsPerPage={limit}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleLimitChange}
            />
          </Paper>
        )}

        {/* Recipe Detail Drawer */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={handleCloseDrawer}
          sx={{
            '& .MuiDrawer-paper': {
              width: { xs: '100%', sm: 500 },
              padding: 3
            }
          }}
        >
          {selectedRecipe && (
            <Box>
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ flex: 1, mr: 2 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {selectedRecipe.title}
                  </Typography>
                  <Chip
                    label={selectedRecipe.cuisine || 'Unknown Cuisine'}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <IconButton onClick={handleCloseDrawer}>
                  <Close />
                </IconButton>
              </Box>

              {/* Description */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Description:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedRecipe.description || 'No description available'}
                </Typography>
              </Box>

              {/* Time Information */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => setExpandTimes(!expandTimes)}
                >
                  <Typography variant="h6" sx={{ mr: 1 }}>
                    Total Time: {formatTime(selectedRecipe.total_time)}
                  </Typography>
                  {expandTimes ? <ExpandLess /> : <ExpandMore />}
                </Box>

                <Collapse in={expandTimes}>
                  <Box sx={{ mt: 2, pl: 2 }}>
                    <Typography variant="body2">
                      <strong>Prep Time:</strong> {formatTime(selectedRecipe.prep_time)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Cook Time:</strong> {formatTime(selectedRecipe.cook_time)}
                    </Typography>
                  </Box>
                </Collapse>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Nutrition Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Nutrition Information
                </Typography>

                {selectedRecipe.nutrients && Object.keys(selectedRecipe.nutrients).length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        {nutrientFields.map(({ key, label }) => {
                          const value = selectedRecipe.nutrients[key];
                          return (
                            <TableRow key={key}>
                              <TableCell component="th" scope="row">
                                <strong>{label}</strong>
                              </TableCell>
                              <TableCell align="right">
                                {value || 'N/A'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No nutrition information available
                  </Typography>
                )}
              </Box>

              {/* Additional Info */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Serves:</strong> {selectedRecipe.serves || 'N/A'}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    <strong>Rating:</strong>
                  </Typography>
                  <ReactStars
                    count={5}
                    value={selectedRecipe.rating || 0}
                    size={20}
                    edit={false}
                    activeColor="#ffd700"
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({formatRating(selectedRecipe.rating)})
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Drawer>
      </Box>
    </div>
  );
}

export default App;
