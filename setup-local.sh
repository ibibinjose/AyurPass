#!/bin/bash

echo "==================================="
echo "AyurPass Local Development Setup"
echo "==================================="

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "Error: backend/package.json not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo "1. Installing backend dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

echo "2. Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "Error: Failed to generate Prisma client"
    exit 1
fi

echo "3. Setting up database schema..."
npx prisma migrate dev --name init

if [ $? -ne 0 ]; then
    echo "Warning: Database migration failed. Make sure PostgreSQL is running and DATABASE_URL is correct in .env"
    echo "You can try setting up PostgreSQL manually or with Docker:"
    echo "docker run --name ayurpass-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ayurpass_dev -p 5432:5432 -d postgres:15"
    exit 1
fi

echo "4. Installation complete!"
echo ""
echo "To start the application, run:"
echo "  cd backend"
echo "  npm run start:dev"
echo ""
echo "The application will be available at http://localhost:4000"
echo ""
echo "For troubleshooting, please refer to SETUP_LOCAL.md"