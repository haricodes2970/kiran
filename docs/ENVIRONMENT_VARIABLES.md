# Kiran's Infotech — Environment Variables Reference

Copy `.env.example` to `.env` at the repository root (or `apps/api/.env` and `apps/web/.env.local`). Never commit real `.env` files to Git.

---

## 1. Backend API Variables (`apps/api`)

| Variable | Required | Default (Dev) | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `development` | Runtime environment (`development`, `test`, `production`). |
| `DEMO_MODE` | Yes | `true` | Enables demo transparency flags and permits demo OTP verification (`123456`). Set `false` in live production. |
| `API_PORT` | Yes | `4000` | TCP port for the NestJS HTTP server. |
| `API_PREFIX` | No | `/api/v1` | Global REST route prefix. |
| `CORS_ORIGIN` | Yes | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated list of allowed frontend origins. |
| `DATABASE_URL` | Yes | `postgresql://postgres:postgres@127.0.0.1:5432/postgres?schema=public&sslmode=disable&connection_limit=1` | PostgreSQL connection URL. If pointing to `127.0.0.1:5432` and no external Postgres daemon is listening, the API automatically starts an embedded PGlite PostgreSQL 16 server in `.pglite/kirans_pgdata`. |
| `JWT_SECRET` | Yes (Prod) | Dev fallback key | Secret key (minimum 32 random characters) used to sign and verify JWT tokens. |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiration window. |
| `ADMIN_BOOTSTRAP_TOKEN` | No | None | One-time secret token required by `POST /api/v1/auth/bootstrap-admin` when creating the first administrator in an empty production database. |
| `ALLOW_GUEST_REPAIR_BOOKING` | No | `false` | When `true`, allows unauthenticated visitors to submit repair bookings on `/services`. |
| `ONLINE_PAYMENT_ENABLED` | No | `false` | Feature flag reserved for online payment gateway activation. |
| `ALLOW_DEMO_SEED_IN_PROD` | No | `false` | Safety guard: `prisma/seed.ts` refuses to run when `NODE_ENV=production` unless this is explicitly set to `true`. |

---

## 2. Frontend Web Variables (`apps/web`)

| Variable | Required | Default (Dev) | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:4000/api/v1` | Base URL for backend API requests. Also used by Next.js `rewrites()` proxy in `apps/web/next.config.js`. |
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3000` | Canonical public URL of the Next.js application. |
| `NEXT_PUBLIC_DEMO_MODE` | No | `true` | Controls display of the top Client Demo Mode notice banner. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Yes | `919000000000` | Business WhatsApp phone number in international format (digits only) used by all click-to-chat buttons. |
| `NEXT_PUBLIC_BUSINESS_PHONE` | No | `+91 90000 00000` | Display phone number in footer and contact pages. |
| `NEXT_PUBLIC_BUSINESS_EMAIL` | No | `contact@kiransinfotech.example.com` | Display contact email address. |

---

## 3. Optional Third-Party Provider Variables (Awaiting Client Credentials)

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- `OTP_PROVIDER`, `OTP_API_KEY`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
