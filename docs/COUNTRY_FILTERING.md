# Country-Based Multi-Tenancy Implementation

## Overview

This document describes the country-based access control (multi-tenancy) system implemented in the dbroyal-backend API. The system supports separate operations for Nigeria (NG) and United Kingdom (UK) regions.

## Architecture

### Country Detection

The system uses a global `CountryGuard` that extracts the country from incoming requests using the following priority order:

1. **X-Country HTTP Header** (Highest Priority)
   ```http
   X-Country: NG
   X-Country: UK
   ```

2. **Subdomain**
   - `ng.yourdomain.com` → Nigeria (NG)
   - `uk.yourdomain.com` → United Kingdom (UK)

3. **Query Parameter** (Lowest Priority)
   ```
   ?country=NG
   ?country=UK
   ```

4. **Default Value**: If no country is detected, the system defaults to Nigeria (NG)

### Country Extraction Decorator

Controllers use the `@GetCountry()` decorator to access the detected country:

```typescript
@Get(':id')
findOne(@GetCountry() country: Country, @Param('id') id: string) {
  return this.service.findOne(id, country);
}
```

## Resource Scoping

### Country-Scoped Resources

Resources that are isolated by country:

#### 1. Events
- **List Operations**: `GET /events` returns only events from the requesting country
- **Individual Access**: `GET /events/:id` only returns event if it belongs to requesting country
- **Mutations**: Create/Update/Delete operations verify country ownership
- **Related Operations**:
  - Adding photos
  - Syncing from Google Drive
  - Creating shareable links
  - Creating download selections
  All verify the event belongs to the requesting country

**Example:**
```typescript
// Events Service
async findOne(id: string, country?: Country) {
  return this.prisma.event.findUnique({
    where: country ? { id, country } : { id },
    include: { photos: true },
  });
}
```

#### 2. Bookings
- **List Operations**: `GET /bookings` returns only bookings from the requesting country
- **Individual Access**: `GET /bookings/:id` only returns booking if it belongs to requesting country
- **Mutations**: Create/Update/Delete/Assign operations verify country ownership

#### 3. Clients
- **List Operations**: `GET /clients` returns only clients from the requesting country
- **Individual Access**: `GET /clients/:id` only returns client if it belongs to requesting country
- **Mutations**: Create/Update/Delete operations verify country ownership

#### 4. Download Selections
- **Access**: Download tokens are region-locked
- A download selection created in Nigeria can only be accessed with `X-Country: NG`
- Cross-country access returns "Download selection not found"

**Example:**
```typescript
// Events Service - Download Selection
async getDownloadSelection(token: string, country?: Country) {
  const selection = await this.prisma.downloadSelection.findUnique({
    where: { token },
    include: { event: true },
  });

  // Verify the event belongs to the requesting country
  if (country && selection.event.country !== country) {
    throw new Error('Download selection not found');
  }

  // ... rest of logic
}
```

### Global Resources

Resources that are NOT country-scoped:

#### Users
- **Rationale**: Staff (photographers, editors, managers) may work across multiple countries
- **Behavior**: All users are visible from any country
- **Access**: `GET /users` returns all users regardless of requesting country

## Security Considerations

### 1. Access Control
- Users cannot access resources from other countries even if they know the exact ID
- All access attempts that violate country boundaries fail silently

### 2. Error Messages
- Generic "not found" errors are returned for cross-country access attempts
- This prevents information leakage about the existence of resources in other countries
- Error: `"Event not found"` instead of `"Event exists but belongs to another country"`

### 3. Automatic Country Assignment
- When creating new resources, the country is automatically assigned from the request context
- Users cannot manually specify a different country than their request context

**Example:**
```typescript
// Events Controller
@Post()
create(@GetCountry() country: Country, @Body() body: CreateEventDto) {
  return this.eventsService.create({ ...body, country });
}
```

## API Usage Examples

### Creating Resources

```bash
# Create event in Nigeria
curl -X POST http://localhost:3000/events \
  -H "X-Country: NG" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lagos Wedding",
    "slug": "lagos-wedding",
    "category": "WEDDING"
  }'

# Create client in UK
curl -X POST http://localhost:3000/clients \
  -H "X-Country: UK" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john@example.co.uk"
  }'
```

### Accessing Resources

```bash
# List all Nigeria events
curl -H "X-Country: NG" http://localhost:3000/events
# Returns: [...events from Nigeria only]

# List all UK events
curl -H "X-Country: UK" http://localhost:3000/events
# Returns: [...events from UK only]

# Try to access Nigeria event from UK (FAILS)
curl -H "X-Country: UK" http://localhost:3000/events/{ng-event-id}
# Returns: null or 404

# Access Nigeria event from Nigeria (SUCCESS)
curl -H "X-Country: NG" http://localhost:3000/events/{ng-event-id}
# Returns: {event data}
```

### Using Subdomains

```bash
# Nigeria subdomain
curl http://ng.yourdomain.com/events
# Automatically uses X-Country: NG

# UK subdomain
curl http://uk.yourdomain.com/events
# Automatically uses X-Country: UK
```

### Download Links (Region-Locked)

```bash
# Create download selection in Nigeria
curl -X POST http://localhost:3000/events/{event-id}/download-selection \
  -H "X-Country: NG" \
  -H "Content-Type: application/json" \
  -d '{
    "photoIds": ["photo1", "photo2"],
    "expirationHours": 24
  }'
# Returns: {"token": "abc-123", "shareLink": "/download/abc-123"}

# Access download from Nigeria (SUCCESS)
curl -H "X-Country: NG" http://localhost:3000/download/abc-123
# Returns: {download selection with images}

# Try to access same download from UK (FAILS)
curl -H "X-Country: UK" http://localhost:3000/download/abc-123
# Returns: "Download selection not found"
```

## Database Schema

### Models with Country Field

```prisma
enum Country {
  NG // Nigeria
  UK // United Kingdom
}

model User {
  id       String  @id @default(cuid())
  country  Country @default(NG)
  // ... other fields
}

model Client {
  id       String  @id @default(cuid())
  country  Country @default(NG)
  // ... other fields
}

model Event {
  id       String  @id @default(cuid())
  country  Country @default(NG)
  // ... other fields

  @@index([country])
}

model Booking {
  id       String  @id @default(cuid())
  country  Country @default(NG)
  // ... other fields

  @@index([country])
}
```

**Note**: Photos do not have a direct country field; they inherit country context through their parent Event relationship.

## Testing

### Test Suite

```bash
# Test 1: Cross-country event access
# Expected: Should fail
curl -H "X-Country: UK" http://localhost:3000/events/{ng-event-id}

# Test 2: Same-country event access
# Expected: Should succeed
curl -H "X-Country: NG" http://localhost:3000/events/{ng-event-id}

# Test 3: Cross-country booking update
# Expected: Should fail with "Booking not found"
curl -X PATCH http://localhost:3000/bookings/{ng-booking-id} \
  -H "X-Country: UK" \
  -H "Content-Type: application/json" \
  -d '{"location": "London"}'

# Test 4: Cross-country download access
# Expected: Should fail with "Download selection not found"
curl -H "X-Country: UK" http://localhost:3000/download/{ng-token}

# Test 5: Client listing
# Expected: Should return only UK clients
curl -H "X-Country: UK" http://localhost:3000/clients

# Test 6: User listing (global resource)
# Expected: Should return ALL users regardless of country
curl -H "X-Country: UK" http://localhost:3000/users
curl -H "X-Country: NG" http://localhost:3000/users
# Both should return the same list
```

## Troubleshooting

### Common Issues

1. **"Country header not detected"**
   - Ensure you're sending the `X-Country` header with value `NG` or `UK`
   - Check subdomain configuration if using subdomain-based detection
   - Verify CountryGuard is properly registered in app.module.ts

2. **"Getting null when accessing resource by ID"**
   - Verify the resource belongs to the country specified in your request
   - Check that you're using the correct country header/subdomain
   - Confirm the resource exists in the database

3. **"Download links not working"**
   - Ensure you're accessing the download with the same country that created it
   - Check that the download selection hasn't expired
   - Verify the token is correct

4. **"Can't create resources"**
   - Confirm CountryGuard is allowing the request through
   - Verify the country parameter is being extracted correctly
   - Check that the country field is being set in the database

## Migration Guide

If you have existing data without country fields:

```sql
-- Set default country for existing records
UPDATE "Event" SET country = 'NG' WHERE country IS NULL;
UPDATE "Booking" SET country = 'NG' WHERE country IS NULL;
UPDATE "Client" SET country = 'NG' WHERE country IS NULL;
UPDATE "User" SET country = 'NG' WHERE country IS NULL;

-- Verify update
SELECT country, COUNT(*) FROM "Event" GROUP BY country;
SELECT country, COUNT(*) FROM "Booking" GROUP BY country;
SELECT country, COUNT(*) FROM "Client" GROUP BY country;
SELECT country, COUNT(*) FROM "User" GROUP BY country;
```

## Implementation Files

### Services Modified

**src/events/events.service.ts**
- `findOne(id, country?)` - Line 48
- `update(id, data, country?)` - Line 55
- `remove(id, country?)` - Line 79
- `addPhotos(eventId, photos, country?)` - Line 93
- `listPhotos(eventId, country?)` - Line 113
- `syncPhotosFromGoogleDrive(eventId, country?)` - Line 127
- `createShareableLink(photoIds, country?)` - Line 162
- `getGoogleDriveImages(eventId, country?)` - Line 196
- `createDownloadSelection(eventId, driveFileIds, expirationHours, country?)` - Line 226
- `getDownloadSelection(token, country?)` - Line 266
- `createDownloadSelectionFromPhotos(eventId, photoIds, expirationHours, country?)` - Line 313

**src/bookings/bookings.service.ts**
- `findOne(id, country?)` - Line 43
- `update(id, data, country?)` - Line 50
- `remove(id, country?)` - Line 65
- `assignUsers(id, userIds, country?)` - Line 79

**src/clients/clients.service.ts**
- `create(data)` - Line 9 (accepts country in data)
- `findAll(country?)` - Line 13
- `findOne(id, country?)` - Line 19
- `update(id, data, country?)` - Line 25
- `remove(id, country?)` - Line 39

### Controllers Modified

All corresponding controllers updated to extract and pass country using `@GetCountry()` decorator:
- `src/events/events.controller.ts` (11 methods)
- `src/bookings/bookings.controller.ts` (4 methods)
- `src/clients/clients.controller.ts` (5 methods)
- `src/events/download.controller.ts` (2 methods)

## Future Enhancements

Potential improvements:

1. **Additional Countries**: Add more country codes to the enum
2. **Country-Specific Settings**: Different configurations per country
3. **Analytics**: Track usage metrics per country
4. **Country Transfer**: Allow moving resources between countries (with proper authorization)
5. **Multi-Country Users**: Allow users to have access to multiple countries
6. **Country-Based Rate Limiting**: Different rate limits per country
7. **Regional Data Centers**: Store data in country-specific databases

## Best Practices

### For Frontend Developers

1. **Always send country header**: Include `X-Country` header in all requests
2. **Handle null responses**: Cross-country access returns null/404
3. **Cache country context**: Store user's country in app state
4. **Show appropriate UI**: Display only relevant country data

### For Backend Developers

1. **Consistent patterns**: Always add country parameter to new methods
2. **Verify ownership**: Check country before mutations
3. **Test thoroughly**: Test both same-country and cross-country access
4. **Document changes**: Update API docs when modifying country logic

### For System Administrators

1. **Monitor logs**: Track country context in request logs
2. **Database indexes**: Ensure country fields are indexed
3. **Backup strategy**: Consider per-country backup schedules
4. **Compliance**: Ensure data residency requirements are met

---

**Last Updated**: 2025-01-20
**Version**: 1.0.0
**Maintainer**: dbroyal-backend Team
