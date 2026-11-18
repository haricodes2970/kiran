import { OrdersService } from './orders.service';

describe('OrdersService Idempotency Unit Tests', () => {
  it('returns existing order without duplicate creation or double inventory decrement when idempotencyKey matches', async () => {
    let inventoryQty = 5;
    let orderCreates = 0;
    const auditLogs: Array<{
      actorId: string;
      action: string;
      entityType: string;
      entityId: string;
      safeMetadata: string;
    }> = [];
    const storedOrders: Record<string, any> = {};

    const mockTx: any = {
      auditLog: {
        findFirst: async ({ where }: any) =>
          auditLogs.find(
            (l) =>
              l.actorId === where.actorId &&
              l.action === where.action &&
              l.entityType === where.entityType &&
              l.safeMetadata === where.safeMetadata,
          ) ?? null,
        create: async ({ data }: any) => {
          auditLogs.push(data);
          return data;
        },
      },
      product: {
        findUnique: async () => ({
          id: 'prod-1',
          name: 'USB-C Hub',
          sku: 'SKU-1',
          sellingPrice: 1500,
          costPrice: 1000,
          status: 'PUBLISHED',
          inventory: { id: 'inv-1', quantity: inventoryQty },
        }),
      },
      inventory: {
        update: async ({ data }: any) => {
          inventoryQty =
            typeof data.quantity === 'number'
              ? data.quantity
              : inventoryQty - (data.quantity?.decrement ?? 0);
          return { id: 'inv-1', quantity: inventoryQty };
        },
      },
      inventoryTransaction: {
        create: async () => ({}),
      },
      order: {
        findUnique: async ({ where }: any) => storedOrders[where.id] ?? null,
        create: async ({ data }: any) => {
          orderCreates += 1;
          const created = {
            id: `order-${orderCreates}`,
            reference: data.reference,
            status: data.status,
            paymentStatus: data.paymentStatus,
            totalAmount: data.totalAmount,
            items: data.items.create,
            payments: data.payments.create,
          };
          storedOrders[created.id] = created;
          return created;
        },
      },
    };

    const mockPrisma: any = {
      $transaction: async (cb: (tx: any) => Promise<any>) => cb(mockTx),
    };

    const mockAudit: any = { log: async () => {} };
    const service = new OrdersService(mockPrisma, mockAudit);

    const payload = {
      items: [{ productId: 'prod-1', quantity: 2 }],
      shippingRecipient: 'Asha Patil',
      shippingPhone: '+919876543210',
      shippingAddressText: 'MG Road, Pune',
      idempotencyKey: 'checkout-key-001',
    };

    const first = await service.createOrder('cust-1', payload as any);
    const second = await service.createOrder('cust-1', payload as any);

    expect(orderCreates).toBe(1);
    expect(inventoryQty).toBe(3);
    expect(second.id).toBe(first.id);
    expect(second.reference).toBe(first.reference);
  });
});
