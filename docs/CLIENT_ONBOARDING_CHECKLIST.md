# Client Onboarding Checklist (Phase 4D)

> **Security Rule:** Never share passwords, API keys, or OTPs in plain chat or unencrypted email. Use a password manager share link or direct entry in the hosting dashboard.

## 1. Business & Legal Details
- [ ] Legal business name, store address, Google Maps pin, and opening hours
- [ ] GSTIN (if displaying GST-inclusive/tax invoices) and official support phone number
- [ ] Official business domain name (e.g., `kiransinfotech.in`) & DNS registrar access

## 2. Hosting & Database Accounts (Client-Owned)
- [ ] Primary Architecture Approved: **Vercel Pro** (Frontend) + **Render** (API) + **Neon** (PostgreSQL), OR Fallback: **Railway Pro**
- [ ] Billing card enabled on client's Vercel/Render/Neon (or Railway) accounts
- [ ] Developer collaborator invite sent (least-privilege deploy role, not billing owner)

## 3. Communications & Media (Optional / Phased)
- [ ] Verified business sender email domain (SPF, DKIM, DMARC records for Resend or SMTP)
- [ ] Official WhatsApp Business number & Meta Business Manager verification (for Cloud API)
- [ ] Cloudinary (or S3) account for product/refurbished laptop images

## 4. Initial Catalog & Admin Access
- [ ] Completed CSV sheets (`products.csv`, `refurbished.csv`, `services.csv`, `inventory.csv`)
- [ ] Admin email addresses for staff who need `/admin` dashboard access (initial passwords set via secure reset, never shared in chat)
