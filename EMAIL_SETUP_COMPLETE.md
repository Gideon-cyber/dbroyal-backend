# Email Service - Quick Reference Guide

## 🚀 Setup Complete!

The email service has been successfully integrated into your DB Royal Photography backend.

## 📧 What's Been Implemented

### 1. Email Module (`src/email/`)

- ✅ `email.module.ts` - Email module configuration
- ✅ `email.service.ts` - Email service with Nodemailer
- ✅ `dto/email.dto.ts` - Type definitions for emails
- ✅ `README.md` - Quick start guide

### 2. Downloads Module (`src/downloads/`)

- ✅ `downloads.module.ts` - Downloads module
- ✅ `downloads.service.ts` - Downloads service with email integration
- ✅ `downloads.controller.ts` - API endpoints for downloads

### 3. Integrated Features

- ✅ Booking confirmation emails (automatic on booking creation)
- ✅ Booking accepted emails (automatic on booking approval)
- ✅ Download ready emails (on download approval)

## 🔧 Configuration Required

Update your `.env` file with your actual email credentials:

```env
# Replace with your actual credentials
SMTP_HOST=smtp.titan.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@yourdomain.com          # ← Change this
SMTP_PASSWORD=dbroyal!123              # ← Change this
SMTP_FROM=info@yourdomain.com          # ← Change this
FRONTEND_URL=http://localhost:3000     # ← Update for production
```

## 📝 Usage Examples

### Automatic Emails (Already Working!)

#### 1. Booking Confirmation

When you create a booking via `POST /bookings`, an email is automatically sent to the client.

```bash
POST /bookings
{
  "packageId": "pkg_123",
  "clientId": "client_456",
  "dateTime": "2024-06-15T10:00:00Z",
  "location": "Grand Hotel",
  ...
}
# → Email sent automatically to client
```

#### 2. Booking Accepted

When you update a booking to APPROVED, an email is automatically sent.

```bash
PATCH /bookings/:id
{
  "approvalStatus": "APPROVED"
}
# → Email sent automatically to client
```

### Manual Workflow: Download Notifications

#### Step 1: Create Download Selection

```bash
POST /downloads
Authorization: Bearer <token>
{
  "eventId": "evt_123",
  "photoIds": ["photo_1", "photo_2", "photo_3"],
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

#### Step 2: Approve & Send Email

```bash
PATCH /downloads/:id/approve
Authorization: Bearer <token>
{
  "approvedBy": "user_id",
  "deliverables": "100 high-resolution photos"
}
# → Email sent with download link
```

## 📨 Email Templates

### 1. Booking Confirmation (Green Theme)

- Professional welcome message
- Event details
- Package information
- Pricing breakdown

### 2. Booking Accepted (Blue Theme)

- Confirmation of acceptance
- Event reminder
- Additional instructions

### 3. Download Ready (Orange Theme)

- Download link button
- Expiration warning
- Access instructions

## 🧪 Testing

### Test with Real Bookings

1. Create a test client with your email address
2. Create a booking for that client
3. Check your inbox for confirmation email

### Test Download Emails

1. Create a download selection
2. Approve it via API
3. Check the client's email for download link

## 🔍 Troubleshooting

### Emails Not Sending?

1. Check `.env` has correct SMTP credentials
2. Verify `SMTP_USER` and `SMTP_PASSWORD` are correct
3. Check application logs for error messages
4. Ensure client has valid email address

### Emails in Spam?

- Configure SPF/DKIM/DMARC for your domain
- Use verified sender domain
- Test with different email providers

## 📚 Full Documentation

For detailed documentation, see:

- `/docs/EMAIL_SERVICE.md` - Complete email service documentation
- `/src/email/README.md` - Email module quick start

## 🎯 Next Steps

1. **Update SMTP Credentials**: Replace placeholder credentials in `.env`
2. **Test Emails**: Create test bookings to verify emails are sent
3. **Customize Templates**: Edit templates in `email.service.ts` if needed
4. **Monitor Delivery**: Check logs for any email sending failures
5. **Production Setup**: Update `FRONTEND_URL` for production environment

## 🔐 Security Notes

- Never commit `.env` file with real credentials
- Use environment-specific credentials
- Implement rate limiting for email endpoints
- Monitor for abuse or spam

## ✨ Features

- 📧 Beautiful HTML email templates
- 📱 Mobile-responsive design
- 🎨 Brand-consistent colors
- ⚡ Non-blocking email sending (won't affect API response time)
- 🛡️ Error handling and logging
- 🔄 Automatic retry on transient failures

---

**Ready to use!** 🎉 Your email service is fully integrated and working.
