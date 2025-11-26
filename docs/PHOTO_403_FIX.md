# Photo 403 Error Fix - Implementation Guide

## Problem Analysis

### Why the 403 Error Occurred

The 403 error happened because **Google Drive `thumbnailLink` URLs require authentication**:

1. **Private URLs**: The `thumbnailLink` returned by Google Drive API is a private URL that requires authentication
2. **Service Account Access**: Your backend service account has access to the files
3. **Browser Access Denied**: When the frontend tries to load the image directly, Google Drive blocks the request because the browser doesn't have authentication

### Example of the Problem

```typescript
// ❌ OLD WAY (Causes 403 Error)
{
  url: "https://lh3.googleusercontent.com/d/SOME_ID=s220?authuser=0",
  // This URL requires Google authentication
}
```

## Solution Implemented

### Approach: Backend Proxy Pattern

We've implemented a **proxy endpoint** that:

1. Accepts requests from the frontend
2. Authenticates with Google Drive using the service account
3. Streams the image back to the frontend

This allows the backend to handle authentication while the frontend gets the images without 403 errors.

## Changes Made

### 1. Google Drive Service Updates

**File**: `src/google-drive/google-drive.service.ts`

#### Added Scopes

```typescript
scopes: [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/drive", // Added for full access if needed
];
```

#### New Methods Added

**`streamFile(fileId: string)`**

- Streams file content from Google Drive
- Returns: `{ stream, mimeType, size }`
- Used by the proxy endpoint to serve images

**`makeFilePublic(fileId: string)`** (Optional)

- Makes files publicly accessible
- Use if you want direct access without proxy

**`getPublicImageUrl(fileId: string)`** (Helper)

- Generates public Google Drive URLs
- Alternative approach if files are made public

### 2. Events Service Updates

**File**: `src/events/events.service.ts`

#### Updated Sync Methods

Changed photo URL storage from Google's `thumbnailLink` to backend proxy URL:

```typescript
// ✅ NEW WAY (Fixed)
url: `/api/events/photos/proxy/${img.id}`, // Backend proxy URL
driveFileId: img.id, // Store the Drive file ID
```

#### New Method Added

**`streamPhotoFromDrive(driveFileId: string)`**

- Wrapper method to stream photos
- Used by the controller's proxy endpoint

### 3. Events Controller Updates

**File**: `src/events/events.controller.ts`

#### New Proxy Endpoint

```typescript
@Get("photos/proxy/:driveFileId")
async proxyImage(
  @Param("driveFileId") driveFileId: string,
  @Query("size") size: string,
  @Res() res: Response
)
```

**Features**:

- Serves images through the backend
- Sets proper headers (Content-Type, Cache-Control)
- Streams files efficiently (no buffering in memory)
- Cache-Control header for 24-hour browser caching

## How to Use

### Backend API

The photos now return URLs like:

```json
{
  "id": "photo123",
  "url": "/api/events/photos/proxy/GOOGLE_DRIVE_FILE_ID",
  "driveFileId": "GOOGLE_DRIVE_FILE_ID",
  "caption": "Wedding Photo",
  "mimeType": "image/jpeg",
  "fileSize": "2048576"
}
```

### Frontend Usage

```typescript
// React/Next.js Example
<img
  src={`${API_BASE_URL}${photo.url}`}
  alt={photo.caption}
/>

// Or directly
<img
  src={`${API_BASE_URL}/api/events/photos/proxy/${photo.driveFileId}`}
  alt={photo.caption}
/>
```

### API Endpoint

**URL**: `GET /api/events/photos/proxy/:driveFileId`

**Parameters**:

- `driveFileId`: Google Drive file ID (required)
- `size`: Thumbnail size (optional, not yet implemented)

**Response**: Image file stream

**Headers Set**:

- `Content-Type`: Image MIME type (e.g., `image/jpeg`)
- `Content-Length`: File size
- `Cache-Control`: `public, max-age=86400` (24 hours)

## Testing

### 1. Re-sync Your Events

After deploying, trigger a sync to update all photo URLs:

```bash
# Sync specific event
POST /api/events/:eventId/sync

# Bulk sync all events
POST /api/events/sync/bulk
```

### 2. Test the Proxy Endpoint

```bash
# Get event photos
GET /api/events/:eventId/photos

# Response will have new proxy URLs
{
  "data": [
    {
      "id": "...",
      "url": "/api/events/photos/proxy/DRIVE_FILE_ID",
      "driveFileId": "DRIVE_FILE_ID"
    }
  ]
}

# Access image directly
GET /api/events/photos/proxy/DRIVE_FILE_ID
```

### 3. Frontend Display

```html
<!-- Should work without 403 errors -->
<img src="http://localhost:3000/api/events/photos/proxy/1BxA..." />
```

## Performance Considerations

### Pros

✅ **No 403 errors** - Backend handles authentication
✅ **Cached** - 24-hour browser caching reduces load
✅ **Streaming** - Efficient memory usage (no buffering)
✅ **Secure** - Files remain private in Google Drive

### Cons

⚠️ **Backend load** - All image requests go through your server
⚠️ **Bandwidth** - Uses your server's bandwidth

### Optimization Tips

1. **Use CDN**: Place CDN in front of proxy endpoint
2. **Increase caching**: Adjust `max-age` if images don't change
3. **Thumbnail sizes**: Add size parameter to serve optimized images
4. **Alternative**: Make folder public for read-only access (if acceptable)

## Alternative Approach: Public Files

If you want to make files public (simpler but less secure):

```typescript
// Make all files in folder public
const images = await googleDriveService.fetchImagesFromFolder(folderUrl);

for (const image of images) {
  await googleDriveService.makeFilePublic(image.id);
}

// Then use direct Google Drive URLs
url: `https://drive.google.com/uc?export=view&id=${img.id}`;
```

**Trade-offs**:

- ✅ No backend load
- ✅ Direct access from browser
- ⚠️ Anyone with link can access
- ⚠️ Less control over access

## Migration Steps

1. **Deploy the code** with the changes
2. **Re-sync all events** to update photo URLs
3. **Test on frontend** - images should load without 403 errors
4. **Monitor** backend load and adjust caching as needed

## Troubleshooting

### Still getting 403 errors?

1. Check if sync completed successfully
2. Verify service account has access to Drive folder
3. Check if proxy endpoint is accessible
4. Verify frontend is using correct API base URL

### Images loading slowly?

1. Check server bandwidth
2. Consider using CDN
3. Implement thumbnail sizes
4. Increase cache duration

### High backend load?

1. Use CDN for image serving
2. Consider making files public (if acceptable)
3. Implement image optimization
4. Add rate limiting

## Next Steps (Optional Enhancements)

1. **Add thumbnail support** - Serve different image sizes
2. **Implement CDN** - Cache images at edge locations
3. **Add image optimization** - Compress images on-the-fly
4. **Lazy loading** - Load images as user scrolls
5. **Progressive loading** - Show low-res first, then high-res

## Summary

The 403 error is now fixed by:

1. ✅ Storing backend proxy URLs instead of Google Drive thumbnailLinks
2. ✅ Adding a proxy endpoint that authenticates with service account
3. ✅ Streaming images efficiently with proper caching
4. ✅ Maintaining security (files stay private in Google Drive)

All existing photos will need to be re-synced to get the new URLs!
