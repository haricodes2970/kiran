import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { PrismaService } from '../src/prisma/prisma.service';
import { stopEmbeddedPostgres } from '../src/prisma/embedded-pg';
import { seedDatabase } from '../prisma/seed';

describe("Kiran's Infotech Complete Phase 2 Stabilization E2E Suite", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let adminToken: string;
  let customerAToken: string;
  let customerBToken: string;

  beforeAll(async () => {
    process.env.PGLITE_DATA_DIR = 'memory://';
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@127.0.0.1:5433/postgres?schema=public&sslmode=disable&connection_limit=1';
    process.env.JWT_SECRET = 'e2e-test-secret-key-kirans-infotech-2026';
    process.env.DEMO_MODE = 'true';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
    await seedDatabase(prisma);
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    await stopEmbeddedPostgres();
  });

  it('1. API root (/api/v1), health check (/api/v1/health), and public site content respond with 200 OK', async () => {
    const rootRes = await request(app.getHttpServer())
      .get('/api/v1')
      .expect(200);
    expect(rootRes.body.status).toBe('ok');
    expect(rootRes.body.database).toBe('connected');

    const healthRes = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);
    expect(healthRes.body.status).toBe('ok');
    expect(healthRes.body.demoMode).toBe(true);

    const contentRes = await request(app.getHttpServer())
      .get('/api/v1/site-content')
      .expect(200);
    expect(contentRes.body.business_info).toBeDefined();
    expect(contentRes.body.hero_banner).toBeDefined();
  });

  it('2. Guest browsing, search, filtering, sorting, and privacy stripping work across catalogue, refurbished, and services', async () => {
    const prodRes = await request(app.getHttpServer())
      .get('/api/v1/products?limit=20&sortBy=price_asc')
      .expect(200);

    expect(prodRes.body.data.length).toBe(20);
    expect(prodRes.body.data[0].costPrice).toBeUndefined();
    expect(prodRes.body.data[0].sellingPrice).toBeLessThanOrEqual(
      prodRes.body.data[1].sellingPrice,
    );

    // Search & filter by brand + inStock
    const dellRes = await request(app.getHttpServer())
      .get('/api/v1/products?brand=Dell&inStock=true&search=Latitude')
      .expect(200);
    expect(dellRes.body.data.length).toBeGreaterThan(0);
    expect(dellRes.body.data[0].brand).toBe('Dell');
    expect(dellRes.body.data[0].specifications.length).toBeGreaterThan(0);

    // Refurbished listing & detail with 40-point inspection report
    const refurbRes = await request(app.getHttpServer())
      .get('/api/v1/refurbished')
      .expect(200);
    expect(refurbRes.body.data.length).toBe(6);
    for (const dev of refurbRes.body.data) {
      expect(dev.status).toBe('PUBLISHED');
      expect(dev.acquisitionCost).toBeUndefined();
      expect(dev.refurbishmentCost).toBeUndefined();
    }

    const refurbDetail = await request(app.getHttpServer())
      .get(`/api/v1/refurbished/${refurbRes.body.data[0].slug}`)
      .expect(200);
    expect(refurbDetail.body.inspections.length).toBeGreaterThan(0);
    expect(refurbDetail.body.inspections[0].screenCheck).toBeDefined();

    // Services listing & detail
    const svcRes = await request(app.getHttpServer())
      .get('/api/v1/services')
      .expect(200);
    expect(svcRes.body.services.length).toBe(10);

    const svcDetail = await request(app.getHttpServer())
      .get(`/api/v1/services/${svcRes.body.services[0].slug}`)
      .expect(200);
    expect(svcDetail.body.title).toBe(svcRes.body.services[0].title);
  });

  it('3. Customer registration, login, logout, session persistence, OTP, profile & address book work and enforce RBAC', async () => {
    // Register a new customer
    const regRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: 'Kiran Test Customer',
        email: 'newcustomer@example.demo',
        phone: '+919899001122',
        password: 'NewCustomer@2026!',
      })
      .expect(201);
    expect(regRes.body.user.passwordHash).toBeUndefined();
    expect(regRes.body.user.roles).toEqual(['CUSTOMER']);

    // Verify session persistence via /auth/me
    const meRes = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${regRes.body.accessToken}`)
      .expect(200);
    expect(meRes.body.email).toBe('newcustomer@example.demo');

    // Update profile and add/delete address
    const profRes = await request(app.getHttpServer())
      .patch('/api/v1/me/profile')
      .set('Authorization', `Bearer ${regRes.body.accessToken}`)
      .send({ companyName: 'Test Corp', gstNumber: '27AABCT1234R1ZM' })
      .expect(200);
    expect(profRes.body.customerProfile.companyName).toBe('Test Corp');

    const addrRes = await request(app.getHttpServer())
      .post('/api/v1/me/addresses')
      .set('Authorization', `Bearer ${regRes.body.accessToken}`)
      .send({
        label: 'Office',
        recipient: 'Kiran Test Customer',
        phone: '+919899001122',
        addressLine1: '101 Cyber Tower, Baner',
        city: 'Pune',
        state: 'Maharashtra',
        postalCode: '411045',
      })
      .expect(201);
    expect(addrRes.body.city).toBe('Pune');

    await request(app.getHttpServer())
      .delete(`/api/v1/me/addresses/${addrRes.body.id}`)
      .set('Authorization', `Bearer ${regRes.body.accessToken}`)
      .expect(200);

    // Logout clears cookie
    await request(app.getHttpServer()).post('/api/v1/auth/logout').expect(200);

    // Mobile OTP flow
    await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ phone: '+919820100101' })
      .expect(200);

    const otpVerify = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/verify')
      .send({ phone: '+919820100101', otp: '123456' })
      .expect(200);
    expect(otpVerify.body.accessToken).toBeDefined();

    // Authenticate Admin, Customer A, and Customer B
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@kiransinfotech.demo',
        password: 'Admin@Kiran2026!',
      })
      .expect(200);
    adminToken = adminLogin.body.accessToken;

    const custALogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'rahul.sharma@example.demo',
        password: 'Customer@2026!',
      })
      .expect(200);
    customerAToken = custALogin.body.accessToken;

    const custBLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'priya.patel@example.demo',
        password: 'Customer@2026!',
      })
      .expect(200);
    customerBToken = custBLogin.body.accessToken;

    // Customer cannot access /admin/*
    await request(app.getHttpServer())
      .get('/api/v1/admin/dashboard/overview')
      .set('Authorization', `Bearer ${customerAToken}`)
      .expect(403);
  });

  it('4. Admin Category, Product, and Service CRUD reflect immediately on public storefront', async () => {
    // Admin creates category
    const catRes = await request(app.getHttpServer())
      .post('/api/v1/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Enterprise Networking',
        description: 'Switches, firewalls, and Wi-Fi 6 access points',
      })
      .expect(201);

    // Admin creates & publishes product in that category
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sku: 'KI-LAP-E2E-1',
        slug: 'hp-elitebook-640-g10-e2e',
        name: 'HP EliteBook 640 G10 Enterprise Notebook',
        brand: 'HP',
        model: 'EliteBook 640 G10',
        description: 'Enterprise 14-inch notebook created during E2E test.',
        costPrice: 58000,
        sellingPrice: 67500,
        categoryId: catRes.body.id,
        initialStock: 4,
        status: 'PUBLISHED',
      })
      .expect(201);

    const productId = createRes.body.id;

    // Visible on public storefront
    const publicDetail = await request(app.getHttpServer())
      .get('/api/v1/products/hp-elitebook-640-g10-e2e')
      .expect(200);
    expect(publicDetail.body.name).toBe('HP EliteBook 640 G10 Enterprise Notebook');
    expect(publicDetail.body.availableQuantity).toBe(4);
    expect(publicDetail.body.costPrice).toBeUndefined();

    // Unpublish hides it from public storefront
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'DRAFT' })
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/v1/products/hp-elitebook-640-g10-e2e')
      .expect(404);

    // Re-publish
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PUBLISHED' })
      .expect(200);

    // Admin creates a hardware service -> appears publicly
    const adminSvcs = await request(app.getHttpServer())
      .get('/api/v1/admin/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const newSvc = await request(app.getHttpServer())
      .post('/api/v1/admin/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId: adminSvcs.body.categories[0].id,
        title: 'BIOS Recovery & Firmware Reprogramming',
        shortSummary: 'Hardware SPI programmer recovery for corrupted laptop BIOS chips.',
        description: 'Direct SOIC-8 SPI flash recovery and ME region cleanup.',
        basePrice: 1400,
      })
      .expect(201);

    const pubSvc = await request(app.getHttpServer())
      .get(`/api/v1/services/${newSvc.body.slug}`)
      .expect(200);
    expect(pubSvc.body.title).toBe('BIOS Recovery & Firmware Reprogramming');
  });

  it('5. Admin stock adjustment & movement ledger work and prevent negative stock', async () => {
    const detailBefore = await request(app.getHttpServer())
      .get('/api/v1/products/hp-elitebook-640-g10-e2e')
      .expect(200);
    const productId = detailBefore.body.id;

    // Deduct 4 units -> stock becomes 0
    await request(app.getHttpServer())
      .post('/api/v1/admin/inventory/adjustments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        productId,
        changeQuantity: -4,
        reason: 'MANUAL_ADJUSTMENT',
        notes: 'Display unit allocation',
      })
      .expect(201);

    // Negative stock attempt (-1 when stock is 0) must be rejected with 400
    await request(app.getHttpServer())
      .post('/api/v1/admin/inventory/adjustments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        productId,
        changeQuantity: -1,
        reason: 'MANUAL_ADJUSTMENT',
      })
      .expect(400);

    // Out-of-stock order attempt must fail with 400
    await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerAToken}`)
      .send({
        items: [{ productId, quantity: 1 }],
        shippingRecipient: 'Rahul Sharma',
        shippingPhone: '+919820100101',
        shippingAddressText: 'Pune 411038',
      })
      .expect(400);

    // Restock +3 units
    await request(app.getHttpServer())
      .post('/api/v1/admin/inventory/adjustments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        productId,
        changeQuantity: 3,
        reason: 'RESTOCK',
      })
      .expect(201);

    // Verify movement ledger
    const txRes = await request(app.getHttpServer())
      .get(`/api/v1/admin/inventory/${productId}/transactions`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(txRes.body.transactions.length).toBeGreaterThanOrEqual(3);
  });

  it('6. Customer enquiry, Used-Laptop Buyback submission, and Admin Refurbished Lifecycle + Inspection work', async () => {
    // Customer submits enquiry
    const enqRes = await request(app.getHttpServer())
      .post('/api/v1/enquiries')
      .set('Authorization', `Bearer ${customerAToken}`)
      .send({
        subject: 'Need 2x HP EliteBook 640 G10',
        message: 'Can I pick up 2 units tomorrow morning?',
        contactPhone: '+919820100101',
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/enquiries/${enqRes.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'FOLLOWED_UP',
        followUpSummary: 'Units reserved at showroom counter.',
        internalNotes: 'Private sales note.',
      })
      .expect(200);

    const myEnq = await request(app.getHttpServer())
      .get('/api/v1/me/enquiries')
      .set('Authorization', `Bearer ${customerAToken}`)
      .expect(200);
    const matched = myEnq.body.find((e: any) => e.id === enqRes.body.id);
    expect(matched.status).toBe('FOLLOWED_UP');
    expect(matched.followUpSummary).toBe('Units reserved at showroom counter.');
    expect(matched.internalNotes).toBeUndefined();

    // Customer submits used-laptop buyback request
    const sellRes = await request(app.getHttpServer())
      .post('/api/v1/used-device-submissions')
      .set('Authorization', `Bearer ${customerAToken}`)
      .send({
        brand: 'Lenovo',
        model: 'ThinkPad T480',
        processor: 'Intel Core i5-8250U',
        ram: '16GB DDR4',
        storage: '512GB SSD',
        ageMonths: 36,
        conditionSummary: 'Clean unit with dual battery and charger.',
        expectedPrice: 14500,
        contactPhone: '+919820100101',
      })
      .expect(201);
    expect(sellRes.body.reference).toMatch(/^SELL-/);

    // Admin evaluates buyback request
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/used-device-submissions/${sellRes.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'OFFER_MADE',
        offeredPrice: 13800,
        adminNotes: 'Private buyback margin note',
      })
      .expect(200);

    // Admin creates refurbished device & logs inspection report
    const newRefurb = await request(app.getHttpServer())
      .post('/api/v1/admin/refurbished-devices')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Lenovo ThinkPad T480 Refurbished (Core i5 / 16GB / 512GB)',
        brand: 'Lenovo',
        model: 'ThinkPad T480',
        serialNumber: 'PF1T480E2E',
        processor: 'Intel Core i5-8250U',
        ram: '16GB DDR4',
        storage: '512GB SSD',
        display: '14" FHD IPS',
        acquisitionCost: 13800,
        refurbishmentCost: 1200,
        sellingPrice: 21900,
        status: 'PUBLISHED',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/admin/refurbished-devices/${newRefurb.body.id}/inspections`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        inspectorName: 'Suresh K.',
        screenCheck: 'Pass',
        keyboardTrackpad: 'Pass',
        portsConnectivity: 'Pass',
        thermalsFan: 'Pass',
        batteryHealthReport: '87% Dual Battery',
        storageSmartHealth: '99% SMART',
        overallVerdict: 'Grade-A Approved',
      })
      .expect(201);
  });

  it('7. Repair booking, status timeline, private note isolation, quotation approval, and IDOR protection work', async () => {
    const bookingRes = await request(app.getHttpServer())
      .post('/api/v1/repair-bookings')
      .set('Authorization', `Bearer ${customerAToken}`)
      .send({
        deviceType: 'Laptop',
        brand: 'Lenovo',
        model: 'ThinkPad T14',
        issueCategory: 'Display / Flickering',
        issueDescription: 'Screen flickers when adjusting lid angle.',
        customerPhone: '+919820100101',
      })
      .expect(201);

    const bookingId = bookingRes.body.id;
    const reference = bookingRes.body.reference;

    // Customer B is blocked from viewing Customer A's repair booking
    await request(app.getHttpServer())
      .get(`/api/v1/me/repair-bookings/${reference}`)
      .set('Authorization', `Bearer ${customerBToken}`)
      .expect(403);

    // Admin updates status with both public message and private technician note
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/repair-bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'DIAGNOSING',
        customerVisibleMessage: 'Testing eDP display cable continuity.',
        internalNote: 'Private technician note: 30-pin eDP cable FRU 01YR421.',
      })
      .expect(200);

    // Admin issues quotation
    const quoRes = await request(app.getHttpServer())
      .post(`/api/v1/admin/repair-bookings/${bookingId}/quotations`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        diagnosisDetails: 'Replace 30-pin eDP display flex cable',
        partsCost: 1200,
        labourCost: 600,
        taxAmount: 324,
      })
      .expect(201);

    // Customer A views repair timeline -> sees public message, never sees internalNote
    const custTrack = await request(app.getHttpServer())
      .get(`/api/v1/me/repair-bookings/${reference}`)
      .set('Authorization', `Bearer ${customerAToken}`)
      .expect(200);

    for (const upd of custTrack.body.updates) {
      expect(upd.internalNote).toBeUndefined();
    }

    // Customer A approves quotation
    const approveRes = await request(app.getHttpServer())
      .post(
        `/api/v1/me/repair-bookings/${bookingId}/quotations/${quoRes.body.id}/respond`,
      )
      .set('Authorization', `Bearer ${customerAToken}`)
      .send({
        decision: 'APPROVED',
        customerResponseNote: 'Please proceed with the cable replacement.',
      })
      .expect(201);

    expect(approveRes.body.status).toBe('APPROVED');
  });

  it('8. Order lifecycle: stock decrement, immutable price snapshot, single-sale refurbished protection, and stock restoration on cancellation', async () => {
    const productRes = await request(app.getHttpServer())
      .get('/api/v1/products/hp-elitebook-640-g10-e2e')
      .expect(200);
    const productId = productRes.body.id;

    const refurbList = await request(app.getHttpServer())
      .get('/api/v1/refurbished')
      .expect(200);
    const refurbDevice = refurbList.body.data[0];

    const orderRes = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerAToken}`)
      .send({
        items: [
          { productId, quantity: 1 },
          { refurbishedDeviceId: refurbDevice.id, quantity: 1 },
        ],
        fulfilmentType: 'STORE_PICKUP',
        shippingRecipient: 'Rahul Sharma',
        shippingPhone: '+919820100101',
        shippingAddressText: 'Pune 411038',
      })
      .expect(201);

    // Customer B cannot read Customer A's order
    await request(app.getHttpServer())
      .get(`/api/v1/me/orders/${orderRes.body.reference}`)
      .set('Authorization', `Bearer ${customerBToken}`)
      .expect(403);

    // Stock decremented from 3 to 2
    const productAfterOrder = await request(app.getHttpServer())
      .get('/api/v1/products/hp-elitebook-640-g10-e2e')
      .expect(200);
    expect(productAfterOrder.body.availableQuantity).toBe(2);

    // Admin changes product price from 67500 to 72000 -> existing order snapshot must stay 67500!
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ sellingPrice: 72000 })
      .expect(200);

    const orderCheck = await request(app.getHttpServer())
      .get(`/api/v1/me/orders/${orderRes.body.reference}`)
      .set('Authorization', `Bearer ${customerAToken}`)
      .expect(200);
    const orderedProductItem = orderCheck.body.items.find(
      (i: any) => i.productId === productId,
    );
    expect(orderedProductItem.unitPrice).toBe(67500);

    // Refurbished device is SOLD and cannot be ordered a second time
    await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerBToken}`)
      .send({
        items: [{ refurbishedDeviceId: refurbDevice.id, quantity: 1 }],
        shippingRecipient: 'Priya Patel',
        shippingPhone: '+919820100102',
        shippingAddressText: 'Mumbai',
      })
      .expect(400);

    // Admin cancels the order -> stock is restored (from 2 back to 3) and refurbished unit is PUBLISHED again!
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/orders/${orderRes.body.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CANCELLED' })
      .expect(200);

    const productAfterCancel = await request(app.getHttpServer())
      .get('/api/v1/products/hp-elitebook-640-g10-e2e')
      .expect(200);
    expect(productAfterCancel.body.availableQuantity).toBe(3);
  });

  it('9. Admin Customer Directory, Site Content CMS, Financial Reports, Audit Logs, and Demo Seed Protection work', async () => {
    const custList = await request(app.getHttpServer())
      .get('/api/v1/admin/customers')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(custList.body.length).toBeGreaterThanOrEqual(10);
    expect(custList.body[0].passwordHash).toBeUndefined();

    const custDetail = await request(app.getHttpServer())
      .get(`/api/v1/admin/customers/${custList.body[0].id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(custDetail.body.passwordHash).toBeUndefined();
    expect(Array.isArray(custDetail.body.orders)).toBe(true);

    // Admin updates site content -> public site-content reflects change
    await request(app.getHttpServer())
      .put('/api/v1/admin/site-content/promo_notice')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Special Promo Notice',
        contentJson: JSON.stringify({ banner: 'Free RAM installation this week!' }),
        published: true,
      })
      .expect(200);

    const pubPromo = await request(app.getHttpServer())
      .get('/api/v1/site-content/promo_notice')
      .expect(200);
    expect(pubPromo.body.content.banner).toBe('Free RAM installation this week!');

    // Reports & Audit logs
    const repRes = await request(app.getHttpServer())
      .get('/api/v1/admin/reports/summary')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(repRes.body.salesReport.paidRevenue).toBeGreaterThan(0);
    expect(repRes.body.salesReport.knownPurchaseCostBasis).toBeGreaterThan(0);

    const auditRes = await request(app.getHttpServer())
      .get('/api/v1/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(auditRes.body.data.length).toBeGreaterThan(0);

    // Production seed safety check
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    delete process.env.ALLOW_DEMO_SEED_IN_PROD;
    try {
      await expect(seedDatabase(prisma)).rejects.toThrow(/SAFETY ABORT/);
    } finally {
      process.env.NODE_ENV = prevEnv;
    }
  });
});
