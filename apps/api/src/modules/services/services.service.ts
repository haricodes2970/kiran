import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { slugify } from '../../common/utils/reference.util';

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAllPublic(categorySlug?: string) {
    const [categories, services] = await Promise.all([
      this.prisma.serviceCategory.findMany({
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.service.findMany({
        where: {
          active: true,
          ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        },
        orderBy: [{ featured: 'desc' }, { title: 'asc' }],
        include: {
          category: { select: { id: true, name: true, slug: true, iconName: true } },
        },
      }),
    ]);

    return {
      categories,
      services: services.map((s) => ({
        ...s,
        basePrice: s.basePrice !== null ? Number(s.basePrice) : null,
      })),
    };
  }

  async findBySlugPublic(slug: string) {
    const service = await this.prisma.service.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!service || !service.active) {
      throw new NotFoundException(`Service '${slug}' not found`);
    }
    return {
      ...service,
      basePrice: service.basePrice !== null ? Number(service.basePrice) : null,
    };
  }

  async findAllAdmin() {
    const [categories, services] = await Promise.all([
      this.prisma.serviceCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
      this.prisma.service.findMany({
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
    ]);

    return {
      categories,
      services: services.map((s) => ({
        ...s,
        basePrice: s.basePrice !== null ? Number(s.basePrice) : null,
      })),
    };
  }

  async create(dto: CreateServiceDto, actorId?: string) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.title);
    const existing = await this.prisma.service.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Service slug '${slug}' already exists`);
    }

    const created = await this.prisma.service.create({
      data: {
        categoryId: dto.categoryId,
        slug,
        title: dto.title.trim(),
        shortSummary: dto.shortSummary,
        description: dto.description,
        iconName: dto.iconName || 'Wrench',
        imageUrl: dto.imageUrl,
        pricingType: dto.pricingType,
        basePrice: dto.basePrice,
        estimatedTurnaround: dto.estimatedTurnaround || '24–48 Hours',
        warrantyNote: dto.warrantyNote,
        featured: dto.featured ?? false,
        active: dto.active ?? true,
      },
      include: { category: true },
    });

    await this.auditService.log({
      actorId,
      action: 'SERVICE_CREATED',
      entityType: 'Service',
      entityId: created.id,
      metadata: { title: created.title, slug: created.slug },
    });

    return {
      ...created,
      basePrice: created.basePrice !== null ? Number(created.basePrice) : null,
    };
  }

  async update(id: string, dto: UpdateServiceDto, actorId?: string) {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Service not found');
    }

    const updated = await this.prisma.service.update({
      where: { id },
      data: {
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.shortSummary !== undefined ? { shortSummary: dto.shortSummary } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.iconName !== undefined ? { iconName: dto.iconName } : {}),
        ...(dto.pricingType !== undefined ? { pricingType: dto.pricingType } : {}),
        ...(dto.basePrice !== undefined ? { basePrice: dto.basePrice } : {}),
        ...(dto.estimatedTurnaround !== undefined
          ? { estimatedTurnaround: dto.estimatedTurnaround }
          : {}),
        ...(dto.warrantyNote !== undefined ? { warrantyNote: dto.warrantyNote } : {}),
        ...(dto.featured !== undefined ? { featured: dto.featured } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
      },
      include: { category: true },
    });

    await this.auditService.log({
      actorId,
      action: 'SERVICE_UPDATED',
      entityType: 'Service',
      entityId: id,
      metadata: { title: updated.title, active: updated.active },
    });

    return {
      ...updated,
      basePrice: updated.basePrice !== null ? Number(updated.basePrice) : null,
    };
  }

  async archive(id: string, actorId?: string) {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Service not found');
    }
    const updated = await this.prisma.service.update({
      where: { id },
      data: { active: false },
    });
    await this.auditService.log({
      actorId,
      action: 'SERVICE_ARCHIVED',
      entityType: 'Service',
      entityId: id,
    });
    return updated;
  }
}
