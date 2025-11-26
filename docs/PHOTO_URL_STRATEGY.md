# Photo URL Strategy

## Overview

Each photo in the system now has **two URLs** for maximum flexibility and reliability:

1. **`googleDriveUrl`** - Direct Google Drive public URL (primary)
2. **`url`** - Backend proxy URL (fallback)

## URL Types

### 1. Direct Google Drive URL (`googleDriveUrl`)

**Format:** `https://drive.google.com/uc?export=view&id={fileId}`

**Advantages:**

- ✅ Direct access to Google Drive
- ✅ No backend bandwidth usage
- ✅ Google's CDN performance
- ✅ Works if Google Drive folder is set to public

**When to use:**

- Your Google Drive folder is set to "Anyone with the link can view"
- You want direct access to Google Drive content
- You prefer Google's CDN for image delivery

**Example:**

```json
{
  "id": "photo123",
  "googleDriveUrl": "https://drive.google.com/uc?export=view&id=1abc...xyz",
  "url": "/api/v1/events/photos/proxy/1abc...xyz"
}
```

### 2. Backend Proxy URL (`url`)

**Format:** `/api/v1/events/photos/proxy/{fileId}?size={optional}`

**Advantages:**

- ✅ Always works, regardless of Google Drive permissions
- ✅ Image optimization support (resize, compress)
- ✅ Consistent access control
- ✅ Caching and CDN integration

**When to use:**

- Fallback if Google Drive URL fails (403 error)
- Need image optimization/resizing
- Want to track image access
- Need to serve images through your domain

**Example:**

```json
{
  "id": "photo123",
  "url": "/api/v1/events/photos/proxy/1abc...xyz",
  "googleDriveUrl": "https://drive.google.com/uc?export=view&id=1abc...xyz"
}
```

## Frontend Usage Pattern

### Recommended Approach (Try Google Drive, fallback to Proxy)

```javascript
function PhotoComponent({ photo }) {
  const [imgSrc, setImgSrc] = useState(photo.googleDriveUrl || photo.url);
  const [usedFallback, setUsedFallback] = useState(false);

  const handleError = () => {
    if (!usedFallback && photo.url) {
      console.log("Google Drive URL failed, using backend proxy");
      setImgSrc(photo.url);
      setUsedFallback(true);
    }
  };

  return <img src={imgSrc} alt={photo.caption} onError={handleError} />;
}
```

### React Hook for Image Loading

```javascript
function usePhotoUrl(photo) {
  const [src, setSrc] = useState(photo.googleDriveUrl || photo.url);
  const [error, setError] = useState(false);

  const handleError = useCallback(() => {
    if (src === photo.googleDriveUrl && photo.url) {
      setSrc(photo.url);
      setError(false);
    } else {
      setError(true);
    }
  }, [photo, src]);

  return { src, error, handleError };
}

// Usage
function Photo({ photo }) {
  const { src, error, handleError } = usePhotoUrl(photo);

  if (error) return <div>Failed to load image</div>;

  return <img src={src} onError={handleError} alt={photo.caption} />;
}
```

## Backend Proxy Features

### Image Optimization

The backend proxy supports image optimization through query parameters:

```
/api/v1/events/photos/proxy/{fileId}?size=400    // 400px width thumbnail
/api/v1/events/photos/proxy/{fileId}?size=800    // 800px width
/api/v1/events/photos/proxy/{fileId}?size=1200   // 1200px width
/api/v1/events/photos/proxy/{fileId}             // Full-size original
```

**Benefits:**

- Automatic resizing with Sharp
- Progressive JPEG encoding
- Significant bandwidth reduction
- Faster page loads

**Example:**

```javascript
// Use different sizes for different contexts
<img
  src={`/api/v1/events/photos/proxy/${photo.driveFileId}?size=400`}
  alt="thumbnail"
/>

<img
  src={`/api/v1/events/photos/proxy/${photo.driveFileId}?size=1200`}
  alt="full view"
/>
```

## Google Drive Public Access Setup

To ensure `googleDriveUrl` works without authentication:

1. **Share the folder publicly:**

   - Right-click folder in Google Drive
   - Select "Share" → "Anyone with the link"
   - Set permission to "Viewer"

2. **Share individual files** (alternative):

   - Right-click each file
   - Select "Share" → "Anyone with the link"
   - Set permission to "Viewer"

3. **Verify access:**
   - Test the URL in an incognito browser window
   - Should load without login prompt

## Migration from Old System

If you have existing photos without `googleDriveUrl`, you can backfill them:

```sql
-- Update existing photos to add Google Drive URLs
UPDATE "Photo"
SET "googleDriveUrl" = 'https://drive.google.com/uc?export=view&id=' || "driveFileId"
WHERE "driveFileId" IS NOT NULL AND "googleDriveUrl" IS NULL;
```

Or trigger a re-sync:

```bash
# Re-sync event to populate Google Drive URLs
POST /api/v1/events/{eventId}/sync
```

## Decision Matrix

| Scenario                   | Recommended URL                         |
| -------------------------- | --------------------------------------- |
| Public Google Drive folder | `googleDriveUrl` (primary)              |
| Private/restricted folder  | `url` (proxy only)                      |
| Need image optimization    | `url` with `?size=` param               |
| Need access tracking       | `url` (proxy only)                      |
| Maximum performance        | Try `googleDriveUrl`, fallback to `url` |
| Bandwidth constraints      | `url` with optimization                 |

## Caching Strategy

### Frontend

```javascript
// Cache Google Drive URLs (they're stable)
const cacheKey = photo.googleDriveUrl;
if (imageCache.has(cacheKey)) {
  return imageCache.get(cacheKey);
}
```

### Backend

The proxy endpoint sets cache headers:

```
Cache-Control: public, max-age=86400  // 24 hours
```

## API Response Format

When fetching photos, you'll receive both URLs:

```json
{
  "data": [
    {
      "id": "photo_abc123",
      "url": "/api/v1/events/photos/proxy/1abc...xyz",
      "googleDriveUrl": "https://drive.google.com/uc?export=view&id=1abc...xyz",
      "driveFileId": "1abc...xyz",
      "caption": "Photo 1",
      "mimeType": "image/jpeg",
      "fileSize": "2048576",
      "width": 1920,
      "height": 1080
    }
  ]
}
```

## Troubleshooting

### Google Drive URL returns 403 Forbidden

- **Cause:** File/folder is not set to public
- **Solution:** Use backend proxy URL (`url`) instead, or update sharing settings

### Both URLs fail

- **Cause:** File deleted from Google Drive or invalid `driveFileId`
- **Solution:** Re-sync the event to update photo records

### Slow loading with Google Drive URL

- **Cause:** Google Drive can be slower for some regions
- **Solution:** Use backend proxy with optimization (`url?size=800`)

## Best Practices

1. **Always provide both URLs** in API responses
2. **Frontend: Try Google Drive first**, fallback to proxy
3. **Use optimization** for thumbnails and previews
4. **Keep folders public** if you want to use direct Google Drive URLs
5. **Monitor 403 errors** to detect permission issues
6. **Cache aggressively** - images don't change frequently
7. **Consider lazy loading** for image-heavy pages

## Related Documentation

- [Google Drive Setup](./GOOGLE_DRIVE_SETUP.md)
- [Image Optimization](./IMAGE_OPTIMIZATION.md)
- [Photo Sync Integration](./PHOTO_SYNC_INTEGRATION.md)
