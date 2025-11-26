# Photo API Response Examples

## Single Photo Response

When fetching photos from the API, you'll now receive both URLs:

### After Sync (Current Implementation)

```json
{
  "id": "clpxyz123abc",
  "eventId": "clpevent456",
  "url": "/api/v1/events/photos/proxy/1BxA9kL3mN4oP5qR6sT7uV8wX9yZ0",
  "googleDriveUrl": "https://drive.google.com/uc?export=view&id=1BxA9kL3mN4oP5qR6sT7uV8wX9yZ0",
  "driveFileId": "1BxA9kL3mN4oP5qR6sT7uV8wX9yZ0",
  "caption": "IMG_20231125_143022.jpg",
  "status": "COMPLETE",
  "mimeType": "image/jpeg",
  "fileSize": "4567890",
  "width": 3840,
  "height": 2160,
  "createdAt": "2023-11-25T14:30:22.000Z",
  "updatedAt": "2023-11-25T14:30:22.000Z"
}
```

## Photo List Response

### GET /api/v1/events/:eventId/photos

```json
{
  "data": [
    {
      "id": "photo_1",
      "url": "/api/v1/events/photos/proxy/1BxA9kL3mN4oP5qR6sT7uV8wX9yZ0",
      "googleDriveUrl": "https://drive.google.com/uc?export=view&id=1BxA9kL3mN4oP5qR6sT7uV8wX9yZ0",
      "driveFileId": "1BxA9kL3mN4oP5qR6sT7uV8wX9yZ0",
      "caption": "Photo 1",
      "mimeType": "image/jpeg",
      "fileSize": "2048576",
      "width": 1920,
      "height": 1080
    },
    {
      "id": "photo_2",
      "url": "/api/v1/events/photos/proxy/2CyB0mM4nO5pQ6rS7tU8vW9xY0zA1",
      "googleDriveUrl": "https://drive.google.com/uc?export=view&id=2CyB0mM4nO5pQ6rS7tU8vW9xY0zA1",
      "driveFileId": "2CyB0mM4nO5pQ6rS7tU8vW9xY0zA1",
      "caption": "Photo 2",
      "mimeType": "image/jpeg",
      "fileSize": "3145728",
      "width": 2560,
      "height": 1440
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

## Frontend Usage Examples

### React Component (with fallback)

```jsx
import React, { useState } from "react";

function PhotoGallery({ photos }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
}

function PhotoCard({ photo }) {
  const [imgSrc, setImgSrc] = useState(photo.googleDriveUrl || photo.url);
  const [usedFallback, setUsedFallback] = useState(false);

  const handleError = () => {
    if (!usedFallback && photo.url) {
      console.log(`Google Drive failed for ${photo.id}, using proxy`);
      setImgSrc(photo.url);
      setUsedFallback(true);
    }
  };

  return (
    <div className="photo-card">
      <img
        src={imgSrc}
        alt={photo.caption}
        onError={handleError}
        loading="lazy"
        className="w-full h-64 object-cover rounded-lg"
      />
      <p className="mt-2 text-sm text-gray-600">{photo.caption}</p>
    </div>
  );
}

export default PhotoGallery;
```

### Vue Component

```vue
<template>
  <div class="photo-grid">
    <div v-for="photo in photos" :key="photo.id" class="photo-item">
      <img
        :src="currentSrc(photo)"
        :alt="photo.caption"
        @error="handleError($event, photo)"
        loading="lazy"
      />
      <p>{{ photo.caption }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: ["photos"],
  data() {
    return {
      fallbackUsed: {},
    };
  },
  methods: {
    currentSrc(photo) {
      return this.fallbackUsed[photo.id]
        ? photo.url
        : photo.googleDriveUrl || photo.url;
    },
    handleError(event, photo) {
      if (!this.fallbackUsed[photo.id] && photo.url) {
        this.fallbackUsed[photo.id] = true;
        event.target.src = photo.url;
      }
    },
  },
};
</script>
```

### Angular Component

```typescript
// photo-gallery.component.ts
import { Component, Input } from "@angular/core";

interface Photo {
  id: string;
  url: string;
  googleDriveUrl?: string;
  driveFileId: string;
  caption: string;
}

@Component({
  selector: "app-photo-gallery",
  templateUrl: "./photo-gallery.component.html",
  styleUrls: ["./photo-gallery.component.css"],
})
export class PhotoGalleryComponent {
  @Input() photos: Photo[] = [];
  fallbackUsed: Set<string> = new Set();

  getPhotoSrc(photo: Photo): string {
    return this.fallbackUsed.has(photo.id)
      ? photo.url
      : photo.googleDriveUrl || photo.url;
  }

  handleImageError(photo: Photo, event: Event): void {
    if (!this.fallbackUsed.has(photo.id) && photo.url) {
      this.fallbackUsed.add(photo.id);
      (event.target as HTMLImageElement).src = photo.url;
    }
  }
}
```

```html
<!-- photo-gallery.component.html -->
<div class="photo-grid">
  <div *ngFor="let photo of photos" class="photo-item">
    <img
      [src]="getPhotoSrc(photo)"
      [alt]="photo.caption"
      (error)="handleImageError(photo, $event)"
      loading="lazy"
    />
    <p>{{ photo.caption }}</p>
  </div>
</div>
```

### Vanilla JavaScript

```javascript
async function loadPhotos(eventId) {
  const response = await fetch(`/api/v1/events/${eventId}/photos`);
  const { data: photos } = await response.json();

  const gallery = document.getElementById("photo-gallery");

  photos.forEach((photo) => {
    const img = document.createElement("img");
    img.src = photo.googleDriveUrl || photo.url;
    img.alt = photo.caption;
    img.loading = "lazy";

    // Fallback to proxy on error
    img.onerror = function () {
      if (this.src !== photo.url) {
        console.log(`Google Drive failed for ${photo.id}, using proxy`);
        this.src = photo.url;
      }
    };

    gallery.appendChild(img);
  });
}
```

## URL Formats Explained

### Google Drive URL

```
https://drive.google.com/uc?export=view&id={fileId}
```

- Direct access to Google Drive
- Works if folder/file is public
- No backend resources used
- Fast via Google CDN

### Backend Proxy URL

```
/api/v1/events/photos/proxy/{fileId}
```

- Always works (backend authenticates)
- Supports optimization: `/api/v1/events/photos/proxy/{fileId}?size=400`
- Uses backend bandwidth
- Can be cached/monitored

### Optimization Examples

```
/api/v1/events/photos/proxy/{fileId}?size=400   (thumbnail)
/api/v1/events/photos/proxy/{fileId}?size=800   (medium)
/api/v1/events/photos/proxy/{fileId}?size=1200  (large)
/api/v1/events/photos/proxy/{fileId}            (original)
```

## Testing the Implementation

### 1. Check API Response

```bash
# Get photos for an event
curl http://localhost:3000/api/v1/events/{eventId}/photos \
  -H "X-Country: NG"

# Should return photos with both url and googleDriveUrl
```

### 2. Test Google Drive URL

```bash
# Open in browser (should load without login if public)
https://drive.google.com/uc?export=view&id=1BxA9kL3mN4oP5qR6sT7uV8wX9yZ0
```

### 3. Test Backend Proxy

```bash
# Should always work
curl http://localhost:3000/api/v1/events/photos/proxy/1BxA9kL3mN4oP5qR6sT7uV8wX9yZ0

# Test with optimization
curl http://localhost:3000/api/v1/events/photos/proxy/1BxA9kL3mN4oP5qR6sT7uV8wX9yZ0?size=400
```

## Migration Notes

### Existing Photos

After deployment, existing photos will have:

- ✅ `url` - Already exists (proxy URL)
- ❌ `googleDriveUrl` - NULL (needs to be populated)

### Populating Google Drive URLs

Run a sync to populate `googleDriveUrl` for existing events:

```bash
# Trigger re-sync for a specific event
POST /api/v1/events/{eventId}/sync

# Or bulk sync all events
POST /api/v1/events/sync/bulk
```

Or manually update in database:

```sql
UPDATE "Photo"
SET "googleDriveUrl" = 'https://drive.google.com/uc?export=view&id=' || "driveFileId"
WHERE "driveFileId" IS NOT NULL
  AND "googleDriveUrl" IS NULL;
```

## Best Practices

1. **Always provide both URLs** in your responses
2. **Try Google Drive first** for best performance
3. **Fallback to proxy** if Google Drive fails (403, timeout)
4. **Use proxy with size parameter** for thumbnails
5. **Cache images** on the frontend
6. **Monitor 403 errors** to detect permission issues

## Common Issues

### Google Drive URL returns 403

**Problem:** Folder/file not set to public

**Solution:**

```javascript
// Frontend automatically falls back to proxy
<img src={photo.googleDriveUrl} onError={(e) => (e.target.src = photo.url)} />
```

### Need thumbnails from Google Drive URL

**Problem:** Google Drive URL returns full-size images

**Solution:**

```javascript
// Use backend proxy for thumbnails
<img src={`${photo.url}?size=400`} />
```

### Slow loading from Google Drive

**Problem:** Google CDN might be slow in some regions

**Solution:**

```javascript
// Use backend proxy instead
<img src={photo.url} />
```
