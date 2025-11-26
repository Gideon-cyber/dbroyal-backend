# Migration Guide: Services and Events Integration

## Overview

This migration connects the Services model to Events, replacing the hardcoded `EventCategory` enum with dynamic Service records.

## Changes Made

### 1. Schema Changes

- ✅ Removed `EventCategory` enum
- ✅ Added `slug` field to `Service` model (unique identifier)
- ✅ Added `serviceId` foreign key to `Event` model
- ✅ Added `events` relation to `Service` model
- ✅ Changed Event filtering from `category` to `serviceId`

### 2. Code Updates

- ✅ Updated `CreateEventDto` to use `serviceId` instead of `category`
- ✅ Updated `EventsService` methods to handle `serviceId`
- ✅ Changed `findByCategory()` to `findByService(serviceId)`
- ✅ Updated Events Controller endpoint from `/category/:category` to `/service/:serviceId`
- ✅ Updated `CreateServiceDto` to include `slug` field
- ✅ All event queries now include `service` relation

### 3. Data Migration

- ✅ Created seed script to create default services
- ✅ Seed script handles migration of existing events from old categories

## Migration Steps

### Step 1: When Database is Available

Run the migration command:

```bash
npx prisma migrate dev --name connect_services_to_events
```

This will:

1. Add `slug` column to `Service` table
2. Add `serviceId` column to `Event` table
3. Create foreign key constraint
4. Remove `category` column from `Event` table (after data migration)

### Step 2: Seed Services and Migrate Data

Run the seed script:

```bash
npx prisma db seed
```

This will:

1. Create 6 default services for Nigeria (NG)
2. Create 6 default services for United Kingdom (UK)
3. Migrate existing events from old categories to new services

### Default Services Created

#### Nigeria (NG)

- `wedding-photography` - Wedding Photography
- `corporate-event` - Corporate Event
- `professional-photoshoot` - Professional Photoshoot Services
- `birthday-shoots` - Birthday Shoots
- `burial-memorial-events` - Burial & Memorial Events
- `other-services` - Other Services

#### United Kingdom (UK)

- `wedding-photography-uk` - Wedding Photography
- `corporate-event-uk` - Corporate Event
- `professional-photoshoot-uk` - Professional Photoshoot Services
- `birthday-shoots-uk` - Birthday Shoots
- `burial-memorial-events-uk` - Burial & Memorial Events
- `other-services-uk` - Other Services

## Category to Service Mapping

The migration script automatically maps old categories to new services:

| Old Category | New Service Slug        | Service Title                    |
| ------------ | ----------------------- | -------------------------------- |
| WEDDING      | wedding-photography     | Wedding Photography              |
| CORPORATE    | corporate-event         | Corporate Event                  |
| PHOTOSHOOT   | professional-photoshoot | Professional Photoshoot Services |
| BIRTHDAY     | birthday-shoots         | Birthday Shoots                  |
| BURIAL       | burial-memorial-events  | Burial & Memorial Events         |
| OTHER        | other-services          | Other Services                   |

## API Changes

### Breaking Changes

#### 1. Create Event

**Before:**

```json
POST /events
{
  "name": "John & Jane Wedding",
  "slug": "john-jane-wedding",
  "category": "WEDDING",
  "description": "Beautiful wedding ceremony"
}
```

**After:**

```json
POST /events
{
  "name": "John & Jane Wedding",
  "slug": "john-jane-wedding",
  "serviceId": "clx1234567890abcdefghijk",
  "description": "Beautiful wedding ceremony"
}
```

#### 2. Get Events by Category/Service

**Before:**

```
GET /events/category/WEDDING
```

**After:**

```
GET /events/service/{serviceId}
```

#### 3. Event Response

**Before:**

```json
{
  "id": "...",
  "name": "John & Jane Wedding",
  "category": "WEDDING",
  ...
}
```

**After:**

```json
{
  "id": "...",
  "name": "John & Jane Wedding",
  "service": {
    "id": "...",
    "title": "Wedding Photography",
    "slug": "wedding-photography",
    "description": "...",
    "imageUrl": "..."
  },
  ...
}
```

## Frontend Updates Required

### 1. Replace Category Enums with Service API Calls

```typescript
// Before
const categories = ['WEDDING', 'CORPORATE', 'PHOTOSHOOT', ...];

// After
const services = await fetch('/services?isVisible=true').then(r => r.json());
```

### 2. Update Event Forms

```typescript
// Before
<select name="category">
  <option value="WEDDING">Wedding</option>
  <option value="CORPORATE">Corporate</option>
  ...
</select>

// After
<select name="serviceId">
  {services.map(service => (
    <option key={service.id} value={service.id}>
      {service.title}
    </option>
  ))}
</select>
```

### 3. Update Event Display

```typescript
// Before
<span>{event.category}</span>

// After
<span>{event.service.title}</span>
```

### 4. Update Filtering

```typescript
// Before
const events = await fetch(`/events/category/WEDDING`);

// After
const events = await fetch(`/events/service/${serviceId}`);
```

## Rollback Plan

If you need to rollback:

1. Restore the `EventCategory` enum in schema.prisma
2. Add back `category` field to Event model
3. Remove `serviceId` field
4. Run: `npx prisma migrate dev --name rollback_services`
5. Update code to use `category` again

## Testing Checklist

- [ ] Verify all default services are created
- [ ] Verify existing events are migrated correctly
- [ ] Test creating new events with serviceId
- [ ] Test filtering events by service
- [ ] Test event responses include service data
- [ ] Test creating/updating/deleting services
- [ ] Test service visibility toggle
- [ ] Verify country-based filtering still works

## Notes

- Services can be dynamically created/updated without code changes
- Each service has title, description, and image for better UI display
- Services support country-specific configurations
- Service visibility can be toggled without deletion
- The slug field provides a URL-friendly identifier for services
