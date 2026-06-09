BondVault Pakistan

Part 4 — Implementation Roadmap (FINAL)

This roadmap assumes a partially completed frontend already exists and will be retained. The goal is to progressively replace any temporary or generated backend logic with the architecture defined in Parts 1, 2, 3A, and 3B.

Phase 0 — Project Audit & Freeze

Objective

Understand what already exists before writing production backend code.

Tasks

Inventory the existing frontend

Pages

Components

Routing

State management

Existing API calls

Existing environment variables

Remove assumptions

Delete fake data providers.

Delete mock auth.

Delete temporary local-storage persistence if present.

Establish branch strategy

main = stable

backend-integration = active work

Exit Criteria

Frontend runs cleanly.

All mocked backend assumptions identified.

No production logic remains in the UI layer.

Phase 1 — Infrastructure Foundation

Objective

Build the permanent backend foundation.

Tasks

Cloudflare Setup

Cloudflare Pages project

Cloudflare Workers API project

D1 database

KV namespace

R2 bucket

Queues

Cron triggers

Backend Skeleton

Hono app

Middleware stack

Error handling

Request logging

Zod validation helpers

Database Setup

Drizzle configuration

Initial migration system

Part 3A schema generation

Exit Criteria

D1 connected.

Drizzle migrations working.

Health endpoint responding.

Phase 2 — Authentication & User System

Objective

Implement secure identity management.

Tasks

Better Auth Integration

Registration

Login

Logout

Password reset

Session handling

User Tables

users
user_preferences
notification_preferences

Authorization Middleware

Authenticated routes

Admin routes

Ownership checks

Frontend Integration

Replace mock auth

Protect dashboard routes

Session-aware UI

Exit Criteria

Users can register and log in.

Protected routes work.

Sessions persist across refreshes.

Phase 3 — Subscription & Plan Foundation

Objective

Implement the commercial model before feature gating.

Tasks

Seed Plans

Free

Monthly

Quarterly

Semi Annual

Annual

Subscription Logic

Create subscriptions

Grace period handling

Expiration logic

Feature Gate Helpers

canUseOCR
canImportFiles
canReceiveAlerts
canExport

Exit Criteria

Plans seeded.

Subscription state computed correctly.

Feature gates available to all modules.

Phase 4 — Bond Portfolio System

Objective

Build the core product.

Tasks

CRUD API

Create bond

List bonds

Update bond

Delete bond (soft delete)

Archive / restore

Validation

6-digit bond numbers

Supported denominations

Duplicate prevention within same user + denomination

Search & Filters

Bond number search

Denomination filter

Status filter

Pagination

Frontend Integration

Connect portfolio screens

Replace local state with API data

Optimistic UI where appropriate

Exit Criteria

Users can fully manage portfolios.

Duplicate rules enforced.

Search and filtering performant.

Phase 5 — Historical Draw Database

Objective

Establish the authoritative draw dataset.

Tasks

Schema

draws
winning_numbers
draw_import_jobs

Admin Tools

Create draw

Upload PDF

Enter winners

Edit draw

Initial Data Import

Import all historical draws from National Savings Pakistan.

Verify normalization and prize amounts.

Exit Criteria

Historical draw database populated.

Admin can manage draws.

PDFs stored in R2.

Phase 6 — Match Engine

Objective

Turn BondVault into an intelligence platform.

Tasks

Match Service

Find matching bonds

Create snapshot records

Update statuses

Precomputed Matching

Trigger on draw import

Queue match generation

Store results in matches

Historical Check API

POST /api/v1/check
GET /api/v1/matches

Frontend Integration

Winner dashboard

Historical results view

Match detail screens

Exit Criteria

Draw imports generate matches automatically.

Winner dashboard works from precomputed data.

Performance remains stable with large portfolios.

Phase 7 — OCR System

Objective

Enable zero-cost image processing.

Tasks

Tesseract.js Integration

Browser-side OCR

Confidence scoring

Bond number extraction

Denomination detection

Low-Confidence Flow

Highlight problematic image

Retry option

Manual entry option

OCR Usage Tracking

Record successful scans

Enforce monthly limits

Frontend Integration

Bulk image upload

Per-image status

Progress UI

Exit Criteria

OCR runs entirely in browser.

Low-confidence images handled gracefully.

Monthly limits enforced correctly.

Phase 8 — File Imports & Exports

Objective

Support large collectors.

Tasks

Import Providers

CSV

XLSX

TXT

Import Preview

Valid rows

Invalid rows

Duplicates skipped

Summary counts

Exports

CSV export

XLSX export

Retention

Store import files in R2.

Delete after 30 days.

Exit Criteria

Imports process successfully.

Duplicates skipped automatically.

Paid users can export portfolios.

Phase 9 — Notification System

Objective

Implement the provider-based notification architecture.

Tasks

Notification Tables

notification_batches
notifications

Email Provider

Implement email delivery.

Summary notifications only.

Provider Abstractions

WhatsApp provider interface

SMS provider interface

Leave unconfigured initially.

User Preferences

Per-channel enable/disable.

Verification status handling.

Exit Criteria

Email summaries sent successfully.

Notification batching works.

WhatsApp/SMS architecture ready.

Phase 10 — Payment Workflow

Objective

Implement manual subscription activation.

Tasks

Payment Request Flow

Select plan

Generate payment request

Upload receipt

Admin Review

View pending payments

Approve / reject

Duplicate receipt detection

Subscription Activation

Create subscription

Create subscription history

Enable premium features

Exit Criteria

Users can submit payments.

Admin can approve or reject.

Subscriptions activate correctly.

Phase 11 — Admin Console

Objective

Give the administrator full operational control.

Tasks

Dashboard

Users

Bonds

Revenue

OCR usage

Draws

Management Screens

Users

Payments

Draws

Notifications

System settings

Audit Log Viewer

Search

Filter

Export

Exit Criteria

Administrator can manage the entire platform.

Audit logs are visible and searchable.

System settings editable without redeploy.

Phase 12 — Automation & Operations

Objective

Finish operational automation.

Tasks

Cron Jobs

Subscription expiration checks

Retention cleanup

Import cleanup

Notification retries

Queues

Match queue

Notification queue

Draw queue

Cleanup queue

Monitoring

Worker errors

Queue failures

Database errors

Storage errors

Exit Criteria

Retention policies execute automatically.

Expired subscriptions transition correctly.

Queue processing is reliable.

Phase 13 — Launch Readiness

Objective

Ship safely.

Checklist

End-to-end auth flow

Portfolio CRUD

Historical checking

Match generation

OCR limits

Imports and exports

Payment workflow

Email notifications

Admin console

Audit logs

Backups

Privacy policy

Terms of service

Rate limits

Security review

Launch Criteria

No mocked backend dependencies remain.

All critical flows tested.

Subscription gates enforced.

Data retention jobs verified.

Admin can recover from operational issues.

Recommended Build Order

Phase 1

Phase 2

Phase 3

Phase 4

Phase 5

Phase 6

Phase 8

Phase 7

Phase 9

Phase 10

Phase 11

Phase 12

Phase 13

Why OCR Comes After Imports

Imports provide immediate value to collectors with far less engineering risk. OCR is user-facing convenience, not core system correctness. Building imports first validates the data model before adding image-processing complexity.

Roadmap Governance Rule

No phase may be skipped if it provides foundational infrastructure for a later phase.

Examples:

Do not build OCR before subscriptions and feature gates exist.

Do not build notifications before the match engine exists.

Do not build payment approval before plans and subscriptions exist.

This roadmap is the authoritative execution order for BondVault Pakistan.
