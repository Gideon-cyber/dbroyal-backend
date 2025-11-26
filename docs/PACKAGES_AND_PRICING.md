# Packages and Pricing System

## Overview

The photography management system now supports a comprehensive package-based pricing structure. Each service (Wedding, Birthday, Funeral, Corporate Event, Photoshoot) can have multiple packages with:

- **Multiple tiers** (Basic, Standard, Premium, etc.)
- **Country-specific pricing** (NG/Nigeria and UK/United Kingdom)
- **Feature lists** for each package
- **Integrated booking system** that captures package details

## Database Schema

### Models

#### Service

```prisma
model Service {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String
  subtitle    String?  // e.g., "Turning every corporate moment into a timeless impression"
  imageUrl    String?
  isVisible   Boolean  @default(true)
  country     Country  @default(NG)
  packages    Package[]
}
```

#### Package

```prisma
model Package {
  id          String   @id @default(cuid())
  serviceId   String
  name        String   // e.g., "Essential Package", "Basic Package"
  slug        String
  description String?
  isVisible   Boolean  @default(true)
  sortOrder   Int      @default(0)
  features    PackageFeature[]
  pricing     PackagePricing[]
  bookings    Booking[]
}
```

#### PackageFeature

```prisma
model PackageFeature {
  id        String   @id @default(cuid())
  packageId String
  feature   String   // e.g., "3-hours coverage", "50 edited photos"
  sortOrder Int      @default(0)
}
```

#### PackagePricing

```prisma
model PackagePricing {
  id        String   @id @default(cuid())
  packageId String
  country   Country
  price     Decimal  @db.Decimal(10, 2)
  currency  String   // "USD", "NGN"
}
```

#### Booking (Updated)

```prisma
model Booking {
  id             String   @id @default(cuid())
  packageId      String   // Required - what package was booked
  eventId        String?
  clientId       String
  dateTime       DateTime
  location       String?
  notes          String?  // Additional requirements
  price          Decimal? // Captured at booking time
  currency       String?  // Captured at booking time
  approvalStatus ApprovalStatus
  status         BookingStatus
  country        Country
}
```

## Package Examples (from reference images)

### Corporate Event Package

- **Essential Package**: $250 / ₦475,000

  - 3-hours coverage
  - 1 Professional photographer
  - 50 Edited photos
  - Online gallery delivery

- **Professional Package**: $550 / ₦855,000

  - 5-hours coverage
  - 1 Photographer + 1 Videographer
  - 80 Edited photos
  - 3-mins highlight video
  - Branded flash drive delivery

- **Premium Package**: $750 / ₦1,420,000

  - Full day coverage
  - 2 Photographers + 1 Videographer
  - 120 Edited photos
  - 5-mins highlight video + full recap video
  - Drone footage (if location allows)
  - Branded photo album (20 pages)

- **Premium Executive Package**: $1,100 / ₦2,090,000
  - 2-day coverage
  - 2 photographers + 2 videographers
  - 200+ edited photos
  - 10-mins cinematic video
  - Drone + interview + behind the scenes coverage
  - Photo album + framed group photo

### Wedding Package

- **Standard Package**: $500 / ₦950,000

  - 1 day coverage (ceremony + reception)
  - 2 costumes
  - 100 edited photos
  - 5-mins highlight video

- **Premium Package**: $850 / ₦1,500,000

  - Full day coverage
  - 2 photographers + 1 videographer
  - 150 edited photos
  - 10-mins highlight video + full video

- **Luxury Package**: $1,200 / ₦2,200,000
  - 2 day coverage (traditional + white wedding)
  - Drone footage
  - Photo album
  - Framed print
  - 200 edited photos

### Birthday Package

- **Basic Package**: $150 / ₦270,000

  - 3-hours coverage
  - 50 edited photos
  - 5-mins highlight video

- **Standard Package**: $300 / ₦570,000

  - 6-hour coverage
  - 100 edited photos
  - 3-mins highlight video
  - 10-mins highlight video + full video

- **Premium Package**: $500 / ₦950,000
  - Full day coverage
  - 150 edited photos
  - 10-mins highlight video + photo album
  - 200 edited photos

### Funeral Package

- **Basic Package**: $250 / ₦475,000

  - 4-hours coverage
  - 50 edited photos
  - 3-mins recap video
  - 5-mins highlight video

- **Standard Package**: $400 / ₦760,000

  - Full day coverage
  - 100 edited photos
  - 5-mins recap video
  - 10-mins highlight video + full video

- **Deluxe Package**: $600 / ₦1,014,000
  - Full day coverage
  - 2 photographers
  - Drone footage
  - Printed album (20 pages)
  - 200 edited photos

### Photoshoot Package

- **Basic Package**: $100 / (no NG price shown)

  - 1 Outfit
  - 5 Edited photos
  - 1 hour session (Studio shoot only)

- **Standard Package**: $120
  - 1 Outfit
  - 10 Edited photos
  - 1 hour 30 mins session
  - Studio/outdoor shoot

**Add-ons:**

- Extra outfit - $20
- Extra hour - $50
- Prop & creative set design - $50
- Framed photo (12 x 16 inch) - $30

## API Endpoints

### Service Endpoints

#### Get All Services (with packages)

```http
GET /services
Headers: X-Country: NG|UK
```

Response includes packages with features and country-specific pricing:

```json
{
  "id": "service-id",
  "title": "Corporate Event Package",
  "slug": "corporate-event",
  "subtitle": "Turning every corporate moment into a timeless impression",
  "packages": [
    {
      "id": "package-id",
      "name": "Essential Package",
      "slug": "essential-package",
      "features": [
        { "feature": "3-hours coverage", "sortOrder": 0 },
        { "feature": "1 Professional photographer", "sortOrder": 1 },
        { "feature": "50 Edited photos", "sortOrder": 2 }
      ],
      "pricing": [
        {
          "country": "NG",
          "price": "475000.00",
          "currency": "NGN"
        }
      ]
    }
  ]
}
```

#### Get Single Service

```http
GET /services/:id
Headers: X-Country: NG|UK
```

### Package Endpoints

#### Create Package

```http
POST /services/:serviceId/packages
Authorization: Bearer <token>

{
  "name": "Essential Package",
  "slug": "essential-package",
  "description": "Perfect for smaller corporate events",
  "features": [
    "3-hours coverage",
    "1 Professional photographer",
    "50 edited photos",
    "Online gallery delivery"
  ],
  "pricing": [
    {
      "country": "NG",
      "price": 475000,
      "currency": "NGN"
    },
    {
      "country": "UK",
      "price": 250,
      "currency": "USD"
    }
  ],
  "sortOrder": 0
}
```

#### Get Package

```http
GET /services/packages/:packageId
Headers: X-Country: NG|UK
```

#### Update Package

```http
PATCH /services/packages/:packageId
Authorization: Bearer <token>

{
  "name": "Updated Package Name",
  "features": [...],
  "pricing": [...]
}
```

#### Delete Package

```http
DELETE /services/packages/:packageId
Authorization: Bearer <token>
```

#### Toggle Package Visibility

```http
PATCH /services/packages/:packageId/toggle-visibility
Authorization: Bearer <token>
```

### Booking Endpoints (Updated)

#### Create Booking

```http
POST /bookings
Authorization: Bearer <token>

{
  "packageId": "package-id",
  "clientId": "client-id",
  "dateTime": "2025-12-01T10:00:00Z",
  "location": "Event Venue, Lagos",
  "notes": "Client requested extra photographer",
  "eventId": "event-id",  // optional
  "country": "NG"
}
```

The system automatically:

- Fetches the package pricing for the booking country
- Captures the price and currency at booking time
- Includes full package details in the response

Response:

```json
{
  "id": "booking-id",
  "package": {
    "id": "package-id",
    "name": "Essential Package",
    "service": {
      "id": "service-id",
      "title": "Corporate Event Package"
    },
    "features": [...],
    "pricing": [...]
  },
  "price": "475000.00",
  "currency": "NGN",
  "dateTime": "2025-12-01T10:00:00Z",
  "location": "Event Venue, Lagos",
  "notes": "Client requested extra photographer",
  "approvalStatus": "PENDING",
  "status": "SCHEDULED"
}
```

## Notes

### Common Package Notes

- All packages include soft copy delivery via online gallery or flash drive
- Clients can book multiple looks/outfits; each look is billed separately
- Outdoor sessions may attract a location permit fee (if applicable)
- 50% advance payment is required to confirm booking
- Delivery timeframe is 7-10 working days after shoot
- Lateness fee is $50

### Currency

- **NG (Nigeria)**: NGN (Nigerian Naira)
- **UK (United Kingdom)**: USD (US Dollar) or GBP (British Pound)

### Migration

When migrating existing bookings, a data migration script should:

1. Create default packages for each service
2. Update existing bookings to reference the appropriate package
3. Backfill price and currency from package pricing

## Usage Examples

### 1. Create a Service with Packages

```typescript
// First create the service
const service = await prisma.service.create({
  data: {
    title: "Corporate Event Package",
    slug: "corporate-event",
    subtitle: "Turning every corporate moment into a timeless impression",
    description: "Professional corporate event photography",
    country: "NG",
  },
});

// Then create packages
const essentialPackage = await prisma.package.create({
  data: {
    serviceId: service.id,
    name: "Essential Package",
    slug: "essential-package",
    sortOrder: 0,
    features: {
      create: [
        { feature: "3-hours coverage", sortOrder: 0 },
        { feature: "1 Professional photographer", sortOrder: 1 },
        { feature: "50 Edited photos", sortOrder: 2 },
        { feature: "Online gallery delivery", sortOrder: 3 },
      ],
    },
    pricing: {
      create: [
        { country: "NG", price: 475000, currency: "NGN" },
        { country: "UK", price: 250, currency: "USD" },
      ],
    },
  },
});
```

### 2. Book a Package

```typescript
const booking = await bookingsService.create({
  packageId: "package-id",
  clientId: "client-id",
  dateTime: "2025-12-01T10:00:00Z",
  location: "Corporate Office, Lagos",
  notes: "Need setup by 9 AM",
  country: "NG",
});
// System automatically captures ₦475,000 from package pricing
```

### 3. Query Services with Packages (Country-Filtered)

```typescript
const services = await prisma.service.findMany({
  where: { country: "NG" },
  include: {
    packages: {
      where: { isVisible: true },
      include: {
        features: {
          orderBy: { sortOrder: "asc" },
        },
        pricing: {
          where: { country: "NG" },
        },
      },
      orderBy: { sortOrder: "asc" },
    },
  },
});
```
