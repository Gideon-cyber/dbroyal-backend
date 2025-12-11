# Payment Integration Guide

## Overview

The DBRoyal backend now supports payment processing for bookings with two methods:

- **Stripe** for UK bookings (automated card payments)
- **Bank Transfer** for Nigeria bookings (manual verification with payment proof)

## Features

✅ Dual payment system (Stripe for UK, Bank Transfer for Nigeria)  
✅ Payment tracking and history  
✅ Admin verification for bank transfers  
✅ Automatic payment status updates  
✅ Refund support  
✅ Stripe webhook integration  
✅ Payment proof upload for manual transfers

---

## Setup

### 1. Install Stripe Package

```bash
npm install stripe
```

### 2. Environment Variables

Add the following to your `.env` file:

```env
# Stripe Configuration (UK Payments)
STRIPE_SECRET_KEY=sk_test_xxxxx  # Get from Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Configure webhook endpoint

# Nigeria Bank Account Details
NG_BANK_NAME=GTBank
NG_ACCOUNT_NUMBER=0123456789
NG_ACCOUNT_NAME=DBRoyal Photography Ltd
```

### 3. Database Migration

Run Prisma migrations to add payment tables:

```bash
npx prisma migrate dev --name add_payment_support
npx prisma generate
```

### 4. Stripe Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/payments/stripe/webhook`
3. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

---

## API Endpoints

### Get Bank Account Details (Nigeria)

```http
GET /payments/bank-account
Headers: X-Country: NG
```

**Response:**

```json
{
  "country": "Nigeria",
  "currency": "NGN",
  "accounts": [
    {
      "bankName": "GTBank",
      "accountNumber": "0123456789",
      "accountName": "DBRoyal Photography Ltd"
    }
  ],
  "instructions": [
    "Make a bank transfer to the account above",
    "Take a clear screenshot of the transfer confirmation",
    "Upload the screenshot when submitting your payment proof",
    "Your payment will be verified by our team within 24 hours"
  ]
}
```

### Create Stripe Payment (UK)

```http
POST /payments/bookings/:bookingId/stripe
Headers: X-Country: UK
Content-Type: application/json

{
  "amount": 50000,  // Amount in pence (£500.00)
  "currency": "GBP",
  "description": "Payment for Wedding Package",
  "paidBy": "John Doe"
}
```

**Response:**

```json
{
  "payment": {
    "id": "clxxx123",
    "bookingId": "clyyy456",
    "amount": 500,
    "currency": "GBP",
    "status": "PENDING",
    "method": "STRIPE"
  },
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxxxxxxxxxxxx"
}
```

Use the `clientSecret` on the frontend with Stripe Elements to complete payment.

### Submit Bank Transfer Payment (Nigeria)

```http
POST /payments/bookings/:bookingId/bank-transfer
Headers: X-Country: NG
Content-Type: application/json

{
  "amount": 250000,  // Amount in Naira
  "paymentProofUrl": "https://storage.example.com/proof.jpg",
  "bankName": "GTBank",
  "accountNumber": "1234",
  "transferReference": "TRX123456789",
  "paidBy": "Chidi Okafor",
  "notes": "Paid via mobile banking"
}
```

**Response:**

```json
{
  "id": "clxxx789",
  "bookingId": "clyyy456",
  "amount": 250000,
  "currency": "NGN",
  "status": "PENDING",
  "method": "BANK_TRANSFER",
  "paymentProofUrl": "https://storage.example.com/proof.jpg"
}
```

### Confirm Stripe Payment

Called after client completes payment on frontend:

```http
POST /payments/stripe/confirm
Content-Type: application/json

{
  "paymentIntentId": "pi_xxxxxxxxxxxxx"
}
```

### Admin: Verify Bank Transfer

```http
POST /payments/verify?adminUserId=clzzz111
Content-Type: application/json

{
  "paymentId": "clxxx789",
  "approved": true,
  "notes": "Payment verified and confirmed"
}
```

### Get Pending Payments (Admin)

```http
GET /payments/pending?country=NG
```

Returns all bank transfer payments awaiting verification.

### Get Booking Payments

```http
GET /payments/bookings/:bookingId
```

Returns all payments made for a specific booking.

### Get Booking Balance

```http
GET /payments/bookings/:bookingId/balance
```

**Response:**

```json
{
  "totalPrice": 500,
  "amountPaid": 250,
  "balance": 250,
  "currency": "GBP",
  "paymentStatus": "PARTIALLY_PAID",
  "depositAmount": 0,
  "depositPaid": false,
  "payments": [...]
}
```

### Refund Payment

```http
POST /payments/:paymentId/refund?adminUserId=clzzz111
Content-Type: application/json

{
  "amount": 100,  // Optional, partial refund
  "reason": "Customer requested cancellation"
}
```

---

## Payment Flow

### UK Booking (Stripe)

1. **Client creates booking** → Booking status: `UNPAID`
2. **Client initiates payment** → `POST /payments/bookings/:id/stripe`
3. **Backend creates Stripe Payment Intent** → Returns `clientSecret`
4. **Frontend uses Stripe Elements** → Client enters card details
5. **Stripe processes payment** → Webhook fires
6. **Backend confirms payment** → Booking status: `PAID`

### Nigeria Booking (Bank Transfer)

1. **Client creates booking** → Booking status: `UNPAID`
2. **Client gets bank details** → `GET /payments/bank-account`
3. **Client makes bank transfer** → Takes screenshot
4. **Client submits proof** → `POST /payments/bookings/:id/bank-transfer`
5. **Payment status: `PENDING`** → Awaiting admin verification
6. **Admin verifies payment** → `POST /payments/verify`
7. **Payment status: `PAID`** → Booking status updated

---

## Database Schema

### Payment Model

```prisma
model Payment {
  id                    String         @id @default(cuid())
  bookingId             String
  booking               Booking        @relation(...)

  amount                Decimal        @db.Decimal(10, 2)
  currency              String
  method                PaymentMethod
  status                PaymentStatus  @default(PENDING)

  // Stripe fields
  stripePaymentIntentId String?        @unique
  stripeChargeId        String?

  // Bank transfer fields
  paymentProofUrl       String?
  bankName              String?
  accountNumber         String?
  transferReference     String?

  // Verification
  verifiedBy            String?
  verifiedAt            DateTime?

  paidBy                String?
  notes                 String?

  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt
}
```

### Updated Booking Model

```prisma
model Booking {
  // ... existing fields ...

  // Payment fields
  paymentStatus  PaymentStatus   @default(UNPAID)
  amountPaid     Decimal         @default(0) @db.Decimal(10, 2)
  depositAmount  Decimal?        @db.Decimal(10, 2)
  depositPaid    Boolean         @default(false)

  payments       Payment[]
}
```

---

## Frontend Integration

### Stripe (UK)

1. Install Stripe.js:

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

2. Create payment form:

```typescript
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_xxxxx');

function PaymentForm({ bookingId }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create payment intent
    const { clientSecret, paymentIntentId } = await fetch(
      `/payments/bookings/${bookingId}/stripe`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 50000, currency: 'GBP' })
      }
    ).then(r => r.json());

    // Confirm payment
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      }
    });

    if (result.error) {
      console.error(result.error.message);
    } else {
      // Payment successful, confirm on backend
      await fetch('/payments/stripe/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId })
      });
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <form onSubmit={handleSubmit}>
        <CardElement />
        <button type="submit">Pay £500</button>
      </form>
    </Elements>
  );
}
```

### Bank Transfer (Nigeria)

1. Show bank account details
2. Upload payment proof screenshot
3. Submit payment record

```typescript
function BankTransferPayment({ bookingId }) {
  const [bankDetails, setBankDetails] = useState(null);
  const [proofUrl, setProofUrl] = useState('');

  useEffect(() => {
    fetch('/payments/bank-account', {
      headers: { 'X-Country': 'NG' }
    })
      .then(r => r.json())
      .then(setBankDetails);
  }, []);

  const handleSubmit = async () => {
    await fetch(`/payments/bookings/${bookingId}/bank-transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 250000,
        paymentProofUrl: proofUrl,
        bankName: 'GTBank',
        transferReference: 'TRX123456'
      })
    });
  };

  return (
    <div>
      {bankDetails && (
        <div>
          <h3>Make payment to:</h3>
          <p>Bank: {bankDetails.accounts[0].bankName}</p>
          <p>Account: {bankDetails.accounts[0].accountNumber}</p>
          <p>Name: {bankDetails.accounts[0].accountName}</p>
        </div>
      )}

      <input
        type="url"
        placeholder="Payment proof URL"
        value={proofUrl}
        onChange={(e) => setProofUrl(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit Payment Proof</button>
    </div>
  );
}
```

---

## Admin Panel Features

### Verify Bank Transfers

Display pending payments with proof images:

```typescript
function PendingPayments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetch('/payments/pending?country=NG')
      .then(r => r.json())
      .then(setPayments);
  }, []);

  const verifyPayment = async (paymentId, approved) => {
    await fetch(`/payments/verify?adminUserId=clzzz111`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId,
        approved,
        notes: approved ? 'Verified' : 'Invalid proof'
      })
    });

    // Refresh list
  };

  return (
    <div>
      {payments.map(payment => (
        <div key={payment.id}>
          <img src={payment.paymentProofUrl} alt="Payment proof" />
          <p>Amount: ₦{payment.amount}</p>
          <p>Reference: {payment.transferReference}</p>
          <button onClick={() => verifyPayment(payment.id, true)}>
            Approve
          </button>
          <button onClick={() => verifyPayment(payment.id, false)}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Testing

### Test Stripe Payments

Use Stripe test cards:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

### Test Bank Transfers

1. Create Nigeria booking
2. Get bank account details
3. Upload test image URL
4. Admin verifies payment

---

## Security Notes

1. **Never expose Stripe secret keys** in frontend code
2. **Validate webhook signatures** to prevent fraud
3. **Store payment proofs securely** (use cloud storage)
4. **Implement admin authentication** for verification endpoints
5. **Log all payment transactions** for audit trail
6. **Use HTTPS** in production for webhook endpoints

---

## Troubleshooting

### Stripe webhook not firing

- Check webhook URL is publicly accessible
- Verify webhook secret matches
- Check Stripe Dashboard logs

### Payment proof upload failing

- Ensure storage service is configured
- Validate image URL accessibility
- Check file size limits

### Payment status not updating

- Check database transactions
- Verify webhook event handling
- Review application logs

---

## Future Enhancements

- [ ] Add Paystack support for Nigeria card payments
- [ ] Implement payment installment plans
- [ ] Auto-generate payment invoices/receipts
- [ ] Email notifications for payment events
- [ ] Payment reminders for unpaid bookings
- [ ] Payment analytics dashboard
- [ ] Support for deposit requirements
- [ ] Multi-currency support

---

## Support

For issues or questions:

- Check application logs
- Review Stripe Dashboard events
- Verify environment variables
- Test webhook endpoint accessibility
