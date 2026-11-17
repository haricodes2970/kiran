import { Injectable, NotFoundException } from '@nestjs/common';
import { EnquiryStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateEnquiryDto, UpdateEnquiryDto } from './dto/enquiry.dto';
import { generateReference } from '../../common/utils/reference.util';

@Injectable()
export class EnquiriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(customerId: string, dto: CreateEnquiryDto) {
    const reference = generateReference('ENQ');
    const created = await this.prisma.enquiry.create({
      data: {
        reference,
        customerId,
        productId: dto.productId || null,
        refurbishedDeviceId: dto.refurbishedDeviceId || null,
        serviceId: dto.serviceId || null,
        subject: dto.subject.trim(),
        message: dto.message.trim(),
        contactPhone: dto.contactPhone?.trim() || null,
        status: EnquiryStatus.NEW,
      },
      include: {
        product: { select: { id: true, name: true, slug: true, sku: true } },
        refurbishedDevice: { select: { id: true, title: true, slug: true, deviceCode: true } },
        service: { select: { id: true, title: true, slug: true } },
      },
    });
    const { internalNotes, ...safe } = created;
    return safe;
  }

  async findCustomerEnquiries(customerId: string) {
    const list = await this.prisma.enquiry.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, slug: true, sku: true } },
        refurbishedDevice: { select: { id: true, title: true, slug: true, deviceCode: true } },
        service: { select: { id: true, title: true, slug: true } },
      },
    });
    return list.map(({ internalNotes, ...safe }) => safe);
  }

  async findAllAdmin(query: { status?: EnquiryStatus; search?: string }) {
    return this.prisma.enquiry.findMany({
      where: {
        ...(query.status ? { status: query.status } : {}),
        ...(query.search?.trim()
          ? {
              OR: [
                { subject: { contains: query.search.trim(), mode: 'insensitive' } },
                { message: { contains: query.search.trim(), mode: 'insensitive' } },
                { reference: { contains: query.search.trim(), mode: 'insensitive' } },
                {
                  customer: {
                    name: { contains: query.search.trim(), mode: 'insensitive' },
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        product: { select: { id: true, name: true, slug: true, sku: true } },
        refurbishedDevice: { select: { id: true, title: true, slug: true, deviceCode: true } },
        service: { select: { id: true, title: true, slug: true } },
      },
    });
  }

  async updateAdmin(id: string, dto: UpdateEnquiryDto, actorId: string) {
    const existing = await this.prisma.enquiry.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Enquiry not found');
    }

    const updated = await this.prisma.enquiry.update({
      where: { id },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.internalNotes !== undefined ? { internalNotes: dto.internalNotes } : {}),
        ...(dto.followUpSummary !== undefined
          ? { followUpSummary: dto.followUpSummary, followedUpAt: new Date() }
          : {}),
      },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        product: { select: { id: true, name: true, slug: true, sku: true } },
        refurbishedDevice: { select: { id: true, title: true, slug: true, deviceCode: true } },
        service: { select: { id: true, title: true, slug: true } },
      },
    });

    await this.auditService.log({
      actorId,
      action: 'ENQUIRY_UPDATED',
      entityType: 'Enquiry',
      entityId: id,
      metadata: { reference: updated.reference, status: updated.status },
    });

    return updated;
  }
}
