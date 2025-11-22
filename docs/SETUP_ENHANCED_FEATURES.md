# Setup Instructions for Enhanced Google Drive Features

## Quick Setup (3 Steps)

### Step 1: Run Database Migration

```bash
# Generate Prisma Client with new models
yarn prisma:generate

# Create and apply migration
yarn prisma migrate dev --name add_download_selections
```

This will:

- Add `driveFolderId` field to Event model
- Add `driveFileId` field to Photo model
- Create new `DownloadSelection` model
- Update the database schema

### Step 2: Install ZIP Package (Optional)

Only needed if you want ZIP download functionality:

```bash
# Install archiver for ZIP creation
yarn add archiver

# Install type definitions
yarn add -D @types/archiver
```

### Step 3: Restart Your Server

```bash
yarn start:dev
```

## Verify Installation

### 1. Check New Endpoints

```bash
# Create a download selection
curl -X POST http://localhost:3000/events/YOUR_EVENT_ID/download-selection \
  -H "Content-Type: application/json" \
  -d '{
    "driveFileIds": ["file_id_1", "file_id_2"],
    "expirationHours": 48
  }'

# You should get a response like:
# {
#   "token": "550e8400-e29b-41d4-a716-446655440000",
#   "shareLink": "/download/550e8400-e29b-41d4-a716-446655440000",
#   "expiresAt": "2025-11-06T10:00:00.000Z"
# }
```

### 2. Test Download Selection View

```bash
curl http://localhost:3000/download/YOUR_TOKEN
```

### 3. Test ZIP Download (if archiver is installed)

Open in browser:

```
http://localhost:3000/download/YOUR_TOKEN/zip
```

## What's New?

### ✅ Backward Compatible

All existing endpoints still work:

- `POST /events/:id/create-shareable-link`
- `GET /events/:id/google-drive-images`
- `POST /events/:id/sync-google-drive`

### ✨ New Features

1. **Token-based sharing** - More secure than public folders
2. **Automatic expiration** - Links can expire after X hours
3. **ZIP downloads** - Download multiple photos as one file
4. **Better performance** - Cached folder and file IDs
5. **Tracking** - See when and how selections are used

## Troubleshooting

### "Property 'downloadSelection' does not exist"

Run: `yarn prisma:generate`

### "Cannot find module 'archiver'"

Run: `yarn add archiver @types/archiver`

### Migration fails

Reset and retry:

```bash
yarn prisma migrate reset
yarn prisma migrate dev --name add_download_selections
```

## Next Steps

1. ✅ Complete setup steps above
2. 📖 Read [Enhanced Features Guide](./GOOGLE_DRIVE_ENHANCED_FEATURES.md)
3. 💻 Update your frontend to use new endpoints
4. 🧪 Test the new functionality

## Need Help?

See the complete documentation:

- [Enhanced Features Guide](./GOOGLE_DRIVE_ENHANCED_FEATURES.md) - Detailed feature documentation
- [API Documentation](./GOOGLE_DRIVE_API.md) - API reference
- [Setup Guide](./GOOGLE_DRIVE_SETUP.md) - Google Cloud setup

## Summary of Changes

| File                                       | Change                                    |
| ------------------------------------------ | ----------------------------------------- |
| `prisma/schema.prisma`                     | Added fields and DownloadSelection model  |
| `src/events/events.service.ts`             | Added new methods for download selections |
| `src/events/events.controller.ts`          | Added new endpoints                       |
| `src/events/download.controller.ts`        | **NEW** - ZIP download controller         |
| `src/google-drive/google-drive.service.ts` | Added file download methods               |

All changes are **backward compatible** - existing code continues to work!
