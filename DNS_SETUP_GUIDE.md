# DNS Setup Guide for Titan Email

## Problem

Your Titan Email authentication is failing because the domain `dbroyal.studio` is missing **MX records**.

## Current Status

✅ SPF Record: Correctly configured  
❌ MX Records: **MISSING** (This is causing the authentication failure)  
❌ DMARC Record: Not checked (optional but recommended)

---

## Required DNS Records

### 1. MX Records (REQUIRED - Add these ASAP)

| Priority | Type | Host/Name | Value/Points To | TTL  |
| -------- | ---- | --------- | --------------- | ---- |
| 10       | MX   | @         | mx1.titan.email | 3600 |
| 20       | MX   | @         | mx2.titan.email | 3600 |

### 2. SPF Record (Already configured ✅)

| Type | Host/Name | Value                               | TTL  |
| ---- | --------- | ----------------------------------- | ---- |
| TXT  | @         | v=spf1 include:spf.titan.email ~all | 3600 |

### 3. DMARC Record (Recommended)

| Type | Host/Name | Value                                            | TTL  |
| ---- | --------- | ------------------------------------------------ | ---- |
| TXT  | \_dmarc   | v=DMARC1; p=none; rua=mailto:info@dbroyal.studio | 3600 |

---

## How to Add Records

### Step 1: Access Your DNS Provider

Go to where you manage `dbroyal.studio` (e.g., Namecheap, GoDaddy, Cloudflare, etc.)

### Step 2: Navigate to DNS Settings

- **Namecheap**: Advanced DNS
- **GoDaddy**: DNS Management
- **Cloudflare**: DNS

### Step 3: Add MX Records

1. Click "Add Record" or "Add New Record"
2. Select **MX** as record type
3. Add first record:
   - Priority: `10`
   - Value: `mx1.titan.email`
4. Add second record:
   - Priority: `20`
   - Value: `mx2.titan.email`

### Step 4: Save and Wait

- DNS changes can take 5 minutes to 48 hours
- Usually propagates within 15-30 minutes
- Use `dig dbroyal.studio MX` to verify

---

## Verification Commands

Check if MX records are set:

```bash
dig dbroyal.studio MX +short
```

Expected output:

```
10 mx1.titan.email.
20 mx2.titan.email.
```

Check SPF record:

```bash
dig dbroyal.studio TXT +short
```

Should include: `"v=spf1 include:spf.titan.email ~all"`

---

## Test Email After DNS Changes

Run this command to test SMTP:

```bash
node test-email.js
```

---

## Temporary Solution: Use Gmail

While waiting for DNS to propagate, you can use Gmail SMTP:

1. Go to https://myaccount.google.com/apppasswords
2. Create an app password for "DBRoyal Backend"
3. Update `.env` file with Gmail settings (see commented section)
4. Restart your application

---

## Common Issues

### "Authentication failed" error

- **Cause**: Missing MX records
- **Fix**: Add MX records as shown above

### "SPF check failed" error

- **Cause**: Wrong SPF record
- **Fix**: Ensure SPF includes `include:spf.titan.email`

### Still not working after 24 hours?

- Contact your DNS provider support
- Contact Titan Email support at support@titan.email
- Check Titan Email dashboard for setup instructions

---

## Need Help?

Titan Email Support: https://support.titan.email  
DNS Propagation Checker: https://www.whatsmydns.net/
