# Image Optimization Guide

## Overview

This backend now supports automatic image optimization to improve frontend loading performance. Large high-resolution images are resized and compressed on-the-fly to reduce bandwidth and loading times.

> **Note:** Photos now include both a direct Google Drive URL and a backend proxy URL. See [Photo URL Strategy](./PHOTO_URL_STRATEGY.md) for details on when to use each URL type.

## Problem Solved

**Before**: Full-resolution images (3-10 MB each) caused:

- Frontend freezing
- Slow page loads (5-10 seconds per image)
- High bandwidth usage
- Poor mobile experience

**After**: Optimized images (50-200 KB each) provide:

- Fast loading (< 0.5 seconds)
- Smooth scrolling
- 95%+ bandwidth reduction
- Excellent mobile performance

## How It Works

The backend uses **Sharp** (high-performance image processing library) to:

1. Download full-resolution image from Google Drive
2. Resize to requested width (maintaining aspect ratio)
3. Convert to progressive JPEG
4. Compress with specified quality
5. Stream optimized image to frontend

## API Usage

### Proxy Endpoint

```
GET /api/events/photos/proxy/:driveFileId?size={width}
```

**Parameters:**

- `driveFileId` (required): Google Drive file ID
- `size` (optional): Target width in pixels

**Without size parameter** - Returns full-resolution image:

```
GET /api/events/photos/proxy/1BxA...
```

**With size parameter** - Returns optimized thumbnail:

```
GET /api/events/photos/proxy/1BxA...?size=400
GET /api/events/photos/proxy/1BxA...?size=800
GET /api/events/photos/proxy/1BxA...?size=1200
```

## Recommended Image Sizes

| Use Case             | Size         | Typical File Size | Load Time |
| -------------------- | ------------ | ----------------- | --------- |
| **Grid/Thumbnails**  | `?size=400`  | 50-100 KB         | < 0.3s    |
| **Modal/Lightbox**   | `?size=1200` | 200-400 KB        | < 0.8s    |
| **High-res Preview** | `?size=1920` | 400-800 KB        | < 1.5s    |
| **Full Download**    | (no size)    | 3-10 MB           | 3-10s     |

## Frontend Implementation

### Using Direct Google Drive URLs (Recommended)

```tsx
// Try Google Drive URL first, fallback to proxy if it fails
function Photo({ photo }) {
  const [imgSrc, setImgSrc] = useState(photo.googleDriveUrl || photo.url);
  const [usedFallback, setUsedFallback] = useState(false);

  const handleError = () => {
    if (!usedFallback && photo.url) {
      setImgSrc(photo.url);
      setUsedFallback(true);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={photo.caption}
      onError={handleError}
      loading="lazy"
    />
  );
}
```

### React/Next.js Example

```tsx
// Basic usage with backend proxy (with optimization)
<img
  src={`${API_BASE_URL}/api/events/photos/proxy/${photo.driveFileId}?size=400`}
  alt={photo.caption}
  loading="lazy"
/>

// Using direct Google Drive URL (no optimization, but faster if public)
<img
  src={photo.googleDriveUrl}
  alt={photo.caption}
  loading="lazy"
/>

// Responsive images with srcSet
<img
  src={`${API_BASE_URL}/api/events/photos/proxy/${photo.driveFileId}?size=800`}
  srcSet={`
    ${API_BASE_URL}/api/events/photos/proxy/${photo.driveFileId}?size=400 400w,
    ${API_BASE_URL}/api/events/photos/proxy/${photo.driveFileId}?size=800 800w,
    ${API_BASE_URL}/api/events/photos/proxy/${photo.driveFileId}?size=1200 1200w
  `}
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  alt={photo.caption}
  loading="lazy"
/>

// Gallery grid
<div className="grid grid-cols-3 gap-4">
  {photos.map(photo => (
    <img
      key={photo.id}
      src={`${API_BASE_URL}/api/events/photos/proxy/${photo.driveFileId}?size=400`}
      alt={photo.caption}
      loading="lazy"
      className="w-full h-64 object-cover"
    />
  ))}
</div>

// Lightbox/Modal - higher quality
<Dialog>
  <img
    src={`${API_BASE_URL}/api/events/photos/proxy/${photo.driveFileId}?size=1200`}
    alt={photo.caption}
  />
</Dialog>
```

### Vue.js Example

```vue
<template>
  <div class="photo-grid">
    <img
      v-for="photo in photos"
      :key="photo.id"
      :src="`${apiBaseUrl}/api/events/photos/proxy/${photo.driveFileId}?size=400`"
      :alt="photo.caption"
      loading="lazy"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      apiBaseUrl: process.env.VUE_APP_API_URL,
    };
  },
};
</script>
```

### Angular Example

```typescript
// component.ts
export class PhotoGalleryComponent {
  apiBaseUrl = environment.apiUrl;

  getThumbnailUrl(driveFileId: string, size: number = 400): string {
    return `${this.apiBaseUrl}/api/events/photos/proxy/${driveFileId}?size=${size}`;
  }
}

// component.html
<div class="photo-grid">
  <img
    *ngFor="let photo of photos"
    [src]="getThumbnailUrl(photo.driveFileId, 400)"
    [alt]="photo.caption"
    loading="lazy"
  />
</div>
```

## Performance Comparison

### Single Image Load

| Scenario               | Image Size | Load Time | Bandwidth |
| ---------------------- | ---------- | --------- | --------- |
| **Full resolution**    | 5 MB       | 5-10s     | 5 MB      |
| **Optimized (1200px)** | 350 KB     | 0.8s      | 350 KB    |
| **Optimized (800px)**  | 150 KB     | 0.3s      | 150 KB    |
| **Optimized (400px)**  | 80 KB      | 0.2s      | 80 KB     |

### Gallery Page (20 images)

| Scenario            | Total Size | Load Time | User Experience |
| ------------------- | ---------- | --------- | --------------- |
| **Full resolution** | 100 MB     | 60-120s   | ❌ Page freezes |
| **No optimization** | 100 MB     | 60-120s   | ❌ Very slow    |
| **size=1200**       | 7 MB       | 10-15s    | ⚠️ Slow         |
| **size=800**        | 3 MB       | 5-8s      | ✅ Good         |
| **size=400**        | 1.6 MB     | 3-5s      | ✅ Excellent    |

## Configuration

### Default Settings

The optimization uses these defaults (can be customized):

```typescript
// In google-drive.service.ts
maxWidth: 800,      // pixels
quality: 85,        // 1-100 (JPEG quality)
format: 'jpeg',     // Output format
progressive: true,  // Progressive JPEG
mozjpeg: true      // Use MozJPEG encoder
```

### Custom Quality

To adjust quality/size tradeoff, modify in `google-drive.service.ts`:

```typescript
.jpeg({
  quality: 90,  // Higher = better quality, larger file
  progressive: true,
  mozjpeg: true,
})
```

## Best Practices

### 1. Always Use Size Parameter for Display

```typescript
// ❌ DON'T - Loads 5 MB image
<img src="/api/events/photos/proxy/FILE_ID" />

// ✅ DO - Loads 80 KB optimized image
<img src="/api/events/photos/proxy/FILE_ID?size=400" />
```

### 2. Use Lazy Loading

```typescript
// Defers loading until image is near viewport
<img loading="lazy" src="..." />
```

### 3. Use Responsive Images

```typescript
// Browser selects best size based on screen width
<img
  srcSet="...?size=400 400w, ...?size=800 800w, ...?size=1200 1200w"
  sizes="(max-width: 640px) 400px, 800px"
/>
```

### 4. Match Size to Use Case

```typescript
// Thumbnail grid
?size=400

// Medium preview
?size=800

// Lightbox/modal
?size=1200

// Full download only
(no size parameter)
```

### 5. Cache Images

The backend sets 24-hour cache headers. Frontend can also cache:

```typescript
// Service Worker caching
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/photos/proxy/")) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
```

## Troubleshooting

### Images Still Loading Slowly

1. **Check if size parameter is used**: Verify in Network tab
2. **Check image dimensions**: Ensure size matches display size
3. **Check bandwidth**: Use browser DevTools Network tab
4. **Enable lazy loading**: Add `loading="lazy"` attribute

### Images Look Blurry

1. **Increase size parameter**: Try next size up (400 → 800)
2. **Use 2x size for retina**: `?size=800` for 400px display
3. **Adjust quality**: Increase quality in backend (85 → 90)

### Backend Slow to Respond

1. **Check Sharp installation**: `npm list sharp`
2. **Check server resources**: CPU/memory usage
3. **Consider caching**: Add Redis for generated thumbnails
4. **Consider CDN**: Cache optimized images at edge

### Out of Memory Errors

Processing very large images (>20 MB) may cause memory issues:

1. **Limit max file size**: Add validation
2. **Increase Node memory**: `node --max-old-space-size=4096`
3. **Process in batches**: Limit concurrent optimizations

## Advanced Features

### Add WebP Support

WebP provides 30% smaller files than JPEG:

```typescript
// Detect WebP support
const supportsWebP = req.headers.accept?.includes('image/webp');

if (supportsWebP) {
  .webp({ quality: 85 })
} else {
  .jpeg({ quality: 85 })
}
```

### Add AVIF Support

AVIF provides 50% smaller files (slower encoding):

```typescript
.avif({ quality: 80 })
```

### Add Blur Placeholder

Generate tiny blur preview for smooth loading:

```typescript
// Generate 20px width blur
.resize(20)
.blur(5)
.jpeg({ quality: 50 })
```

### Add Caching Layer

Cache optimized images to avoid repeated processing:

```typescript
const cacheKey = `thumb:${fileId}:${size}`;
const cached = await redis.get(cacheKey);
if (cached) return cached;

// Generate thumbnail
const optimized = await sharp(buffer)...

// Cache for 7 days
await redis.setex(cacheKey, 604800, optimized);
```

## Monitoring

### Log Optimization Stats

The backend logs optimization results:

```
Optimizing image 1BxA...: max-width=800px, quality=85%
Optimized 1BxA...: 5242880 -> 153600 bytes (97% reduction)
```

### Track Performance

Monitor these metrics:

- Average optimization time
- Average file size reduction
- Cache hit rate (if using cache)
- Error rate

## Migration Steps

1. ✅ **Backend deployed** with optimization support
2. ✅ **Sharp installed** via `npm install sharp`
3. **Update frontend** to use `?size` parameter
4. **Test** on staging environment
5. **Deploy** to production
6. **Monitor** performance improvements

## Summary

- **Use `?size=400`** for thumbnails/grids
- **Use `?size=800`** for medium previews
- **Use `?size=1200`** for lightbox/modal
- **Omit size** only for downloads
- **Always use** `loading="lazy"`
- **Consider** responsive images with `srcSet`

This reduces bandwidth by 95%+ and makes pages load 10-20x faster! 🚀
