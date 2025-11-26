# Download Request Workflow

This document describes the download request workflow feature that allows clients to request photo downloads and staff to manage these requests through an approval process.

## Overview

The download request workflow follows these stages:

1. **PENDING_PAYMENT** - Initial state when a download selection is created
2. **PENDING_APPROVAL** - After payment is confirmed, waiting for staff approval
3. **PROCESSING_DELIVERY** - Request approved and being processed
4. **SHIPPED** - Files delivered to the client
5. **REJECTED** - Request was rejected (with reason)

## Database Schema

### DownloadSelection Model

The `DownloadSelection` model has been enhanced with the following fields:

```prisma
model DownloadSelection {
  id               String          @id @default(cuid())
  eventId          String
  event            Event           @relation(fields: [eventId], references: [id], onDelete: Cascade)
  photoIds         String          // JSON array of photo IDs or drive file IDs
  token            String          @unique
  expiresAt        DateTime?       // Optional expiration
  deliveryStatus   DeliveryStatus  @default(PENDING_PAYMENT)
  deliverables     String?         // Description of what will be delivered
  photoCount       Int?            // Number of photos in selection
  rejectionReason  String?         // Reason for rejection if status is REJECTED
  approvedAt       DateTime?       // When the request was approved
  approvedBy       String?         // User ID who approved
  completedAt      DateTime?       // When delivery was completed (SHIPPED)
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  @@index([token])
  @@index([eventId])
  @@index([deliveryStatus])
  @@index([createdAt])
}
```

### DeliveryStatus Enum

```prisma
enum DeliveryStatus {
  PENDING_PAYMENT
  PENDING_APPROVAL
  PROCESSING_DELIVERY
  SHIPPED
  REJECTED
}
```

## API Endpoints

### 1. Create Download Selection

Create a new download request for selected photos.

**Endpoint:** `POST /events/:id/download-selection`

**Request Body:**

```json
{
  "photoIds": ["photo-id-1", "photo-id-2"], // OR
  "driveFileIds": ["file-id-1", "file-id-2"],
  "expirationHours": 72,
  "deliverables": "Digital Downloads"
}
```

**Response:**

```json
{
  "id": "clxxxxx",
  "token": "uuid-token",
  "shareLink": "/download/uuid-token",
  "expiresAt": "2025-11-25T10:00:00Z",
  "deliveryStatus": "PENDING_PAYMENT"
}
```

### 2. List Download Requests

Get all download requests with optional filters.

**Endpoint:** `GET /download/requests/list`

**Query Parameters:**

- `status` - Filter by delivery status (PENDING_PAYMENT, PENDING_APPROVAL, etc.)
- `eventId` - Filter by event ID
- `startDate` - Filter by creation date (ISO format)
- `endDate` - Filter by creation date (ISO format)

**Response:**

```json
[
  {
    "id": "clxxxxx",
    "token": "uuid-token",
    "event": {
      "id": "event-id",
      "name": "Sam x Kerr Wedding",
      "category": "WEDDING",
      "date": "2025-10-08T00:00:00Z"
    },
    "client": {
      "id": "client-id",
      "name": "Sam x Kerr",
      "email": "samknight042@gmail.com"
    },
    "photoCount": 32,
    "deliverables": "Digital Downloads",
    "deliveryStatus": "PENDING_PAYMENT",
    "createdAt": "2025-11-22T10:00:00Z",
    "expiresAt": "2025-11-25T10:00:00Z",
    "approvedAt": null,
    "completedAt": null,
    "rejectionReason": null
  }
]
```

### 3. Get Download Request Statistics

Get statistics about download requests.

**Endpoint:** `GET /download/requests/stats`

**Response:**

```json
{
  "total": 10,
  "byStatus": {
    "pendingPayment": 2,
    "pendingApproval": 3,
    "processing": 2,
    "shipped": 2,
    "rejected": 1
  }
}
```

### 4. Update Download Request Status

Update the status of a download request.

**Endpoint:** `PATCH /download/requests/:id/status`

**Request Body:**

```json
{
  "status": "PROCESSING_DELIVERY",
  "approvedBy": "user-id", // Optional
  "rejectionReason": "Reason for rejection" // Required if status is REJECTED
}
```

**Response:**

```json
{
  "id": "clxxxxx",
  "token": "uuid-token",
  "deliveryStatus": "PROCESSING_DELIVERY",
  "event": {
    "id": "event-id",
    "name": "Sam x Kerr Wedding"
  },
  "client": {
    "id": "client-id",
    "name": "Sam x Kerr",
    "email": "samknight042@gmail.com"
  },
  "approvedAt": "2025-11-22T11:00:00Z",
  "completedAt": null,
  "rejectionReason": null
}
```

### 5. Approve Download Request

Approve a pending download request.

**Endpoint:** `POST /download/requests/:id/approve`

**Request Body:**

```json
{
  "approvedBy": "user-id" // Optional
}
```

**Response:**

```json
{
  "id": "clxxxxx",
  "token": "uuid-token",
  "deliveryStatus": "PENDING_APPROVAL",
  "event": { ... },
  "client": { ... },
  "approvedAt": "2025-11-22T11:00:00Z"
}
```

### 6. Reject Download Request

Reject a download request with a reason.

**Endpoint:** `POST /download/requests/:id/reject`

**Request Body:**

```json
{
  "rejectionReason": "Payment not received"
}
```

**Response:**

```json
{
  "id": "clxxxxx",
  "token": "uuid-token",
  "deliveryStatus": "REJECTED",
  "event": { ... },
  "client": { ... },
  "rejectionReason": "Payment not received"
}
```

### 7. View Download Selection

View details of a download selection by token.

**Endpoint:** `GET /download/:token`

**Response:**

```json
{
  "event": {
    "id": "event-id",
    "name": "Sam x Kerr Wedding"
  },
  "images": [
    {
      "id": "file-id",
      "downloadLink": "https://drive.google.com/uc?export=download&id=file-id",
      "viewLink": "https://drive.google.com/file/d/file-id/view"
    }
  ],
  "createdAt": "2025-11-22T10:00:00Z",
  "expiresAt": "2025-11-25T10:00:00Z"
}
```

### 8. Download as ZIP

Download all selected photos as a ZIP file.

**Endpoint:** `GET /download/:token/zip`

**Response:** ZIP file download

## Workflow Examples

### Example 1: Complete Approval Flow

1. **Client creates download selection:**

   ```bash
   POST /events/event-id/download-selection
   {
     "photoIds": ["photo-1", "photo-2"],
     "deliverables": "Digital Downloads"
   }
   # Returns status: PENDING_PAYMENT
   ```

2. **Payment confirmed, staff updates to pending approval:**

   ```bash
   PATCH /download/requests/request-id/status
   {
     "status": "PENDING_APPROVAL"
   }
   ```

3. **Manager approves the request:**

   ```bash
   POST /download/requests/request-id/approve
   {
     "approvedBy": "manager-user-id"
   }
   ```

4. **Staff processes the delivery:**

   ```bash
   PATCH /download/requests/request-id/status
   {
     "status": "PROCESSING_DELIVERY"
   }
   ```

5. **Files delivered, mark as shipped:**
   ```bash
   PATCH /download/requests/request-id/status
   {
     "status": "SHIPPED"
   }
   ```

### Example 2: Rejection Flow

1. **Client creates download selection** (status: PENDING_PAYMENT)

2. **Staff rejects due to payment issue:**
   ```bash
   POST /download/requests/request-id/reject
   {
     "rejectionReason": "Payment verification failed"
   }
   ```

## Service Methods

### EventsService Methods

- `createDownloadSelection()` - Create new download selection with PENDING_PAYMENT status
- `createDownloadSelectionFromPhotos()` - Create from database photo IDs
- `listDownloadRequests()` - List requests with filters
- `updateDownloadStatus()` - Update request status
- `approveDownloadRequest()` - Approve a request
- `rejectDownloadRequest()` - Reject a request with reason
- `getDownloadRequestStats()` - Get statistics
- `getDownloadSelection()` - Get selection by token
- `cleanupExpiredSelections()` - Delete expired selections (cleanup job)

## Frontend Integration

### Display Download Requests Table

```javascript
// Fetch all requests
const requests = await fetch("/download/requests/list").then((r) => r.json());

// Filter by status
const pending = await fetch(
  "/download/requests/list?status=PENDING_APPROVAL"
).then((r) => r.json());

// Get statistics for dashboard
const stats = await fetch("/download/requests/stats").then((r) => r.json());
```

### Status Badge Colors

- **PENDING_PAYMENT**: Yellow/Warning
- **PENDING_APPROVAL**: Orange
- **PROCESSING_DELIVERY**: Blue/Info
- **SHIPPED**: Green/Success
- **REJECTED**: Red/Error

### Action Buttons

Based on current status, show relevant actions:

- PENDING_PAYMENT → "Confirm Payment" (→ PENDING_APPROVAL)
- PENDING_APPROVAL → "Approve" or "Reject"
- APPROVED → "Start Processing" (→ PROCESSING_DELIVERY)
- PROCESSING_DELIVERY → "Mark as Shipped" (→ SHIPPED)

## Database Migration

Run the migration to apply schema changes:

```bash
npx prisma migrate dev --name add_download_request_workflow
```

Or when database is available:

```bash
npx prisma generate
npx prisma migrate deploy  # For production
```

## Multi-tenancy Support

All endpoints support the `X-Country-Code` header for filtering by country (NG or UK):

```bash
curl -H "X-Country-Code: NG" /download/requests/list
```

## Notes

- All download selections default to PENDING_PAYMENT status
- Rejection requires a rejection reason
- Timestamps are automatically set: `approvedAt`, `completedAt`, `createdAt`, `updatedAt`
- The `approvedBy` field stores the user ID who approved/updated the request
- Expired selections can be cleaned up using the `cleanupExpiredSelections()` method
