# Email Service Implementation

## Overview

This document describes the email service implementation for the DB Royal Photography backend. The service uses Nodemailer with Titan SMTP to send various email notifications based on different events.

## Features

- **Booking Confirmation Emails**: Sent when a new booking is created
- **Booking Accepted Emails**: Sent when a booking is approved
- **Download Ready Emails**: Sent when photos are ready for download

## Setup

### 1. Environment Variables

Add the following variables to your `.env` file:

```env
# Email Configuration (Titan SMTP)
SMTP_HOST=smtp.titan.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@yourdomain.com
SMTP_PASSWORD=your_password
SMTP_FROM=info@yourdomain.com

# Frontend URL (for download links)
FRONTEND_URL=http://localhost:3000
```

### 2. Email Templates

The service includes three beautifully designed HTML email templates:

#### Booking Confirmation Template

- Sent when a new booking is created
- Includes event details, package info, and pricing
- Green color scheme (#4CAF50)

#### Booking Accepted Template

- Sent when a booking is approved by admin
- Includes event details and any additional information
- Blue color scheme (#2196F3)

#### Download Ready Template

- Sent when photos are ready for download
- Includes download link and expiration information
- Orange color scheme (#FF9800)

## API Endpoints

### Downloads Module

#### Create Download Selection

```
POST /downloads
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "eventId": "event_id",
  "photoIds": ["photo_id_1", "photo_id_2"],
  "expiresAt": "2024-12-31T23:59:59Z" // optional
}
```

#### Approve Download Request (Sends Email)

```
PATCH /downloads/:id/approve
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "approvedBy": "user_id",
  "deliverables": "High-resolution photos" // optional
}
```

This endpoint automatically sends an email to the client with the download link.

#### Complete Download

```
PATCH /downloads/:id/complete
Authorization: Bearer <token>
```

#### Reject Download Request

```
PATCH /downloads/:id/reject
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "rejectionReason": "Reason for rejection"
}
```

#### Get Download by Token (Public)

```
GET /downloads/token/:token
```

#### Get Event Downloads

```
GET /downloads/event/:eventId
Authorization: Bearer <token>
```

## Email Service Methods

### `sendBookingConfirmation(dto: BookingConfirmationEmailDto)`

Sends a booking confirmation email.

**Parameters:**

- `to`: Client email address
- `clientName`: Name of the client
- `eventName`: Name of the event
- `eventDate`: Date of the event
- `packageName`: Selected package name
- `amount`: Booking amount

### `sendBookingAccepted(dto: BookingAcceptedEmailDto)`

Sends a booking accepted email.

**Parameters:**

- `to`: Client email address
- `clientName`: Name of the client
- `eventName`: Name of the event
- `eventDate`: Date of the event
- `additionalInfo`: Optional additional information

### `sendDownloadReady(dto: DownloadReadyEmailDto)`

Sends a download ready notification email.

**Parameters:**

- `to`: Client email address
- `clientName`: Name of the client
- `eventName`: Name of the event
- `downloadUrl`: URL to download photos
- `expiresAt`: Optional expiration date

## Integration Examples

### Automatic Email on Booking Creation

When a booking is created, the system automatically sends a confirmation email if the client has an email address:

```typescript
// In BookingsService.create()
if (booking.client?.email) {
  this.emailService.sendBookingConfirmation({
    to: booking.client.email,
    clientName: booking.client.name,
    eventName: booking.event?.name || "Your Event",
    eventDate: booking.dateTime.toLocaleDateString(),
    packageName: booking.package.name,
    amount: Number(booking.price || 0),
  });
}
```

### Automatic Email on Booking Approval

When a booking status is updated to APPROVED, the system sends an acceptance email:

```typescript
// In BookingsService.update()
if (
  data.approvalStatus === ApprovalStatus.APPROVED &&
  updatedBooking.client?.email
) {
  this.emailService.sendBookingAccepted({
    to: updatedBooking.client.email,
    clientName: updatedBooking.client.name,
    eventName: updatedBooking.event?.name || "Your Event",
    eventDate: updatedBooking.dateTime.toLocaleDateString(),
    additionalInfo: data.notes,
  });
}
```

### Manual Email on Download Approval

When a download request is approved, the system sends a download ready email:

```typescript
// In DownloadsService.approveDownloadRequest()
await this.emailService.sendDownloadReady({
  to: client.email,
  clientName: client.name,
  eventName: event.name,
  downloadUrl: `${process.env.FRONTEND_URL}/download/${token}`,
  expiresAt: selection.expiresAt,
});
```

## Error Handling

All email sending operations are wrapped in try-catch blocks to prevent failures from disrupting the main workflow. Errors are logged but don't throw exceptions:

```typescript
this.emailService.sendBookingConfirmation(dto).catch((error) => {
  console.error("Failed to send email:", error);
});
```

## Testing

To test the email service:

1. Update the `.env` file with your actual SMTP credentials
2. Create a booking through the API
3. Check the client's email inbox
4. Approve a booking and verify the acceptance email
5. Create and approve a download request and verify the download email

## Customization

### Changing Email Templates

The email templates are defined in the `EmailService` class:

- `getBookingConfirmationTemplate()`
- `getBookingAcceptedTemplate()`
- `getDownloadReadyTemplate()`

Modify these methods to customize the email design and content.

### Adding New Email Types

To add a new email type:

1. Create a new DTO in `src/email/dto/email.dto.ts`
2. Add a new method in `src/email/email.service.ts`
3. Create a template method for the HTML content
4. Call the method from the appropriate service

## Production Considerations

1. **Environment Variables**: Ensure all SMTP credentials are properly set in production
2. **Rate Limiting**: Consider implementing rate limiting to prevent email abuse
3. **Email Queue**: For high-volume applications, consider using a queue (Bull/BullMQ) for email sending
4. **Monitoring**: Set up monitoring for email delivery failures
5. **Template Testing**: Test all email templates across different email clients
6. **Unsubscribe Links**: Consider adding unsubscribe functionality for marketing emails
7. **Transactional vs Marketing**: Ensure proper categorization of emails

## Troubleshooting

### Emails Not Sending

1. Check SMTP credentials in `.env`
2. Verify SMTP_HOST and SMTP_PORT are correct
3. Check if the email address is valid
4. Review application logs for error messages
5. Test SMTP connection separately

### Emails Going to Spam

1. Ensure SPF, DKIM, and DMARC records are properly configured
2. Use a verified sender domain
3. Avoid spam trigger words in subject and content
4. Include unsubscribe links

### Email Formatting Issues

1. Test templates in multiple email clients
2. Use inline CSS for better compatibility
3. Validate HTML structure
4. Test on mobile devices

## Dependencies

- `nodemailer`: ^7.0.11
- `@types/nodemailer`: ^7.0.4
