# AyurPass Local Development Setup Guide

This guide will help you set up the AyurPass application for local development.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (local installation or Docker)
- Git

## Step-by-Step Setup

### 1. Clone and Navigate to Project

```bash
git clone <your-repo-url> # if applicable
cd AyurPass
```

### 2. Set Up Database

Choose one of the following options:

#### Option A: Local PostgreSQL Installation
1. Install PostgreSQL on your system
2. Create a database for AyurPass:
   ```sql
   CREATE DATABASE ayurpass_dev;
   ```

#### Option B: Using Docker
1. Install Docker Desktop
2. Run PostgreSQL with Docker:
   ```bash
   docker run --name ayurpass-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ayurpass_dev -p 5432:5432 -d postgres:15
   ```

### 3. Configure Environment Variables

The `.env` file in `/backend` is already configured for local development:

```
DATABASE_URL="postgresql://localhost:5432/ayurpass_dev"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
JWT_ACCESS_SECRET="ayurpass_access_secret_key"
JWT_REFRESH_SECRET="ayurpass_refresh_secret_key"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"
```

### 4. Install Dependencies

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### 5. Generate Prisma Client

After installing dependencies, generate the Prisma client:

```bash
npx prisma generate
```

### 6. Run Database Migrations

Apply the database schema to your local database:

```bash
npx prisma migrate dev --name init
```

### 7. Start the Application

Start the development server:

```bash
npm run start:dev
```

The application will be available at `http://localhost:4000`.

## Running the Application

Once set up, you can start the application anytime with:

```bash
cd backend
npm run start:dev
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**: Make sure PostgreSQL is running and the DATABASE_URL in `.env` matches your database configuration.

2. **Port Already in Use**: Change the PORT variable in `.env` if port 4000 is already being used.

3. **Missing Dependencies**: Run `npm install` in the backend directory to reinstall dependencies.

### Resetting the Database

If you need to reset the database:

```bash
npx prisma migrate reset
```

## API Endpoints

After starting the application, the following endpoints will be available:

- Auth: `POST /auth/register`, `POST /auth/login`
- Users: `GET /users/:id`, `GET /users/email/:email`
- Bookings: `POST /bookings`, `GET /bookings/consumer/:id`
- Health Profiles: `POST /health-profiles/consumer/:id`, `GET /health-profiles/consumer/:id`
- Professionals: `GET /professionals/provider/:id`
- Packages: `POST /packages`, `GET /packages/provider/:id`
- Treatment Plans: `POST /treatment-plans`, `GET /treatment-plans/consumer/:id`
- Consents: `POST /consents`, `GET /consents/consumer/:id`

## Next Steps

Once you have the local setup working, you can:

1. Develop frontend applications that connect to the API
2. Implement additional features
3. Set up testing environments
4. Prepare for deployment to hosting platforms