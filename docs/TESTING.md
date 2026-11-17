# Kiran's Infotech — Testing Strategy & Verification

## 1. Test Pyramid

1. **Unit Tests (`apps/api/src/**/*.spec.ts`):**
   - Stock adjustment math, low-stock threshold calculations, and negative stock prevention.
   - Order total, GST tax calculation, and price snapshot creation.
   - Refurbished lifecycle state transitions and single-sale protection.
   - Repair status transitions and customer-visible vs internal note filtering.
2. **API Integration / E2E Tests (`apps/api/test/*.e2e-spec.ts`):**
   - Guest browsing of published products, refurbished laptops, and services.
   - Strict filtering of unpublished/archived products and private `costPrice` / `acquisitionCost` fields from public endpoints.
   - Customer registration, login, and JWT session verification.
   - Role-based access control: `CUSTOMER` blocked from `/api/v1/admin/*` with `403 Forbidden`.
   - Customer data isolation (IDOR prevention): Customer A cannot read Customer B's orders, enquiries, or repair bookings.
   - Shared Admin -> Storefront live data flow:
     - Admin creates and publishes a product -> appears on `GET /api/v1/products`.
     - Admin adjusts stock -> product availability updates and `InventoryTransaction` is recorded.
     - Customer submits enquiry & repair booking -> both appear in admin endpoints.
     - Admin updates repair status with both public message and private internal note -> customer sees public update only.
     - Customer places order request -> stock decrements and order snapshot is preserved.

---

## 2. Running Tests

```bash
# Run backend unit tests
npm --workspace=apps/api run test

# Run backend integration / E2E test suite
npm --workspace=apps/api run test:e2e

# Run typecheck and lint across workspaces
npm run typecheck
npm run lint
```
