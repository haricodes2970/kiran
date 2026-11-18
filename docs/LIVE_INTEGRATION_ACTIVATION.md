# Live Integration Activation Checklists (Phase 4F)

> **Current State:** All external integrations remain in **Sandbox Mode** (`LIVE_EMAIL_ENABLED=false`, `LIVE_WHATSAPP_ENABLED=false`, `LIVE_STORAGE_ENABLED=false`, `ONLINE_PAYMENT_ENABLED=false`). Do not activate without client credentials and approval.

## 1. Business Email Activation (`EmailService`)
- [ ] Add DNS `SPF`, `DKIM`, and `DMARC` TXT records for `<client-domain>` in Resend or SMTP provider.
- [ ] Set `EMAIL_PROVIDER` (`resend` or `smtp`), `EMAIL_FROM`, and `RESEND_API_KEY` (or `SMTP_*`) in Render environment secrets.
- [ ] Set `LIVE_EMAIL_ENABLED=true` and redeploy API.
- [ ] Test order confirmation and repair booking email delivery to a client inbox; verify `EMAIL_SENT_IDEMPOTENCY` entries in `audit_logs`.

## 2. WhatsApp Business Cloud API Activation (`WhatsappService`)
- [ ] Verify business display name and phone number in Meta Business Manager.
- [ ] Submit and approve message templates (`order_request_received`, `repair_status_update`, `quotation_ready`).
- [ ] Set `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, and `WHATSAPP_WEBHOOK_VERIFY_TOKEN` in Render secrets.
- [ ] Set `LIVE_WHATSAPP_ENABLED=true` and test against an internal staff number first.

## 3. Media Storage Activation (`StorageService`)
- [ ] Create Cloudinary (or S3) bucket with unsigned uploads disabled.
- [ ] Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in Render secrets.
- [ ] Set `LIVE_STORAGE_ENABLED=true` and verify image upload + URL rendering on product/refurbished pages.
