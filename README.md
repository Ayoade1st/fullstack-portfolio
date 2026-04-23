# Fullstack Portfolio

A classic, professional full-stack portfolio application built to showcase real-world engineering skills. Built with React, Express, PostgreSQL, Prisma, and JWT authentication.

## Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | React 18 + Vite               |
| Backend    | Express.js (Node.js)          |
| Database   | PostgreSQL + Prisma ORM       |
| Auth       | JWT (access + refresh tokens) |
| Deployment | Vercel (FE) + Render (BE)     |

## Architecture

### Backend — Four-Layer Structure

```
backend/src/
├── routes/       # Express routers — map HTTP verbs/paths to controllers
├── controllers/  # Request/response handling, input validation
├── services/     # Business logic and database access (Prisma)
└── middleware/   # auth.middleware (JWT verify) · role.middleware (RBAC)
```

### Frontend — React + Vite

```
frontend/src/
├── context/      # AuthContext — global auth state, login/logout/register
├── services/     # Axios API client with auto token-refresh interceptor
├── components/   # Navbar, ProtectedRoute
└── pages/        # Login, Register, Dashboard, Portfolio, NotFound
```

## Features

- **JWT Authentication** — access tokens (15 min) + refresh tokens (7 days), stored in DB
- **Role-based access control** — `USER` and `ADMIN` roles
- **Portfolio CRUD** — create, read, update, delete portfolio projects
- **Admin dashboard** — admins can view and manage all users
- **Public portfolio page** — searchable grid of all projects (no auth required)
- **Auto token refresh** — Axios interceptor transparently refreshes expired tokens
- **Split deployment** — frontend on Vercel, backend on Render

## API Endpoints

### Auth (`/api/auth`)
| Method | Path        | Description                  |
|--------|-------------|------------------------------|
| POST   | /register   | Create account, returns JWTs |
| POST   | /login      | Login, returns JWTs          |
| POST   | /refresh    | Exchange refresh token       |
| POST   | /logout     | Invalidate refresh token     |

### Users (`/api/users`) — requires auth
| Method | Path    | Role  | Description              |
|--------|---------|-------|--------------------------|
| GET    | /me     | Any   | Get current user profile |
| GET    | /       | ADMIN | List all users           |
| PUT    | /:id    | Self/ADMIN | Update user       |
| DELETE | /:id    | ADMIN | Delete user              |

### Portfolio (`/api/portfolio`)
| Method | Path        | Auth | Description             |
|--------|-------------|------|-------------------------|
| GET    | /           | No   | All portfolio items     |
| GET    | /:id        | No   | Single item             |
| GET    | /my/items   | Yes  | Current user's items    |
| POST   | /           | Yes  | Create item             |
| PUT    | /:id        | Yes  | Update item (owner/admin)|
| DELETE | /:id        | Yes  | Delete item (owner/admin)|

## Database Schema

```prisma
model User          { id, email, name, password, role (USER|ADMIN), portfolio[], refreshTokens[] }
model PortfolioItem { id, title, description, techStack[], githubUrl?, liveUrl?, imageUrl?, featured, userId }
model RefreshToken  { id, token, userId, expiresAt }
```

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally (or use a cloud DB)

### Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and secrets

# Run Prisma migrations
npm run db:migrate

# Start dev server (port 5000)
npm run dev
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (optional — Vite proxy handles /api in dev)
cp .env.example .env

# Start dev server (port 5173)
npm run dev
```

Open http://localhost:5173 — the Vite dev server proxies `/api` to the backend.

## Deployment

### Backend → Render

1. Push repo to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Point it at your repo; the `render.yaml` at the root pre-configures the build/start commands
4. Set environment variables: `DATABASE_URL`, `FRONTEND_URL`
5. Render auto-generates `JWT_SECRET` and `JWT_REFRESH_SECRET`

### Frontend → Vercel

1. Import repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend` (or leave root — `vercel.json` handles it)
3. Set env var `VITE_API_URL` → your Render backend URL + `/api`

## Project Structure

```
fullstack-portfolio/
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── app.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── middleware/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── context/
│   │   ├── services/
│   │   ├── components/
│   │   └── pages/
│   ├── index.html
│   └── package.json
├── render.yaml       # Render deployment config
├── vercel.json       # Vercel deployment config
└── .gitignore
```
