# Admin Dashboard User Guide (Phase 4I)

**Portal URL:** `https://<client-domain>/admin`

## 1. Managing Order Requests (`ORDER_REQUEST_ONLY`)
1. Open **Admin -> Orders** to view incoming customer requests (`PENDING_CONFIRMATION`).
2. Call or message the customer to confirm stock, delivery/pickup slot, and offline payment method (UPI/cash/card at store).
3. Update status: `CONFIRMED` -> `PACKED` / `READY_FOR_PICKUP` -> `COMPLETED`.
4. Mark **Payment Status** as `PAID` once collected.
5. If cancelled, set status to `CANCELLED` — product stock and refurbished unit availability are automatically restored.

## 2. Managing Repair Tickets & Quotations
1. Open **Admin -> Repairs** to see new repair bookings (`RECEIVED`).
2. Log inspection notes and create an itemized **Quotation** (`QUOTATION_SENT`).
3. Once customer approves, move through `IN_REPAIR` -> `QUALITY_CHECK` -> `READY_FOR_PICKUP` -> `DELIVERED`.

## 3. Refurbished Laptops & Used-Laptop Buybacks
- **Used Laptop Submissions:** Review customer-submitted laptop specs/photos under **Admin -> Buyback**, propose an offer price, and schedule inspection.
- **Refurbished Inventory:** Add inspected units with serial number, battery health %, condition grade (`GRADE_A_EXCELLENT`, etc.), and warranty months; set status `READY_FOR_SALE` to publish to the storefront.

## 4. Products & Stock Alerts
- Keep `Inventory.lowStockThreshold` set appropriately; monitor low-stock alerts in **Admin -> Inventory** and adjust stock with reason codes.
