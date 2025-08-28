# Recipe Data Collection and API

A full-stack application for managing and displaying recipe data with a RESTful API backend and React frontend.

## Features

### Backend API
- **GET /api/recipes** - Paginated list of recipes sorted by rating (descending)
- **GET /api/recipes/search** - Advanced search with multiple filters
- Supports filtering by: calories, title, cuisine, total_time, rating, prep_time, cook_time, serves
- Handles NaN values properly by converting them to NULL
- MongoDB database with optimized indexes

### Frontend UI
- Responsive table displaying recipes with title, cuisine, rating (stars), total time, and serves
- Advanced search filters with field-level filtering
- Pagination (customizable: 15, 25, or 50 results per page)
- Detailed recipe view in right-side drawer
- Star rating system for displaying ratings
- Expandable time information (prep time, cook time)
- Nutrition information table
- Fallback screens for no results and loading states

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- CORS enabled for frontend communication

### Frontend
- React 19.1.1
- Material-UI (MUI) for components
- React Rating Stars Component
- Axios for API calls

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Git

### 1. Clone and Setup

```bash
cd D:\Projects\securinAssignment
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Database Setup

Make sure MongoDB is running on `mongodb://localhost:27017/recipesdb` or update the connection string in `backend/app.js`.

### 4. Import Recipe Data

```bash
# From the backend directory
node scripts/import_recipes.js
```

This will:
- Read the US_recipes.json file
- Handle NaN values by converting them to null
- Clean and import all recipe data into MongoDB
- Create necessary indexes for optimal query performance

### 5. Start Backend Server

```bash
# From the backend directory
npm start
```

Backend will run on http://localhost:5000

### 6. Frontend Setup

```bash
cd frontend
npm install
```

### 7. Start Frontend

```bash
npm start
```

Frontend will run on http://localhost:3000

## API Documentation

### GET /api/recipes

Get paginated recipes sorted by rating (descending).

**Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10, max: 50)

**Example:**
```
GET /api/recipes?page=1&limit=10
```

**Response:**
```json
{
  "page": 1,
  "limit": 10,
  "total": 150,
  "totalPages": 15,
  "data": [...]
}
```

### GET /api/recipes/search

Search recipes with advanced filtering.

**Parameters:**
- `title` (optional): Partial match on recipe title
- `cuisine` (optional): Partial match on cuisine
- `calories` (optional): Filter by calories (supports <=, >=, <, >, =)
- `rating` (optional): Filter by rating (supports <=, >=, <, >, =)
- `total_time` (optional): Filter by total time (supports <=, >=, <, >, =)
- `prep_time` (optional): Filter by prep time (supports <=, >=, <, >, =)
- `cook_time` (optional): Filter by cook time (supports <=, >=, <, >, =)
- `serves` (optional): Partial match on serves field
- `page` (optional): Page number
- `limit` (optional): Results per page

**Example:**
```
GET /api/recipes/search?calories=<=400&title=pie&rating=>=4.5&page=1&limit=10
```

## Database Schema

The Recipe model includes the following fields:
- `cuisine` (String, indexed)
- `title` (String, indexed)
- `rating` (Number, nullable, indexed)
- `prep_time` (Number, nullable)
- `cook_time` (Number, nullable)
- `total_time` (Number, nullable, indexed)
- `description` (Text)
- `nutrients` (JSON/Object)
- `serves` (String)

## Frontend Features

### Recipe Table
- Displays title (truncated if too long)
- Cuisine as colored chips
- Star ratings with numeric value
- Time display with icons
- Serves information with icons
- Clickable rows to open detail view

### Search & Filtering
- Real-time search across multiple fields
- Support for comparison operators (<=, >=, <, >, =)
- Clear filters functionality
- Search mode indication

### Detail Drawer
- Recipe title and cuisine in header
- Full description
- Expandable time information (total, prep, cook)
- Complete nutrition table
- Additional recipe information

### Responsive Design
- Mobile-friendly layout
- Responsive table and drawer
- Optimized for various screen sizes

## Error Handling

- NaN values in JSON are properly handled and converted to NULL
- API errors are displayed to users
- Loading states during data fetching
- Fallback screens for empty results
- Network error handling

## Performance Optimizations

- Database indexes on frequently queried fields
- Pagination to limit data transfer
- Aggregation pipeline for complex queries
- Optimized React rendering with proper key props
- Debounced search (can be added if needed)

## Testing the API

You can test the API endpoints using curl, Postman, or any HTTP client:

```bash
# Get paginated recipes
curl "http://localhost:5000/api/recipes?page=1&limit=5"

# Search with filters
curl "http://localhost:5000/api/recipes/search?title=chicken&rating>=4&calories<=500"
```

## Troubleshooting

1. **MongoDB Connection Issues**: Ensure MongoDB is running and accessible
2. **Import Errors**: Check that US_recipes.json exists and is valid
3. **Frontend API Errors**: Verify backend is running on port 5000
4. **CORS Issues**: Backend has CORS enabled for all origins during development

## Assignment Compliance

This implementation fulfills all assignment requirements:

✅ JSON parsing with NaN handling
✅ Database storage with proper schema
✅ Paginated API endpoint sorted by rating
✅ Advanced search endpoint with multiple filters
✅ React frontend with table display
✅ Star rating system
✅ Responsive detail drawer
✅ Field-level filtering
✅ Customizable pagination (15-50 results)
✅ Fallback screens for empty states
✅ Truncated text display
✅ Expandable time information
✅ Nutrition information table

## License

This project is for educational purposes as part of the Securin assessment.
