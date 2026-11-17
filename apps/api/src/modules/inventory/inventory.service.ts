import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AdjustInventoryDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(filter?: 'all' | 'low_stock' | 'out_of_stock') {
    const inventories = await this.prisma.inventory.findMany({
      include: {
        product: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
            images: { take: 1, orderBy: { sortOrder: 'asc' } },
          },
        },
        transactions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            actor: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { quantity: 'asc' },
    });

    const mapped = inventories.map((inv) => {
      const available = Math.max(0, inv.quantity - inv.reservedQuantity);
      const isOutOfStock = available === 0;
      const isLowStock = available > 0 && available <= inv.lowStockThreshold;
      return {
        ...inv,
        availableQuantity: available,
        isOutOfStock,
        isLowStock,
        product: {
          ...inv.product,
          costPrice: Number(inv.product.costPrice),
          sellingPrice: Number(inv.product.sellingPrice),
        },
      };
    });

    if (filter === 'out_of_stock') {
      return mapped.filter((m) => m.isOutOfStock);
    }
    if (filter === 'low_stock') {
      return mapped.filter((m) => m.isLowStock);
    }
    return mapped;
  }

  async adjustStock(dto: AdjustInventoryDto, actorId?: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
        include: { inventory: true },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      let inv = product.inventory;
      if (!inv) {
        inv = await tx.inventory.create({
          data: {
            productId: product.id,
            quantity: 0,
            reservedQuantity: 0,
            lowStockThreshold: dto.lowStockThreshold ?? 3,
          },
        });
      }

      const previousQty = inv.quantity;
      const resultingQty = previousQty + dto.changeQuantity;

      if (resultingQty < 0) {
        throw new BadRequestException(
          `Stock adjustment would result in negative quantity (${resultingQty}). Current stock: ${previousQty}`,
        );
      }

      const updatedInv = await tx.inventory.update({
        where: { id: inv.id },
        data: {
          quantity: resultingQty,
          ...(dto.lowStockThreshold !== undefined
            ? { lowStockThreshold: dto.lowStockThreshold }
            : {}),
        },
        include: {
          product: { select: { id: true, sku: true, name: true, slug: true } },
        },
      });

      const transactionRecord = await tx.inventoryTransaction.create({
        data: {
          inventoryId: inv.id,
          changeQuantity: dto.changeQuantity,
          previousQty,
          resultingQty,
          reason: dto.reason,
          notes: dto.notes ?? null,
          actorId: actorId ?? null,
        },
      });

      return {
        inventory: {
          ...updatedInv,
          availableQuantity: Math.max(
            0,
            updatedInv.quantity - updatedInv.reservedQuantity,
          ),
        },
        transaction: transactionRecord,
      };
    });

    await this.auditService.log({
      actorId,
      action: 'INVENTORY_ADJUSTED',
      entityType: 'Inventory',
      entityId: result.inventory.id,
      metadata: {
        productId: dto.productId,
        changeQuantity: dto.changeQuantity,
        resultingQty: result.inventory.quantity,
        reason: dto.reason,
      },
    });

    return result;
  }

  async getTransactions(productId: string) {
    const inv = await this.prisma.inventory.findUnique({
      where: { productId },
      include: {
        product: { select: { id: true, sku: true, name: true } },
        transactions: {
          orderBy: { createdAt: 'desc' },
          include: {
            actor: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
    if (!inv) {
      throw new NotFoundException('Inventory record not found for product');
    }
    return inv;
  }
}
