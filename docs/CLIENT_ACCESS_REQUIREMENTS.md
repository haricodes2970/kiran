# Kiran's Infotech — Client Access & Credential Requirements

This document lists the external accounts, credentials, and business policies required from **Kiran's Infotech** before transitioning from the local/staging demonstration environment to live production.

---

## 1. Required Client Accounts & Access

| # | Area | Required From Client | Current Status |
| :--- | :--- | :--- | :--- |
| **A** | **Production PostgreSQL Database** | Managed PostgreSQL connection URI (`DATABASE_URL`) on Neon, Supabase, AWS RDS, or Railway with automated daily backups enabled. | **Awaiting Client Credentials** (Locally tested on PostgreSQL 16) |
| **B** | **WhatsApp Business Contact** | Official Kiran's Infotech WhatsApp Business number (`NEXT_PUBLIC_WHATSAPP_NUMBER`) for click-to-chat links. *(Optional Phase 3: Meta WhatsApp Cloud API credentials if automated template messages are desired).* | **Awaiting Client Phone Number** (Click-to-chat implemented & tested with configurable placeholder) |
| **C** | **Transactional Email (SMTP / Provider)** | Business email sender address (`EMAIL_FROM`) and SMTP/Resend/SendGrid credentials (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`). | **Awaiting Client Credentials** |
| **D** | **Domain & DNS** | Official domain name (e.g., `kiransinfotech.com` / `.in`) and DNS access to configure `A`/`CNAME` records for the web storefront and `api.` subdomain. | **Awaiting Client Access** |
| **E** | **Hosting Provider Approval** | Confirmation of Vercel (Frontend) and Render/Railway/Cloud Run (Backend API) hosting accounts under client billing ownership. | **Requires Client Approval** |
| **F** | **Media / Image Storage** | Cloudinary (or AWS S3 / Cloudflare R2) account credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) for production product & inspection photo uploads. | **Awaiting Client Credentials** |
| **G** | **Payment Gateway (Optional)** | Client decision on whether checkout remains **Order Request / Pay at Store** or integrates online payment (e.g., Razorpay `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`). | **Requires Client Approval** (Order Request flow implemented & locally tested) |
| **H** | **Google OAuth & SMS OTP (Optional)** | Google Cloud Console OAuth 2.0 Client ID/Secret and SMS DLT/OTP provider credentials (e.g., MSG91 / Twilio) if live SMS OTP is desired in production. | **Awaiting Client Credentials** (Integration boundaries & demo OTP implemented) |

---

## 2. Pending Business Policy Confirmations

1. **Guest Repair Booking Policy:** Should unauthenticated visitors be allowed to submit repair bookings (`ALLOW_GUEST_REPAIR_BOOKING=true`), or must customers sign in first (`false`, current default)?
2. **Checkout Fulfilment & Delivery Radius:** Confirm whether local courier delivery is offered alongside in-store showroom pickup, and any delivery fee rules.
3. **GST Invoice & Tax Display:** Confirm Kiran's Infotech GSTIN, state code, and whether listed prices are GST-inclusive across all product categories.
4. **Refurbished Warranty Terms:** Confirm standard store warranty duration (currently configured as 6 months for refurbished laptops) and return/replacement terms.
