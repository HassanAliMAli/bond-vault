# BondVault MVP — Complete Technical Audit

**Audit Date:** 2026-06-08  
**Codebase:** `/home/hassanalimali/Desktop/coding/bonds-checker`  
**Branch:** `master`  
**Latest Commit:** `5b1548a` — Fix floating label overlapping placeholder text in Input component

---

## 1. Project Overview

BondVault Pakistan is a personal prize bond portfolio management app. Users register, add their Pakistani Prize Bonds by denomination + number, and check them against historical draw results to discover winning bonds.

### Architecture

| Layer | Choice | Notes |
|---|---|---|
| **Frontend Framework** | Next.js 16.2.7 (App Router) | React 19.2.4, server/client component split |
| **Backend Framework** | Next.js API Routes | 5 route handlers under `app/api/` |
| **Database** | SQLite via `better-sqlite3` v12.10.0 | File-based (`bondvault.db`), WAL mode, FK enabled |
| **ORM** | None — raw SQL with prepared statements | `kysely` installed but unused |
| **Authentication** | Better Auth v1.6.14 | Email+password only, cookie-based sessions |
| **Deployment Target** | Node.js hosting (Vercel inferred) | Plan called for Cloudflare Pages — incompatible due to `better-sqlite3` |
| **File Storage** | None | Planned: Cloudflare R2 (not implemented) |
| **Server State** | TanStack React Query v5.101.0 | `staleTime: 30_000`, query invalidation on mutations |
| **Client State** | `useState` only | `zustand` v5.0.14 installed but unused |
| **Validation** | Zod v4.4.3 + react-hook-form v7.77.0 | `bondSchema` in `lib/validations.ts` |
| **UI Primitives** | Radix UI (8 packages) | Avatar, Dialog, DropdownMenu, Label, Select, Separator, Slot, Tooltip |
| **Styling** | Tailwind CSS v4, CVA, clsx, tailwind-merge | Dark-only theme (#0A0E17 background), `cn()` utility |
| **Icons** | lucide-react v1.17.0 | Plan called for Phosphor Icons |
| **Animation** | framer-motion v12.40.0 | Inline variants, `PageTransition` component |
| **Toasts** | sonner v2.0.7 | Present |
| **Typography** | JetBrains Mono (only font) | Plan called for Playfair Display + Satoshi + JetBrains Mono |

---

## 2. Folder Structure

```
bonds-checker/
├── .commandcode/taste/taste.md
├── .env.local
├── .gitignore
├── .next/                        (build output)
├── app/
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── bonds/
│   │   │   ├── page.tsx
│   │   │   ├── client.tsx
│   │   │   ├── [id]/             (empty — route dir exists, no page)
│   │   │   └── add/
│   │   │       ├── page.tsx
│   │   │       └── client.tsx
│   │   ├── check/
│   │   │   ├── page.tsx
│   │   │   └── client.tsx
│   │   ├── settings/
│   │   │   ├── page.tsx
│   │   │   └── client.tsx
│   │   └── vault/
│   │       ├── page.tsx
│   │       └── client.tsx
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── client.tsx
│   │   └── register/
│   │       ├── page.tsx
│   │       └── client.tsx
│   ├── api/
│   │   ├── auth/[...all]/route.ts
│   │   ├── bonds/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── check/route.ts
│   │   └── dashboard/route.ts
│   ├── error.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   └── page.tsx
├── bondvault.db
├── bondvault.db-shm
├── bondvault.db-wal
├── components/
│   ├── providers.tsx
│   ├── auth/
│   │   ├── auth-card.tsx
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── bonds/
│   │   ├── bond-card.tsx
│   │   ├── bond-delete-dialog.tsx
│   │   ├── bond-form.tsx
│   │   └── bond-list.tsx
│   ├── check/
│   │   ├── check-button.tsx
│   │   ├── match-card.tsx
│   │   ├── results-panel.tsx
│   │   └── slot-machine.tsx
│   ├── dashboard/
│   │   ├── dashboard-skeleton.tsx
│   │   ├── denomination-breakdown.tsx
│   │   ├── portfolio-summary.tsx
│   │   ├── quick-actions.tsx
│   │   └── recent-winners.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── mobile-nav.tsx
│   │   ├── shell.tsx
│   │   └── sidebar.tsx
│   ├── shared/
│   │   ├── animated-counter.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-state.tsx
│   │   ├── logo.tsx
│   │   └── page-transition.tsx
│   └── ui/
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       └── tooltip.tsx
├── hooks/
│   ├── use-auth.ts
│   ├── use-bonds.ts
│   ├── use-matches.ts
│   └── use-media-query.ts
├── lib/
│   ├── api-client.ts
│   ├── auth-client.ts
│   ├── auth-utils.ts
│   ├── auth.ts
│   ├── constants.ts
│   ├── db.ts
│   ├── seed.ts
│   ├── utils.ts
│   └── validations.ts
├── middleware.ts
├── next.config.ts
├── package.json
├── plan/
│   ├── implementation-plan.md
│   └── plan.md
├── postcss.config.mjs
├── public/               (SVG placeholders only)
├── styles/               (empty)
└── tsconfig.json
```

---

## 3. package.json

### Dependencies

```json
{
  "@hookform/resolvers": "^5.4.0",
  "@radix-ui/react-avatar": "^1.1.12",
  "@radix-ui/react-dialog": "^1.1.16",
  "@radix-ui/react-dropdown-menu": "^2.1.17",
  "@radix-ui/react-label": "^2.1.9",
  "@radix-ui/react-select": "^2.3.0",
  "@radix-ui/react-separator": "^1.1.9",
  "@radix-ui/react-slot": "^1.2.5",
  "@radix-ui/react-tooltip": "^1.2.9",
  "@tanstack/react-query": "^5.101.0",
  "better-auth": "^1.6.14",
  "better-sqlite3": "^12.10.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "framer-motion": "^12.40.0",
  "kysely": "^0.28.17",
  "lucide-react": "^1.17.0",
  "next": "16.2.7",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "react-hook-form": "^7.77.0",
  "sonner": "^2.0.7",
  "tailwind-merge": "^3.6.0",
  "zod": "^4.4.3",
  "zustand": "^5.0.14"
}
```

### Dev Dependencies

```json
{
  "@tailwindcss/postcss": "^4",
  "@types/better-sqlite3": "^7.6.13",
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "eslint": "^9",
  "eslint-config-next": "16.2.7",
  "tailwindcss": "^4",
  "typescript": "^5"
}
```

### Dependency Rationale

| Package | Why Chosen |
|---|---|
| **next + react + react-dom** | Core framework (App Router, RSC, streaming) |
| **better-auth** | Self-hosted auth, avoids external SaaS dependencies |
| **better-sqlite3** | Zero-config local SQLite, synchronous API, no connection pools |
| **@tanstack/react-query** | Server state management, caching, deduplication, optimistic updates |
| **zod** | TypeScript-first schema validation with inference |
| **react-hook-form + @hookform/resolvers** | Performant form state management, Zod integration (partially used — BondForm uses plain `useState`) |
| **@radix-ui/* (8 packages)** | Headless, accessible UI primitives |
| **class-variance-authority + clsx + tailwind-merge** | The `cn()` + `cva()` variant pattern (shadcn/ui conventions) |
| **tailwindcss** | Utility-first CSS, v4 with `@tailwindcss/postcss` |
| **framer-motion** | Declarative animations and page transitions |
| **sonner** | Toast notifications (opinionated, clean API) |
| **lucide-react** | Icon set (tree-shakeable, consistent design) |
| **zustand** | Installed but unused — planned for client state |
| **kysely** | Installed but unused — possible future ORM migration |

---

## 4. Database Schema

### Complete Schema (8 tables)

```sql
-- Better Auth managed tables
CREATE TABLE user (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    email_verified INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE session (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE account (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    password_hash TEXT,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Application tables
CREATE TABLE bonds (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    denomination TEXT NOT NULL,
    bond_number TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, denomination, bond_number)
);

CREATE TABLE draws (
    id TEXT PRIMARY KEY,
    denomination TEXT NOT NULL,
    draw_date TEXT NOT NULL,
    draw_number TEXT NOT NULL
);

CREATE TABLE winning_numbers (
    id TEXT PRIMARY KEY,
    draw_id TEXT NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
    bond_number TEXT NOT NULL,
    prize_type TEXT NOT NULL,
    prize_amount TEXT NOT NULL
);

CREATE TABLE matches (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    bond_id TEXT NOT NULL REFERENCES bonds(id) ON DELETE CASCADE,
    winning_number_id TEXT NOT NULL REFERENCES winning_numbers(id) ON DELETE CASCADE,
    matched_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Indexes

| Index | Table | Columns | Purpose |
|---|---|---|---|
| `idx_sessions_user_id` | session | (user_id) | Session lookup by user |
| `idx_sessions_token` | session | (token) | Auth cookie validation |
| `idx_accounts_user_id` | account | (user_id) | Provider account lookup |
| `idx_bonds_user_id` | bonds | (user_id) | User's bond list |
| `idx_bonds_user_denomination` | bonds | (user_id, denomination) | Filtered bond lists |
| `idx_draws_denomination` | draws | (denomination) | Draw lookup by denomination |
| `idx_winning_draw_id` | winning_numbers | (draw_id) | Winning number lookup per draw |
| `idx_matches_user_id` | matches | (user_id) | User's match history |

### Missing Indexes

- **`winning_numbers.bond_number`**: The check query does `WHERE wn.bond_number = ?`. No index on this column. With 4,704 seeded rows it's negligible, but at 100K+ winning numbers this becomes a bottleneck.
- **Composite `winning_numbers(bond_number, draw_id)`**: Would cover the exact join pattern used in check queries.

### Relationships

```
user 1──N session       (CASCADE)
user 1──N account       (CASCADE)
user 1──N bonds         (CASCADE)
user 1──N matches       (CASCADE)

bonds 1──N matches      (CASCADE)
draws 1──N winning_numbers  (CASCADE)
winning_numbers 1──N matches (CASCADE)

verification — standalone (no FKs)
```

### Seed Data

- **84 draws** (7 denominations × 12 months, dated 2026-01-15 through 2026-12-15, draw numbers 80–91)
- **4,704 winning numbers** (56 per draw: 1× 1st + 5× 2nd + 50× 3rd)
- Bond numbers are random 6-digit strings (100000–999999)
- **Caveats**: Fixed year (2026 only), no versioning/history mechanism, random numbers have no real-world alignment

---

## 5. Authentication

### Provider

**Better Auth v1.6.14** — Email + Password only. No OAuth, no MFA, no email verification (though the `verification` table and `email_verified` column exist in schema).

Configuration (`lib/auth.ts`):
- `database`: SQLite via `better-sqlite3`
- `secret`: `BETTER_AUTH_SECRET` from `.env.local` (currently a dev placeholder)
- `baseURL`: `http://localhost:3000`
- `emailAndPassword.enabled`: `true`, min password length 8
- `session.cookieCache`: enabled, 1-hour maxAge

### Session Management

- **Cookie**: `better-auth.session_token` — stored in browser, read by middleware and API routes
- **Server-side validation**: `getUserId()` in `lib/auth-utils.ts` queries the `session` table directly with `expires_at > datetime('now')` check
- **Client-side**: `useAuth()` hook in `hooks/use-auth.ts` wraps Better Auth's `useSession()`

### User Model

| Field | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `email` | TEXT UNIQUE NOT NULL | — |
| `name` | TEXT NOT NULL DEFAULT '' | Auto-generated from email prefix on register |
| `email_verified` | INTEGER DEFAULT 0 | Set but never enforced |
| `image` | TEXT | Nullable, unused |
| `created_at` | TEXT | datetime('now') |
| `updated_at` | TEXT | datetime('now') |

### Protected Routes (`middleware.ts`)

| Pattern | Protection | Unauthenticated Behavior |
|---|---|---|
| `/vault`, `/bonds`, `/check`, `/settings` | Full redirect | → `/login` |
| `/api/*` | 401 JSON | `{"error":"Unauthorized"}` |
| `/login`, `/register`, `/` | Reverse (auth → redirect) | → `/vault` if cookie exists |

Middleware checks **only cookie presence** (not session validity) — full session validation with expiry happens at the API layer via `getUserId()`. This is the correct pattern for performance.

### Password Policy

- Minimum 8 characters (enforced by Better Auth config)
- Register form includes a **password strength meter** (≥8 chars, uppercase, number, special char) — visual only, not enforced server-side

### All Auth-Related Files

| File | Role |
|---|---|
| `lib/auth.ts` | Server Better Auth instance |
| `lib/auth-client.ts` | Client auth client (`signIn`, `signUp`, `signOut`, etc.) |
| `lib/auth-utils.ts` | Server `getUserId()` — session → user_id |
| `lib/db.ts` | Schema: user, session, account, verification tables |
| `hooks/use-auth.ts` | React hook: `useAuth()` |
| `middleware.ts` | Route protection |
| `app/api/auth/[...all]/route.ts` | API handler delegation |
| `app/(auth)/login/` | Login page (page.tsx + client.tsx) |
| `app/(auth)/register/` | Register page (page.tsx + client.tsx) |
| `components/auth/auth-card.tsx` | Animated auth card wrapper |
| `components/auth/login-form.tsx` | Login form |
| `components/auth/register-form.tsx` | Register form with password strength |
| `.env.local` | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` |

---

## 6. API Architecture

### Complete Endpoint Catalog

#### `GET /api/bonds`
**Purpose:** List authenticated user's bonds with filtering, searching, and sorting.

**Query Parameters (all optional):**
| Param | Type | Default | Description |
|---|---|---|---|
| `denomination` | string | — | Filter by denomination |
| `search` | string | — | Substring match against bond_number |
| `sort` | string | `"newest"` | `newest` / `oldest` / `denomination` |

**Success (200):**
```json
{
  "bonds": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "denomination": "100",
      "bond_number": "123456",
      "created_at": "2026-06-08T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

**Errors:** 401 (Unauthorized / Session expired), 500 (Failed to fetch bonds)

---

#### `POST /api/bonds`
**Purpose:** Create a new bond.

**Request Body:**
```json
{
  "denomination": "100",
  "bond_number": "123456"
}
```

**Validation:** Zod — `denomination` must be in enum, `bond_number` must be 4–7 digits.

**Success (201):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "denomination": "100",
  "bond_number": "123456",
  "created_at": "2026-06-08T00:00:00.000Z"
}
```

**Errors:** 400 (validation), 401 (auth), 409 (duplicate), 500 (server)

---

#### `DELETE /api/bonds/[id]`
**Purpose:** Delete a bond and its associated match records.

**Path Parameter:** `id` — bond UUID

**Success (200):**
```json
{ "success": true }
```

**Errors:** 401 (auth), 403 (ownership), 404 (not found), 500 (server)

**Logic:** Checks existence → checks ownership (`bond.user_id !== userId` → 403) → deletes matches → deletes bond.

---

#### `GET /api/dashboard`
**Purpose:** Aggregated dashboard data for authenticated user.

**No request body or query params.**

**Success (200):**
```json
{
  "totalBonds": 10,
  "totalChecked": 10,
  "totalMatches": 2,
  "denominations": [
    { "denomination": "100", "count": 5 },
    { "denomination": "200", "count": 5 }
  ],
  "winners": [
    {
      "id": "uuid",
      "bondNumber": "123456",
      "denomination": "100",
      "prizeType": "1st Prize",
      "prizeAmount": "Rs. 15,000,000",
      "drawDate": "2026-01-15"
    }
  ]
}
```

**Known Bug:** `totalChecked` is always set to `totalBonds` regardless of whether a check has ever been run. The ternary expression has identical branches.

**Errors:** 401, 500

---

#### `POST /api/check`
**Purpose:** Check all user bonds against winning numbers and persist matches.

**No request body.**

**Success (200):**
```json
{
  "matches": [
    {
      "id": "uuid",
      "bondNumber": "123456",
      "denomination": "100",
      "prizeType": "1st Prize",
      "prizeAmount": "Rs. 15,000,000",
      "drawDate": "2026-01-15",
      "drawNumber": "80"
    }
  ],
  "totalChecked": 10
}
```

**Logic:** Iterates all user bonds in a transaction → joins `winning_numbers` + `draws` on `denomination` + `bond_number` → `INSERT OR IGNORE` into `matches` → returns all historical matches.

**Errors:** 401, 500. Returns `{"matches":[], "totalChecked":0}` if user has no bonds.

---

#### `GET/POST /api/auth/[...all]`
**Purpose:** Catch-all for Better Auth (sign-in, sign-up, sign-out, session).

**Handled entirely by Better Auth's Next.js handler.** Request/response shapes follow Better Auth's contract.

---

### API Client (`lib/api-client.ts`)

Typed `apiFetch<T>()` wrapper with a structured `api` object:
- `api.bonds.list(params?)`, `api.bonds.create(data)`, `api.bonds.delete(id)`
- `api.dashboard.get()`
- `api.check.run()`

---

## 7. Bond Management Implementation

### How Bonds Are Created

1. User navigates to `/bonds/add`
2. `BondForm` renders: 7-button denomination grid → bond number input (appears after denomination selected)
3. Client-side: isValid check (denomination selected + ≥4 digit number matching `\d+` + not duplicate)
4. Submit calls `useCreateBond().mutate({ denomination, bond_number })`
5. `POST /api/bonds` — server validates with Zod, checks uniqueness, inserts, returns created bond
6. On success: toast + redirect to `/bonds` + query cache invalidation

### How Duplicates Are Prevented

| Layer | Mechanism | Status |
|---|---|---|
| **Database** | `UNIQUE(user_id, denomination, bond_number)` | ✅ Always enforced |
| **Server API** | Explicit `SELECT` before `INSERT` | ✅ Returns user-friendly 409 |
| **Client UI** | `BondForm` has `existingNumbers` prop for visual warning | ❌ **Not wired** — `AddBondPageClient` never passes it |

**Effective duplicate prevention:** Server + database only. Client-side duplicate detection is present in the component code but inactive because `existingNumbers` is always `[]`.

### How Denominations Are Handled

- **Constants**: `DENOMINATIONS` array in `lib/constants.ts` — 7 values as const
- **Labels**: `DENOMINATION_LABELS` maps to display strings ("Rs. 100", "Rs. 1,500", etc.)
- **Zod enum**: `z.enum(DENOMINATIONS)` — strict type
- **DB storage**: TEXT column
- **Sorting**: `CAST(denomination AS INTEGER) ASC` for numeric ordering
- **Duplication risk**: `bond-form.tsx` and `bond-list.tsx` define their own inline denomination arrays instead of importing from `lib/constants.ts`

### Validation Rules

| Rule | Source | Enforcement |
|---|---|---|
| Denomination must be one of 7 values | `bondSchema` (Zod) | Server (400) |
| Bond number must be 4–7 characters | `bondSchema` (Zod) | Server (400) |
| Bond number must be digits only | `bondSchema` (Zod) + client `onChange` sanitizer | Server + Client |
| No duplicate (user + denom + number) | `UNIQUE` constraint + API check | Server (409) |

### Bond Lifecycle

```
Create → Store → Check (match) → Delete
```

- **Create**: POST /api/bonds (201, with UUID)
- **Store**: Immutable — no edit/update API
- **Check**: POST /api/check, idempotent via `INSERT OR IGNORE`
- **Delete**: DELETE /api/bonds/[id], cascades to matches

---

## 8. Historical Draw System

### Current Implementation

The draw system is **partially implemented** — it has seeded historical data but no mechanism for real-world draw ingestion.

### Draw Tables

| Table | Rows (seeded) | Purpose |
|---|---|---|
| `draws` | 84 | Individual draw events (7 denoms × 12 months) |
| `winning_numbers` | 4,704 | Winning bond numbers per draw (56 per draw) |
| `matches` | Variable | User bonds that matched winning numbers |

**Prize tiers:**
- 1st Prize: Rs. 15,000,000 (1 winner/draw)
- 2nd Prize: Rs. 5,000,000 (5 winners/draw)
- 3rd Prize: Rs. 1,000,000 (50 winners/draw)

### Matching Logic

```sql
-- Core matching query (per bond, inside transaction)
SELECT wn.id, d.draw_date, d.draw_number
FROM winning_numbers wn
JOIN draws d ON wn.draw_id = d.id
WHERE d.denomination = ? AND wn.bond_number = ?
```

Match requires **exact match on both denomination AND bond_number**. No fuzzy/partial matching.

### Performance Considerations

| Aspect | Current | At Scale |
|---|---|---|
| Winning numbers count | 4,704 | Could grow to millions with real data |
| Check query | Sequential loop over user bonds | O(N bonds × M winning_numbers) without proper indexes |
| Missing index | `winning_numbers.bond_number` | Would make query O(log N) instead of O(N) |
| Transaction scope | All inserts in one transaction | Good — atomic, but large at scale |
| Idempotency | `INSERT OR IGNORE` | Correct — no duplicate match records |

**Critical note:** The seed data is all synthetic (random numbers, fixed 2026 dates). There is no import mechanism for real Prize Bond draw results from the National Savings Pakistan website or any other official source.

---

## 9. Cloudflare Compatibility Audit

### Status: **COMPLETELY INCOMPATIBLE**

The planned architecture (Cloudflare Pages + Workers + D1 + R2) was abandoned in implementation. The current codebase is built for **Node.js hosting only**.

### What Requires Node.js

| Component | Dependency | Why Incompatible |
|---|---|---|
| **Database driver** | `better-sqlite3` v12.10.0 | Native C++ addon. Cloudflare Workers have no filesystem, no native modules. Requires Node.js process. |
| **Database file** | `bondvault.db` (file on disk) | Workers have no persistent filesystem. D1 is accessed via HTTP, not file I/O. |
| **`serverExternalPackages`** | `next.config.ts` marks `better-sqlite3` | This is a Next.js Node.js server feature. Workers don't use it. |
| **`path.join(process.cwd(), ...)`** | `lib/db.ts:8` | `process.cwd()` is a Node.js API. Workers use a different runtime. |
| **Synchronous DB queries** | `db.prepare(...).get()` throughout | `better-sqlite3` is synchronous. Workers require async I/O (fetch to D1 HTTP API). |
| **`crypto.randomUUID()`** | Used in API routes | Available in Workers too, but used alongside other Node.js APIs |

### What Would Break on Cloudflare Workers

1. **Every database call** — All 5 API routes (`bonds`, `bonds/[id]`, `check`, `dashboard`, `auth`) call `getDb()` which instantiates `better-sqlite3`
2. **Better Auth** — Currently configured with `database: getDb()` returning a `better-sqlite3` instance. Would need D1 adapter instead.
3. **All server-side session validation** — `getUserId()` queries SQLite directly
4. **Schema initialization** — `initSchema()` runs SQL via `db.exec()`
5. **Seed script** — `lib/seed.ts` is a Node.js script using better-sqlite3

### Migration Path to Cloudflare

A full rewrite of the data layer would be needed:
- Replace `better-sqlite3` with `@libsql/client` (for D1 HTTP access) or `@cloudflare/d1`
- Make all database calls async
- Replace `process.cwd()` with appropriate path handling
- Switch Better Auth to its D1 or Turso adapter
- Remove `serverExternalPackages: ["better-sqlite3"]` from next.config
- Move seed data to a migration or import script compatible with D1

### Current Deployment Target

The presence of `vercel.svg` in `public/`, the Node.js runtime + `better-sqlite3` native module, and standard Next.js API routes strongly suggest **Vercel** as the intended deployment target.

---

## 10. Future Expansion Audit

### A. OCR Uploads
**Status: NOT READY**

- No file upload infrastructure exists
- No image processing libraries installed (`sharp`, `tesseract.js`, etc.)
- `styles/` directory is empty (planned for file upload styling)
- No R2/S3/Cloudflare Images integration
- Would need: upload endpoint, storage (Vercel Blob / R2 / S3), OCR pipeline (tesseract.js or Cloud Vision API)

### B. CSV Imports
**Status: NOT READY**

- No file upload handling
- No CSV parsing library installed (`papaparse`, `csv-parse`)
- No import API endpoint
- Would need: upload → parse → validate → batch insert API

### C. XLSX Imports
**Status: NOT READY**

- Same gaps as CSV
- No `xlsx` or `exceljs` library
- XLSX parsing is more complex (sheets, formatting, merged cells)

### D. TXT Imports
**Status: NOT READY**

- Same gaps as CSV, simpler parsing
- Still needs upload infrastructure

### E. WhatsApp Notifications
**Status: NOT READY**

- No notification system at all
- No Twilio/WhatsApp Business API integration
- No background job/task queue (BullMQ, Inngest, QStash)
- Would need: webhook infrastructure, template management, opt-in/opt-out

### F. Email Notifications
**Status: NOT READY**

- Better Auth has email capabilities but they're unused
- No email provider configured (Resend, SendGrid, Postmark)
- No email templates
- No notification preferences in user settings

### G. SMS Notifications
**Status: NOT READY**

- Same as WhatsApp — no notification infrastructure
- No phone number field on `user` table
- No Twilio/Vonage integration

### H. Subscription Plans
**Status: NOT READY**

- No payment integration (Stripe, Paddle, LemonSqueezy)
- No `subscriptions` table
- No plan/feature-gating logic
- No billing portal or invoice handling
- No pricing page

### I. Free Tier Limits
**Status: NOT READY**

- No usage tracking table
- No per-user limits enforced anywhere (bond count, check frequency, storage quota)
- User can add unlimited bonds
- Would need: `usage` table, middleware checks, quota API

### J. Data Retention Policies
**Status: NOT READY**

- No deletion/retention logic
- Matches table grows indefinitely with `INSERT OR IGNORE`
- No scheduled cleanup jobs
- No data export/account deletion self-service
- GDPR/data privacy compliance gap

### K. Automated Draw Ingestion
**Status: NOT READY**

- Seed data is purely synthetic (random numbers, 2026 dates)
- No web scraping or API integration with National Savings Pakistan
- No cron/scheduled job infrastructure
- No admin interface for manual draw entry
- No draw versioning (if a draw result is later corrected)

---

## 11. Scalability Audit

### Database Bottlenecks

| Bottleneck | Concern | Severity |
|---|---|---|
| **SQLite single-writer** | Only one write transaction at a time. Under concurrent check operations, writes will queue. | Medium at 1K users, High at 10K+ |
| **File-based storage** | `bondvault.db` is a single file on disk. No replication, no sharding, no read replicas. | High for any production deployment |
| **No connection pooling** | Singleton `getDb()` — single connection. All reads and writes share one connection. | Medium |
| **WAL mode** | Enabled, which helps reader-writer concurrency. Good. | Mitigation only |

### Query Bottlenecks

| Query | Problem | Fix |
|---|---|---|
| **Check loop** | Iterates user bonds sequentially in a transaction. 100 bonds = 100 queries inside a single write tx. | Batch query: `SELECT wn.*, d.* FROM winning_numbers wn JOIN draws d WHERE d.denomination IN (...) AND wn.bond_number IN (...)` |
| **Missing `bond_number` index** | `winning_numbers` table queried by `bond_number` with no index. Linear scan. | `CREATE INDEX idx_winning_bond_number ON winning_numbers(bond_number)` |
| **Dashboard 5 queries** | Dashboard makes 5 separate queries per page load. Could be combined. | Single query with subqueries or CTE |
| **No pagination** | `GET /api/bonds` returns all bonds with no limit/offset. | Add pagination params |

### Storage Bottlenecks

| Bottleneck | Concern |
|---|---|
| **Single DB file** | Grows with every bond + match. No archival/partitioning strategy. |
| **No file storage** | Not relevant yet (no uploads), but will need R2/S3/Vercel Blob |
| **No CDN** | Static assets served from Next.js, no CDN configuration visible |

### User Scale Estimates

| Scale | Viability | Notes |
|---|---|---|
| **1,000 users** | ✅ Feasible on a single VPS | SQLite handles this fine. Dashboard queries are simple aggregates. |
| **10,000 users** | ⚠️ Borderline | SQLite single-writer becomes a bottleneck under concurrent checks. Need connection pooling, query optimization, or migration to PostgreSQL. |
| **100,000 users** | ❌ Not feasible | SQLite is the wrong database at this scale. Need PostgreSQL + read replicas + caching layer. API routes need edge deployment. Check operation needs to be async/queued. |

### Critical Path to Scale

1. Migrate to PostgreSQL (or Turso/LibSQL for D1 compatibility)
2. Add Redis/Memcached for session + dashboard caching
3. Move check to background job queue (Inngest/QStash/BullMQ)
4. Add pagination to all list endpoints
5. Add `winning_numbers(bond_number)` index
6. Optimize check query to single batch JOIN

---

## 12. Technical Debt

### Shortcuts

| Issue | Location | Impact |
|---|---|---|
| **Dev secret in .env.local** | `BETTER_AUTH_SECRET=bondvault-dev-secret-change-in-production-32chars` | Security risk if deployed with this |
| **Constants duplication** | `bond-form.tsx`, `bond-list.tsx` define their own denomination arrays instead of importing from `lib/constants.ts` | Maintenance risk — changing denominations requires 3 edits |
| **`existingNumbers` not wired** | `BondForm` prop never passed by `AddBondPageClient` | Dead code, misleading |
| **`totalChecked` always equals `totalBonds`** | `app/api/dashboard/route.ts` — ternary has identical branches | Bug — dashboard shows incorrect stats |
| **Random seed data** | `lib/seed.ts` uses `Math.random()` for bond numbers | Seeds won't match real-world draws, making check results meaningless for demos |

### Hacks

| Issue | Location | Impact |
|---|---|---|
| **`useRef` + `useEffect` for slot→check relay** | `app/(app)/check/client.tsx:45-51` | Fragile pattern to avoid calling mutate during render. Should use a callback. |
| **Sequential bond matching loop** | `app/api/check/route.ts` — for-loop over bonds in a transaction | Works for small portfolios, doesn't scale |
| **Manual match cleanup before bond delete** | `app/api/bonds/[id]/route.ts` — explicit `DELETE FROM matches` before `DELETE FROM bonds` | Redundant with `ON DELETE CASCADE` FK — belt-and-suspenders that suggests uncertainty about FK behavior |
| **`existingNumbers` defaults to `[]`** | `app/(app)/bonds/client.tsx` — `existingNumbers={[]}` | The duplicate detection UI code is completely bypassed |

### Weak Areas

| Area | Concern |
|---|---|
| **Error handling** | Generic `"Failed to X"` messages. No error codes, no structured error responses. Client-side `catch` in mutations is often missing — errors silently fail. |
| **Testing** | Zero test files. No Vitest, Jest, Playwright, or testing library of any kind. |
| **Logging** | No structured logging, no error tracking (Sentry, etc.). Console errors only. |
| **Security headers** | `next.config.ts` sets basic headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy) but CSP is missing. |
| **Rate limiting** | No rate limiting on any endpoint. `/api/check` could be spammed. |
| **Input sanitization** | Client strips non-digits from bond numbers, but no XSS protection beyond React defaults. |
| **CSRF** | Better Auth handles session cookies; no explicit CSRF tokens on API mutations. |
| **No TypeScript strict mode** | `tsconfig.json` not checked but no `strict: true` evidence. |

### Future Migration Risks

| Risk | Likelihood | Impact |
|---|---|---|
| **SQLite → PostgreSQL/D1 migration** | Very High | All raw SQL uses SQLite-isms (e.g., `datetime('now')`, `CAST(...AS INTEGER)`). Migration requires rewriting every query. |
| **better-sqlite3 → async driver** | Very High | All DB calls are synchronous. Need to make every function async and propagate up the call stack. |
| **Better Auth version lock** | Medium | Better Auth is still maturing. API contract changes could break the custom session validation in `getUserId()`. |
| **Seed → real data** | High | The entire draw data is synthetic. Real National Savings Pakistan data has different formats, schedules, and edge cases. |

---

## 13. Missing Requirements

### Implemented Features (MVP)

| Feature | Status | Notes |
|---|---|---|
| Email + password registration | ✅ Done | With password strength meter |
| Login / logout | ✅ Done | Better Auth with cookie sessions |
| Manual bond storage | ✅ Done | With denomination + bond number validation |
| Organization by denomination | ✅ Done | Filter pills, sort by denomination |
| Historical draw checking | ✅ Done | Slot-machine animation + results panel |
| Winning results display | ✅ Done | Match cards with prize details |
| Dashboard with stats | ✅ Done | Portfolio summary, breakdown, recent winners |
| Mobile-responsive layout | ✅ Done | Shell, sidebar, mobile-nav, responsive grid |
| Dark theme | ✅ Done | Custom #0A0E17 palette |
| Protected routes | ✅ Done | Middleware with auth gating |

### Missing Features (Planned but Not Implemented)

| Feature | Status |
|---|---|
| Bond detail page (`/bonds/[id]`) | ❌ Route directory exists but is empty |
| Check results page (`/check/results`) | ❌ Inline results instead of dedicated page |
| Edit/update bond | ❌ No PATCH endpoint or UI |
| Confetti on winning match | ❌ Not implemented |
| Password strength via `zxcvbn` | ❌ Not installed |
| Phosphor Icons | ❌ Lucide used instead |
| Playfair Display + Satoshi fonts | ❌ JetBrains Mono only |
| Shared animation variants file | ❌ Variants are inline |
| Zustand for client state | ❌ Installed but unused |
| Kysely query builder | ❌ Installed but unused |
| Email verification | ❌ Table exists but no flow implemented |
| OAuth/social login | ❌ Not configured |

### Future Blockers

| Blocker | Why Critical |
|---|---|
| **SQLite as production database** | Will not scale beyond a few thousand users. Single point of failure. No replication. |
| **No file upload infrastructure** | Blocks OCR, CSV, XLSX, TXT features. |
| **No notification system** | Blocks WhatsApp, Email, SMS features. |
| **No payment integration** | Blocks subscription plans and monetization. |
| **No background jobs** | Blocks automated draw ingestion, scheduled checks, batch notifications. |
| **No admin interface** | No way to manage draws, users, or content without direct DB access. |
| **No testing infrastructure** | Zero test coverage. Regression risk grows with every feature. |
| **No CI/CD** | No build pipeline, no automated deployments, no environment separation. |

---

## 14. Final Verdict

### Scores

| Category | Score | Explanation |
|---|---|---|
| **Overall Architecture** | **6/10** | Clean Next.js patterns, well-organized component structure, typed API client. Knocked down for SQLite as production DB, lack of testing, and architectural divergence from the planned Cloudflare stack. |
| **Cloudflare Readiness** | **1/10** | Completely incompatible with Cloudflare Workers/Pages. Native `better-sqlite3` module, synchronous DB calls, Node.js filesystem APIs throughout. Full rewrite required for CF deployment. |
| **Scalability** | **3/10** | SQLite single-writer bottleneck, no pagination, no caching layer, sequential check queries. Fine for local dev/demos. Will fail under concurrent production load beyond hundreds of users. |
| **Maintainability** | **7/10** | Good component composition, consistent patterns (server page + client page split), typed API client, clear separation of concerns. Deductions for duplicated constants, dead code, and zero tests. |

### The Big Question

**"Can this MVP realistically evolve into the full BondVault platform without a major rewrite?"**

**NO — a major rewrite is required.** Here's why:

1. **The database layer is a dead end.** SQLite via `better-sqlite3` is fundamentally incompatible with both Cloudflare Workers (the planned target) and production scale. Every API route, every server-side utility, and the auth system depend on synchronous SQLite calls. Migrating to D1 or PostgreSQL requires rewriting every data access pattern.

2. **The Cloudflare divergence is architectural, not superficial.** The current code is Node.js-first with filesystem access, synchronous I/O, and native modules. Cloudflare Workers are V8 isolates with no filesystem, async-only I/O, and a Web API surface. Bridging this gap means rebuilding the entire backend.

3. **Missing infrastructure for non-MVP features.** File uploads, notifications, payments, background jobs, and automated draw ingestion all need foundational infrastructure that doesn't exist. These aren't incremental additions — they're new subsystems.

4. **The MVP is a solid prototype.** It demonstrates the UX, validates the concept, and has clean frontend architecture. The UI layer (components, layouts, animations) can largely survive a rewrite. But the data layer and deployment architecture must be rebuilt from scratch.

### Recommendation

Use this MVP as a **frontend reference + UX prototype**. Rebuild the backend targeting Cloudflare D1 + Workers (or PostgreSQL + Vercel) with:
- Async database driver (D1 HTTP API or `@libsql/client`)
- `winning_numbers(bond_number)` index
- Batch check queries
- Pagination on all list endpoints
- Background job queue for scheduled tasks
- Proper test suite before adding more features

The component library, design system, and frontend architecture are salvageable. The backend is not.
