# Kiran's Infotech — Deployment Guide

## 1. Architecture Overview

- **Frontend (`apps/web`):** Next.js 14+ application, deployable to **Vercel** or any Node 20+ container host.
- **Backend (`apps/api`):** NestJS REST API (`/api/v1`), deployable to **Render**, **Railway**, **Fly.io**, or **Google Cloud Run**.
- **Database:** Managed **PostgreSQL** (Neon, Supabase, RDS, or Railway PostgreSQL).

---

## 2. Required Environment Variables

### Backend (`apps/api`)
| Variable | Description |
| :--- | :--- |
| `NODE_ENV` | `development`, `staging`, or `production` |
| `DEMO_MODE` | `true` for client demo build; `false` in live production |
| `API_PORT` | Port for NestJS server (default `4000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Minimum 32-character secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token validity (e.g., `7d`) |
| `CORS_ORIGIN` | Allowed frontend origin(s), comma-separated |
| `ALLOW_GUEST_REPAIR_BOOKING` | `true` or `false` |
| `ONLINE_PAYMENT_ENABLED` | `true` or `false` |

### Frontend (`apps/web`)
| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL of NestJS API (e.g., `https://api.kiransinfotech.com/api/v1`) |
| `NEXT_PUBLIC_SITE_URL` | Public URL of Next.js app |
| `NEXT_PUBLIC_DEMO_MODE` | `true` to show Demo Mode banner |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Official business WhatsApp number in international format |

---

## 3. Database Migration & Seed Safety

1. **Apply Migrations in Production:**
   ```bash
   npm --workspace=apps/api run prisma:migrate:deploy
   ```
2. **Demo Seed Safety:**
   The seed script (`apps/api/prisma/seed.ts`) inspects `NODE_ENV`. If `NODE_ENV === 'production'` and `ALLOW_DEMO_SEED_IN_PROD !== 'true'`, it aborts immediately so sample data is never accidentally injected into a live production database.
3. **Run Demo Seed (Development / Demo Environment Only):**
   ```bash
   npm --workspace=apps/api run prisma:seed
   ```

---

## 4. Production Build & Start Commands

```bash
# Install all workspace dependencies
npm install

# Generate Prisma client
npm --workspace=apps/api run prisma:generate

# Build shared types, backend API, and frontend web app
npm run build

# Start backend in production
npm --workspace=apps/api run start:prod

# Start frontend in production
npm --workspace=apps/web run start
```

---

## 5. Health Check & Rollback

- **Health Endpoint:** `GET /api/v1/health` returns HTTP 200 with `{ status: "ok", database: "connected", demoMode: boolean }`.
- **Rollback Procedure:**
  1. Revert container/deployment to previous Git commit SHA on Vercel and API host.
  2. All Prisma schema changes must be backward-compatible additive migrations; restore from automated PostgreSQL snapshot if a schema rollback is required.
