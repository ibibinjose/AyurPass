# AyurPass Visual & Architectural Layout

AyurPass is structured as a premium, highly cohesive wellness marketplace. Below is a high-fidelity visual and structural breakdown of the consumer and provider workspaces.

## Web Dashboard Interface

Here is a visual mockup of the main authenticated wellness dashboard, showing the personalized dosha recommendations, calendar, and marketplace discovery sections.

![AyurPass Authenticated Dashboard](/Users/bibinjose/.gemini/antigravity-ide/brain/5c833423-bea1-4ddf-b7b1-1f3ecf49d20e/ayurpass_app_mockup_1787799204111.jpg)

---

## Screen & Journey Breakdown

### 1. Public Marketplace & Search
* **Landing Page:** Large typography (Fraunces serif) set against a warm ivory background. Displays curated wellness categories (Ayurveda, Yoga, Spa, Meditation, Fitness, Nutrition) with descriptive botanical illustration cards.
* **Global Search:** Focusable via `⌘K` / `Ctrl+K`. Initiates instant directory matching across services, retreats, products, and professionals.
* **Practice Directory:** A dual-grid list of verified centers showing locations (powered by Postgres/PostGIS proximity calculation), verified credentials, categories, ratings, and instant booking slots.

### 2. Personalized Prakriti (Dosha) Quiz
* **Quiz Flow:** A clean, 12-question interactive diagnostic tool measuring physical traits, metabolic factors, and mental tendencies.
* **Results Panel:** A dynamic chart showing the Vata-Pitta-Kapha ratio. Based on the dominant constitution, the marketplace alters recommendation weights to highlight matching herbal products, foods, and therapeutic treatments.

### 3. Consumer Workspace
* **Dashboard:** Features the user's active Prakriti constitution balance gauge, active rewards balance (Seedling → Bloom → Radiance), and recently followed practices/professionals.
* **Bookings & Calendar:** A unified planner mapping upcoming appointments, digital check-in passes (with Apple/Google Wallet integration), invoice receipts, and direct reschedule actions.
* **Health Profile & Consent:** A privacy-first vault where consumers share clinical notes with specific providers. Contains a list of audit logs (`AccessAuditLog`) showing exactly when and who viewed their medical files.

### 4. Provider Operating System
* **Operations Sidebar:** Collapsible sections organizing catalogues (services, packages, rooms, products), scheduling, sales logs, staff permissions, and customer messages.
* **Provider Checklist:** Guides business activation through three immediate tasks: profile completion, first bookable session, and license credential verification.
* **Multi-Room POS Terminal:** Supports counter checkouts, inventory stock depletion, and commission breakdowns (retaining an 18% fee for bookings).

### 5. Expo Mobile Client
* **Native Flow:** Leverages Expo Router 55 and NativeWind tailwind integration. Includes custom bottom tab layouts mapping **Discover, Bookings, Calendar, and Profile** tasks.
* **Design Tokens:** Inherits the same styling system—using deep sage green for primary touch zones, warm cream for backgrounds, and indigo/orange/emerald for Vata/Pitta/Kapha color indicators.
