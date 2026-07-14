# AyurPass – API Contracts (Key Endpoints)

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

## Professional Dashboard Endpoints

- `GET /api/v1/providers/me/analytics`
- `GET /api/v1/professionals/me/availability`
- `POST /api/v1/availability/sync-google`

All endpoints require proper RBAC + consent checks where personal health data is involved.

---

*Suggested REST API contracts for AyurPass*