# Dual URL Implementation Summary

## What Changed

Photos now include **two URLs** for maximum flexibility:

```json
{
  "id": "photo_123",
  "googleDriveUrl": "https://drive.google.com/uc?export=view&id=1abc...xyz",
  "url": "/api/v1/events/photos/proxy/1abc...xyz",
  "driveFileId": "1abc...xyz",
  "caption": "My Photo"
}
```

## Why Two URLs?

1. **`googleDriveUrl`** (Primary) - Direct Google Drive link

   - Works immediately if your Drive folder is public
   - No backend bandwidth usage
   - Fast delivery via Google's CDN

2. **`url`** (Fallback) - Backend proxy with optimization
   - Always works, even if Drive permissions change
   - Supports image resizing/optimization (`?size=400`)
   - Consistent access control

## Usage in Frontend

### Simple Approach (Google Drive Only)

```javascript
<img src={photo.googleDriveUrl} alt={photo.caption} />
```

### Recommended Approach (Try Google Drive, fallback to Proxy)

```javascript
function Photo({ photo }) {
  const [src, setSrc] = useState(photo.googleDriveUrl || photo.url);
  const [fallback, setFallback] = useState(false);

  return (
    <img
      src={src}
      alt={photo.caption}
      onError={() => {
        if (!fallback) {
          setSrc(photo.url); // Try backend proxy
          setFallback(true);
        }
      }}
    />
  );
}
```

### With Optimization (Backend Proxy)

```javascript
// Use backend proxy for thumbnails with optimization
<img
  src={`${photo.url}?size=400`}
  alt={photo.caption}
/>

// Or build the URL from driveFileId
<img
  src={`/api/v1/events/photos/proxy/${photo.driveFileId}?size=400`}
  alt={photo.caption}
/>
```

## Which URL Should I Use?

| Scenario                                | Use This URL                              | Why                                 |
| --------------------------------------- | ----------------------------------------- | ----------------------------------- |
| Your Google Drive folder is **public**  | `googleDriveUrl` first, fallback to `url` | Best performance, no backend load   |
| Your Google Drive folder is **private** | `url` (proxy only)                        | Only proxy can access private files |
| Need **thumbnails/resizing**            | `url` with `?size=`                       | Backend supports optimization       |
| Want **fastest loading**                | Try both (Drive first, proxy fallback)    | Combines benefits of both           |

## Schema Changes

Added to `Photo` model:

```prisma
model Photo {
  // ... existing fields
  url             String   // Backend proxy URL
  googleDriveUrl  String?  // NEW: Direct Google Drive URL
  driveFileId     String?  // Existing: used for both URLs
  // ...
}
```

## Migration Applied

```bash
# Already applied:
npx prisma migrate dev --name add_google_drive_url_to_photos
```

Database now includes the `googleDriveUrl` column for all photos.

## Backend Implementation

When syncing photos from Google Drive:

```typescript
const photos = images.map((img) => ({
  eventId,
  url: `/api/v1/events/photos/proxy/${img.id}`, // Proxy URL
  googleDriveUrl: getPublicImageUrl(img.id), // Direct Drive URL
  driveFileId: img.id,
  caption: img.name,
  // ... other metadata
}));
```

## Testing

1. **Check your Google Drive folder sharing:**

   ```
   Share → Anyone with the link → Viewer
   ```

2. **Test the Google Drive URL:**

   - Open in incognito browser
   - Should load without login

3. **Test fallback:**
   - Restrict Drive folder permissions
   - Frontend should automatically use proxy URL

## Next Steps

1. ✅ Database schema updated
2. ✅ Migration applied
3. ✅ Backend code updated to populate both URLs
4. **TODO:** Update frontend to use `googleDriveUrl` with fallback
5. **TODO:** Test with public Google Drive folders
6. **TODO:** Monitor for 403 errors (indicates Drive not public)

## Related Documentation

- [Photo URL Strategy](./PHOTO_URL_STRATEGY.md) - Detailed guide on URL usage
- [Image Optimization](./IMAGE_OPTIMIZATION.md) - Backend proxy optimization features
- [Google Drive Setup](./GOOGLE_DRIVE_SETUP.md) - How to configure Drive sharing

## Quick Reference

```javascript
// ✅ Best practice: Try Google Drive, fallback to proxy
const photoUrl = photo.googleDriveUrl || photo.url;

// ✅ With error handling
<img
  src={photo.googleDriveUrl}
  onError={(e) => e.target.src = photo.url}
/>

// ✅ Use proxy for thumbnails
<img src={`${photo.url}?size=400`} />

// ✅ Use Google Drive for full-size (if public)
<img src={photo.googleDriveUrl} />
```
