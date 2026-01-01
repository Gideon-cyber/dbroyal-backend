# Email Module

A comprehensive email service for sending various notifications in the DB Royal Photography application.

## Quick Start

### 1. Configure Environment Variables

Add these to your `.env` file:

```env
SMTP_HOST=smtp.titan.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@yourdomain.com
SMTP_PASSWORD=your_password
SMTP_FROM=info@yourdomain.com
FRONTEND_URL=http://localhost:3000
```

### 2. Import EmailModule

```typescript
import { EmailModule } from "./email/email.module";

@Module({
  imports: [EmailModule],
})
export class YourModule {}
```

### 3. Use EmailService

```typescript
constructor(private readonly emailService: EmailService) {}

await this.emailService.sendBookingConfirmation({
  to: 'client@example.com',
  clientName: 'John Doe',
  eventName: 'Wedding',
  eventDate: '2024-06-15',
  packageName: 'Premium',
  amount: 2500,
});
```

## Features

### ✅ Booking Confirmation Emails

Automatically sent when a booking is created.

### ✅ Booking Accepted Emails

Automatically sent when a booking is approved.

### ✅ Download Ready Emails

Sent when photos are ready for download.

## Email Templates

All emails use responsive HTML templates with:

- Professional design
- Mobile-friendly layout
- Brand colors
- Clear call-to-action buttons
- Event details

## Testing

Test the emails by creating test endpoints:

```bash
# Test booking confirmation
curl -X POST http://localhost:8081/email-test/booking-confirmation \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","clientName":"Test User"}'
```

## Files

- `email.module.ts` - Module definition
- `email.service.ts` - Email service with sending logic
- `dto/email.dto.ts` - Data transfer objects
- `email.examples.ts` - Usage examples

## Documentation

See [EMAIL_SERVICE.md](../../docs/EMAIL_SERVICE.md) for detailed documentation.
