# Kiran's Infotech — WhatsApp Business Integration Guide

## 1. Existing Click-to-Chat CTA (Preserved)
- Public storefront (`Navbar`, `Footer`, `ProductDetailPage`, `RefurbishedMarketplacePage`, `ServicesPage`, `ContactPage`) uses `buildWhatsAppUrl()` (`apps/web/src/lib/api.ts`) with `NEXT_PUBLIC_WHATSAPP_NUMBER`.
- This continues to work independently with zero external API keys.

---

## 2. Meta WhatsApp Cloud API Adapter (`WhatsappModule`)

Implemented in `apps/api/src/modules/whatsapp/`:
- **`SandboxWhatsAppAdapter` (Default):** Active when `WHATSAPP_CLOUD_ENABLED !== 'true'` or Meta tokens are unset. Masks phone numbers in logs and prevents accidental real dispatches.
- **`MetaCloudWhatsAppAdapter`:** Dispatches approved template messages via Meta Graph API (`v20.0`).
- **Webhook Verification:**
  - `GET /api/v1/webhooks/whatsapp` verifies `hub.verify_token` against `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
  - `POST /api/v1/webhooks/whatsapp` verifies `X-Hub-Signature-256` against `WHATSAPP_APP_SECRET` using raw body bytes and `crypto.timingSafeEqual`.

---

## 3. Approved Template Mapping & Messaging Rules

1. **24-Hour Customer Service Window:** Proactive outbound notifications outside a 24h customer-initiated session **must** use Meta-approved Utility Templates (`kiran_order_request_received`, `kiran_order_status_update`, `kiran_repair_booking_confirmed`, `kiran_repair_status_update`, `kiran_repair_quotation_ready`, `kiran_repair_quotation_approved`, `kiran_buyback_evaluation_update`, `kiran_admin_new_enquiry_alert`).
2. **Customer Consent:** `sendEventTemplate()` checks `customerOptedIn` and skips outbound customer templates when opted out.
3. **Required Client Credentials:** `WHATSAPP_CLOUD_ENABLED=true`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
