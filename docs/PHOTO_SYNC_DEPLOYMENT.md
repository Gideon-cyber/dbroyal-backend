# Google Drive Photo Sync - Deployment Checklist

## Pre-Deployment

### 1. Database Migration

- [x] Prisma schema updated with sync tracking fields
- [x] Migration file generated: `20251124070324_add_photo_sync_tracking`
- [ ] Review migration SQL before applying to production
- [ ] Backup production database
- [ ] Apply migration: `npx prisma migrate deploy`

### 2. Dependencies

- [x] Install `@nestjs/schedule` package
- [ ] Verify all dependencies in production environment
- [ ] Run `npm install` or `yarn install`

### 3. Environment Variables

- [ ] Verify `GOOGLE_SERVICE_ACCOUNT_EMAIL` is set
- [ ] Verify `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` is set
- [ ] Test Google Drive API access with service account

### 4. Code Review

- [x] GoogleDriveService enhancements
- [x] EventsService sync methods
- [x] EventsController new endpoints
- [x] Scheduler module
- [x] Build passes without errors

## Deployment Steps

### 1. Deploy Code

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build project
npm run build

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Restart application
pm2 restart dbroyal-backend
# or
systemctl restart dbroyal-backend
```

### 2. Verify Deployment

```bash
# Check application is running
curl http://localhost:3000/health

# Check sync endpoints
curl http://localhost:3000/events/sync/statistics
```

### 3. Monitor Initial Sync

```bash
# Check logs for scheduler
tail -f /var/log/dbroyal-backend.log | grep PhotoSyncScheduler

# Check sync statistics
curl http://localhost:3000/events/sync/statistics
```

## Post-Deployment

### 1. Initial Data Sync

For existing events with Google Drive URLs:

```bash
# Option 1: Trigger bulk sync via API
curl -X POST http://localhost:3000/events/sync/bulk

# Option 2: Update existing events to trigger auto-sync
# Run this SQL to mark all events for sync:
UPDATE "Event"
SET "syncStatus" = 'SYNC_REQUIRED'
WHERE "googleDriveUrl" IS NOT NULL;
```

### 2. Monitor Performance

- [ ] Check scheduler logs for successful runs
- [ ] Monitor API response times for photo endpoints
- [ ] Check database size increase (photos with metadata)
- [ ] Monitor Google Drive API quota usage

### 3. Verify Features

- [ ] Create new event with Google Drive URL → Auto-sync works
- [ ] Manual sync trigger → `/events/:id/sync` works
- [ ] Sync status → `/events/:id/sync-status` returns correct data
- [ ] Bulk sync → `/events/sync/bulk` works
- [ ] Statistics → `/events/sync/statistics` shows data
- [ ] Scheduler runs → Check logs after 6 hours

## Configuration

### Scheduler Timing Adjustments

Edit `src/scheduler/photo-sync.scheduler.ts`:

```typescript
// Change from every 6 hours to every 4 hours
@Cron(CronExpression.EVERY_4_HOURS)

// Or use custom cron expression (every 3 hours)
@Cron('0 */3 * * *')
```

### Sync Age Threshold

Current: Events older than 24 hours are marked for re-sync

Adjust in `photo-sync.scheduler.ts`:

```typescript
// Change 24 hours to 12 hours
lastSyncedAt: {
  lt: new Date(Date.now() - 12 * 60 * 60 * 1000);
}
```

## Rollback Plan

If issues occur after deployment:

### 1. Quick Rollback (Disable Scheduler)

```typescript
// In src/app.module.ts, comment out:
// SchedulerModule,

// Rebuild and restart
npm run build
pm2 restart dbroyal-backend
```

### 2. Full Rollback

```bash
# Revert to previous version
git revert HEAD
git push

# Redeploy
npm install
npm run build
pm2 restart dbroyal-backend

# Rollback database (if needed)
# Note: This will lose sync tracking data
npx prisma migrate resolve --rolled-back 20251124070324_add_photo_sync_tracking
```

### 3. Data Cleanup (If Needed)

```sql
-- Remove sync tracking data
UPDATE "Event" SET
  "syncStatus" = 'NEVER_SYNCED',
  "lastSyncedAt" = NULL,
  "syncErrorMessage" = NULL,
  "driveChangeToken" = NULL;

-- Optionally remove photo metadata
UPDATE "Photo" SET
  "mimeType" = NULL,
  "fileSize" = NULL,
  "width" = NULL,
  "height" = NULL;
```

## Monitoring Queries

### Check Sync Health

```sql
-- Events by sync status
SELECT "syncStatus", COUNT(*) as count
FROM "Event"
WHERE "googleDriveUrl" IS NOT NULL
GROUP BY "syncStatus";

-- Recent sync errors
SELECT id, name, "syncStatus", "syncErrorMessage", "lastSyncedAt"
FROM "Event"
WHERE "syncStatus" = 'ERROR'
ORDER BY "updatedAt" DESC
LIMIT 10;

-- Events not synced in 48 hours
SELECT id, name, "lastSyncedAt", "syncStatus"
FROM "Event"
WHERE "googleDriveUrl" IS NOT NULL
  AND ("lastSyncedAt" IS NULL OR "lastSyncedAt" < NOW() - INTERVAL '48 hours')
ORDER BY "lastSyncedAt" ASC NULLS FIRST;
```

### Performance Metrics

```sql
-- Total photos synced
SELECT COUNT(*) as total_photos FROM "Photo";

-- Photos by event
SELECT e.name, COUNT(p.id) as photo_count
FROM "Event" e
LEFT JOIN "Photo" p ON p."eventId" = e.id
WHERE e."googleDriveUrl" IS NOT NULL
GROUP BY e.id, e.name
ORDER BY photo_count DESC
LIMIT 20;

-- Average photos per event
SELECT AVG(photo_count) as avg_photos_per_event
FROM (
  SELECT COUNT(p.id) as photo_count
  FROM "Event" e
  LEFT JOIN "Photo" p ON p."eventId" = e.id
  WHERE e."googleDriveUrl" IS NOT NULL
  GROUP BY e.id
) as counts;
```

## Support Contacts

- **Backend Lead**: [Your Name]
- **DevOps**: [DevOps Contact]
- **Database Admin**: [DBA Contact]

## Additional Resources

- Implementation Details: `docs/PHOTO_SYNC_INTEGRATION.md`
- Quick Reference: `docs/PHOTO_SYNC_QUICK_REF.md`
- API Documentation: Swagger UI at `/api/docs`
- Google Drive API Docs: https://developers.google.com/drive/api/guides/about-sdk

## Success Criteria

- [ ] All existing events with Google Drive URLs are synced
- [ ] New events auto-sync successfully
- [ ] Scheduler runs without errors
- [ ] Photo retrieval is fast (< 500ms)
- [ ] No significant increase in Google Drive API errors
- [ ] Sync statistics endpoint shows accurate data
- [ ] Frontend can display sync status correctly
