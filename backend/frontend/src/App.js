import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Rating from 'react-rating-stars-component';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Drawer, IconButton, Collapse, TextField, Button, TablePagination
} from '@mui/material';
import { ExpandLess, ExpandMore, Close } from '@mui/icons-material';
import './App.css';

// Backend API base URL
const API_BASE_URL = 'http://localhost:5000';

const nutrientFields = [
  'calories', 'carbohydrateContent', 'cholesterolContent', 'fiberContent',
  'proteinContent', 'saturatedFatContent', 'sodiumContent', 'sugarContent', 'fatContent'
];

function App() {
  // State
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ title: '', cuisine: '', rating: '', total_time: '', calories: '' });
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(15);
  const [total, setTotal] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandTimes, setExpandTimes] = useState(false);

  // Fetch paginated recipes
  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/recipes?page=${page + 1}&limit=${limit}`)
      .then(res => {
        setRecipes(res.data.data);
        setTotal(res.data.total);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch recipes');
        setLoading(false);
      });
  }, [page, limit]);

  // Search with filters
  const handleSearch = () => {
    setLoading(true);
    const params = Object.entries(filters)
      .filter(([k, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    axios.get(`${API_BASE_URL}/api/recipes/search?${params}`)
      .then(res => {
        setRecipes(res.data.data);
        setTotal(res.data.data.length);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to search recipes');
        setLoading(false);
      });
  };

  // Table columns
  const columns = [
    { id: 'title', label: 'Title', minWidth: 150 },
    { id: 'cuisine', label: 'Cuisine', minWidth: 80 },
    { id: 'rating', label: 'Rating', minWidth: 80 },
    { id: 'total_time', label: 'Total Time', minWidth: 80 },
    { id: 'serves', label: 'Serves', minWidth: 80 },
  ];

  // Render
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Recipe List</h1>
      <div className="flex flex-wrap gap-4 mb-4">
        <TextField label="Title" size="small" value={filters.title} onChange={e => setFilters(f => ({ ...f, title: e.target.value }))} />
        <TextField label="Cuisine" size="small" value={filters.cuisine} onChange={e => setFilters(f => ({ ...f, cuisine: e.target.value }))} />
        <TextField label="Rating (e.g. >=4)" size="small" value={filters.rating} onChange={e => setFilters(f => ({ ...f, rating: e.target.value }))} />
        <TextField label="Total Time (e.g. <=60)" size="small" value={filters.total_time} onChange={e => setFilters(f => ({ ...f, total_time: e.target.value }))} />
        <TextField label="Calories (e.g. <=400)" size="small" value={filters.calories} onChange={e => setFilters(f => ({ ...f, calories: e.target.value }))} />
        <Button variant="contained" color="primary" onClick={handleSearch}>Search</Button>
        <Button variant="outlined" onClick={() => { setFilters({ title: '', cuisine: '', rating: '', total_time: '', calories: '' }); setPage(0); }}>Reset</Button>
      </div>
      {loading && <div className="text-center py-8">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && recipes.length === 0 && <div className="text-center py-8">No results found</div>}
      {!loading && recipes.length > 0 && (
        <Paper>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {columns.map(col => (
                    <TableCell key={col.id} style={{ minWidth: col.minWidth }}>{col.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {recipes.map(recipe => (
                  <TableRow hover key={recipe._id} onClick={() => { setSelectedRecipe(recipe); setDrawerOpen(true); setExpandTimes(false); }} style={{ cursor: 'pointer' }}>
                    <TableCell>{(recipe.title || '').length > 40 ? recipe.title.slice(0, 40) + '…' : recipe.title}</TableCell>
                    <TableCell>{recipe.cuisine}</TableCell>
                    <TableCell>
                      <Rating value={recipe.rating || 0} edit={false} size={20} isHalf={true} />
                    </TableCell>
                    <TableCell>{recipe.total_time ?? '-'}</TableCell>
                    <TableCell>{recipe.serves ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={limit}
            onRowsPerPageChange={e => { setLimit(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[15, 20, 30, 50]}
          />
        </Paper>
      )}
      {/* Drawer for details */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="w-[400px] p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xl font-bold">{selectedRecipe?.title}</div>
              <div className="text-gray-500">{selectedRecipe?.cuisine}</div>
            </div>
            <IconButton onClick={() => setDrawerOpen(false)}><Close /></IconButton>
          </div>
          <div className="mb-2"><span className="font-semibold">Description:</span> {selectedRecipe?.description || '-'}</div>
          <div className="mb-2"><span className="font-semibold">Total Time:</span> {selectedRecipe?.total_time ?? '-'}</div>
          <div>
            <Button onClick={() => setExpandTimes(e => !e)} endIcon={expandTimes ? <ExpandLess /> : <ExpandMore />}>Prep & Cook Time</Button>
            <Collapse in={expandTimes}>
              <div className="pl-4">
                <div><span className="font-semibold">Prep Time:</span> {selectedRecipe?.prep_time ?? '-'}</div>
                <div><span className="font-semibold">Cook Time:</span> {selectedRecipe?.cook_time ?? '-'}</div>
              </div>
            </Collapse>
          </div>
          <div className="mt-4">
            <div className="font-semibold mb-1">Nutrients</div>
            <Table size="small">
              <TableBody>
                {nutrientFields.map(field => (
                  <TableRow key={field}>
                    <TableCell>{field}</TableCell>
                    <TableCell>{selectedRecipe?.nutrients?.[field] ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export default App;
