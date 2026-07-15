# khurshid Books

Full-stack e-commerce app for a book and stationery agency.

## Project structure

- `client/` — React + Vite frontend
- `server/` — Node.js + Express backend
- `server/seed/seedProducts.js` — MongoDB seed script for initial product data

## Prerequisites

- Node.js 18+
- npm
- MongoDB connection string

## Local setup

### Backend

1. Open a terminal and go to `server/`:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `server/` using `.env.example` as a template.
4. Start the backend:
   ```bash
   npm run dev
   ```

### Seed product data

From `server/`:
```bash
npm run seed
```

This clears existing products and inserts the default product catalog from `server/seed/seedProducts.js`.

### Frontend

1. Open a new terminal and go to `client/`:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

### Environment variables

#### `server/.env`

```env
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
```

#### `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

## API endpoints

- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/cart`
- `POST /api/cart`
- `GET /api/orders`
- `POST /api/orders`
- `POST /api/reviews`
- `GET /api/admin/*`

## Notes

- The frontend uses `VITE_API_URL` to connect to the backend.
- The backend uses `CLIENT_URL` for CORS.
- Use `npm run seed` before you start if the database has no product data.
