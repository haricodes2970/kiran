# Hosting Architecture Comparison & Recommendation (Phase 4A)

**Project:** Kiran's Infotech (`kiran` monorepo: Next.js 14 storefront + NestJS REST API + PostgreSQL / Prisma)  
**Date:** 2026-11-18  
**Status:** Recommendation Only — **No paid infrastructure provisioned or purchased.**

---

## 1. Monorepo & Workload Requirements

| Component | Runtime / Build | Resource Profile (Starter) | Notes |
| --- | --- | --- | --- |
| **Frontend (`apps/web`)** | Next.js 14 App Router (SSR + static assets) | Edge / Node SSR, ~256–512 MB RAM | 32 routes, SEO pages, customer/admin portals, calls `NEXT_PUBLIC_API_URL` |
| **Backend (`apps/api`)** | NestJS 10 long-running HTTP server | Always-on Node process, 512 MB–2 GB RAM | Swagger, Prisma Client, scheduled/idempotent email & notification adapters, rawBody webhook readiness |
| **Database** | PostgreSQL 15/16 (managed) | 1 GB–10 GB storage, pooled connections | 26 Prisma models, transactional order/inventory updates, `prisma migrate deploy` |

> **Important Commercial Rule:** Vercel's **Hobby** plan ($0/month) is strictly for personal, non-commercial projects and **cannot be used for a commercial client business website** like Kiran's Infotech.

---

## 2. Verified Provider Pricing vs. Estimates

All USD base prices below are from official provider pricing pages verified during Phase 4A audit. INR equivalents use an **estimated** exchange rate of **₹85 / USD** plus **18% GST** (estimated; actual card/forex markup and tax depend on Indian billing card/GST registration).

### Verified Official USD Rates

1. **Vercel**
   - **Hobby:** $0/month (non-commercial only — **ineligible**).
   - **Pro:** **$20/user/month** (includes $20/month usage credit; Viewer seats free; extra bandwidth ~$0.15/GB).
2. **Render**
   - **Workspace:** Hobby $0/month, Professional $25/month (optional team features).
   - **Web Services:**
     - **Free:** $0/month (spins down after inactivity; 512 MB RAM, 0.1 CPU — unsuitable for responsive production API).
     - **Starter (`0.5c-512mb`):** **$7/month** (0.5 CPU, 512 MB RAM, always-on).
     - **Standard (`1c-2g`):** **$25/month** (1 CPU, 2 GB RAM, always-on).
3. **Neon PostgreSQL**
   - **Free:** $0/month (100 CU-hrs/month, 1 GB storage, auto-suspend after 5 min inactivity).
   - **Launch:** $0 base + **$0.106 / CU-hour** compute + **$0.35 / GB-month** storage (500 GB egress included; configurable scale-to-zero / PITR).
   - **Scale:** $0 base + **$0.222 / CU-hour** compute + **$0.35 / GB-month** storage.
4. **Railway**
   - **Hobby:** **$5/month** (includes $5 usage credit; up to 48 vCPU / 48 GB RAM).
   - **Pro:** **$20/month** (includes $20 usage credit).
   - **Usage rates:** RAM ~$10/GB-month, CPU ~$20/vCPU-month, Volume ~$0.15/GB-month, Egress $0.05/GB.

---

## 3. Architecture Comparison

### Option A: Vercel Pro (Frontend) + Render (API) + Neon PostgreSQL
- **Commercial Eligibility:** Yes (Vercel Pro permits commercial client sites; Render Starter/Standard and Neon Launch are commercial-ready).
- **Monthly Cost (USD):**
  - **Starter:** Vercel Pro ($20) + Render Starter API ($7) + Neon Launch (~$5–$10 estimated active compute + 1–5 GB storage) = **~$32–$37/month**.
  - **Growth:** Vercel Pro ($20) + Render Standard API ($25) + Neon Launch/Scale (~$15–$25 estimated) = **~$60–$70/month**.
- **Estimated Monthly Cost (INR, incl. 18% GST estimate):**
  - **Starter:** **~₹3,210 – ₹3,710 / month**
  - **Growth:** **~₹6,020 – ₹7,020 / month**
- **Latency from India:** Vercel Edge CDN has Mumbai/Bengaluru/Chennai PoPs (excellent static/edge latency). Render **Singapore** region (`sin`) + Neon **AWS Singapore (`ap-southeast-1`)** yield ~45–75 ms RTT from India.
- **Pros:** Best-in-class Next.js 14 SSR/ISR/image optimization; zero cold-start on Render Starter API; Neon branching for safe staging DB clones and automated backups/PITR; straightforward `prisma migrate deploy` in Render pre-deploy command.
- **Cons:** Three vendor dashboards (Vercel, Render, Neon); slightly higher base cost due to Vercel Pro $20/seat minimum.

### Option B: Render (Frontend) + Render (API) + Neon PostgreSQL
- **Commercial Eligibility:** Yes.
- **Monthly Cost (USD):**
  - **Starter:** Render Starter Web ($7) + Render Starter API ($7) + Neon Launch (~$5–$10 estimated) = **~$19–$24/month**.
  - **Growth:** Render Standard Web ($25) + Render Standard API ($25) + Neon Launch/Scale (~$15–$25 estimated) = **~$65–$75/month**.
- **Estimated Monthly Cost (INR, incl. 18% GST estimate):**
  - **Starter:** **~₹1,905 – ₹2,410 / month**
  - **Growth:** **~₹6,520 – ₹7,520 / month**
- **Latency from India:** Both Next.js and NestJS in Render Singapore + Neon Singapore. No global edge SSR caching like Vercel out of the box unless fronted by Cloudflare.
- **Pros:** Lowest starter cost with commercial eligibility; unified compute billing on Render; native NestJS long-running process support.
- **Cons:** Next.js App Router SSR/asset caching is less optimized on a single 512 MB Node container compared to Vercel; 512 MB RAM can tighten under concurrent Next.js SSR spikes.

### Option C: Railway (Frontend + API + Managed PostgreSQL)
- **Commercial Eligibility:** Yes (Railway Hobby $5 / Pro $20; Pro recommended for production SLA/team).
- **Monthly Cost (USD):**
  - **Starter (Hobby/Pro + usage):** Base $5–$20 (credit applied to usage). Typical always-on Next.js (256–512 MB) + NestJS (512 MB) + Managed Postgres (512 MB + 5 GB volume) = **~$15–$25/month** estimated total.
  - **Growth (Pro + higher usage):** **~$35–$55/month** estimated total.
- **Estimated Monthly Cost (INR, incl. 18% GST estimate):**
  - **Starter:** **~₹1,505 – ₹2,510 / month**
  - **Growth:** **~₹3,510 – ₹5,520 / month**
- **Latency from India:** Railway Singapore (`asia-southeast1`) region available; private networking between Web, API, and Postgres reduces API-to-DB latency.
- **Pros:** Single unified dashboard, private internal networking, simple monorepo multi-service setup, predictable usage-based scaling.
- **Cons:** Usage-based CPU/RAM billing requires setting budget alerts; PostgreSQL backups/branching are less developer-friendly than Neon's instant branching; single-vendor coupling for compute + DB.

---

## 4. Matrix Summary

| Criterion | Option A (Vercel Pro + Render + Neon) | Option B (Render + Render + Neon) | Option C (Railway All-in-One) |
| --- | --- | --- | --- |
| **Commercial Use** | Yes (Vercel Pro) | Yes | Yes |
| **Starter Cost (Est. INR + GST)** | ~₹3,210–₹3,710/mo | ~₹1,905–₹2,410/mo | ~₹1,505–₹2,510/mo |
| **Next.js 14 SSR Quality** | Best | Good | Good |
| **NestJS Long-Running API** | Excellent (Render Starter/Std) | Excellent | Excellent |
| **Prisma Migrations** | Pre-deploy hook (`prisma migrate deploy`) | Pre-deploy hook | Pre-deploy / start command |
| **DB Backups & Staging Clones** | Best (Neon PITR + DB branching) | Best (Neon PITR + DB branching) | Volume snapshots (manual/scheduled) |
| **SSL / Custom Domains** | Automatic Let's Encrypt on all | Automatic TLS | Automatic TLS |
| **Vendor Lock-in** | Low (standard Next.js/NestJS/PG) | Low | Low–Medium |
| **Operational Complexity** | Medium (3 dashboards) | Low–Medium (2 dashboards) | Lowest (1 dashboard) |

---

## 5. Final Recommendation

- **Primary Recommendation:** **Option A — Vercel Pro (Frontend) + Render Starter/Standard (API in Singapore) + Neon Launch (PostgreSQL in Singapore)**
  - Best Next.js 14 storefront performance in India, isolated always-on NestJS process, and Neon's instant database branching/PITR for safe migration dry-runs.
- **Fallback / Budget-Conscious Recommendation:** **Option C — Railway Pro (Frontend + API + Managed PostgreSQL in Singapore)**
  - Ideal if Kiran's Infotech prefers a single monthly invoice, single dashboard, and lower starter cost (~₹1,500–₹2,510/month) while keeping clean Docker/Node portability.

**Approval Gate:** Do not create paid accounts or provision production resources until the client signs `docs/CLIENT_APPROVAL_FORM.md`.
