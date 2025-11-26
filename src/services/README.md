# Services Module

This module manages photography service offerings that can be displayed to clients.

## Features

- ✅ Create, read, update, and delete services
- ✅ Toggle service visibility (active/inactive)
- ✅ Filter services by country
- ✅ Image upload support for service images
- ✅ JWT authentication for protected routes
- ✅ Country-based filtering

## Database Schema

```prisma
model Service {
  id          String   @id @default(cuid())
  title       String
  description String
  imageUrl    String?
  isVisible   Boolean  @default(true)
  country     Country  @default(NG)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([country])
  @@index([isVisible])
}
```

## API Endpoints

### Public Endpoints

#### Get All Services

```
GET /services
Query Parameters:
  - includeInactive: boolean (optional) - Include inactive services
Headers:
  - X-Country-Code: NG | UK (optional, defaults to NG)
```

#### Get Single Service

```
GET /services/:id
```

### Protected Endpoints (Requires JWT)

#### Create Service

```
POST /services
Headers:
  - Authorization: Bearer <token>
Body:
{
  "title": "Wedding Photography",
  "description": "Capture your special day with beautiful wedding photography...",
  "imageUrl": "https://example.com/image.jpg",
  "isVisible": true,
  "country": "NG"
}
```

#### Update Service

```
PATCH /services/:id
Headers:
  - Authorization: Bearer <token>
Body: (any fields from create)
{
  "title": "Updated Wedding Photography",
  "description": "Updated description"
}
```

#### Delete Service

```
DELETE /services/:id
Headers:
  - Authorization: Bearer <token>
```

#### Toggle Visibility

```
PATCH /services/:id/toggle-visibility
Headers:
  - Authorization: Bearer <token>
```

## Example Services

Based on the UI, here are example services:

1. **Wedding Photography**

   - Capture your special day with beautiful timeless wedding photography

2. **Corporate Event**

   - Professional event coverage for corporate functions, celebrations, and special occasions

3. **Professional Photoshoot Services**

   - Professional portrait sessions for individuals, families, and professionals

4. **Birthday Shoots**

   - Capture your special day with beautiful timeless photography

5. **Burial & Memorial Events**
   - Capture your special day with beautiful timeless photography

## Usage Example

```typescript
// Get active services for Nigeria
const services = await fetch("/services", {
  headers: {
    "X-Country-Code": "NG",
  },
});

// Create a new service (admin only)
const newService = await fetch("/services", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_TOKEN",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "Wedding Photography",
    description: "Capture your special day...",
    imageUrl: "https://example.com/wedding.jpg",
    isVisible: true,
  }),
});

// Toggle visibility
await fetch("/services/service-id/toggle-visibility", {
  method: "PATCH",
  headers: {
    Authorization: "Bearer YOUR_TOKEN",
  },
});
```

## Running Migrations

After adding the Service model to the schema, run:

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_service_model
```

## Notes

- Services are filtered by country using the existing country middleware
- Only authenticated users (JWT) can create, update, delete, or toggle services
- Public users can view active services
- The `isVisible` field allows services to be temporarily hidden without deletion
