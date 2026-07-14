# AyurPass – Prisma Schema (Recommended Models)

This is the recommended Prisma ORM representation of the core + advanced tables.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  phone         String?
  passwordHash  String?
  role          Role
  fullName      String?
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  consumer      Consumer?
  professional  Professional?
  provider      Provider?
}

enum Role {
  CONSUMER
  PROFESSIONAL
  PROVIDER_ADMIN
  PLATFORM_ADMIN
}

model Consumer {
  userId            String    @id
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  prakritiPrimary   String?
  prakritiScores    Json?
  preferences       Json?
  location          Unsupported("geography")?

  healthProfiles    HealthProfile[]
  bookings          Booking[]
  consents          ClientConsent[]
  treatmentPlans    TreatmentPlan[]
}

model Provider {
  id                String    @id @default(uuid())
  userId            String?
  user              User?     @relation(fields: [userId], references: [id])
  businessName      String
  type              ProviderType
  brandProfile      Json?
  address           Json?
  timezone          String?
  stripeAccountId   String?
  subscriptionTier  String?
  verificationStatus String   @default("pending")
  createdAt         DateTime  @default(now())

  professionals     Professional[]
  services          Service[]
  products          Product[]
  packages          Package[]
}

enum ProviderType {
  AYURVEDA_CLINIC
  YOGA_STUDIO
  LUXURY_SPA
  MEDITATION_CENTER
  HYBRID
}

model Professional {
  id                      String    @id @default(uuid())
  userId                  String
  user                    User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  providerId              String
  provider                Provider  @relation(fields: [providerId], references: [id])
  title                   String?
  specializations         String[]
  doshaExpertise          Json?
  bio                     String?
  certifications          Json?
  yearsExperience         Int?
  hourlyRate              Decimal?  @db.Decimal(10, 2)
  availabilityPreferences Json?
  verificationDocuments   Json?
  rating                  Decimal   @default(0) @db.Decimal(3, 2)
  reviewCount             Int       @default(0)

  services                Service[]
  bookings                Booking[]
}

model Service {
  id                 String    @id @default(uuid())
  providerId         String
  provider           Provider  @relation(fields: [providerId], references: [id])
  professionalId     String?
  professional       Professional? @relation(fields: [professionalId], references: [id])
  category           ServiceCategory
  name               String
  description        String?
  durationMinutes    Int
  price              Decimal   @db.Decimal(10, 2)
  currency           String    @default("USD")
  doshaCompatibility Json?
  isVirtual          Boolean   @default(false)
  maxParticipants    Int       @default(1)
  createdAt          DateTime  @default(now())

  bookings           Booking[]
}

enum ServiceCategory {
  AYURVEDA
  YOGA
  SPA
  MEDITATION
  CONSULTATION
  PACKAGE
}

model Booking {
  id                  String    @id @default(uuid())
  consumerId          String
  consumer            Consumer  @relation(fields: [consumerId], references: [userId])
  serviceId           String
  service             Service   @relation(fields: [serviceId], references: [id])
  professionalId      String?
  professional        Professional? @relation(fields: [professionalId], references: [id])
  providerId          String
  provider            Provider  @relation(fields: [providerId], references: [id])
  startTime           DateTime
  endTime             DateTime
  timezone            String?
  status              BookingStatus @default(PENDING)
  totalAmount         Decimal?  @db.Decimal(10, 2)
  platformCommission  Decimal?  @db.Decimal(10, 2)
  providerPayout      Decimal?  @db.Decimal(10, 2)
  paymentIntentId     String?
  notes               String?
  createdAt           DateTime  @default(now())
}

enum BookingStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

// Advanced Models

model Package {
  id                String    @id @default(uuid())
  providerId        String
  provider          Provider  @relation(fields: [providerId], references: [id])
  name              String
  description       String?
  totalPrice        Decimal   @db.Decimal(10, 2)
  durationDays      Int?
  includedServices  Json?
  includedProducts  Json?
  doshaFocus        Json?
  isRecurring       Boolean   @default(false)
  createdAt         DateTime  @default(now())
}

model TreatmentPlan {
  id             String    @id @default(uuid())
  consumerId     String
  consumer       Consumer  @relation(fields: [consumerId], references: [userId])
  professionalId String?
  professional   Professional? @relation(fields: [professionalId], references: [id])
  providerId     String
  provider       Provider  @relation(fields: [providerId], references: [id])
  name           String?
  description    String?
  startDate      DateTime?
  endDate        DateTime?
  phases         Json?
  status         String    @default("active")
  aiGenerated    Boolean   @default(false)
  createdAt      DateTime  @default(now())
}

model ClientConsent {
  id             String    @id @default(uuid())
  consumerId     String
  consumer       Consumer  @relation(fields: [consumerId], references: [userId])
  granteeId      String?
  permissionType String
  scope          Json?
  expiresAt      DateTime?
  status         String    @default("active")
  createdAt      DateTime  @default(now())
}

model AccessAuditLog {
  id           BigInt    @id @default(autoincrement())
  consumerId   String?
  accessorId   String?
  action       String
  resourceType String
  resourceId   String?
  purpose      String?
  timestamp    DateTime  @default(now())
  ipAddress    String?
}
```

---

**Notes**:
- Use `Json` for all Vedic/flexible fields
- Add indexes on `startTime`, `consumerId`, `providerId`, and `status` for performance
- Consider partitioning the `Booking` table by month for high volume

---

*Generated from AyurPass Blueprint – Prisma recommended models*