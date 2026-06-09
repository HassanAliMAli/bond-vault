
# BondVault Pakistan

## Master Specification V1

### Part 3B — API Specification (FINAL)

**Status:** APPROVED & FROZEN

This document defines the complete API architecture, endpoint contracts, authorization model, validation requirements, rate limits, queue triggers, and service interactions.

---

# 1. API Architecture

## API Pattern

All APIs follow:

```text
/api/v1/*
```

Examples:

```text
/api/v1/auth/login
/api/v1/bonds
/api/v1/matches
```

---

## Response Format

### Success

```json
{
  "success": true,
  "data": {},
  "message": null
}
```

---

### Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Bond number must be 6 digits"
  }
}
```

---

# 2. Authentication Model

Authentication:

```text
Better Auth Session
```

Protected routes require:

```text
Authenticated User
```

Admin routes require:

```text
Administrator
```

---

# 3. Authorization Levels

## Guest

Can:

* Register
* Login
* View marketing pages

---

## Authenticated User

Can:

* Manage own bonds
* View own matches
* Manage own settings

Cannot:

* Access other user data

---

## Administrator

Can:

* Access everything

No restrictions.

---

# 4. Rate Limiting

## Registration

```text
10 requests/hour/IP
```

---

## Login

```text
20 requests/hour/IP
```

---

## OCR

```text
100 requests/hour/user
```

Monthly plan limits enforced separately.

---

## Imports

```text
20 imports/hour/user
```

---

## Contact Form

```text
5 submissions/hour/IP
```

---

## API General

```text
300 requests/minute/user
```

---

# 5. Auth Endpoints

## POST /api/v1/auth/register

Creates account.

Validation:

```json
{
  "email": "user@example.com",
  "password": "StrongPassword",
  "fullName": "User Name"
}
```

---

## POST /api/v1/auth/login

Authenticates user.

---

## POST /api/v1/auth/logout

Destroys session.

---

## POST /api/v1/auth/forgot-password

Initiates password reset.

---

## POST /api/v1/auth/reset-password

Completes reset.

---

## GET /api/v1/auth/me

Returns authenticated user.

---

# 6. User Endpoints

## GET /api/v1/user/profile

Returns profile.

---

## PATCH /api/v1/user/profile

Updates:

* Full name
* Phone
* WhatsApp

---

## DELETE /api/v1/user/account

Requests account deletion.

Workflow:

```text
Delete Request
↓
Soft Delete
↓
90 Days
↓
Permanent Deletion
```

---

# 7. Notification Preferences

## GET /api/v1/user/notifications/preferences

Returns preferences.

---

## PATCH /api/v1/user/notifications/preferences

Updates:

```json
{
  "emailEnabled": true,
  "whatsappEnabled": false,
  "smsEnabled": false
}
```

---

# 8. Subscription Endpoints

## GET /api/v1/subscription/current

Returns active subscription.

---

## GET /api/v1/subscription/history

Returns subscription history.

---

## GET /api/v1/plans

Returns available plans.

---

# 9. Payment Endpoints

## POST /api/v1/payments

Creates payment request.

Validation:

```json
{
  "planId": "monthly"
}
```

---

## POST /api/v1/payments/:id/receipt

Uploads receipt.

Stores receipt in:

```text
R2
```

Creates payment_receipt record.

---

## GET /api/v1/payments

Returns user's payment history.

---

## GET /api/v1/payments/:id

Returns payment details.

---

# 10. Bond Endpoints

## GET /api/v1/bonds

Returns bonds.

Supports:

```text
search
denomination
status
pagination
```

---

## POST /api/v1/bonds

Create bond.

Validation:

```json
{
  "bondNumber": "068802",
  "denomination": 200
}
```

Rules:

* 6 digits only
* Duplicate check

---

## GET /api/v1/bonds/:id

Returns bond.

---

## PATCH /api/v1/bonds/:id

Update bond.

---

## DELETE /api/v1/bonds/:id

Soft delete bond.

---

## POST /api/v1/bonds/:id/archive

Archive bond.

---

## POST /api/v1/bonds/:id/restore

Restore archived bond.

---

# 11. OCR Endpoints

OCR executes in browser.

Backend only records usage.

---

## POST /api/v1/ocr/usage

Records successful OCR scan.

Validation:

```json
{
  "bondNumber": "068802",
  "denomination": 200
}
```

Purpose:

* Monthly limit enforcement
* Usage tracking

---

## GET /api/v1/ocr/usage

Returns:

```json
{
  "used": 2,
  "remaining": 1
}
```

---

# 12. Import Endpoints

## POST /api/v1/imports

Upload file.

Supported:

```text
CSV
XLSX
TXT
```

Creates:

```text
import_job
```

---

## GET /api/v1/imports

Returns import history.

---

## GET /api/v1/imports/:id

Returns import details.

---

## DELETE /api/v1/imports/:id

Soft delete import record.

---

# 13. Export Endpoints

Paid users only.

---

## GET /api/v1/exports/csv

Generate CSV export.

---

## GET /api/v1/exports/xlsx

Generate XLSX export.

---

# 14. Match Endpoints

## GET /api/v1/matches

Returns:

* Winners
* Prize details
* Draw information

Supports:

```text
status
denomination
pagination
```

---

## GET /api/v1/matches/:id

Returns single match.

---

## POST /api/v1/matches/:id/view

Marks:

```text
UNSEEN
↓
VIEWED
```

---

# 15. Notification Endpoints

## GET /api/v1/notifications

Returns notification history.

---

## GET /api/v1/notifications/:id

Returns notification details.

Marks:

```text
READ
```

---

# 16. Draw Endpoints

## GET /api/v1/draws

Returns draw list.

Supports:

```text
denomination
date
pagination
```

---

## GET /api/v1/draws/:id

Returns draw details.

---

## GET /api/v1/draws/:id/winners

Returns winning numbers.

---

# 17. Historical Check Endpoint

## POST /api/v1/check

Manual bond checking.

Validation:

```json
{
  "bondNumber": "068802",
  "denomination": 200
}
```

Returns:

```json
{
  "isWinner": true,
  "matches": []
}
```

Available to:

* Free
* Paid

Unlimited checks.

---

# 18. Search Endpoint

## GET /api/v1/search

Supports:

```text
bond numbers
draw numbers
```

Searches only user's accessible data.

---

# 19. Admin Endpoints

All routes:

```text
/admin/*
```

Require:

```text
Administrator
```

---

# 20. Admin User Management

## GET /api/v1/admin/users

List users.

---

## GET /api/v1/admin/users/:id

User details.

---

## PATCH /api/v1/admin/users/:id

Update user.

---

## POST /api/v1/admin/users/:id/suspend

Suspend user.

---

## POST /api/v1/admin/users/:id/restore

Restore user.

---

# 21. Admin Payment Management

## GET /api/v1/admin/payments

Pending payments.

---

## POST /api/v1/admin/payments/:id/approve

Approve payment.

Triggers:

```text
Subscription Creation
```

---

## POST /api/v1/admin/payments/:id/reject

Reject payment.

---

# 22. Admin Draw Management

## POST /api/v1/admin/draws

Create draw.

---

## POST /api/v1/admin/draws/:id/pdf

Upload draw PDF.

Stored in:

```text
R2
```

---

## POST /api/v1/admin/draws/:id/winners

Create winning numbers.

---

## PATCH /api/v1/admin/draws/:id

Edit draw.

---

# 23. Match Generation Trigger

## POST /api/v1/admin/draws/:id/generate-matches

Triggers:

```text
Match Queue
```

Workflow:

```text
Draw
↓
Winning Numbers
↓
Generate Matches
↓
Create Notification Batches
```

---

# 24. Admin Notifications

## GET /api/v1/admin/notifications

View delivery status.

---

## POST /api/v1/admin/notifications/retry

Retry failed deliveries.

---

# 25. Admin Audit Logs

## GET /api/v1/admin/audit-logs

Returns logs.

Supports:

```text
user
entity
date range
```

---

# 26. System Settings

## GET /api/v1/admin/settings

Returns settings.

---

## PATCH /api/v1/admin/settings

Updates:

```text
OCR limits
Retention periods
Feature flags
```

---

# 27. Queue Triggers

## Match Queue

Triggered by:

```text
New Draw
```

---

## Notification Queue

Triggered by:

```text
New Matches
```

---

## Cleanup Queue

Triggered by:

```text
Cron
```

---

## Draw Queue

Triggered by:

```text
Future Draw Imports
```

---

# 28. Validation Rules

Bond Number:

```text
Exactly 6 Digits
```

---

Denomination:

```text
100
200
750
1500
7500
25000
40000
```

---

Receipt Upload:

```text
jpg
jpeg
png
pdf
```

---

Import Files:

```text
csv
xlsx
txt
```

---

# 29. API Governance Rule

No endpoint may:

* Bypass authorization
* Bypass validation
* Bypass audit logging
* Bypass rate limiting
* Bypass match generation workflow

All future endpoints must follow this specification.

---

# 30. Future API Expansion

Reserved namespace:

```text
/api/v2/*
```

Future support:

* Mobile Apps
* Public API Keys
* Third-Party Integrations
* Automated Draw Providers

Without breaking existing clients.

This API specification is the authoritative API contract for BondVault Pakistan.
