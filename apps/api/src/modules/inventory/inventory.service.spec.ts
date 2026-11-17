import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InventoryTransactionReason } from '@prisma/client';
import { InventoryService } from './inventory.service';

describe('InventoryService Unit Tests', () => {
  let service: InventoryService;
  let mockPrisma: any;
  let mockAudit: any;

  beforeEach(() => {
    mockPrisma = {
      $transaction: jest.fn((cb) => cb(mockPrisma)),
      product: {
        findUnique: jest.fn(),
      },
      inventory: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      inventoryTransaction: {
        create: jest.fn(),
      },
    };
    mockAudit = {
      log: jest.fn().mockResolvedValue({}),
    };
    service = new InventoryService(mockPrisma, mockAudit);
  });

  it('throws NotFoundException when adjusting stock for non-existent product', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null);

    await expect(
      service.adjustStock({
        productId: 'missing-id',
        changeQuantity: 5,
        reason: InventoryTransactionReason.RESTOCK,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when stock adjustment results in negative inventory', async () => {
    mockPrisma.product.findUnique.mockResolvedValue({
      id: 'prod-1',
      inventory: {
        id: 'inv-1',
        productId: 'prod-1',
        quantity: 3,
        reservedQuantity: 0,
        lowStockThreshold: 2,
      },
    });

    await expect(
      service.adjustStock({
        productId: 'prod-1',
        changeQuantity: -5,
        reason: InventoryTransactionReason.MANUAL_ADJUSTMENT,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('updates stock quantity and records an InventoryTransaction on valid adjustment', async () => {
    mockPrisma.product.findUnique.mockResolvedValue({
      id: 'prod-1',
      inventory: {
        id: 'inv-1',
        productId: 'prod-1',
        quantity: 4,
        reservedQuantity: 0,
        lowStockThreshold: 3,
      },
    });
    mockPrisma.inventory.update.mockResolvedValue({
      id: 'inv-1',
      productId: 'prod-1',
      quantity: 10,
      reservedQuantity: 0,
      lowStockThreshold: 3,
      product: { id: 'prod-1', sku: 'KI-LAP-001', name: 'Dell Latitude', slug: 'dell' },
    });
    mockPrisma.inventoryTransaction.create.mockResolvedValue({
      id: 'tx-1',
      previousQty: 4,
      changeQuantity: 6,
      resultingQty: 10,
      reason: InventoryTransactionReason.RESTOCK,
    });

    const res = await service.adjustStock(
      {
        productId: 'prod-1',
        changeQuantity: 6,
        reason: InventoryTransactionReason.RESTOCK,
        notes: 'Supplier restock',
      },
      'admin-1',
    );

    expect(res.inventory.quantity).toBe(10);
    expect(res.inventory.availableQuantity).toBe(10);
    expect(res.transaction.resultingQty).toBe(10);
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'INVENTORY_ADJUSTED',
        actorId: 'admin-1',
      }),
    );
  });
});
