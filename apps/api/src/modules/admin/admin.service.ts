import { Injectable, NotFoundException } from '@nestjs/common';
import {
  EnquiryStatus,
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  RefurbishedStatus,
  RepairBookingStatus,
  RoleName,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UpsertSiteContentDto } from './dto/admin.dto';
import { sanitizeUser } from '../../common/utils/serializer.util';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getDashboardOverview() {
    const [
      totalProducts,
      activeProducts,
      totalCategories,
      inventories,
      totalRefurbished,
      publishedRefurbished,
      totalCustomers,
      orders,
      newEnquiriesCount,
      totalEnquiriesCount,
      repairBookings,
      recentOrders,
      recentRepairs,
      recentEnquiries,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { status: ProductStatus.PUBLISHED } }),
      this.prisma.category.count({ where: { active: true } }),
      this.prisma.inventory.findMany({
        include: { product: { select: { id: true, name: true, sku: true, sellingPrice: true } } },
      }),
      this.prisma.refurbishedDevice.count(),
      this.prisma.refurbishedDevice.count({
        where: { status: RefurbishedStatus.PUBLISHED },
      }),
      this.prisma.userRole.count({
        where: { role: { name: RoleName.CUSTOMER } },
      }),
      this.prisma.order.findMany({
        include: { items: true },
      }),
      this.prisma.enquiry.count({ where: { status: EnquiryStatus.NEW } }),
      this.prisma.enquiry.count(),
      this.prisma.repairBooking.findMany({
        select: { id: true, status: true },
      }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.repairBooking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { service: { select: { title: true } } },
      }),
      this.prisma.enquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true, email: true } } },
      }),
    ]);

    let totalInventoryUnits = 0;
    let lowStockProductsCount = 0;
    let outOfStockProductsCount = 0;
    const lowStockAlerts: Array<{
      productId: string;
      sku: string;
      name: string;
      availableQuantity: number;
      threshold: number;
    }> = [];

    for (const inv of inventories) {
      const available = Math.max(0, inv.quantity - inv.reservedQuantity);
      totalInventoryUnits += available;
      if (available === 0) {
        outOfStockProductsCount += 1;
        lowStockAlerts.push({
          productId: inv.product.id,
          sku: inv.product.sku,
          name: inv.product.name,
          availableQuantity: 0,
          threshold: inv.lowStockThreshold,
        });
      } else if (available <= inv.lowStockThreshold) {
        lowStockProductsCount += 1;
        lowStockAlerts.push({
          productId: inv.product.id,
          sku: inv.product.sku,
          name: inv.product.name,
          availableQuantity: available,
          threshold: inv.lowStockThreshold,
        });
      }
    }

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (o) =>
        o.status === OrderStatus.PENDING_CONFIRMATION ||
        o.status === OrderStatus.PROCESSING,
    ).length;

    const validOrders = orders.filter((o) => o.status !== OrderStatus.CANCELLED);
    const paidOrders = orders.filter((o) => o.paymentStatus === PaymentStatus.PAID);

    const totalOrderValue = validOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );
    const collectedRevenue = paidOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );

    const pendingRepairBookings = repairBookings.filter(
      (r) =>
        r.status !== RepairBookingStatus.COMPLETED &&
        r.status !== RepairBookingStatus.CANCELLED,
    ).length;

    return {
      metrics: {
        totalProducts,
        activeProducts,
        totalCategories,
        totalInventoryUnits,
        lowStockProductsCount,
        outOfStockProductsCount,
        totalRefurbished,
        publishedRefurbished,
        totalCustomers,
        totalOrders,
        pendingOrders,
        newEnquiriesCount,
        totalEnquiriesCount,
        pendingRepairBookings,
        totalRepairBookings: repairBookings.length,
        salesSummary: {
          totalOrderValue: Math.round(totalOrderValue * 100) / 100,
          collectedRevenue: Math.round(collectedRevenue * 100) / 100,
          paidOrdersCount: paidOrders.length,
          currency: 'INR',
        },
      },
      lowStockAlerts,
      recentOrders: recentOrders.map((o) => ({
        ...o,
        totalAmount: Number(o.totalAmount),
      })),
      recentRepairs,
      recentEnquiries,
    };
  }

  async listCustomers(search?: string) {
    const users = await this.prisma.user.findMany({
      where: {
        userRoles: {
          some: { role: { name: RoleName.CUSTOMER } },
        },
        ...(search?.trim()
          ? {
              OR: [
                { name: { contains: search.trim(), mode: 'insensitive' } },
                { email: { contains: search.trim(), mode: 'insensitive' } },
                { phone: { contains: search.trim(), mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        userRoles: { include: { role: true } },
        customerProfile: true,
        _count: {
          select: {
            orders: true,
            enquiries: true,
            repairBookings: true,
          },
        },
      },
    });

    return users.map((u) => ({
      ...sanitizeUser(u),
      counts: u._count,
    }));
  }

  async getCustomerDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: { include: { role: true } },
        customerProfile: true,
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { items: true },
        },
        enquiries: {
          orderBy: { createdAt: 'desc' },
          include: {
            product: { select: { id: true, name: true, slug: true } },
            service: { select: { id: true, title: true, slug: true } },
          },
        },
        repairBookings: {
          orderBy: { createdAt: 'desc' },
          include: {
            service: { select: { id: true, title: true } },
            quotations: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Customer not found');
    }

    const safe = sanitizeUser(user);
    return {
      ...safe,
      orders: user.orders.map((o) => ({
        ...o,
        subtotal: Number(o.subtotal),
        taxAmount: Number(o.taxAmount),
        totalAmount: Number(o.totalAmount),
      })),
    };
  }

  async getAllSiteContentPublic() {
    const rows = await this.prisma.siteContent.findMany({
      where: { published: true },
    });
    const map: Record<string, unknown> = {};
    for (const r of rows) {
      try {
        map[r.key] = JSON.parse(r.contentJson);
      } catch {
        map[r.key] = r.contentJson;
      }
    }
    return map;
  }

  async getSiteContentByKeyPublic(key: string) {
    const row = await this.prisma.siteContent.findUnique({ where: { key } });
    if (!row || !row.published) {
      throw new NotFoundException(`Content block '${key}' not found`);
    }
    let parsed: unknown = row.contentJson;
    try {
      parsed = JSON.parse(row.contentJson);
    } catch {
      // keep string
    }
    return {
      key: row.key,
      title: row.title,
      published: row.published,
      updatedAt: row.updatedAt,
      content: parsed,
    };
  }

  async upsertSiteContent(key: string, dto: UpsertSiteContentDto, actorId: string) {
    const updated = await this.prisma.siteContent.upsert({
      where: { key },
      create: {
        key,
        title: dto.title,
        contentJson: dto.contentJson,
        published: dto.published ?? true,
        updatedBy: actorId,
      },
      update: {
        title: dto.title,
        contentJson: dto.contentJson,
        ...(dto.published !== undefined ? { published: dto.published } : {}),
        updatedBy: actorId,
      },
    });

    await this.auditService.log({
      actorId,
      action: 'SITE_CONTENT_UPDATED',
      entityType: 'SiteContent',
      entityId: updated.id,
      metadata: { key },
    });

    return updated;
  }

  async getReportsSummary() {
    const [orders, inventories, refurbished, repairs, enquiries, customers] =
      await Promise.all([
        this.prisma.order.findMany({ include: { items: true } }),
        this.prisma.inventory.findMany({ include: { product: true } }),
        this.prisma.refurbishedDevice.findMany(),
        this.prisma.repairBooking.findMany({ include: { quotations: true } }),
        this.prisma.enquiry.findMany(),
        this.prisma.user.findMany({
          where: { userRoles: { some: { role: { name: RoleName.CUSTOMER } } } },
          select: { id: true, createdAt: true },
        }),
      ]);

    const activeOrders = orders.filter((o) => o.status !== OrderStatus.CANCELLED);
    const paidOrders = orders.filter((o) => o.paymentStatus === PaymentStatus.PAID);

    let paidRevenue = 0;
    let knownCostBasisForPaidItems = 0;
    let allItemsHaveCostSnapshot = true;

    for (const ord of paidOrders) {
      paidRevenue += Number(ord.totalAmount);
      for (const item of ord.items) {
        if (item.costPriceSnapshot !== null && item.costPriceSnapshot !== undefined) {
          knownCostBasisForPaidItems += Number(item.costPriceSnapshot) * item.quantity;
        } else {
          allItemsHaveCostSnapshot = false;
        }
      }
    }

    const inventoryRetailValuation = inventories.reduce(
      (sum, inv) => sum + inv.quantity * Number(inv.product.sellingPrice),
      0,
    );
    const inventoryCostValuation = inventories.reduce(
      (sum, inv) => sum + inv.quantity * Number(inv.product.costPrice),
      0,
    );

    const repairsByStatus: Record<string, number> = {};
    for (const r of repairs) {
      repairsByStatus[r.status] = (repairsByStatus[r.status] || 0) + 1;
    }

    const enquiriesByStatus: Record<string, number> = {};
    for (const e of enquiries) {
      enquiriesByStatus[e.status] = (enquiriesByStatus[e.status] || 0) + 1;
    }

    const refurbishedByStatus: Record<string, number> = {};
    for (const d of refurbished) {
      refurbishedByStatus[d.status] = (refurbishedByStatus[d.status] || 0) + 1;
    }

    return {
      salesReport: {
        totalOrdersCount: orders.length,
        activeOrdersCount: activeOrders.length,
        paidOrdersCount: paidOrders.length,
        grossOrderValue:
          Math.round(
            activeOrders.reduce((s, o) => s + Number(o.totalAmount), 0) * 100,
          ) / 100,
        paidRevenue: Math.round(paidRevenue * 100) / 100,
        knownPurchaseCostBasis: Math.round(knownCostBasisForPaidItems * 100) / 100,
        verifiedGrossMargin: allItemsHaveCostSnapshot
          ? Math.round((paidRevenue - knownCostBasisForPaidItems) * 100) / 100
          : null,
        costDataComplete: allItemsHaveCostSnapshot,
        currency: 'INR',
      },
      inventoryReport: {
        totalSkus: inventories.length,
        totalUnitsOnHand: inventories.reduce((s, i) => s + i.quantity, 0),
        inventoryCostValuation: Math.round(inventoryCostValuation * 100) / 100,
        inventoryRetailValuation: Math.round(inventoryRetailValuation * 100) / 100,
      },
      refurbishedReport: {
        totalUnits: refurbished.length,
        byStage: refurbishedByStatus,
      },
      repairsReport: {
        totalBookings: repairs.length,
        byStatus: repairsByStatus,
      },
      enquiriesReport: {
        totalEnquiries: enquiries.length,
        byStatus: enquiriesByStatus,
      },
      customerGrowth: {
        totalRegisteredCustomers: customers.length,
      },
    };
  }
}
