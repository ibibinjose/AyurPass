# AyurPass – API Contracts (Key Endpoints)

## Authentication & User Management

### Login
`POST /api/v1/auth/login`

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Register
`POST /api/v1/auth/register`

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Refresh Token
`POST /api/v1/auth/refresh`

## Consent Management (Core Differentiator)

### Create / Update Consent
`POST /api/v1/consents`

```json
{
  "consumerId": "uuid",
  "granteeId": "professional-uuid",
  "permissionType": "view_dosha_history",
  "scope": {
    "dataCategories": ["dosha_scores", "treatment_plans"],
    "timeRange": { "from": "2025-01-01", "to": "2026-12-31" }
  },
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

### Get My Consents (Consumer)
`GET /api/v1/consents/me`

Returns list of all active and expired consents with audit summary.

### Revoke Consent
`DELETE /api/v1/consents/:id`

Immediately revokes access. Triggers notification to grantee.

### Access Audit Log (Consumer View)
`GET /api/v1/consents/:id/audit`

Returns immutable access records.

---

## Booking + Package Endpoints

### Create Booking
`POST /api/v1/bookings`

```json
{
  "serviceId": "uuid",
  "professionalId": "uuid",
  "startTime": "2026-08-15T10:00:00Z",
  "notes": "First Panchakarma session"
}
```

### Create Package Booking
`POST /api/v1/packages/:id/book`

Handles multiple linked bookings + product shipments.

---

## Provider & Professional Management

### Create Provider
`POST /api/v1/providers`

```json
{
  "name": "Wellness Center",
  "type": "spa",
  "address": {
    "street": "123 Wellness St",
    "city": "Sydney",
    "country": "AU"
  },
  "coordinates": {
    "latitude": -33.8688,
    "longitude": 151.2093
  },
  "currency": "AUD"
}
```

### Get Providers (Discover)
`GET /api/v1/providers/discover?location=:lat,:lng&radius=:km&type=:providerType`

### Create Professional
`POST /api/v1/professionals`

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "specialties": ["ayurveda", "massage"],
  "providerId": "uuid",
  "credentials": {
    "registrationNumber": "REG123456",
    "licenceNumber": "LIC789012",
    "healthAuthorities": ["AAA", "AHPRA"]
  }
}
```

---

## Service & Product Management

### Create Service
`POST /api/v1/services`

```json
{
  "name": "Abhyanga Massage",
  "categoryId": "ayurvedic-massage",
  "durationMinutes": 60,
  "price": 120,
  "providerId": "uuid",
  "professionalIds": ["prof-uuid"]
}
```

### Create Product
`POST /api/v1/products`

```json
{
  "name": "Ashwagandha Supplement",
  "categoryId": "herbal-supplements",
  "price": 29.99,
  "inventory": 100,
  "providerId": "uuid"
}
```

---

## Treatment Plan Endpoints

### Generate AI Draft
`POST /api/v1/treatment-plans/generate`

```json
{
  "consumerId": "uuid",
  "goals": ["reduce_pitta", "improve_sleep"],
  "durationWeeks": 8
}
```

Returns AI-generated draft for professional review.

### Professional Review & Finalize
`PATCH /api/v1/treatment-plans/:id`

```json
{
  "status": "active",
  "phases": [...],
  "professionalNotes": "..."
}
```

---

## Health Profiles & Dosha Assessment

### Create Health Profile
`POST /api/v1/health-profiles`

```json
{
  "consumerId": "uuid",
  "prakritiScores": {
    "vata": 35,
    "pitta": 45,
    "kapha": 20
  },
  "currentImbalances": ["pitta_excess"],
  "preferences": {
    "treatments": ["ayurveda", "massage"],
    "dietaryRestrictions": ["vegan"]
  }
}
```

---

## Job Listings Endpoints

### Create Job Listing
`POST /api/v1/jobs`

```json
{
  "title": "Ayurvedic Practitioner",
  "companyId": "uuid",
  "location": "Sydney, Australia",
  "employmentType": "full_time",
  "description": "Seeking experienced Ayurvedic practitioner...",
  "requirements": ["registration", "experience"]
}
```

### Search Jobs
`GET /api/v1/jobs?location=:location&specialty=:specialty`

---

## Wellness Events & Passes

### Create Event
`POST /api/v1/events`

```json
{
  "title": "Mindfulness Meditation Retreat",
  "providerId": "uuid",
  "startDate": "2026-09-15T09:00:00Z",
  "endDate": "2026-09-17T17:00:00Z",
  "location": "Byron Bay",
  "capacity": 20
}
```

### Create Wellness Pass
`POST /api/v1/passes`

```json
{
  "name": "Monthly Wellness Pass",
  "benefits": ["unlimited_classes", "discount_services"],
  "validityDays": 30,
  "price": 99.99
}
```

---

## Professional Dashboard Endpoints

- `GET /api/v1/providers/me/analytics` - Business analytics
- `GET /api/v1/providers/me/staff` - Staff management
- `GET /api/v1/providers/me/bookings` - Booking management
- `GET /api/v1/providers/me/services` - Service management
- `GET /api/v1/providers/me/products` - Product management
- `GET /api/v1/providers/me/profile` - Profile management
- `GET /api/v1/providers/me/availability` - Availability settings
- `POST /api/v1/availability/sync-google` - Google Calendar sync

All endpoints require proper RBAC + consent checks where personal health data is involved.

---

*Updated to reflect current API endpoints as of 2026-07-28*