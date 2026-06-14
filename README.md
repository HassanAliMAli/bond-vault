# BondVault

Prize bond portfolio tracker. Deployed on Cloudflare Workers.

## Tech stack

- **Framework:** Next.js 16 (App Router) + Hono (API routes)
- **Deployment:** Cloudflare Workers via OpenNext
- **Database:** D1 (SQLite via Drizzle ORM)
- **Auth:** Better Auth (email/password)
- **Storage:** R2 (assets), KV (cache + rate limiting)
- **UI:** Tailwind v4, Framer Motion, Radix UI, TanStack Query

## Development

```bash
npm install    # install deps + apply postinstall patches
npm run dev    # local dev server
npm run build  # typecheck + next build
npm test       # run tests
npm run deploy # build + deploy to Cloudflare
```

## Keep-warm

The free Cloudflare Worker has a 10ms CPU limit. Cold starts can exceed this.
An external uptime monitor pings `https://bondvault.hassanali205031.workers.dev/api/v1/health`
every 5 minutes to keep the worker warm. The same endpoint also runs daily cleanup
tasks (subscription expiration, data retention) once per day.

## Admin

Promote a user to admin via D1:

```bash
npx wrangler d1 execute bondvault-production-v2 --remote \
  --command "UPDATE users SET status = 'admin' WHERE email = 'admin@example.com';"
```

## Structure

```
lib/
  server/          Hono API backend
    routes/        Route handlers (bonds, draws, matches, admin, etc.)
    services/      Business logic (cron, audit, matches, notifications)
    auth.ts        Better Auth server config
    schema.ts      Drizzle schema (all tables)
  api-client.ts    Client-side fetch wrapper
  auth-client.ts   Better Auth client
hooks/             TanStack Query hooks
app/               Next.js App Router pages
components/        UI components
patches/           Postinstall patches for vendor libs
```
