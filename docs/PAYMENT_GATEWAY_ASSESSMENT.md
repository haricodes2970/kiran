# Kiran's Infotech — Payment Gateway Readiness Assessment

## 1. Current Status
- **Active Mode:** `ORDER_REQUEST_ONLY` (`ONLINE_PAYMENT_ENABLED=false`).
- Customers submit cart order requests (`POST /api/v1/orders`) which validate stock, decrement inventory transactionally, preserve `OrderItem` price snapshots, and create a `Payment` record (`OFFLINE_OR_PAY_AT_STORE`, `PENDING`).
- **Readiness Endpoint:** `GET /api/v1/payments/status` exposes current checkout mode without enabling live charges.

---

## 2. Recommended India-Compatible Provider: Razorpay

If the client approves online checkout in a later phase, **Razorpay** is recommended for Indian retail & B2B hardware sales:
- Supports UPI (GPay, PhonePe, Paytm), RuPay/Visa/Mastercard, NetBanking, and corporate cards in INR (`₹`).
- Standard transaction fee: ~2% + 18% GST per successful domestic transaction.

---

## 3. Required Security & Financial Architecture (When Approved)

1. **Server-Side Order Creation:** Never trust client-supplied totals. Create the Razorpay Order (`amount` in paise) on the NestJS server from validated DB product prices inside a transaction.
2. **Checkout Signature Verification:** Verify `razorpay_order_id + "|" + razorpay_payment_id` against `RAZORPAY_KEY_SECRET` via `HMAC-SHA256` + `crypto.timingSafeEqual` (boundary implemented in `PaymentsService.verifyRazorpayCheckoutSignature`).
3. **Webhook Verification & Idempotency:** Verify `X-Razorpay-Signature` against `RAZORPAY_WEBHOOK_SECRET` on raw request body bytes (`PaymentsService.verifyRazorpayWebhookSignature`). Deduplicate `payment.captured` / `refund.processed` events by `providerReference` so retries never double-mark orders.
4. **No Raw Card Storage:** Never collect, log, or store card PAN, CVV, or expiry in Kiran's Infotech database.
5. **Refunds & Audit Trail:** Record refund initiation and webhook confirmation in `Payment` (`REFUNDED`) and `AuditLog`.
