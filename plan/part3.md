
# BondVault Pakistan

## Master Specification V1

### Part 3A — Database Specification (FINAL)

**Status:** APPROVED & FROZEN

This document defines the complete database architecture for BondVault Pakistan.

---

# 1. Database Design Principles

The database must:

* Support 100,000+ users
* Support millions of bonds
* Support future OCR upgrades
* Support future payment automation
* Support future public API
* Support future mobile apps
* Preserve auditability
* Avoid destructive schema redesigns

---

# 2. ID Strategy

All primary keys use:

```text
TEXT PRIMARY KEY
```

Generated using:

```text
cuid2
```

Reason:

* Safer APIs
* No ID enumeration
* Better future migrations

---

# 3. Timestamp Standards

Every major table includes:

```sql
created_at
updated_at
```

Format:

```text
UTC ISO Timestamp
```

---

# 4. Soft Delete Standard

Supported tables include:

```sql
deleted_at
```

Soft delete only.

No immediate hard deletion.

---

# 5. Core Relationship Map

```text
users
├── user_preferences
├── notification_preferences
├── subscriptions
├── subscription_history
├── bonds
├── matches
├── notifications
├── imports
├── payments
└── audit_logs

draws
└── winning_numbers
        └── matches
```

---

# 6. USERS

## users

Purpose:

Primary account table.

Columns:

```sql
id TEXT PRIMARY KEY

email TEXT UNIQUE NOT NULL
password_hash TEXT NOT NULL

email_verified BOOLEAN DEFAULT FALSE

phone TEXT
phone_verified BOOLEAN DEFAULT FALSE

whatsapp_number TEXT
whatsapp_verified BOOLEAN DEFAULT FALSE

full_name TEXT

status TEXT NOT NULL
-- active
-- suspended
-- deleted

last_login_at DATETIME

created_at DATETIME
updated_at DATETIME
deleted_at DATETIME
```

Indexes:

```sql
email
status
```

---

# 7. USER PREFERENCES

## user_preferences

Columns:

```sql
id TEXT PRIMARY KEY

user_id TEXT NOT NULL

timezone TEXT

language TEXT

created_at DATETIME
updated_at DATETIME
```

Indexes:

```sql
user_id UNIQUE
```

---

# 8. NOTIFICATION PREFERENCES

## notification_preferences

Columns:

```sql
id TEXT PRIMARY KEY

user_id TEXT NOT NULL

email_enabled BOOLEAN

whatsapp_enabled BOOLEAN

sms_enabled BOOLEAN

created_at DATETIME
updated_at DATETIME
```

Indexes:

```sql
user_id UNIQUE
```

---

# 9. PLANS

## plans

Purpose:

Avoid hardcoded plans.

Columns:

```sql
id TEXT PRIMARY KEY

name TEXT

price_usd REAL

duration_days INTEGER

ocr_limit INTEGER

imports_enabled BOOLEAN

alerts_enabled BOOLEAN

exports_enabled BOOLEAN

auto_monitoring_enabled BOOLEAN

created_at DATETIME
updated_at DATETIME
```

Initial records:

```text
Free
Monthly
Quarterly
Semi Annual
Annual
```

---

# 10. SUBSCRIPTIONS

## subscriptions

Current active subscription.

Columns:

```sql
id TEXT PRIMARY KEY

user_id TEXT NOT NULL

plan_id TEXT NOT NULL

status TEXT
-- active
-- grace_period
-- expired

started_at DATETIME

expires_at DATETIME

grace_ends_at DATETIME

created_at DATETIME
updated_at DATETIME
```

Indexes:

```sql
user_id
status
expires_at
```

---

# 11. SUBSCRIPTION HISTORY

## subscription_history

Columns:

```sql
id TEXT PRIMARY KEY

user_id TEXT NOT NULL

plan_id TEXT NOT NULL

amount_paid REAL

started_at DATETIME

expired_at DATETIME

created_at DATETIME
```

Never deleted.

---

# 12. BONDS

## bonds

Core portfolio table.

Columns:

```sql
id TEXT PRIMARY KEY

user_id TEXT NOT NULL

bond_number TEXT NOT NULL

denomination INTEGER NOT NULL

status TEXT NOT NULL
-- active
-- archived

entry_method TEXT NOT NULL
-- manual
-- ocr
-- csv
-- xlsx
-- txt

created_at DATETIME
updated_at DATETIME
deleted_at DATETIME
```

Constraint:

```sql
UNIQUE(
user_id,
bond_number,
denomination
)
```

Indexes:

```sql
user_id
bond_number
denomination
status
```

Composite:

```sql
(user_id, denomination)
(user_id, status)
```

---

# 13. OCR USAGE

## ocr_usage

Columns:

```sql
id TEXT PRIMARY KEY

user_id TEXT NOT NULL

year INTEGER
month INTEGER

successful_scans INTEGER

created_at DATETIME
updated_at DATETIME
```

Constraint:

```sql
UNIQUE(user_id, year, month)
```

---

# 14. IMPORT JOBS

## import_jobs

Columns:

```sql
id TEXT PRIMARY KEY

user_id TEXT NOT NULL

file_type TEXT

status TEXT
-- pending
-- processing
-- completed
-- failed

total_records INTEGER

successful_records INTEGER

duplicate_records INTEGER

invalid_records INTEGER

r2_file_key TEXT

created_at DATETIME
updated_at DATETIME
deleted_at DATETIME
```

---

# 15. PAYMENTS

## payments

Columns:

```sql
id TEXT PRIMARY KEY

user_id TEXT NOT NULL

amount REAL

payment_method TEXT
-- easypaisa
-- jazzcash

status TEXT
-- pending
-- approved
-- rejected

reviewed_by TEXT

reviewed_at DATETIME

created_at DATETIME
updated_at DATETIME
deleted_at DATETIME
```

Indexes:

```sql
user_id
status
```

---

# 16. PAYMENT RECEIPTS

## payment_receipts

Columns:

```sql
id TEXT PRIMARY KEY

payment_id TEXT NOT NULL

r2_file_key TEXT NOT NULL

hash TEXT NOT NULL

created_at DATETIME
```

Purpose:

Duplicate receipt detection.

---

# 17. DRAWS

## draws

Columns:

```sql
id TEXT PRIMARY KEY

denomination INTEGER NOT NULL

draw_number TEXT

draw_date DATE

source TEXT

pdf_r2_key TEXT

created_at DATETIME
updated_at DATETIME
```

Indexes:

```sql
denomination
draw_date
```

---

# 18. DRAW IMPORT JOBS

## draw_import_jobs

Columns:

```sql
id TEXT PRIMARY KEY

draw_id TEXT

status TEXT
-- pending
-- processing
-- completed
-- failed

started_at DATETIME

completed_at DATETIME

created_at DATETIME
```

---

# 19. WINNING NUMBERS

## winning_numbers

Columns:

```sql
id TEXT PRIMARY KEY

draw_id TEXT NOT NULL

bond_number TEXT NOT NULL

prize_type TEXT

prize_amount REAL

created_at DATETIME
```

Indexes:

```sql
draw_id
bond_number
```

Composite:

```sql
(draw_id, bond_number)
```

---

# 20. MATCHES

## matches

Purpose:

Precomputed winner table.

Columns:

```sql
id TEXT PRIMARY KEY

user_id TEXT NOT NULL

bond_id TEXT NOT NULL

winning_number_id TEXT NOT NULL

draw_id TEXT NOT NULL

bond_number_snapshot TEXT

denomination_snapshot INTEGER

prize_type_snapshot TEXT

prize_amount_snapshot REAL

draw_date_snapshot DATE

status TEXT
-- unseen
-- viewed

created_at DATETIME
updated_at DATETIME
```

Indexes:

```sql
user_id
bond_id
draw_id
status
```

Composite:

```sql
(user_id, status)
```

---

# 21. NOTIFICATION BATCHES

## notification_batches

Purpose:

Summary notifications.

Columns:

```sql
id TEXT PRIMARY KEY

user_id TEXT NOT NULL

channel TEXT

match_count INTEGER

status TEXT
-- pending
-- sent
-- failed

created_at DATETIME
```

---

# 22. NOTIFICATIONS

## notifications

Columns:

```sql
id TEXT PRIMARY KEY

user_id TEXT NOT NULL

batch_id TEXT

channel TEXT

title TEXT

message TEXT

status TEXT
-- pending
-- sent
-- failed
-- read

sent_at DATETIME

read_at DATETIME

created_at DATETIME
```

Indexes:

```sql
user_id
status
```

---

# 23. AUDIT LOGS

## audit_logs

Columns:

```sql
id TEXT PRIMARY KEY

user_id TEXT

action TEXT

entity_type TEXT

entity_id TEXT

ip_address TEXT

metadata_json TEXT

created_at DATETIME
```

Indexes:

```sql
user_id
entity_type
created_at
```

Retention:

User logs:

12 months

Admin logs:

Permanent

---

# 24. SYSTEM SETTINGS

## system_settings

Columns:

```sql
key TEXT PRIMARY KEY

value TEXT

updated_at DATETIME
```

Examples:

```text
ocr_monthly_limit
free_retention_days
paid_retention_days
whatsapp_enabled
sms_enabled
email_enabled
```

---

# 25. FOREIGN KEY RELATIONSHIPS

```text
users
 ├── user_preferences
 ├── notification_preferences
 ├── subscriptions
 ├── subscription_history
 ├── bonds
 ├── ocr_usage
 ├── import_jobs
 ├── payments
 ├── matches
 ├── notifications
 └── audit_logs

plans
 ├── subscriptions
 └── subscription_history

draws
 ├── winning_numbers
 └── matches

payments
 └── payment_receipts

notification_batches
 └── notifications
```

---

# 26. RETENTION RULES

Free User:

```text
30 days
↓
soft delete
```

Expired Paid User:

```text
90 days
↓
soft delete
```

Deleted Account:

```text
90 days
↓
permanent deletion
```

Import Files:

```text
30 days
↓
automatic deletion
```

---

# 27. DATABASE GOVERNANCE RULE

No future feature may:

* Duplicate user data
* Bypass match generation
* Bypass notification batching
* Store OCR images
* Store bond numbers as integers

This database specification is the authoritative data model for BondVault Pakistan.
