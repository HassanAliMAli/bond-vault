
# BondVault Pakistan

## Master Specification V1

### Deployment & Infrastructure Specification (FINAL)

Status: APPROVED & FROZEN

This document defines the deployment architecture, infrastructure constraints, environments, CI/CD workflow, secrets management, monitoring, backups, and operational requirements.

The coding agent must follow this document exactly.

---

# 1. Infrastructure Philosophy

BondVault must operate on a strict $0 budget during initial development and launch.

The system must remain:

* Cloudflare-native
* Low-maintenance
* Scalable
* Vendor-independent where practical

The coding agent must not introduce additional infrastructure unless explicitly approved.

---

# 2. Approved Infrastructure Stack

Frontend:

* Next.js 15
* Cloudflare Pages

Backend:

* Hono
* Cloudflare Workers

Database:

* Cloudflare D1

Storage:

* Cloudflare R2

Cache:

* Cloudflare KV

Queues:

* Cloudflare Queues

Scheduling:

* Cloudflare Cron Triggers

Authentication:

* Better Auth

ORM:

* Drizzle ORM

Validation:

* Zod

OCR:

* Tesseract.js
* Browser-side only

---

# 3. Forbidden Infrastructure

The coding agent must not introduce:

* AWS
* Azure
* Google Cloud
* Firebase
* Supabase
* Neon
* Railway
* Render
* Fly.io
* DigitalOcean
* Kubernetes
* Docker Swarm
* Kafka
* Redis
* Elasticsearch
* GraphQL

unless explicitly approved later.

---

# 4. Deployment Environments

Only two environments exist.

---

## Development

Purpose:

Local development.

Resources:

* Local Wrangler
* Local D1
* Local KV

---

## Production

Purpose:

Live environment.

Resources:

* Cloudflare Pages
* Cloudflare Workers
* Cloudflare D1
* Cloudflare R2
* Cloudflare KV
* Cloudflare Queues

No staging environment initially.

---

# 5. Repository Structure

Required structure:

```text
bondvault/

├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── database/
│   ├── shared/
│   ├── validation/
│   ├── auth/
│   └── types/
│
├── infrastructure/
│   ├── migrations/
│   ├── seeds/
│   └── scripts/
│
├── docs/
│
└── specifications/
```

---

# 6. Frontend Deployment

Frontend deployment target:

Cloudflare Pages

Build command:

```bash
npm run build
```

Output:

```text
.next
```

The coding agent must configure Cloudflare-compatible Next.js deployment.

---

# 7. Backend Deployment

Deployment target:

Cloudflare Workers

Framework:

Hono

Required:

* Wrangler configuration
* Environment bindings
* Queue bindings
* D1 bindings
* KV bindings
* R2 bindings

---

# 8. D1 Configuration

Production database:

```text
bondvault-production
```

Local database:

```text
bondvault-local
```

All schema changes must occur through:

```text
Drizzle Migrations
```

Direct manual schema edits are prohibited.

---

# 9. Migration Policy

Every schema change requires:

1. Migration file
2. Review
3. Commit

Never modify production schema manually.

---

# 10. R2 Configuration

Bucket:

```text
bondvault-assets
```

Stores:

* Draw PDFs
* Import files
* Payment receipts

Must NOT store:

* OCR images
* User sessions
* Application state

---

# 11. KV Configuration

Purpose:

* Rate limiting
* Temporary cache
* Draw cache

Must NOT become a secondary database.

---

# 12. Queue Configuration

Required queues:

---

## match-generation

Purpose:

Generate winner records.

---

## notification-delivery

Purpose:

Send notifications.

---

## cleanup-jobs

Purpose:

Retention enforcement.

---

## draw-processing

Purpose:

Future automation.

---

# 13. Cron Configuration

Required schedules:

---

## Subscription Expiration

Runs daily.

Purpose:

Update expired subscriptions.

---

## Retention Cleanup

Runs daily.

Purpose:

Remove expired records.

---

## Import Cleanup

Runs daily.

Purpose:

Delete old import files.

---

## Queue Health Check

Runs daily.

Purpose:

Detect stuck jobs.

---

# 14. Environment Variables

Required secrets:

```text
BETTER_AUTH_SECRET

D1_DATABASE_ID

R2_BUCKET_NAME

KV_NAMESPACE_ID

MATCH_QUEUE_NAME

NOTIFICATION_QUEUE_NAME

RESEND_API_KEY

ADMIN_EMAIL
```

---

# 15. Secret Management Rules

Secrets must never:

* Exist in source code
* Exist in client bundles
* Exist in Git history

Use:

Cloudflare Secrets

only.

---

# 16. CI/CD Policy

Deployment source:

GitHub

Workflow:

```text
Push
↓
Build
↓
Type Check
↓
Lint
↓
Tests
↓
Deploy
```

Deployment occurs only if all checks pass.

---

# 17. Branch Strategy

Main branches:

```text
main
develop
```

Optional feature branches:

```text
feature/*
```

Production deployments originate from:

```text
main
```

only.

---

# 18. Monitoring

Required monitoring:

* Worker errors
* Queue failures
* Database failures
* Authentication failures

Initially use:

Cloudflare native monitoring.

No third-party monitoring service.

---

# 19. Logging

Production logs must include:

* Request ID
* User ID
* Route
* Timestamp

Sensitive data must never be logged.

---

# 20. Backup Strategy

D1:

Scheduled exports.

R2:

Versioned storage when possible.

Critical data:

* Users
* Bonds
* Draws
* Matches
* Payments

must be recoverable.

---

# 21. Disaster Recovery

If production database becomes corrupted:

1. Restore backup.
2. Re-run migrations.
3. Validate draw data.
4. Validate match integrity.

Recovery procedures must be documented.

---

# 22. Deployment Validation Checklist

Before deployment:

* Build passes
* Type checks pass
* Lint passes
* Tests pass
* Migrations reviewed
* Secrets configured

---

# 23. Performance Targets

Dashboard:

< 2 seconds

Bond Search:

< 500ms

Match Lookup:

< 500ms

Notification Generation:

Queue-based

No synchronous delivery.

---

# 24. Security Requirements

Must enforce:

* HTTPS
* Secure cookies
* CSRF protection
* Rate limiting
* Input validation
* Audit logging

---

# 25. Infrastructure Governance Rule

The coding agent may:

* Add code
* Add migrations
* Add APIs
* Add modules

The coding agent may NOT:

* Change deployment providers
* Change database providers
* Change hosting providers
* Introduce paid infrastructure
* Introduce new cloud vendors

without explicit approval.

This document is the authoritative deployment and infrastructure specification for BondVault Pakistan.
