# Order Request Workflow & Inventory Semantics (Phase 4C)

**Active Purchase Mode:** `ORDER_REQUEST_ONLY` (`ONLINE_PAYMENT_ENABLED=false`)

---

## 1. Customer & Admin Lifecycle

1. **Customer Submits Order Request (`POST /api/v1/orders`):**
   - Frontend/API preserves `ORDER_REQUEST_ONLY`: no Razorpay/online card prompt is shown.
   - Optional `idempotencyKey` on `CreateOrderDto` prevents duplicate order requests from double-clicks or network retries. When a matching `ORDER_IDEMPOTENCY` audit record exists for the same customer, the API returns the original order without creating a second order or decrementing stock again.
   - Order is created atomically in a Prisma `$transaction`:
     - `status = PENDING_CONFIRMATION`
     - `paymentStatus = PENDING`
     - `Payment` record created with `provider = "OFFLINE_OR_PAY_AT_STORE"`, `status = PENDING`
     - `OrderItem` stores `unitPrice`, `costPriceSnapshot`, `productName`, `productSku`, and `lineTotal` snapshots.
2. **Inventory Reservation / Decrement:**
   - For standard `Product` items, `Inventory.quantity` is atomically decremented on order request creation (`decrement: reqItem.quantity`) after verifying `inventory.quantity >= reqItem.quantity`.
   - For `RefurbishedDevice` items (quantity must be `1`), `RefurbishedDevice.status` transitions from `READY_FOR_SALE` to `SOLD`.
3. **Admin Confirmation & Fulfilment (`PATCH /api/v1/orders/:id/status`):**
   - Admin contacts customer via phone/WhatsApp/email, confirms availability/delivery or store pickup, and updates status (`CONFIRMED` -> `PACKED` / `READY_FOR_PICKUP` -> `COMPLETED`).
   - When payment is collected at the store or via offline UPI/bank transfer, admin updates `paymentStatus` to `PAID` / `PAID_AT_STORE`.
4. **Cancellation & Automatic Inventory Restoration:**
   - If customer or admin cancels an order before completion (`CANCELLED`), `OrdersService` runs inside a transaction to:
     - Increment `Inventory.quantity` back for all `Product` items.
     - Restore `RefurbishedDevice.status` from `SOLD` back to `READY_FOR_SALE`.

---

## 2. Future Online Payment Readiness

- `PaymentsModule` and `rawBody: true` in `apps/api/src/main.ts` remain ready for future Razorpay integration.
- Online payments stay disabled (`ONLINE_PAYMENT_ENABLED=false`) until the client signs commercial payment gateway approval.
