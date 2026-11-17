import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { PrismaService } from '../src/prisma/prisma.service';
import { stopEmbeddedPostgres } from '../src/prisma/embedded-pg';
import { seedDatabase } from '../prisma/seed';

describe("Kiran's Infotech Backend E2E Workflow Suite", () => {
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

  it('1. Health check and public site content load without login', async () => {
    const healthRes = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);
    expect(healthRes.body.status).toBe('ok');
    expect(healthRes.body.database).toBe('connected');
    expect(healthRes.body.demoMode).toBe(true);

    const contentRes = await request(app.getHttpServer())
      .get('/api/v1/site-content')
      .expect(200);
    expect(contentRes.body.business_info).toBeDefined();
    expect(contentRes.body.hero_banner).toBeDefined();
  });

  it('2. Guest browsing of products, refurbished laptops, and services hides private costs', async () => {
    const prodRes = await request(app.getHttpServer())
      .get('/api/v1/products?limit=20')
      .expect(200);

    expect(prodRes.body.data.length).toBe(20);
    expect(prodRes.body.data[0].costPrice).toBeUndefined();
    expect(prodRes.body.data[0].sellingPrice).toBeGreaterThan(0);

    const refurbRes = await request(app.getHttpServer())
      .get('/api/v1/refurbished')
      .expect(200);

    // Only PUBLISHED refurbished units (6 of the 8 seeded) should appear publicly
    expect(refurbRes.body.data.length).toBe(6);
    for (const dev of refurbRes.body.data) {
      expect(dev.status).toBe('PUBLISHED');
      expect(dev.acquisitionCost).toBeUndefined();
      expect(dev.refurbishmentCost).toBeUndefined();
    }

    const svcRes = await request(app.getHttpServer())
      .get('/api/v1/services')
      .expect(200);
    expect(svcRes.body.services.length).toBe(10);
  });

  it('3. Authenticates Admin and Demo Customers and blocks non-admin from /admin/*', async () => {
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@kiransinfotech.demo',
        password: 'Admin@Kiran2026!',
      })
      .expect(200);
    adminToken = adminLogin.body.accessToken;
    expect(adminLogin.body.user.roles).toContain('ADMIN');

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

    // Customer A cannot access admin overview
    await request(app.getHttpServer())
      .get('/api/v1/admin/dashboard/overview')
      .set('Authorization', `Bearer ${customerAToken}`)
      .expect(403);

    // Admin can access admin overview
    const dashRes = await request(app.getHttpServer())
      .get('/api/v1/admin/dashboard/overview')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(dashRes.body.metrics.totalProducts).toBe(20);
    expect(dashRes.body.metrics.totalCategories).toBe(8);
  });

  it('4. Admin creates and publishes a product -> appears on storefront; unpublish hides it', async () => {
    const cats = await request(app.getHttpServer())
      .get('/api/v1/categories')
      .expect(200);
    const laptopCatId = cats.body.find((c: any) => c.slug === 'laptops').id;

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
        categoryId: laptopCatId,
        initialStock: 4,
        status: 'PUBLISHED',
      })
      .expect(201);

    const productId = createRes.body.id;

    // Verify visible on public storefront
    const publicDetail = await request(app.getHttpServer())
      .get('/api/v1/products/hp-elitebook-640-g10-e2e')
      .expect(200);
    expect(publicDetail.body.name).toBe('HP EliteBook 640 G10 Enterprise Notebook');
    expect(publicDetail.body.availableQuantity).toBe(4);
    expect(publicDetail.body.costPrice).toBeUndefined();

    // Admin unpublishes product -> hidden from public storefront
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'DRAFT' })
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/v1/products/hp-elitebook-640-g10-e2e')
      .expect(404);

    // Re-publish for subsequent stock & order tests
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PUBLISHED' })
      .expect(200);
  });

  it('5. Admin stock adjustment updates storefront availability and blocks negative stock', async () => {
    const detailBefore = await request(app.getHttpServer())
      .get('/api/v1/products/hp-elitebook-640-g10-e2e')
      .expect(200);
    const productId = detailBefore.body.id;

    // Deduct 4 units -> stock becomes 0 (out of stock)
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

    const detailOut = await request(app.getHttpServer())
      .get('/api/v1/products/hp-elitebook-640-g10-e2e')
      .expect(200);
    expect(detailOut.body.inStock).toBe(false);
    expect(detailOut.body.availableQuantity).toBe(0);

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
  });

  it('6. Customer submits enquiry -> visible in Admin -> Admin updates status', async () => {
    // Guest enquiry blocked
    await request(app.getHttpServer())
      .post('/api/v1/enquiries')
      .send({
        subject: 'Guest enquiry test',
        message: 'Should require authentication',
      })
      .expect(401);

    // Authenticated customer submits enquiry
    const enqRes = await request(app.getHttpServer())
      .post('/api/v1/enquiries')
      .set('Authorization', `Bearer ${customerAToken}`)
      .send({
        subject: 'Need 2x HP EliteBook 640 G10',
        message: 'Can I pick up 2 units tomorrow morning?',
        contactPhone: '+919820100101',
      })
      .expect(201);

    expect(enqRes.body.reference).toMatch(/^ENQ-/);

    // Admin sees enquiry and updates status + internal note
    const adminUpdate = await request(app.getHttpServer())
      .patch(`/api/v1/admin/enquiries/${enqRes.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'FOLLOWED_UP',
        internalNotes: 'Called customer and reserved units.',
      })
      .expect(200);
    expect(adminUpdate.body.status).toBe('FOLLOWED_UP');

    // Customer sees updated status but NOT internalNotes
    const myEnq = await request(app.getHttpServer())
      .get('/api/v1/me/enquiries')
      .set('Authorization', `Bearer ${customerAToken}`)
      .expect(200);
    const matched = myEnq.body.find((e: any) => e.id === enqRes.body.id);
    expect(matched.status).toBe('FOLLOWED_UP');
    expect(matched.internalNotes).toBeUndefined();
  });

  it('7. Customer books repair -> Admin issues quotation & status update -> Customer approves & Customer B is isolated', async () => {
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
    expect(reference).toMatch(/^REP-/);

    // Customer B cannot read Customer A's repair booking (IDOR check -> 403)
    await request(app.getHttpServer())
      .get(`/api/v1/me/repair-bookings/${reference}`)
      .set('Authorization', `Bearer ${customerBToken}`)
      .expect(403);

    // Admin adds status update with both public message and private internal note
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

    // Customer A views repair booking -> sees public update & quotation, never sees internalNote
    const custTrack = await request(app.getHttpServer())
      .get(`/api/v1/me/repair-bookings/${reference}`)
      .set('Authorization', `Bearer ${customerAToken}`)
      .expect(200);

    expect(custTrack.body.status).toBe('QUOTATION_SENT');
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

  it('8. Order request decrements stock, preserves price snapshot, prevents double-selling refurbished laptop, and enforces ownership', async () => {
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

    expect(orderRes.body.reference).toMatch(/^ORD-/);

    // Customer B cannot access Customer A's order
    await request(app.getHttpServer())
      .get(`/api/v1/me/orders/${orderRes.body.reference}`)
      .set('Authorization', `Bearer ${customerBToken}`)
      .expect(403);

    // Product stock decremented from 3 to 2
    const productAfter = await request(app.getHttpServer())
      .get('/api/v1/products/hp-elitebook-640-g10-e2e')
      .expect(200);
    expect(productAfter.body.availableQuantity).toBe(2);

    // Refurbished device is now SOLD and cannot be ordered a second time!
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
  });

  it('9. Demo seed script refuses to run when NODE_ENV=production', async () => {
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
