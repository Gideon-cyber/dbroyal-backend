# Google Drive Photo Integration - Implementation Summary

## Overview

This document describes the hybrid approach for Google Drive photo integration that combines database synchronization with on-demand fetching for optimal performance and flexibility.

## Architecture

### Components

1. **Enhanced Prisma Schema**

   - Added `SyncStatus` enum: `NEVER_SYNCED`, `SYNCING`, `UP_TO_DATE`, `ERROR`, `SYNC_REQUIRED`
   - Event model sync tracking fields:
     - `syncStatus`: Current synchronization state
     - `lastSyncedAt`: Timestamp of last successful sync
     - `syncErrorMessage`: Error details if sync failed
     - `driveChangeToken`: Token for incremental sync using Google Drive Changes API
   - Photo model metadata fields:
     - `mimeType`: Image MIME type (e.g., image/jpeg)
     - `fileSize`: File size in bytes
     - `width`: Image width in pixels
     - `height`: Image height in pixels

2. **Enhanced GoogleDriveService**

   - `fetchImagesFromFolder()`: Fetch all images with full metadata
   - `getStartPageToken()`: Initialize change tracking
   - `fetchImageChanges()`: Get changes since last token
   - `fetchImagesIncremental()`: Smart sync (full or incremental based on token)

3. **Enhanced EventsService**

   - `create()`: Auto-triggers initial sync when Google Drive URL provided
   - `syncPhotosFromGoogleDrive()`: Full sync with status tracking
   - `syncPhotosIncremental()`: Incremental sync using Changes API
   - `getSyncStatus()`: Get current sync state
   - `getPendingSyncEvents()`: List events needing sync
   - `triggerBulkSync()`: Sync multiple events
   - `getSyncStatistics()`: Overall sync metrics

4. **Scheduler Module**

   - `PhotoSyncScheduler`: Automated background sync jobs
   - Runs every 6 hours to sync photos
   - Runs every 12 hours to mark events for sync
   - Runs daily at 2 AM to cleanup expired download selections

5. **Controller Endpoints**
   - `POST /events/:id/sync`: Trigger sync (incremental by default)
   - `GET /events/:id/sync-status`: Get sync status
   - `GET /events/sync/pending`: List events needing sync
   - `POST /events/sync/bulk`: Trigger bulk sync
   - `GET /events/sync/statistics`: Get sync statistics

## Flow

### 1. Event Creation

```
Client creates event with googleDriveUrl
  ↓
Event created with syncStatus = "SYNC_REQUIRED"
  ↓
Auto-trigger background sync (non-blocking)
  ↓
syncPhotosIncremental() runs (full sync on first run)
  ↓
Photos stored in database with metadata
  ↓
driveChangeToken saved for next incremental sync
  ↓
syncStatus = "UP_TO_DATE"
```

### 2. Photo Browsing

```
Client requests event photos
  ↓
Query database (fast, no Google API calls)
  ↓
Return photos with thumbnails and metadata
  ↓
Support pagination, filtering, search
```

### 3. Incremental Sync

```
Scheduler or manual trigger
  ↓
Check if event has driveChangeToken
  ↓
If yes: Use Changes API to fetch only new/modified photos
  ↓
Process changes: Add new photos, Remove deleted photos
  ↓
Update driveChangeToken for next sync
  ↓
If no: Do full sync and get initial token
```

### 4. Background Jobs

#### Photo Sync (Every 6 hours)

```
Find events with:
  - syncStatus = "SYNC_REQUIRED" or "ERROR"
  - syncStatus = "UP_TO_DATE" but not synced in 24 hours
  ↓
For each event:
  - Run syncPhotosIncremental()
  - Track success/failure
  - Add 1 second delay between events (rate limiting)
```

#### Mark for Sync (Every 12 hours)

```
Find events with:
  - googleDriveUrl not null
  - syncStatus = "UP_TO_DATE"
  - lastSyncedAt older than 24 hours
  ↓
Update syncStatus to "SYNC_REQUIRED"
```

#### Cleanup (Daily at 2 AM)

```
Delete expired download selections
```

## API Endpoints

### Get Sync Status

```http
GET /events/:id/sync-status
```

Returns current sync state, last sync time, error message, photo count.

### Trigger Sync

```http
POST /events/:id/sync
Content-Type: application/json

{
  "fullSync": false  // Optional: force full sync
}
```

Triggers incremental sync by default, or full sync if specified.

### Get Pending Sync Events

```http
GET /events/sync/pending
```

Returns list of events that need syncing.

### Trigger Bulk Sync

```http
POST /events/sync/bulk
```

Triggers sync for all events with `SYNC_REQUIRED` or `ERROR` status.

### Get Sync Statistics

```http
GET /events/sync/statistics
```

Returns overall sync statistics across all events.

## Sync States

- **NEVER_SYNCED**: Event created, no sync attempted yet
- **SYNC_REQUIRED**: Event needs syncing (new or outdated)
- **SYNCING**: Sync currently in progress
- **UP_TO_DATE**: Successfully synced, up-to-date
- **ERROR**: Last sync failed (check syncErrorMessage)

## Benefits

### Performance

- Fast photo retrieval from database (no API calls)
- Incremental sync reduces data transfer
- Background jobs prevent blocking user requests

### Reliability

- Status tracking for monitoring
- Error handling and reporting
- Automatic retry for failed syncs

### Scalability

- Batch processing in scheduler
- Rate limiting between syncs
- Efficient change detection with Google Drive Changes API

### User Experience

- Auto-sync on event creation
- Real-time status updates
- Manual sync triggers for flexibility

## Configuration

### Scheduler Timing

Edit `/src/scheduler/photo-sync.scheduler.ts`:

- Photo sync interval: `@Cron(CronExpression.EVERY_6_HOURS)`
- Mark for sync: `@Cron(CronExpression.EVERY_12_HOURS)`
- Cleanup: `@Cron(CronExpression.EVERY_DAY_AT_2AM)`

### Sync Age Threshold

Default: 24 hours before marking event for re-sync
Adjust in scheduler queries: `Date.now() - 24 * 60 * 60 * 1000`

## Monitoring

### Check Sync Health

```bash
# Get statistics
GET /events/sync/statistics

# Check pending events
GET /events/sync/pending

# Check specific event
GET /events/:id/sync-status
```

### Common Issues

**Events stuck in SYNCING**

- Manual intervention: Update syncStatus to SYNC_REQUIRED
- Trigger sync again

**High ERROR count**

- Check syncErrorMessage in events
- Common causes: Invalid Google Drive URL, permission issues

**Photos not syncing**

- Verify Google Drive folder sharing with service account
- Check service account credentials
- Verify folder ID extraction

## Testing

### Test Auto-Sync

```bash
# Create event with Google Drive URL
POST /events
{
  "name": "Test Event",
  "googleDriveUrl": "https://drive.google.com/drive/folders/{folderId}",
  ...
}

# Check sync status
GET /events/:id/sync-status
```

### Test Manual Sync

```bash
# Trigger incremental sync
POST /events/:id/sync
{ "fullSync": false }

# Trigger full sync
POST /events/:id/sync
{ "fullSync": true }
```

### Test Scheduler

```bash
# Check pending events
GET /events/sync/pending

# Trigger bulk sync
POST /events/sync/bulk

# Check statistics
GET /events/sync/statistics
```

## Next Steps

1. **Monitoring Dashboard**: Create UI to visualize sync statistics
2. **Webhooks**: Implement Google Drive webhooks for real-time updates
3. **Photo Approval Workflow**: Add review/approval before photos go live
4. **Selective Sync**: Allow syncing specific folders within an event
5. **Bandwidth Optimization**: Implement progressive image loading
6. **Error Notifications**: Alert admins when sync errors occur
