# AyurPass – Database Architecture (PostgreSQL + Prisma)

Core principles:
- Normalization for integrity
- JSONB for flexible Vedic data (dosha metrics, questionnaire responses)
- `timestamptz` for all timestamps
- Multi-currency support

## Core Tables

### Users & Roles
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    role VARCHAR(20) CHECK (role IN ('consumer', 'professional', 'provider_admin', 'platform_admin')),
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Consumers
```sql
CREATE TABLE consumers (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    prakriti_primary VARCHAR(20) CHECK (prakriti_primary IN ('Vata', 'Pitta', 'Kapha', 'Tridoshic')),
    prakriti_scores JSONB,
    health_profile_id UUID,
    preferences JSONB,
    location GEOGRAPHY(POINT)
);
```

### Providers (Centers/Brands)
```sql
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    business_name VARCHAR(255) NOT NULL,
    type VARCHAR(30) CHECK (type IN ('ayurveda_clinic', 'yoga_studio', 'luxury_spa', 'meditation_center', 'hybrid')),
    brand_profile JSONB,
    address JSONB,
    timezone VARCHAR(50),
    stripe_account_id VARCHAR(255),
    subscription_tier VARCHAR(20),
    verification_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Professionals
```sql
CREATE TABLE professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id),
    title VARCHAR(100),
    specializations TEXT[],
    dosha_expertise JSONB,
    bio TEXT,
    certifications JSONB,
    years_experience INTEGER,
    hourly_rate DECIMAL(10,2),
    availability_preferences JSONB,
    verification_documents JSONB,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0
);
```

### Services
```sql
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id),
    professional_id UUID REFERENCES professionals(id),
    category VARCHAR(30) CHECK (category IN ('ayurveda', 'yoga', 'spa', 'meditation', 'consultation', 'package')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    dosha_compatibility JSONB,
    is_virtual BOOLEAN DEFAULT false,
    max_participants INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Products
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id),
    name VARCHAR(255),
    category VARCHAR(50),
    description TEXT,
    price DECIMAL(10,2),
    inventory_quantity INTEGER,
    dosha_recommendations JSONB,
    images JSONB
);
```

### Health Profiles
```sql
CREATE TABLE health_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_id UUID REFERENCES consumers(user_id),
    vata_score DECIMAL(5,2),
    pitta_score DECIMAL(5,2),
    kapha_score DECIMAL(5,2),
    questionnaire_responses JSONB,
    current_imbalances JSONB,
    last_assessment TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Bookings
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_id UUID REFERENCES consumers(user_id),
    service_id UUID REFERENCES services(id),
    professional_id UUID REFERENCES professionals(id),
    provider_id UUID REFERENCES providers(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(50),
    status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    total_amount DECIMAL(10,2),
    platform_commission DECIMAL(10,2),
    provider_payout DECIMAL(10,2),
    payment_intent_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Additional Tables (Advanced Features)
- `packages`
- `treatment_plans`
- `plan_bookings`
- `client_consents`
- `access_audit_logs`
- `travel_itineraries`

Full schema continues in the original blueprint. Use Prisma for type-safe access.

---

*Source: AyurPass Blueprint – Database Architecture section*