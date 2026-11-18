# Kiran's Infotech — Hosting, Domain & Infrastructure Architecture

## 1. Recommended Production Deployment Topology

| Component | Recommended Host | Why |
| :--- | :--- | :--- |
| **Next.js Frontend (`apps/web`)** | **Vercel** (Hobby/Pro) | Native Next.js 14 App Router SSR/ISR, global edge CDN, automatic preview deployments. |
| **NestJS API (`apps/api`)** | **Render** (Web Service) or **Railway** | Persistent Node 22 container for NestJS, zero cold-start issues, simple env & health check integration (`/api/v1/health`). |
| **PostgreSQL 16 Database** | **Neon** or **Supabase** | Managed PostgreSQL with PgBouncer connection pooling, SSL (`sslmode=require`), and automated PITR backups. |
| **Media Storage** | **Cloudinary** | Signed server-side uploads, automatic WebP/AVIF resizing, CDN delivery. |
| **Business Email** | **Resend** | High-deliverability REST API with DKIM/SPF verification and idempotency keys. |
| **WhatsApp Automation (Optional)** | **Meta WhatsApp Cloud API** | Direct Graph API integration with no middleman markup. |

---

## 2. Estimated Recurring Infrastructure Costs (Monthly)

| Service | Starter / Launch Tier | Growth / Production Tier |
| :--- | :--- | :--- |
| **Vercel (Frontend)** | $0 (Hobby — non-commercial) / $20/mo (Pro — commercial) | $20/mo (~₹1,700/mo) |
| **Render / Railway (NestJS API)** | $5–$7/mo (~₹450–₹600/mo) | $15–$25/mo (~₹1,300–₹2,100/mo) |
| **Neon / Supabase (PostgreSQL)** | $0–$19/mo (~₹0–₹1,600/mo) | $19–$25/mo (~₹1,600–₹2,100/mo) |
| **Cloudinary (Media CDN)** | $0 (Free tier: 25 credits/mo) | $0–$89/mo (Free tier usually sufficient for <5,000 SKUs) |
| **Resend (Transactional Email)** | $0 (3,000 emails/mo free) | $20/mo (50,000 emails/mo) |
| **Domain (`.com` / `.in`)** | ~₹800–₹1,200/year | ~₹800–₹1,200/year |
| **Estimated Total** | **~₹2,150 – ₹3,900 / month** | **~₹4,600 – ₹7,600 / month** |

---

## 3. Domain, DNS, HTTPS & Cookie Security

- **DNS Records:**
  - `kiransinfotech.com` & `www` -> Vercel CNAME/A records.
  - `api.kiransinfotech.com` -> Render/Railway CNAME record.
  - `TXT` / `CNAME` records for Resend DKIM, SPF, and DMARC.
- **HTTPS & Cookies:** Both `kiransinfotech.com` and `api.kiransinfotech.com` must enforce TLS 1.2+. When `NODE_ENV=production`, `AuthController` sets `kiran_token` with `httpOnly: true`, `secure: true`, `sameSite: 'lax'`.
- **CORS:** Set `CORS_ORIGIN=https://kiransinfotech.com,https://www.kiransinfotech.com`.

---

## 4. Build, Migration & Rollback Commands

```bash
# 1. Database Migration (against direct PostgreSQL URL)
npm --workspace=apps/api run prisma:migrate:deploy

# 2. Build All Workspaces
npm install && npm run db:generate && npm run build

# 3. Start Services
npm --workspace=apps/api run start:prod
npm --workspace=apps/web run start
```
- **Rollback:** Revert deployment to previous Git SHA on Vercel + Render/Railway; restore pre-migration PostgreSQL snapshot if schema rollback is needed.
