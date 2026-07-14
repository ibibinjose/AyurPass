# Running AyurPass Application

## Quick Start (recommended)

From the project root, with the `ayurpass-postgres` Docker container running:

```bash
npm run start
```

This starts the backend API (http://localhost:4000) and the Next.js frontend (http://localhost:3000) together. `Ctrl+C` stops both.

## Running the Backend Alone

### From Terminal:

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Generate Prisma client:
```bash
npx prisma generate
```

4. Run database migrations (if needed):
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run start:dev
```

## Available Scripts in Backend

After navigating to the `/backend` directory, you can run:

- `npm run start` - Start the application
- `npm run start:dev` - Start with watch mode (recommended for development)
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run build` - Build the application
- `npm run lint` - Lint the code
- `npm run format` - Format the code

## Expected Output

When running `npm run start:dev`, you should see:
```
[Nest] [INFO] Starting Nest application...
[Nest] [INFO] AppModule dependencies initialized
[Nest] [INFO] PrismaModule dependencies initialized
[Nest] [INFO] AuthModule dependencies initialized
...
[Nest] [INFO] 🚀 AyurPass Backend running on port 4000
```

The application will be available at `http://localhost:4000`

## Troubleshooting

If you encounter issues:
1. Make sure you're in the `/backend` directory, not the root directory
2. Ensure PostgreSQL is running and accessible
3. Verify your `.env` file has correct database configuration
4. Check that all dependencies are installed with `npm install`