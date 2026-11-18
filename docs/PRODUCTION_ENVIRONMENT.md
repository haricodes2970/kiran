# Production Environment Matrix (Phase 4B)

> **Security Rule:** Never commit real `.env` files, API keys, or secrets to Git. Set all values in the hosting provider's encrypted Secret/Environment UI.

## 1. Backend API (`apps/api`)

| Variable | Required in Prod | Example / Default | Purpose |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | `production` | Enforces strict env validation & disables dev PGlite fallback |
| `DEMO_MODE` | Yes | `false` | Prevents automatic demo data seeding |
| `API_PORT` | Yes | `4000` (or platform `$PORT`) | HTTP listening port |
| `DATABASE_URL` | Yes | `postgresql://...sslmode=require` | External managed PostgreSQL connection |
| `JWT_ACCESS_SECRET` | Yes | >= 32-char random secret | Signs short-lived access tokens |
| `JWT_REFRESH_SECRET` | Yes | >= 32-char random secret | Signs refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Recommended | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | Recommended | `7d` | Refresh token TTL |
| `CORS_ORIGIN` | Yes | `https://kiransinfotech.in,https://www.kiransinfotech.in` | Comma-separated allowed browser origins |
| `ONLINE_PAYMENT_ENABLED` | Yes | `false` | Keeps storefront in `ORDER_REQUEST_ONLY` mode |
| `LIVE_EMAIL_ENABLED` | Yes | `false` (until Phase 4F activation) | Keeps `SandboxEmailAdapter` when `false` |
| `EMAIL_PROVIDER` | When live | `resend` or `smtp` | Selects live mail provider |
| `EMAIL_FROM` | When live | `orders@<client-domain>` | Verified sender identity |
| `RESEND_API_KEY` / `SMTP_*` | When live | Secret | Provider credentials |
| `LIVE_WHATSAPP_ENABLED` | Yes | `false` (until Phase 4F activation) | Keeps `SandboxWhatsAppAdapter` when `false` |
| `WHATSAPP_PHONE_NUMBER_ID` | When live | Meta Cloud API ID | Business WhatsApp sender |
| `WHATSAPP_ACCESS_TOKEN` | When live | Secret | Meta Cloud API token |
| `LIVE_STORAGE_ENABLED` | Yes | `false` (until Phase 4F activation) | Local vs Cloudinary/S3 media adapter |
| `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` | When live | Secret | Product/refurbished image storage |

## 2. Frontend Storefront (`apps/web`)

| Variable | Required in Prod | Example | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | `https://api.<client-domain>/api/v1` | Public REST API base URL (no secrets) |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://<client-domain>` | Canonical SEO / sitemap base URL |
