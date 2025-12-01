# Automatic Cover Image Generation

## Overview

The Event model now supports both manual and automatically generated cover images:

- **`coverImageUrl`** - Manually set cover image (remains unchanged)
- **`generatedCoverImageUrl`** - Automatically generated from the first photo in the event

## Features

### Automatic Generation

The system automatically generates a cover image whenever:

1. **Photos are synced from Google Drive** (full sync)
2. **Incremental sync adds new photos**
3. **Manual regeneration is triggered**

The cover image is set to the **first photo** (by creation date) from the event's photo collection.

### Manual Regeneration

Admin users can manually trigger cover image regeneration via the API:

```bash
POST /api/v1/events/:eventId/regenerate-cover
Headers: X-Country: NG (or UK)
```

**Response:**

```json
{
  "eventId": "clx1234567890",
  "generatedCoverImageUrl": "https://drive.google.com/...",
  "message": "Cover image regenerated successfully"
}
```

## Database Schema

```prisma
model Event {
  // ... other fields
  coverImageUrl               String?  // Manually set cover image
  generatedCoverImageUrl      String?  // Auto-generated (Google Drive direct URL)
  generatedCoverImageProxyUrl String?  // Auto-generated (backend proxy URL)
  // ... other fields
}
```

## API Response

When fetching events, both fields are included:

```json
{
  "id": "clx1234567890",
  "name": "Corporate Event 2025",
  "coverImageUrl": "https://example.com/manual-cover.jpg",  // Manual
  "generatedCoverImageUrl": "https://drive.google.com/...",  // Auto (Google Drive)
  "generatedCoverImageProxyUrl": "/api/v1/events/photos/proxy/abc123",  // Auto (Backend Proxy)
  "photos": [...]
}
```

## Usage Recommendations

### Frontend Display Logic

```typescript
// Prefer manual cover image, fallback to generated (use proxy URL for reliability)
const displayCoverImage =
  event.coverImageUrl ||
  event.generatedCoverImageProxyUrl ||
  event.generatedCoverImageUrl;

// Or with explicit preference for Google Drive direct URL
const coverImage = {
  primary: event.coverImageUrl,
  fallbackDirect: event.generatedCoverImageUrl, // Google Drive direct
  fallbackProxy: event.generatedCoverImageProxyUrl, // Backend proxy (more reliable)
};
```

### When to Use Each

- **`coverImageUrl`**: When admin wants a specific, curated cover image
- **`generatedCoverImageUrl`**: Direct Google Drive URL (faster but may have 403 errors)
- **`generatedCoverImageProxyUrl`**: Backend proxy URL (more reliable, always works)

## Implementation Details

### Service Methods

#### `updateGeneratedCoverImage(eventId: string)`

Internal method that:

1. Finds the first photo for the event (by `createdAt` ASC)
2. Updates both `generatedCoverImageUrl` (Google Drive) and `generatedCoverImageProxyUrl` (backend proxy)
3. Stores the direct Google Drive URL and backend proxy URL separately

#### `regenerateCoverImage(eventId: string, country?: Country)`

Public method that:

1. Verifies event exists and belongs to the correct country
2. Calls `updateGeneratedCoverImage()`
3. Returns both the Google Drive direct URL and backend proxy URL

### Automatic Triggers

The system automatically calls `updateGeneratedCoverImage()` after:

1. **Full Google Drive sync** (`syncPhotosFromGoogleDrive`)
2. **Incremental sync** - full mode (`syncPhotosIncremental`)
3. **Incremental sync** - when new photos are added

## Migration

A migration was created to add the `generatedCoverImageUrl` field:

```bash
# Migration: 20251130163132_add_generated_cover_image_url
# Applied: 2025-11-30
```

Existing events will have `generatedCoverImageUrl: null` until:

- Photos are synced/re-synced from Google Drive
- Manual regeneration is triggered

## API Endpoints

### Regenerate Cover Image

```http
POST /api/v1/events/:id/regenerate-cover
Headers: X-Country: NG
```

**Success Response (200):**

```json
{
  "eventId": "clx1234567890",
  "generatedCoverImageUrl": "https://drive.google.com/uc?id=...",
  "generatedCoverImageProxyUrl": "/api/v1/events/photos/proxy/abc123",
  "message": "Cover image regenerated successfully"
}
```

**Error Responses:**

- `404`: Event not found
- `400`: No photos available to generate cover image

## Testing

### Test Automatic Generation

1. Create an event with a Google Drive URL
2. Trigger sync: `POST /api/v1/events/:id/sync`
3. Verify `generatedCoverImageUrl` is populated

### Test Manual Regeneration

1. Add/remove photos from an event
2. Call: `POST /api/v1/events/:id/regenerate-cover`
3. Verify the cover image updates

## Future Enhancements

Potential improvements:

- Allow selecting which photo to use (not just first)
- AI-powered cover selection (best quality, composition)
- Support for video thumbnail generation
- Batch regeneration for all events
