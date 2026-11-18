import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FulfilmentType,
  InventoryTransactionReason,
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  RefurbishedStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { generateReference } from '../../common/utils/reference.util';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  private serializeCustomerOrder(order: any) {
    const { adminNotes, ...safe } = order;
    return {
      ...safe,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      taxAmount: Number(order.taxAmount),
      totalAmount: Number(order.totalAmount),
      items: Array.isArray(order.items)
        ? order.items.map(({ costPriceSnapshot, ...item }: any) => ({
            ...item,
            unitPrice: Number(item.unitPrice),
            lineTotal: Number(item.lineTotal),
          }))
        : [],
      payments: Array.isArray(order.payments)
        ? order.payments.map((p: any) => ({
            ...p,
            amount: Number(p.amount),
          }))
        : [],
    };
  }

  private serializeAdminOrder(order: any) {
    return {
      ...order,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      taxAmount: Number(order.taxAmount),
      totalAmount: Number(order.totalAmount),
      items: Array.isArray(order.items)
        ? order.items.map((item: any) => ({
            ...item,
            unitPrice: Number(item.unitPrice),
            costPriceSnapshot:
              item.costPriceSnapshot !== null ? Number(item.costPriceSnapshot) : null,
            lineTotal: Number(item.lineTotal),
          }))
        : [],
      payments: Array.isArray(order.payments)
        ? order.payments.map((p: any) => ({
            ...p,
            amount: Number(p.amount),
          }))
        : [],
    };
  }

  async createOrder(customerId: string, dto: CreateOrderDto) {
    const idempotencyKey = dto.idempotencyKey?.trim() || undefined;
    const reference = generateReference('ORD');

    const created = await this.prisma.$transaction(async (tx) => {
      if (idempotencyKey && tx.auditLog?.findFirst) {
        const existingLog = await tx.auditLog.findFirst({
          where: {
            actorId: customerId,
            action: 'ORDER_IDEMPOTENCY',
            entityType: 'Order',
            safeMetadata: idempotencyKey,
          },
          orderBy: { createdAt: 'desc' },
        });
        if (existingLog?.entityId) {
          const existingOrder = await tx.order.findUnique({
            where: { id: existingLog.entityId },
            include: { items: true, payments: true },
          });
          if (existingOrder) {
            return existingOrder;
          }
        }
      }

      const orderItemsData: Array<{
        productId?: string | null;
        refurbishedDeviceId?: string | null;
        itemType: string;
        productName: string;
        productSku: string;
        unitPrice: number;
        costPriceSnapshot: number;
        quantity: number;
        lineTotal: number;
      }> = [];

      let totalAmount = 0;

      for (const reqItem of dto.items) {
        if (reqItem.productId) {
          const product = await tx.product.findUnique({
            where: { id: reqItem.productId },
            include: { inventory: true },
          });

          if (!product || product.status !== ProductStatus.PUBLISHED) {
            throw new BadRequestException(
              `Product '${reqItem.productId}' is not available for purchase`,
            );
          }

          const inv = product.inventory;
          const available = inv ? inv.quantity - inv.reservedQuantity : 0;
          if (!inv || available < reqItem.quantity) {
            throw new BadRequestException(
              `Insufficient stock for '${product.name}'. Available: ${Math.max(0, available)}, Requested: ${reqItem.quantity}`,
            );
          }

          const newQty = inv.quantity - reqItem.quantity;
          await tx.inventory.update({
            where: { id: inv.id },
            data: { quantity: newQty },
          });

          await tx.inventoryTransaction.create({
            data: {
              inventoryId: inv.id,
              changeQuantity: -reqItem.quantity,
              previousQty: inv.quantity,
              resultingQty: newQty,
              reason: InventoryTransactionReason.SALE_ORDER,
              referenceId: reference,
              notes: `Order request ${reference}`,
              actorId: customerId,
            },
          });

          const unitPrice = Number(product.sellingPrice);
          const lineTotal = Math.round(unitPrice * reqItem.quantity * 100) / 100;
          totalAmount += lineTotal;

          orderItemsData.push({
            productId: product.id,
            itemType: 'PRODUCT',
            productName: product.name,
            productSku: product.sku,
            unitPrice,
            costPriceSnapshot: Number(product.costPrice),
            quantity: reqItem.quantity,
            lineTotal,
          });
        } else if (reqItem.refurbishedDeviceId) {
          if (reqItem.quantity !== 1) {
            throw new BadRequestException(
              'Refurbished laptops are unique single units (quantity must be 1)',
            );
          }

          const device = await tx.refurbishedDevice.findUnique({
            where: { id: reqItem.refurbishedDeviceId },
          });

          if (!device || device.status !== RefurbishedStatus.PUBLISHED) {
            throw new BadRequestException(
              `Refurbished device '${device?.title || reqItem.refurbishedDeviceId}' is already sold or unavailable`,
            );
          }

          // Atomically transition unique refurbished device to SOLD so it cannot be sold twice
          await tx.refurbishedDevice.update({
            where: { id: device.id },
            data: { status: RefurbishedStatus.SOLD },
          });

          const unitPrice = Number(device.sellingPrice);
          totalAmount += unitPrice;

          orderItemsData.push({
            refurbishedDeviceId: device.id,
            itemType: 'REFURBISHED_DEVICE',
            productName: device.title,
            productSku: device.deviceCode,
            unitPrice,
            costPriceSnapshot:
              Number(device.acquisitionCost) + Number(device.refurbishmentCost),
            quantity: 1,
            lineTotal: unitPrice,
          });
        } else {
          throw new BadRequestException(
            'Each order item must specify either productId or refurbishedDeviceId',
          );
        }
      }

      const subtotal = Math.round((totalAmount / 1.18) * 100) / 100;
      const taxAmount = Math.round((totalAmount - subtotal) * 100) / 100;

      const order = await tx.order.create({
        data: {
          reference,
          customerId,
          status: OrderStatus.PENDING_CONFIRMATION,
          paymentStatus: PaymentStatus.PENDING,
          fulfilmentType: dto.fulfilmentType ?? FulfilmentType.STORE_PICKUP,
          subtotal,
          discountAmount: 0,
          taxAmount,
          totalAmount,
          shippingRecipient: dto.shippingRecipient.trim(),
          shippingPhone: dto.shippingPhone.trim(),
          shippingAddressText: dto.shippingAddressText.trim(),
          gstNumber: dto.gstNumber?.trim() || null,
          customerNotes: dto.customerNotes?.trim() || null,
          items: {
            create: orderItemsData,
          },
          payments: {
            create: [
              {
                provider: 'OFFLINE_OR_PAY_AT_STORE',
                amount: totalAmount,
                status: PaymentStatus.PENDING,
              },
            ],
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      if (idempotencyKey && tx.auditLog?.create) {
        await tx.auditLog.create({
          data: {
            actorId: customerId,
            action: 'ORDER_IDEMPOTENCY',
            entityType: 'Order',
            entityId: order.id,
            safeMetadata: idempotencyKey,
          },
        });
      }

      return order;
    });

    return this.serializeCustomerOrder(created);
  }

  async findCustomerOrders(customerId: string) {
    const orders = await this.prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        payments: true,
      },
    });
    return orders.map((o) => this.serializeCustomerOrder(o));
  }

  async findCustomerOrderByReference(customerId: string, reference: string) {
    const order = await this.prisma.order.findUnique({
      where: { reference },
      include: {
        items: true,
        payments: true,
      },
    });
    if (!order) {
      throw new NotFoundException(`Order '${reference}' not found`);
    }
    if (order.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this order');
    }
    return this.serializeCustomerOrder(order);
  }

  async findAllAdmin(status?: OrderStatus) {
    const orders = await this.prisma.order.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        items: true,
        payments: true,
      },
    });
    return orders.map((o) => this.serializeAdminOrder(o));
  }

  async findByIdAdmin(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        items: true,
        payments: true,
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return this.serializeAdminOrder(order);
  }

  async updateStatusAdmin(
    id: string,
    dto: UpdateOrderStatusDto,
    actorId: string,
  ) {
    const existing = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    const isCancelling =
      dto.status === OrderStatus.CANCELLED &&
      existing.status !== OrderStatus.CANCELLED;

    const updated = await this.prisma.$transaction(async (tx) => {
      if (isCancelling) {
        // Restore stock for cancelled order items
        for (const item of existing.items) {
          if (item.productId) {
            const inv = await tx.inventory.findUnique({
              where: { productId: item.productId },
            });
            if (inv) {
              const restored = inv.quantity + item.quantity;
              await tx.inventory.update({
                where: { id: inv.id },
                data: { quantity: restored },
              });
              await tx.inventoryTransaction.create({
                data: {
                  inventoryId: inv.id,
                  changeQuantity: item.quantity,
                  previousQty: inv.quantity,
                  resultingQty: restored,
                  reason: InventoryTransactionReason.ORDER_CANCELLED,
                  referenceId: existing.reference,
                  notes: `Stock restored from cancelled order ${existing.reference}`,
                  actorId,
                },
              });
            }
          } else if (item.refurbishedDeviceId) {
            await tx.refurbishedDevice.update({
              where: { id: item.refurbishedDeviceId },
              data: { status: RefurbishedStatus.PUBLISHED },
            });
          }
        }
      }

      if (dto.paymentStatus) {
        await tx.payment.updateMany({
          where: { orderId: id },
          data: {
            status: dto.paymentStatus,
            paidAt: dto.paymentStatus === PaymentStatus.PAID ? new Date() : undefined,
          },
        });
      }

      return tx.order.update({
        where: { id },
        data: {
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.paymentStatus !== undefined
            ? { paymentStatus: dto.paymentStatus }
            : {}),
          ...(dto.adminNotes !== undefined ? { adminNotes: dto.adminNotes } : {}),
        },
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          items: true,
          payments: true,
        },
      });
    });

    await this.auditService.log({
      actorId,
      action: 'ORDER_STATUS_UPDATED',
      entityType: 'Order',
      entityId: id,
      metadata: {
        reference: updated.reference,
        status: updated.status,
        paymentStatus: updated.paymentStatus,
      },
    });

    return this.serializeAdminOrder(updated);
  }
}
