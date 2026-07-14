# AyurPass - Global Wellness Ecosystem

AyurPass is a premium global health ecosystem designed to build a "Wellness Operating System" that combines Ayurveda, Yoga, Luxury Spa, and Meditation, creating a dual-sided intelligent marketplace platform for consumers and independent wellness practitioners.

## 🚀 Features

- **Dual Marketplace**: Consumer App (React Native) + Provider Dashboard (Next.js)
- **Full-Service Booking Management**: Complete booking system with Google Calendar sync
- **Compliance**: HIPAA/GDPR compliant consent management with audit trails
- **Professional Profiles**: Practitioner profiles and credential management
- **User Lifecycle**: Complete user management with Prakriti profiles and health records
- **Advanced Services**: Packages, personalized treatment plans, wellness travel
- **AI Recommendations**: Prakriti-based personalized recommendations (coming soon)
- **Payment Integration**: Stripe Connect multi-account splits
- **Communication**: Twilio SMS notifications
- **Calendar Integration**: Enterprise calendar sync

## 🏗️ System Architecture

The application follows a modular architecture with:
- Backend: NestJS (TypeScript), Prisma ORM, PostgreSQL
- Prisma schema with comprehensive data models for the wellness ecosystem
- Modular feature organization (users, bookings, consents, health-profiles, etc.)

## 📁 Directory Structure

```
AyurPass/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   │   ├── auth/        # Authentication
│   │   │   ├── users/       # User management
│   │   │   ├── bookings/    # Booking system
│   │   │   ├── consents/    # Consent management
│   │   │   ├── health-profiles/ # Health profiles
│   │   │   ├── professionals/ # Practitioner management
│   │   │   ├── packages/    # Service packages
│   │   │   └── treatment-plans/ # Treatment plans
│   │   ├── prisma/          # Database schema
│   │   └── dtos/            # Data transfer objects
│   ├── prisma/
│   └── package.json
├── SETUP_LOCAL.md          # Local setup guide
├── RUN_APP.md              # Running instructions
├── setup-local.sh          # Setup script
└── README.md
```

## 🛠️ Local Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (local installation or Docker)

### Quick Setup

1. **Set up PostgreSQL database**:
   - Option A: Local installation with created database `ayurpass_dev`
   - Option B: Using Docker:
     ```bash
     docker run --name ayurpass-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ayurpass_dev -p 5432:5432 -d postgres:15
     ```

2. **Run the automated setup**:
   ```bash
   chmod +x setup-local.sh
   ./setup-local.sh
   ```

3. **Or follow manual setup steps** (detailed in SETUP_LOCAL.md):
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npm run start:dev
   ```

The application will be available at `http://localhost:4000`.

## ▶️ Running the Application

**Prerequisite**: the `ayurpass-postgres` Docker container must be running (`docker start ayurpass-postgres`).

From the project root:

```bash
npm run start
```

This starts both servers together:
- Backend API (NestJS) — http://localhost:4000
- Frontend (Next.js) — http://localhost:3000

To run them individually:
- `npm run start:dev` (or `npm run dev:backend`) - Backend with auto-reload
- `npm run dev:frontend` - Frontend dev server
- `npm run build:backend` - Build the backend

For detailed running instructions, see [RUN_APP.md](RUN_APP.md).

## 🌐 API Endpoints

- Auth: `POST /auth/register`, `POST /auth/login`
- Users: `GET /users/:id`, `GET /users/email/:email`
- Bookings: `POST /bookings`, `GET /bookings/consumer/:id`
- Health Profiles: `POST /health-profiles/consumer/:id`, `GET /health-profiles/consumer/:id`
- Professionals: `GET /professionals/provider/:id`
- Packages: `POST /packages`, `GET /packages/provider/:id`
- Treatment Plans: `POST /treatment-plans`, `GET /treatment-plans/consumer/:id`
- Consents: `POST /consents`, `GET /consents/consumer/:id`
- Health: `GET /health` (status check)

## 🤝 Contributing

We welcome contributions to the AyurPass project! Feel free to submit pull requests for bug fixes, new features, or documentation improvements.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, please open an issue in this repository.

---

Built with ❤️ for the global wellness community