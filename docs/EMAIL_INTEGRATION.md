# Kiran's Infotech — Business Email Integration Guide

## 1. Architecture

`NotificationsModule` (`apps/api/src/modules/notifications/`) provides a provider-independent `EmailService` backed by the `EmailProvider` interface:
- **`SandboxEmailAdapter` (Default):** Active whenever `EMAIL_ENABLED !== 'true'` or credentials are unset. Logs emails safely without sending real messages.
- **`ResendEmailAdapter`:** Uses the Resend REST API (`RESEND_API_KEY`, `EMAIL_FROM`). Additional SMTP/SES adapters can implement `EmailProvider` without changing business services.

---

## 2. Supported Business Events (`EmailEventType`)

1. `CUSTOMER_REGISTRATION_VERIFICATION`
2. `PASSWORD_RESET`
3. `ORDER_REQUEST_CONFIRMATION`
4. `ORDER_STATUS_UPDATE`
5. `REPAIR_BOOKING_CONFIRMATION`
6. `REPAIR_STATUS_UPDATE`
7. `QUOTATION_NOTIFICATION`
8. `QUOTATION_APPROVAL_CONFIRMATION`
9. `ADMIN_ENQUIRY_NOTIFICATION`

All templates generate both **XSS-escaped HTML** and **plain-text** bodies, deduplicate repeated events via `idempotencyKey`, retry transient failures with backoff, and catch permanent provider errors so customer API requests never fail due to email downtime.

---

## 3. Required Client Setup Before Live Activation

1. Create a Resend (or SMTP) account and verify the business sending domain (`SPF`, `DKIM`, `DMARC` DNS records).
2. Set in backend environment:
   - `EMAIL_ENABLED=true`
   - `RESEND_API_KEY=<secret>`
   - `EMAIL_FROM="Kiran's Infotech <noreply@yourdomain.com>"`
