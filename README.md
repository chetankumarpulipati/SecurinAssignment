***

# RecipeHub

A full-stack application for managing and browsing recipes. Features a RESTful API built with Node.js, Express, and MongoDB, and a responsive React frontend with Material-UI.

***

## Features

- **Recipes Database:** Store and manage recipe data with full-text search and advanced filtering.
- **API Endpoints:** Get paginated recipe lists, sorted by rating, and search with flexible filters (title, cuisine, calories, time, rating, serves).
- **Responsive Frontend:** Browse recipes in a sleek, mobile-friendly table. Click any recipe to view full details in a side drawer.
- **Star Ratings:** Visual star ratings with numeric precision.
- **Nutrition Info:** View detailed nutrition facts for each recipe.
- **Customizable Pagination:** Choose to display 15, 25, or 50 recipes per page.
- **Error Handling:** Clear loading, empty-result, and error states.

***

## Tech Stack

- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Frontend:** React 19.1.1, Material-UI, Axios
- **Database:** MongoDB (local or cloud)

***

## Quick Start

1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd securinAssignment
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```

3. **Start MongoDB:**  
   Ensure MongoDB is running locally on `mongodb://localhost:27017/recipesdb` or update the connection string in `backend/app.js`.

4. **Import Recipe Data:**
   ```bash
   node scripts/import_recipes.js
   ```

5. **Launch Backend Server:**
   ```bash
   npm start
   ```
   Backend will run on `http://localhost:5000`

6. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```

7. **Launch Frontend:**
   ```bash
   npm start
   ```
   Frontend will run on `http://localhost:3000`

***

## API Documentation

### GET /api/recipes
**Paginated recipes, sorted by rating (descending).**  
**Params:** `page`, `limit` (default: 10, max: 50)  
**Example:** `GET /api/recipes?page=1&limit=10`

### GET /api/recipes/search
**Advanced search with filters.**  
**Params:** `title`, `cuisine`, `calories`, `rating`, `total_time`, `prep_time`, `cook_time`, `serves`, `page`, `limit`  
**Example:** `GET /api/recipes/search?title=pie&rating>=4.5&calories<=400&page=1&limit=10`  
**Comparison operators:** `<=`, `>=`, `<`, `>`, `=`

***

## Database Schema

Recipes have:  
`cuisine`, `title`, `rating`, `prep_time`, `cook_time`, `total_time`, `description`, `nutrients`, `serves`

***

## Troubleshooting

- **MongoDB Connection:** Ensure MongoDB is running and accessible.
- **Import Errors:** Check that `US_recipes.json` is present and valid.
- **API Errors:** Confirm backend is running and CORS is enabled.
- **Frontend Issues:** Make sure the backend URL matches in your frontend config.

***

## License

This project is for educational purposes as part of the Securin technical assessment.

---