# Google Drive Photo Sync - Quick Reference

## For Backend Developers

### Key Files Modified

- `prisma/schema.prisma` - Added sync tracking fields
- `src/google-drive/google-drive.service.ts` - Enhanced with Changes API
- `src/events/events.service.ts` - Added sync methods
- `src/events/events.controller.ts` - Added sync endpoints
- `src/scheduler/` - New scheduler module
- `src/app.module.ts` - Added SchedulerModule

### New Endpoints

```typescript
// Get sync status
GET /events/:id/sync-status

// Trigger sync (incremental by default)
POST /events/:id/sync
{ "fullSync": false }

// Get events needing sync
GET /events/sync/pending

// Trigger bulk sync
POST /events/sync/bulk

// Get sync statistics
GET /events/sync/statistics
```

### Service Methods

```typescript
// Full sync (replaces all photos)
await eventsService.syncPhotosFromGoogleDrive(eventId, country);

// Incremental sync (only changes)
await eventsService.syncPhotosIncremental(eventId, country);

// Get sync status
await eventsService.getSyncStatus(eventId, country);

// Get pending events
await eventsService.getPendingSyncEvents(country);

// Trigger bulk sync
await eventsService.triggerBulkSync(country);

// Get statistics
await eventsService.getSyncStatistics(country);
```

### Database Schema Changes

```prisma
enum SyncStatus {
  NEVER_SYNCED
  SYNCING
  UP_TO_DATE
  ERROR
  SYNC_REQUIRED
}

model Event {
  // ... existing fields
  syncStatus       SyncStatus     @default(NEVER_SYNCED)
  lastSyncedAt     DateTime?
  syncErrorMessage String?
  driveChangeToken String?
}

model Photo {
  // ... existing fields
  mimeType      String?
  fileSize      BigInt?
  width         Int?
  height        Int?
}
```

### Scheduler Jobs

```typescript
// Sync photos (Every 6 hours)
@Cron(CronExpression.EVERY_6_HOURS)
handlePhotoSync()

// Mark for sync (Every 12 hours)
@Cron(CronExpression.EVERY_12_HOURS)
handleMarkEventsForSync()

// Cleanup (Daily at 2 AM)
@Cron(CronExpression.EVERY_DAY_AT_2AM)
handleCleanupExpiredSelections()
```

## For Frontend Developers

### Creating an Event

When creating an event with a Google Drive URL, sync happens automatically in the background.

```typescript
// Create event
const response = await fetch("/events", {
  method: "POST",
  body: JSON.stringify({
    name: "Wedding 2025",
    googleDriveUrl: "https://drive.google.com/drive/folders/abc123",
    // ... other fields
  }),
});

// Sync status will be SYNC_REQUIRED initially
// Check status after a few seconds
const syncStatus = await fetch(`/events/${eventId}/sync-status`);
```

### Checking Sync Status

```typescript
interface SyncStatus {
  eventId: string;
  eventName: string;
  syncStatus:
    | "NEVER_SYNCED"
    | "SYNCING"
    | "UP_TO_DATE"
    | "ERROR"
    | "SYNC_REQUIRED";
  lastSyncedAt: string | null;
  syncErrorMessage: string | null;
  hasGoogleDrive: boolean;
  photoCount: number;
}

const status = await fetch(`/events/${eventId}/sync-status`).then((r) =>
  r.json()
);
```

### Triggering Manual Sync

```typescript
// Incremental sync (recommended)
await fetch(`/events/${eventId}/sync`, {
  method: "POST",
  body: JSON.stringify({ fullSync: false }),
});

// Full sync (use when needed)
await fetch(`/events/${eventId}/sync`, {
  method: "POST",
  body: JSON.stringify({ fullSync: true }),
});
```

### Displaying Sync Status

```jsx
function SyncStatusBadge({ status }) {
  const config = {
    NEVER_SYNCED: { color: "gray", label: "Not Synced" },
    SYNC_REQUIRED: { color: "yellow", label: "Sync Needed" },
    SYNCING: { color: "blue", label: "Syncing..." },
    UP_TO_DATE: { color: "green", label: "Up to Date" },
    ERROR: { color: "red", label: "Sync Failed" },
  };

  const { color, label } = config[status];
  return <Badge color={color}>{label}</Badge>;
}
```

### Monitoring Dashboard

```typescript
// Get overall statistics
const stats = await fetch("/events/sync/statistics").then((r) => r.json());

/*
{
  total: 150,
  byStatus: {
    neverSynced: 5,
    upToDate: 120,
    syncRequired: 15,
    syncing: 3,
    error: 7
  },
  totalPhotos: 45230,
  lastSyncedEvent: {
    id: "abc123",
    name: "Recent Event",
    lastSyncedAt: "2025-11-24T07:00:00Z",
    photoCount: 150
  }
}
*/
```

## Common Patterns

### Event Creation Flow

```typescript
// 1. Create event
const event = await createEvent({
  name: "Event Name",
  googleDriveUrl: "drive-url",
  // ...
});

// 2. Poll sync status
const pollStatus = async () => {
  const status = await getSyncStatus(event.id);

  if (status.syncStatus === "SYNCING") {
    // Show loading indicator
    setTimeout(pollStatus, 2000); // Check again in 2 seconds
  } else if (status.syncStatus === "UP_TO_DATE") {
    // Show success, load photos
  } else if (status.syncStatus === "ERROR") {
    // Show error message
    console.error(status.syncErrorMessage);
  }
};

pollStatus();
```

### Photo Gallery with Sync Status

```jsx
function EventPhotos({ eventId }) {
  const [photos, setPhotos] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    // Load photos
    fetch(`/events/${eventId}/photos`)
      .then((r) => r.json())
      .then(setPhotos);

    // Load sync status
    fetch(`/events/${eventId}/sync-status`)
      .then((r) => r.json())
      .then(setSyncStatus);
  }, [eventId]);

  return (
    <div>
      <div className="sync-status">
        <SyncStatusBadge status={syncStatus?.syncStatus} />
        {syncStatus?.lastSyncedAt && (
          <span>Last synced: {formatDate(syncStatus.lastSyncedAt)}</span>
        )}
        <button onClick={() => triggerSync(eventId)}>Refresh from Drive</button>
      </div>

      <PhotoGrid photos={photos} />
    </div>
  );
}
```

### Admin Dashboard

```jsx
function SyncDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);

  useEffect(() => {
    // Load statistics
    fetch("/events/sync/statistics")
      .then((r) => r.json())
      .then(setStats);

    // Load pending events
    fetch("/events/sync/pending")
      .then((r) => r.json())
      .then(setPendingEvents);
  }, []);

  const handleBulkSync = async () => {
    const result = await fetch("/events/sync/bulk", { method: "POST" }).then(
      (r) => r.json()
    );
    alert(`Triggered sync for ${result.triggered} events`);
  };

  return (
    <div>
      <h2>Sync Statistics</h2>
      <div className="stats-grid">
        <StatCard label="Total Events" value={stats?.total} />
        <StatCard
          label="Up to Date"
          value={stats?.byStatus.upToDate}
          color="green"
        />
        <StatCard
          label="Sync Required"
          value={stats?.byStatus.syncRequired}
          color="yellow"
        />
        <StatCard label="Errors" value={stats?.byStatus.error} color="red" />
        <StatCard label="Total Photos" value={stats?.totalPhotos} />
      </div>

      <h2>Pending Syncs ({pendingEvents.total})</h2>
      <button onClick={handleBulkSync}>Sync All</button>
      <EventList events={pendingEvents.events} />
    </div>
  );
}
```

## Troubleshooting

### Photos not appearing

1. Check sync status: `GET /events/:id/sync-status`
2. If ERROR, check `syncErrorMessage`
3. Verify Google Drive URL is correct
4. Ensure folder is shared with service account
5. Trigger manual sync: `POST /events/:id/sync`

### Slow photo loading

- Photos are stored in database, should be fast
- Check database query performance
- Consider pagination if many photos

### Sync not running automatically

- Check SchedulerModule is imported in AppModule
- Verify scheduler logs in application output
- Check event has googleDriveUrl set
- Verify syncStatus is set correctly

## Environment Variables Required

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```
