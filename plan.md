
# Prize Bond Portfolio Platform (MVP) - Product Requirements Document

## Product Name

Working Name: BondVault Pakistan

---

# 1. Executive Summary

BondVault is a SaaS platform for Pakistani Prize Bond holders that allows users to:

* Store prize bond numbers digitally
* Organize bonds by denomination
* Check bonds against historical draw results
* Maintain a personal bond portfolio
* Eliminate repetitive manual bond entry

The MVP focuses on validating the core value proposition:

> Users can create an account, store their bonds permanently, and instantly check them against historical prize bond draws.

OCR, automated draw ingestion, notifications, subscriptions, and file imports are intentionally excluded from the MVP implementation but must be considered during system design.

---

# 2. Problem Statement

Current prize bond holders face several problems:

1. Bond numbers are often stored on paper.
2. Users repeatedly enter the same numbers on checking websites.
3. Historical draw checking is fragmented.
4. No centralized bond portfolio exists.
5. Existing checking sites provide search but not portfolio management.

The market already has free checking tools.

The competitive advantage of BondVault is:

* Persistent storage
* Portfolio management
* Future OCR support
* Future automated monitoring
* Future alerts

---

# 3. Target Users

## Primary Users

Pakistani prize bond holders.

### Casual Holder

* 1–50 bonds
* Occasional checking

### Collector

* 100–1000 bonds
* Frequent checking

### Heavy Collector

* 1000+ bonds
* Requires organization and automation

---

# 4. MVP Goals

### Goal 1

Allow account creation.

### Goal 2

Allow secure login/logout.

### Goal 3

Allow users to manually store bonds.

### Goal 4

Allow users to organize bonds by denomination.

### Goal 5

Allow users to check stored bonds against historical draws.

### Goal 6

Display winning results instantly.

---

# 5. Non-Goals

The following features are NOT part of MVP:

* OCR uploads
* Image processing
* CSV import
* XLSX import
* TXT import
* Automatic draw monitoring
* Email notifications
* SMS notifications
* WhatsApp notifications
* Subscription payments
* Automated PDF ingestion
* Admin analytics
* Referral systems

These must remain possible through future architecture.

---

# 6. Core User Flows

## Flow 1: Registration

User lands on site.

User enters:

* Email
* Password

Account created.

Redirect:

Dashboard

---

## Flow 2: Login

User enters:

* Email
* Password

Redirect:

Dashboard

---

## Flow 3: Add Bond

User selects:

* Denomination

User enters:

* Bond Number

System validates:

* Format
* Duplicate within same user and denomination

Save bond.

---

## Flow 4: View Portfolio

User sees:

* Total bonds
* Bonds grouped by denomination

Example:

Rs. 100 → 24 Bonds

Rs. 200 → 67 Bonds

Rs. 750 → 13 Bonds

---

## Flow 5: Historical Check

User clicks:

Check My Bonds

System compares:

User Bonds
vs
Historical Draw Database

Results displayed.

---

# 7. Functional Requirements

## Authentication

### Registration

Required:

* Email
* Password

Rules:

* Email unique
* Password minimum 8 characters

---

### Login

Required:

* Email
* Password

---

### Logout

Must invalidate session.

---

## Bond Management

### Create Bond

Fields:

* denomination
* bond_number

Validation:

* denomination required
* bond_number required
* duplicate prohibited within same user denomination

Allowed:

User A:
200 → 068802

User B:
200 → 068802

Not Allowed:

User A:
200 → 068802
200 → 068802

---

### Delete Bond

User may remove bond.

Confirmation required.

---

### List Bonds

Paginated.

Sortable.

Filterable by denomination.

---

## Historical Checking

System checks:

Bond Number
+
Denomination

Against:

Historical Winning Numbers

Returns:

* Prize Type
* Prize Amount
* Draw Date

---

# 8. Dashboard Requirements

Dashboard Widgets:

### Portfolio Summary

Displays:

Total Bonds

---

### By Denomination

Displays:

100

200

750

1500

7500

25000

40000

---

### Historical Winners

Displays:

Recent matches

---

### Quick Actions

Add Bond

Check Bonds

Manage Bonds

---

# 9. Data Model

## Users

Fields:

* id
* email
* password_hash
* created_at

---

## Bonds

Fields:

* id
* user_id
* denomination
* bond_number
* created_at

Constraint:

UNIQUE(user_id, denomination, bond_number)

---

## Draws

Fields:

* id
* denomination
* draw_date
* draw_number

---

## Winning Numbers

Fields:

* id
* draw_id
* bond_number
* prize_type
* prize_amount

---

## Matches

Fields:

* id
* user_id
* bond_id
* winning_number_id
* matched_at

---

# 10. Permissions

Guest:

* View landing page
* Register
* Login

Authenticated User:

* Manage own bonds
* Check own bonds
* View own matches

Cannot:

* Access other users' data

---

# 11. Future-Proofing Requirements

Architecture must support:

## OCR

Future fields:

* entry_method
* ocr_confidence

---

## File Imports

Future methods:

* csv
* xlsx
* txt

---

## Notifications

Future fields:

* email_enabled
* whatsapp_enabled
* sms_enabled

---

## Subscription System

Future fields:

* plan
* plan_expires_at
* storage_expiry_date

---

## Draw Automation

Future modules:

* PDF ingestion
* Draw extraction
* Match generation

---

# 12. Technical Stack

Frontend:

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui

Backend:

* Cloudflare Workers

Database:

* Cloudflare D1

Authentication:

* Better Auth

Deployment:

* Cloudflare Pages

Storage:

* Cloudflare R2 (future OCR support)

---

# 13. Success Metrics

MVP is successful if:

* User can register
* User can login
* User can add bonds
* User can delete bonds
* User can view portfolio
* User can check historical results
* User can view matches

Without manual database intervention.

---

# 14. MVP Exit Criteria

The MVP is complete when:

1. Authentication is production-ready.
2. Bond storage is production-ready.
3. Historical draw search is operational.
4. Dashboard is operational.
5. Database schema supports future expansion.
6. Application is deployed on Cloudflare.
