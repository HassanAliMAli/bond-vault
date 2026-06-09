
# BondVault Pakistan

## Master Specification V1

### Part 2 (Final Revision A)

### Technical Architecture Specification

**Status:** APPROVED & FROZEN

This document supersedes all previous Part 2 versions.

---

# 1. Architecture Principles

Every engineering decision must follow these principles:

1. Strict $0 operational budget at launch.
2. Cloudflare-native infrastructure.
3. Provider-based architecture.
4. Replaceable integrations.
5. Event-driven processing.
6. No vendor lock-in.
7. Security by default.
8. Scalability without rewrites.
9. Separation of concerns.
10. Data is more important than infrastructure.

---

# 2. Final Technology Stack

## Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion

Hosting:

* Cloudflare Pages

---

## API Layer

* Hono

Runtime:

* Cloudflare Workers

Responsibilities:

* API endpoints
* Business logic
* Authorization
* Validation
* Queue producers

---

## Authentication

* Better Auth

Responsibilities:

* Registration
* Login
* Sessions
* Password resets
* Email verification

---

## ORM

* Drizzle ORM

Responsibilities:

* Schema definitions
* Migrations
* Queries

---

## Database

* Cloudflare D1

Purpose:

Source of truth for:

* Users
* Bonds
* Draws
* Winning Numbers
* Matches
* Notifications
* Subscriptions
* Payments
* Audit Logs

---

## Cache Layer

* Cloudflare KV

Purpose ONLY:

* Rate limiting
* Temporary cache
* Dashboard cache
* Draw cache

KV is NOT a database.

Never store:

* Users
* Bonds
* Matches
* Payments

inside KV.

---

## Object Storage

* Cloudflare R2

Purpose ONLY:

* Draw PDFs
* Payment receipts
* Import files
* Backup artifacts

Never store:

* OCR images
* User sessions
* Match records

inside R2.

---

## Queues

* Cloudflare Queues

Used for:

* Match generation
* Notification delivery
* Draw processing
* Cleanup jobs

Not used for OCR.

---

## Scheduling

* Cloudflare Cron Triggers

Used for:

* Retention enforcement
* Subscription expiration checks
* Cleanup execution
* Draw polling

---

## Validation

* Zod

Used for:

* API validation
* OCR validation
* Import validation

---

# 3. High-Level System Architecture

```text
Browser
   │
   ▼
Cloudflare Pages
   │
   ▼
Hono API
   │
   ├── Better Auth
   ├── User Service
   ├── Bond Service
   ├── OCR Service
   ├── Import Service
   ├── Draw Service
   ├── Match Service
   ├── Notification Service
   ├── Payment Service
   ├── Admin Service
   └── Audit Service
          │
          ▼
        D1
       / | \
      /  |  \
    KV  R2  Queues
```

---

# 4. Module Architecture

Each module owns its business logic.

No module directly accesses another module's internal implementation.

Communication occurs through service contracts.

---

## Auth Module

Responsibilities:

* Register
* Login
* Logout
* Session validation
* Password reset
* Email verification

---

## User Module

Responsibilities:

* User profile
* Preferences
* Notification settings
* Account deletion requests

---

## Bond Module

Responsibilities:

* Create bonds
* Edit bonds
* Delete bonds
* Archive bonds
* Search bonds
* Export bonds

---

## OCR Module

Responsibilities:

* Browser OCR
* OCR validation
* Confidence scoring

Never saves bonds.

Returns OCR result only.

---

## Import Module

Responsibilities:

* CSV imports
* XLSX imports
* TXT imports

Produces standardized bond records.

---

## Draw Module

Responsibilities:

* Historical draws
* Draw imports
* Draw normalization
* Draw verification

---

## Match Module

Responsibilities:

* Generate matches
* Create winner records
* Manage match status

This is a core system module.

---

## Notification Module

Responsibilities:

* Notification creation
* Notification batching
* Notification delivery

---

## Payment Module

Responsibilities:

* Receipt uploads
* Verification workflow
* Plan activation

---

## Admin Module

Responsibilities:

* Full platform administration

Administrator has unrestricted access.

---

## Audit Module

Responsibilities:

* Record every important action
* Preserve compliance history

---

# 5. Provider Architecture

No module may directly depend on implementation details.

---

## OCRProvider

Purpose:

Abstract OCR engine.

Current:

```text
Tesseract.js
```

Future:

```text
PaddleOCR
Gemini
GPT Vision
Custom OCR
```

Application remains unchanged.

---

## NotificationProvider

Purpose:

Abstract notification delivery.

Implementations:

```text
EmailProvider
WhatsAppProvider
SMSProvider
```

---

## PaymentProvider

Purpose:

Abstract payment verification.

Current:

```text
ManualPaymentProvider
```

Future:

```text
JazzCashProvider
EasyPaisaProvider
```

---

## ImportProvider

Purpose:

Abstract file parsing.

Implementations:

```text
CSVProvider
XLSXProvider
TXTProvider
```

---

## StorageProvider

Purpose:

Abstract storage layer.

Current:

```text
R2StorageProvider
```

---

# 6. OCR Architecture (FINAL)

OCR executes entirely inside the browser.

No OCR server.

No OCR worker.

No OCR queue.

No OCR image storage.

---

## OCR Workflow

```text
Select Image
      │
      ▼
Browser OCR
      │
      ▼
Extract Text
      │
      ▼
Detect Bond Number
Detect Denomination
      │
      ▼
Confidence Score
```

---

## OCR Confidence Rules

### Confidence ≥ 50%

Display:

* Bond Number
* Denomination

User confirms.

---

### Confidence < 50%

Highlight problematic image.

User chooses:

* Retry OCR
* Manual Entry

No auto-save.

---

## OCR Scan Accounting

A scan is counted ONLY when:

```text
OCR Processing Completes
```

Not when:

```text
Image Selected
Image Cancelled
Browser Crashed
```

---

## OCR Image Lifecycle

```text
Image
↓
OCR
↓
Result
↓
Discard
```

Image never leaves user device.

---

# 7. Import Architecture

Supported:

* CSV
* XLSX
* TXT

Paid plans only.

---

## Import Workflow

```text
Upload File
     │
     ▼
Validate
     │
     ▼
Preview
     │
     ▼
Detect Duplicates
     │
     ▼
User Confirms
     │
     ▼
Save
```

---

## Duplicate Handling

If duplicate exists:

Same User
+
Same Denomination
+
Same Bond Number

Then:

```text
SKIP
```

Import continues.

---

## Import File Retention

Import file stored in R2.

Retention:

30 days

Then automatically deleted.

---

# 8. Draw Architecture

Three-layer storage model.

---

## Layer 1

Original PDF

Stored in:

R2

---

## Layer 2

Raw Extracted Data

Stored unchanged.

Purpose:

* Verification
* Reprocessing
* Auditing

---

## Layer 3

Normalized Draw Data

Stored in D1.

Used by application.

---

# 9. Draw Processing Roadmap

Architecture must support:

---

## Phase 1

Manual Entry

```text
Admin
↓
Upload PDF
↓
Enter Winners
↓
Save
```

---

## Phase 2

Semi-Automated

```text
PDF
↓
Extraction
↓
Admin Review
↓
Save
```

---

## Phase 3

Fully Automated

```text
PDF
↓
Extraction
↓
Validation
↓
Save
```

---

# 10. Match Engine Architecture

Match generation is precomputed.

Never computed during page load.

---

## Workflow

```text
Draw Imported
      │
      ▼
Match Service
      │
      ▼
Generate Matches
      │
      ▼
Store Matches
      │
      ▼
Queue Notifications
```

---

# 11. Notification Architecture

Notification system uses batching.

---

## Incorrect

```text
100 Winners
↓
100 Emails
```

---

## Correct

```text
100 Winners
↓
Summary
↓
1 Email
```

---

## Notification States

```text
PENDING
SENT
FAILED
```

---

## User Preferences

Per-channel control:

* Email
* WhatsApp
* SMS

---

## Provider States

```text
ENABLED
DISABLED
UNCONFIGURED
```

Launch State:

```text
Email      ENABLED
WhatsApp   UNCONFIGURED
SMS        UNCONFIGURED
```

---

# 12. Payment Architecture

Workflow:

```text
User Pays
↓
Uploads Receipt
↓
Receipt Stored In R2
↓
Payment Record Created
↓
Admin Reviews
↓
Approve / Reject
```

---

# 13. Security Architecture

---

## Authentication

Better Auth.

---

## Authorization

Every request validates ownership.

---

## Rate Limiting

Apply to:

* Login
* Register
* OCR
* Imports
* Contact Forms
* API Endpoints

---

## Input Validation

Every request validated via Zod.

---

## Fraud Prevention

* Duplicate receipt detection
* Suspicious activity logging
* Abuse monitoring

---

# 14. Audit Architecture

Everything important is logged.

---

## User Actions

* Login
* Logout
* OCR
* Imports
* Exports
* Subscription changes

---

## Admin Actions

* Payment approvals
* Draw edits
* User changes
* Plan changes

---

## Retention Policy

User Logs:

12 months

Admin Logs:

Permanent

---

# 15. Data Lifecycle

Free User:

```text
1 Month
↓
Soft Delete
```

---

Expired Paid User:

```text
3 Months
↓
Soft Delete
```

---

Deleted Account:

```text
90 Days
↓
Permanent Deletion
```

---

# 16. Public API Readiness

Not implemented initially.

Architecture must support:

```text
GET /api/bonds
GET /api/matches
GET /api/draws
GET /api/profile
```

without redesign.

---

# 17. Scalability Targets

Stage 1:

1,000 users

No changes.

---

Stage 2:

10,000 users

No architecture changes.

---

Stage 3:

100,000 users

Only infrastructure tuning.

No business logic rewrites.

---

# 18. Technical Governance Rule

All future features must integrate through:

* Module Architecture
* Provider Architecture
* Queue Architecture

No feature may bypass these layers.

This document is the authoritative technical architecture specification for BondVault Pakistan.
