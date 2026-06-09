
# BondVault Pakistan

## Master Specification V1

### Part 1 Revision A (Business Rules Addendum)

This addendum is considered part of the official product specification and overrides any conflicting statements in Part 1.

---

# 25. Notification Preferences

Users must be able to independently configure notification channels.

Available channels:

* Email
* WhatsApp
* SMS

Examples:

Email: Enabled
WhatsApp: Disabled
SMS: Disabled

or

Email: Disabled
WhatsApp: Enabled
SMS: Enabled

The system must respect individual user preferences.

---

# 26. Notification Delivery Strategy

The system must not send one notification per winning bond.

Instead, notifications must be summarized.

Example:

"You have 17 winning bonds in the latest draw."

The notification should contain:

* Total winners
* Prize breakdown
* Total prize value
* Link to detailed results

This applies to:

* Email
* WhatsApp
* SMS

---

# 27. Bond Status System

Every bond must support status values.

Allowed statuses:

ACTIVE
ARCHIVED

---

## ACTIVE

Visible in:

* Portfolio
* Historical checking
* Automatic monitoring

---

## ARCHIVED

Hidden from normal workflows.

Not included in:

* Automatic monitoring
* Notification generation

Can be restored by user.

---

# 28. Import Processing Rules

Supported formats:

* CSV
* XLSX
* TXT

Paid plans only.

---

## Duplicate Handling

If imported bond already exists under:

* Same user
* Same denomination

System must:

SKIP duplicate

Continue import.

---

## Import Preview

Before saving:

System displays:

* Valid bonds
* Invalid bonds
* Duplicate bonds
* Total imports

User confirms.

Then save.

---

# 29. OCR Confidence Rules

OCR operates entirely in browser.

---

## Confidence ≥ 50%

System displays:

Detected denomination
Detected bond number

User confirms.

---

## Confidence < 50%

System must:

Highlight the specific problematic image.

Provide:

* Retry OCR
* Manual entry

User chooses.

No automatic save allowed.

---

# 30. Bond Number Validation

Bond numbers are exactly:

6 digits

Valid:

068802

Invalid:

68802

Invalid:

0688021

System must enforce validation everywhere.

Including:

* Manual entry
* OCR
* Imports
* API endpoints

---

# 31. Administrative Authority

Administrator possesses unrestricted authority.

Administrator capabilities include:

* User management
* Payment management
* Plan management
* Draw management
* Notification management
* Data restoration
* Data deletion
* Data exports
* System configuration
* Analytics access

Administrator is the highest authority in the system.

No secondary role hierarchy exists.

---

# 32. Fraud Prevention Policy

Industry-standard protections must be implemented.

---

## Receipt Reuse Detection

Uploaded payment proofs must be recorded.

Duplicate receipt submissions must be flagged.

---

## Subscription Abuse Detection

Repeated suspicious upgrade patterns must be logged.

---

## Rate Limiting

Must exist for:

* Login
* Registration
* OCR
* Imports
* Contact forms

---

## Audit Logging

All administrative actions must be recorded.

---

## IP Logging

Security-sensitive events should record:

* IP
* Timestamp
* User

---

# 33. Subscription Grace Period

When a paid plan expires:

Premium access remains active for:

7 days

Grace period ends automatically.

Afterwards:

User becomes expired-paid user.

---

# 34. Official Draw Data Policy

Official source of truth:

National Savings Pakistan

All imported draw data must originate from:

National Savings Pakistan

Third-party sources may only be used as temporary verification references.

---

# 35. Winner Visibility Status

Every generated match supports:

UNSEEN
VIEWED

---

## UNSEEN

User has not viewed result.

---

## VIEWED

User has opened result.

---

# 36. Portfolio Export

Paid users may export portfolio.

Supported formats:

* CSV
* XLSX

Exports include:

* Bond Number
* Denomination
* Status
* Creation Date

---

# 37. Account Deletion Policy

User requests deletion.

System performs:

Soft Delete

Retention period:

90 days

After retention period:

Permanent deletion.

Administrator may restore within retention period.

---

# 38. OCR Monthly Limits

Free plan:

3 OCR scans

Reset schedule:

Calendar month

Not rolling 30-day periods.

---

# 39. Public Marketing Website Scope

Required pages:

Home

Features

Pricing

FAQ

Contact

Privacy Policy

Terms of Service

Login

Register

---

# 40. Audit Logging Requirements

The following actions must be logged:

User Actions:

* Login
* Logout
* Registration
* OCR
* Imports
* Exports
* Subscription changes

Administrative Actions:

* Payment approvals
* Payment rejections
* Draw imports
* User suspensions
* User restorations
* System changes

---

# 41. Future Public API

Architecture must support future API access.

Potential endpoints:

* Bonds
* Portfolio
* Matches
* Draws

Not implemented initially.

System must remain API-ready.

---

# 42. Product Governance Rule

No future feature may violate:

* Subscription rules
* Retention policies
* OCR workflow
* Notification preferences
* Historical draw integrity

without updating the master specification.

This rule applies to all future development.
