import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { QuotationStatus, RepairBookingStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  CreateRepairBookingDto,
  CreateRepairQuotationDto,
  RespondRepairQuotationDto,
  UpdateRepairStatusDto,
} from './dto/repair.dto';
import { generateReference } from '../../common/utils/reference.util';
import { sanitizeCustomerRepairBooking } from '../../common/utils/serializer.util';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class RepairsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createBooking(dto: CreateRepairBookingDto, user?: AuthenticatedUser) {
    const guestAllowed = process.env.ALLOW_GUEST_REPAIR_BOOKING === 'true';
    if (!user && !guestAllowed) {
      throw new UnauthorizedException(
        'Please sign in to submit a repair booking request',
      );
    }

    const customerName = user?.name || dto.customerName?.trim();
    const customerEmail = user?.email || dto.customerEmail?.trim();
    if (!customerName || !customerEmail) {
      throw new BadRequestException('Customer name and email are required');
    }

    const reference = generateReference('REP');

    const booking = await this.prisma.repairBooking.create({
      data: {
        reference,
        customerId: user?.id ?? null,
        serviceId: dto.serviceId || null,
        customerName,
        customerEmail,
        customerPhone: dto.customerPhone.trim(),
        deviceType: dto.deviceType.trim(),
        brand: dto.brand.trim(),
        model: dto.model.trim(),
        serialNumber: dto.serialNumber?.trim() || null,
        issueCategory: dto.issueCategory.trim(),
        issueDescription: dto.issueDescription.trim(),
        preferredDate: dto.preferredDate ? new Date(dto.preferredDate) : null,
        status: RepairBookingStatus.SUBMITTED,
        updates: {
          create: [
            {
              status: RepairBookingStatus.SUBMITTED,
              customerVisibleMessage: `Repair request submitted (${reference}). Our hardware diagnostics team will review your ${dto.brand} ${dto.model}.`,
              internalNote: 'Initial customer submission via web portal.',
              actorId: user?.id ?? null,
            },
          ],
        },
      },
      include: {
        service: { select: { id: true, title: true, slug: true } },
        updates: { orderBy: { createdAt: 'asc' } },
        quotations: { orderBy: { createdAt: 'desc' } },
      },
    });

    return sanitizeCustomerRepairBooking(booking);
  }

  async findCustomerBookings(customerId: string) {
    const bookings = await this.prisma.repairBooking.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        service: { select: { id: true, title: true, slug: true } },
        updates: { orderBy: { createdAt: 'asc' } },
        quotations: { orderBy: { createdAt: 'desc' } },
      },
    });
    return bookings.map(sanitizeCustomerRepairBooking);
  }

  async findCustomerBookingByReference(customerId: string, reference: string) {
    const booking = await this.prisma.repairBooking.findUnique({
      where: { reference },
      include: {
        service: { select: { id: true, title: true, slug: true } },
        updates: { orderBy: { createdAt: 'asc' } },
        quotations: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Repair booking '${reference}' not found`);
    }
    if (booking.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this repair booking');
    }

    return sanitizeCustomerRepairBooking(booking);
  }

  async respondToQuotation(
    customerId: string,
    bookingId: string,
    quotationId: string,
    dto: RespondRepairQuotationDto,
  ) {
    const booking = await this.prisma.repairBooking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) {
      throw new NotFoundException('Repair booking not found');
    }
    if (booking.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this repair booking');
    }

    const quotation = await this.prisma.repairQuotation.findUnique({
      where: { id: quotationId },
    });
    if (!quotation || quotation.bookingId !== bookingId) {
      throw new NotFoundException('Repair quotation not found');
    }

    const nextBookingStatus =
      dto.decision === QuotationStatus.APPROVED
        ? RepairBookingStatus.APPROVED
        : RepairBookingStatus.CANCELLED;

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.repairQuotation.update({
        where: { id: quotationId },
        data: {
          status: dto.decision,
          customerResponseNote: dto.customerResponseNote ?? null,
          respondedAt: new Date(),
        },
      });

      return tx.repairBooking.update({
        where: { id: bookingId },
        data: {
          status: nextBookingStatus,
          updates: {
            create: [
              {
                status: nextBookingStatus,
                customerVisibleMessage:
                  dto.decision === QuotationStatus.APPROVED
                    ? `Quotation ${quotation.quotationNumber} approved by customer. Proceeding to repair.`
                    : `Quotation ${quotation.quotationNumber} declined by customer.`,
                actorId: customerId,
              },
            ],
          },
        },
        include: {
          service: true,
          updates: { orderBy: { createdAt: 'asc' } },
          quotations: { orderBy: { createdAt: 'desc' } },
        },
      });
    });

    return sanitizeCustomerRepairBooking(updated);
  }

  async findAllAdmin(status?: RepairBookingStatus) {
    const bookings = await this.prisma.repairBooking.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        service: { select: { id: true, title: true, slug: true } },
        updates: {
          orderBy: { createdAt: 'asc' },
          include: { actor: { select: { id: true, name: true } } },
        },
        quotations: { orderBy: { createdAt: 'desc' } },
      },
    });

    return bookings.map((b) => ({
      ...b,
      quotations: b.quotations.map((q) => ({
        ...q,
        partsCost: Number(q.partsCost),
        labourCost: Number(q.labourCost),
        taxAmount: Number(q.taxAmount),
        totalAmount: Number(q.totalAmount),
      })),
    }));
  }

  async findByIdAdmin(id: string) {
    const booking = await this.prisma.repairBooking.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        service: true,
        updates: {
          orderBy: { createdAt: 'asc' },
          include: { actor: { select: { id: true, name: true } } },
        },
        quotations: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!booking) {
      throw new NotFoundException('Repair booking not found');
    }
    return {
      ...booking,
      quotations: booking.quotations.map((q) => ({
        ...q,
        partsCost: Number(q.partsCost),
        labourCost: Number(q.labourCost),
        taxAmount: Number(q.taxAmount),
        totalAmount: Number(q.totalAmount),
      })),
    };
  }

  async updateStatusAdmin(
    id: string,
    dto: UpdateRepairStatusDto,
    actorId: string,
  ) {
    const existing = await this.prisma.repairBooking.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Repair booking not found');
    }

    const updated = await this.prisma.repairBooking.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.diagnosticSummary !== undefined
          ? { diagnosticSummary: dto.diagnosticSummary }
          : {}),
        ...(dto.internalNotes !== undefined
          ? { internalNotes: dto.internalNotes }
          : {}),
        updates: {
          create: [
            {
              status: dto.status,
              customerVisibleMessage: dto.customerVisibleMessage.trim(),
              internalNote: dto.internalNote?.trim() || null,
              actorId,
            },
          ],
        },
      },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        service: true,
        updates: { orderBy: { createdAt: 'asc' } },
        quotations: { orderBy: { createdAt: 'desc' } },
      },
    });

    await this.auditService.log({
      actorId,
      action: 'REPAIR_STATUS_UPDATED',
      entityType: 'RepairBooking',
      entityId: id,
      metadata: {
        reference: updated.reference,
        previousStatus: existing.status,
        newStatus: updated.status,
      },
    });

    return updated;
  }

  async createQuotationAdmin(
    bookingId: string,
    dto: CreateRepairQuotationDto,
    actorId: string,
  ) {
    const booking = await this.prisma.repairBooking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) {
      throw new NotFoundException('Repair booking not found');
    }

    const quotationNumber = generateReference('QUO');
    const taxAmount = dto.taxAmount ?? Math.round((dto.partsCost + dto.labourCost) * 0.18 * 100) / 100;
    const totalAmount = dto.partsCost + dto.labourCost + taxAmount;

    const quotation = await this.prisma.$transaction(async (tx) => {
      const created = await tx.repairQuotation.create({
        data: {
          bookingId,
          quotationNumber,
          diagnosisDetails: dto.diagnosisDetails,
          partsBreakdownJson: dto.partsBreakdownJson || '[]',
          partsCost: dto.partsCost,
          labourCost: dto.labourCost,
          taxAmount,
          totalAmount,
          status: QuotationStatus.PENDING_APPROVAL,
        },
      });

      await tx.repairBooking.update({
        where: { id: bookingId },
        data: {
          status: RepairBookingStatus.QUOTATION_SENT,
          diagnosticSummary: dto.diagnosisDetails,
          updates: {
            create: [
              {
                status: RepairBookingStatus.QUOTATION_SENT,
                customerVisibleMessage: `Repair quotation ${quotationNumber} prepared (Total: ₹${totalAmount.toLocaleString('en-IN')}). Please review and approve in your dashboard.`,
                internalNote: `Quotation ${quotationNumber} issued.`,
                actorId,
              },
            ],
          },
        },
      });

      return created;
    });

    await this.auditService.log({
      actorId,
      action: 'REPAIR_QUOTATION_CREATED',
      entityType: 'RepairQuotation',
      entityId: quotation.id,
      metadata: { bookingId, quotationNumber, totalAmount },
    });

    return {
      ...quotation,
      partsCost: Number(quotation.partsCost),
      labourCost: Number(quotation.labourCost),
      taxAmount: Number(quotation.taxAmount),
      totalAmount: Number(quotation.totalAmount),
    };
  }
}
