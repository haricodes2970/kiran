import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConditionGrade, Prisma, RefurbishedStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  CreateDeviceInspectionDto,
  CreateRefurbishedDeviceDto,
  CreateUsedDeviceSubmissionDto,
  UpdateRefurbishedDeviceDto,
  UpdateUsedDeviceSubmissionDto,
} from './dto/refurbished.dto';
import { generateReference, slugify } from '../../common/utils/reference.util';
import {
  sanitizeAdminRefurbished,
  sanitizePublicRefurbished,
} from '../../common/utils/serializer.util';

@Injectable()
export class RefurbishedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAllPublic(query: {
    search?: string;
    brand?: string;
    conditionGrade?: ConditionGrade;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'newest' | 'price_asc' | 'price_desc';
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(query.limit || 12)));
    const skip = (page - 1) * limit;

    // Only PUBLISHED devices appear as available in public marketplace
    const where: Prisma.RefurbishedDeviceWhereInput = {
      status: RefurbishedStatus.PUBLISHED,
    };

    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { model: { contains: q, mode: 'insensitive' } },
        { processor: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (query.brand) {
      where.brand = { equals: query.brand, mode: 'insensitive' };
    }

    if (query.conditionGrade) {
      where.conditionGrade = query.conditionGrade;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.sellingPrice = {
        ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
      };
    }

    let orderBy: Prisma.RefurbishedDeviceOrderByWithRelationInput = {
      createdAt: 'desc',
    };
    if (query.sortBy === 'price_asc') {
      orderBy = { sellingPrice: 'asc' };
    } else if (query.sortBy === 'price_desc') {
      orderBy = { sellingPrice: 'desc' };
    }

    const [items, total] = await Promise.all([
      this.prisma.refurbishedDevice.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          inspections: { take: 1, orderBy: { inspectedAt: 'desc' } },
        },
      }),
      this.prisma.refurbishedDevice.count({ where }),
    ]);

    return {
      data: items.map(sanitizePublicRefurbished),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findBySlugPublic(slug: string) {
    const device = await this.prisma.refurbishedDevice.findUnique({
      where: { slug },
      include: {
        inspections: { orderBy: { inspectedAt: 'desc' } },
      },
    });

    if (!device || device.status !== RefurbishedStatus.PUBLISHED) {
      throw new NotFoundException(`Refurbished device '${slug}' is not available`);
    }

    return sanitizePublicRefurbished(device);
  }

  async findAllAdmin(status?: RefurbishedStatus) {
    const devices = await this.prisma.refurbishedDevice.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        inspections: { orderBy: { inspectedAt: 'desc' } },
      },
    });
    return devices.map(sanitizeAdminRefurbished);
  }

  async createAdmin(dto: CreateRefurbishedDeviceDto, actorId?: string) {
    const deviceCode = dto.deviceCode?.trim().toUpperCase() || generateReference('REF');
    const slug = slugify(`${dto.brand}-${dto.model}-${deviceCode}`);

    const existingSerial = await this.prisma.refurbishedDevice.findUnique({
      where: { serialNumber: dto.serialNumber.trim() },
    });
    if (existingSerial) {
      throw new ConflictException(`Serial number '${dto.serialNumber}' is already registered`);
    }

    const device = await this.prisma.refurbishedDevice.create({
      data: {
        deviceCode,
        slug,
        title: dto.title.trim(),
        brand: dto.brand.trim(),
        model: dto.model.trim(),
        serialNumber: dto.serialNumber.trim(),
        processor: dto.processor,
        ram: dto.ram,
        storage: dto.storage,
        display: dto.display,
        graphics: dto.graphics,
        osInstalled: dto.osInstalled || 'Windows 11 Pro',
        batteryHealthPct: dto.batteryHealthPct,
        batteryCycles: dto.batteryCycles,
        conditionGrade: dto.conditionGrade ?? ConditionGrade.GRADE_A_EXCELLENT,
        cosmeticNotes: dto.cosmeticNotes,
        workPerformed: dto.workPerformed,
        warrantyMonths: dto.warrantyMonths ?? 6,
        warrantyTerms:
          dto.warrantyTerms || "6-Month Kiran's Infotech Hardware Carry-In Warranty",
        acquisitionSource: dto.acquisitionSource,
        acquisitionCost: dto.acquisitionCost,
        refurbishmentCost: dto.refurbishmentCost ?? 0,
        sellingPrice: dto.sellingPrice,
        status: dto.status ?? RefurbishedStatus.PURCHASED,
        imageUrls: dto.imageUrls?.length
          ? dto.imageUrls
          : [
              'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
            ],
        featured: dto.featured ?? false,
      },
      include: { inspections: true },
    });

    await this.auditService.log({
      actorId,
      action: 'REFURBISHED_DEVICE_CREATED',
      entityType: 'RefurbishedDevice',
      entityId: device.id,
      metadata: { deviceCode: device.deviceCode, status: device.status },
    });

    return sanitizeAdminRefurbished(device);
  }

  async updateAdmin(id: string, dto: UpdateRefurbishedDeviceDto, actorId?: string) {
    const existing = await this.prisma.refurbishedDevice.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Refurbished device not found');
    }

    const updated = await this.prisma.refurbishedDevice.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.brand !== undefined ? { brand: dto.brand.trim() } : {}),
        ...(dto.model !== undefined ? { model: dto.model.trim() } : {}),
        ...(dto.processor !== undefined ? { processor: dto.processor } : {}),
        ...(dto.ram !== undefined ? { ram: dto.ram } : {}),
        ...(dto.storage !== undefined ? { storage: dto.storage } : {}),
        ...(dto.display !== undefined ? { display: dto.display } : {}),
        ...(dto.batteryHealthPct !== undefined
          ? { batteryHealthPct: dto.batteryHealthPct }
          : {}),
        ...(dto.conditionGrade !== undefined ? { conditionGrade: dto.conditionGrade } : {}),
        ...(dto.cosmeticNotes !== undefined ? { cosmeticNotes: dto.cosmeticNotes } : {}),
        ...(dto.workPerformed !== undefined ? { workPerformed: dto.workPerformed } : {}),
        ...(dto.warrantyMonths !== undefined ? { warrantyMonths: dto.warrantyMonths } : {}),
        ...(dto.warrantyTerms !== undefined ? { warrantyTerms: dto.warrantyTerms } : {}),
        ...(dto.acquisitionCost !== undefined
          ? { acquisitionCost: dto.acquisitionCost }
          : {}),
        ...(dto.refurbishmentCost !== undefined
          ? { refurbishmentCost: dto.refurbishmentCost }
          : {}),
        ...(dto.sellingPrice !== undefined ? { sellingPrice: dto.sellingPrice } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.imageUrls !== undefined ? { imageUrls: dto.imageUrls } : {}),
        ...(dto.featured !== undefined ? { featured: dto.featured } : {}),
      },
      include: { inspections: { orderBy: { inspectedAt: 'desc' } } },
    });

    await this.auditService.log({
      actorId,
      action: 'REFURBISHED_DEVICE_UPDATED',
      entityType: 'RefurbishedDevice',
      entityId: id,
      metadata: {
        deviceCode: updated.deviceCode,
        previousStatus: existing.status,
        newStatus: updated.status,
      },
    });

    return sanitizeAdminRefurbished(updated);
  }

  async addInspection(deviceId: string, dto: CreateDeviceInspectionDto, actorId?: string) {
    const device = await this.prisma.refurbishedDevice.findUnique({
      where: { id: deviceId },
    });
    if (!device) {
      throw new NotFoundException('Refurbished device not found');
    }

    const inspection = await this.prisma.deviceInspection.create({
      data: {
        deviceId,
        inspectorName: dto.inspectorName,
        screenCheck: dto.screenCheck,
        keyboardTrackpad: dto.keyboardTrackpad,
        portsConnectivity: dto.portsConnectivity,
        thermalsFan: dto.thermalsFan,
        batteryHealthReport: dto.batteryHealthReport,
        storageSmartHealth: dto.storageSmartHealth,
        motherboardBios: dto.motherboardBios || 'Passed',
        overallVerdict: dto.overallVerdict,
        passed: dto.passed ?? true,
        notes: dto.notes,
      },
    });

    await this.auditService.log({
      actorId,
      action: 'REFURBISHED_INSPECTION_LOGGED',
      entityType: 'DeviceInspection',
      entityId: inspection.id,
      metadata: { deviceId, passed: inspection.passed },
    });

    return inspection;
  }

  async createUsedSubmission(customerId: string, dto: CreateUsedDeviceSubmissionDto) {
    const reference = generateReference('SELL');
    const created = await this.prisma.usedDeviceSubmission.create({
      data: {
        reference,
        customerId,
        brand: dto.brand.trim(),
        model: dto.model.trim(),
        processor: dto.processor,
        ram: dto.ram,
        storage: dto.storage,
        ageMonths: dto.ageMonths,
        conditionSummary: dto.conditionSummary,
        knownIssues: dto.knownIssues,
        expectedPrice: dto.expectedPrice,
        contactPhone: dto.contactPhone,
      },
    });
    return {
      ...created,
      expectedPrice: created.expectedPrice ? Number(created.expectedPrice) : null,
      offeredPrice: created.offeredPrice ? Number(created.offeredPrice) : null,
    };
  }

  async listCustomerUsedSubmissions(customerId: string) {
    const list = await this.prisma.usedDeviceSubmission.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
    return list.map(({ adminNotes, ...item }) => ({
      ...item,
      expectedPrice: item.expectedPrice ? Number(item.expectedPrice) : null,
      offeredPrice: item.offeredPrice ? Number(item.offeredPrice) : null,
    }));
  }

  async listAdminUsedSubmissions() {
    const list = await this.prisma.usedDeviceSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
    return list.map((item) => ({
      ...item,
      expectedPrice: item.expectedPrice ? Number(item.expectedPrice) : null,
      offeredPrice: item.offeredPrice ? Number(item.offeredPrice) : null,
    }));
  }

  async updateAdminUsedSubmission(
    id: string,
    dto: UpdateUsedDeviceSubmissionDto,
    actorId?: string,
  ) {
    const existing = await this.prisma.usedDeviceSubmission.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Used device submission not found');
    }

    const updated = await this.prisma.usedDeviceSubmission.update({
      where: { id },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.offeredPrice !== undefined ? { offeredPrice: dto.offeredPrice } : {}),
        ...(dto.adminNotes !== undefined ? { adminNotes: dto.adminNotes } : {}),
        ...(dto.customerMessage !== undefined ? { customerMessage: dto.customerMessage } : {}),
      },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    await this.auditService.log({
      actorId,
      action: 'USED_DEVICE_SUBMISSION_UPDATED',
      entityType: 'UsedDeviceSubmission',
      entityId: id,
      metadata: { status: updated.status },
    });

    return {
      ...updated,
      expectedPrice: updated.expectedPrice ? Number(updated.expectedPrice) : null,
      offeredPrice: updated.offeredPrice ? Number(updated.offeredPrice) : null,
    };
  }
}
