import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { slugify } from '../../common/utils/reference.util';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAllPublic() {
    const categories = await this.prisma.category.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            products: { where: { status: ProductStatus.PUBLISHED } },
          },
        },
      },
    });
    return categories.map((c) => ({
      ...c,
      productCount: c._count.products,
    }));
  }

  async findBySlugPublic(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: { where: { active: true } },
        _count: {
          select: {
            products: { where: { status: ProductStatus.PUBLISHED } },
          },
        },
      },
    });
    if (!category || !category.active) {
      throw new NotFoundException(`Category '${slug}' not found`);
    }
    return {
      ...category,
      productCount: category._count.products,
    };
  }

  async findAllAdmin() {
    const categories = await this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
    });
    return categories.map((c) => ({
      ...c,
      productCount: c._count.products,
    }));
  }

  async create(dto: CreateCategoryDto, actorId?: string) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Category slug '${slug}' already exists`);
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        parentId: dto.parentId || null,
        sortOrder: dto.sortOrder ?? 0,
        active: dto.active ?? true,
      },
    });

    await this.auditService.log({
      actorId,
      action: 'CATEGORY_CREATED',
      entityType: 'Category',
      entityId: category.id,
      metadata: { name: category.name, slug: category.slug },
    });

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto, actorId?: string) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    let slug = existing.slug;
    if (dto.slug) {
      slug = slugify(dto.slug);
      const conflict = await this.prisma.category.findFirst({
        where: { slug, NOT: { id } },
      });
      if (conflict) {
        throw new ConflictException(`Category slug '${slug}' already in use`);
      }
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        slug,
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.parentId !== undefined ? { parentId: dto.parentId || null } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
      },
    });

    await this.auditService.log({
      actorId,
      action: 'CATEGORY_UPDATED',
      entityType: 'Category',
      entityId: id,
      metadata: { name: updated.name, active: updated.active },
    });

    return updated;
  }

  async archive(id: string, actorId?: string) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Category not found');
    }
    const updated = await this.prisma.category.update({
      where: { id },
      data: { active: false },
    });
    await this.auditService.log({
      actorId,
      action: 'CATEGORY_ARCHIVED',
      entityType: 'Category',
      entityId: id,
    });
    return updated;
  }
}
