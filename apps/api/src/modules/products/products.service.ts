import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InventoryTransactionReason,
  Prisma,
  ProductCondition,
  ProductStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { slugify } from '../../common/utils/reference.util';
import {
  sanitizeAdminProduct,
  sanitizePublicProduct,
} from '../../common/utils/serializer.util';

export interface ProductQueryFilter {
  search?: string;
  categorySlug?: string;
  categoryId?: string;
  brand?: string;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
  page?: number;
  limit?: number;
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAllPublic(query: ProductQueryFilter) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(query.limit || 12)));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.PUBLISHED,
      category: { active: true },
    };

    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { model: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (query.categorySlug) {
      where.category = { slug: query.categorySlug, active: true };
    } else if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.brand) {
      where.brand = { equals: query.brand, mode: 'insensitive' };
    }

    if (query.condition) {
      where.condition = query.condition;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.sellingPrice = {
        ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
      };
    }

    if (query.inStock === true) {
      where.inventory = { quantity: { gt: 0 } };
    }

    if (query.featured !== undefined) {
      where.featured = query.featured;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'price_asc') {
      orderBy = { sellingPrice: 'asc' };
    } else if (query.sortBy === 'price_desc') {
      orderBy = { sellingPrice: 'desc' };
    } else if (query.sortBy === 'name_asc') {
      orderBy = { name: 'asc' };
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' } },
          specifications: { orderBy: { sortOrder: 'asc' } },
          inventory: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: items.map(sanitizePublicProduct),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findDistinctBrandsPublic() {
    const rows = await this.prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED },
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    });
    return rows.map((r) => r.brand);
  }

  async findBySlugPublic(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        specifications: { orderBy: { sortOrder: 'asc' } },
        inventory: true,
      },
    });

    if (!product || product.status !== ProductStatus.PUBLISHED) {
      throw new NotFoundException(`Product '${slug}' not found`);
    }

    return sanitizePublicProduct(product);
  }

  async findAllAdmin(query: {
    search?: string;
    status?: ProductStatus;
    categoryId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit || 25)));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { model: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' } },
          specifications: { orderBy: { sortOrder: 'asc' } },
          inventory: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: items.map(sanitizeAdminProduct),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findByIdAdmin(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        specifications: { orderBy: { sortOrder: 'asc' } },
        inventory: {
          include: {
            transactions: {
              take: 15,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return sanitizeAdminProduct(product);
  }

  async create(dto: CreateProductDto, actorId?: string) {
    const sku = dto.sku.trim().toUpperCase();
    const slug = dto.slug ? slugify(dto.slug) : slugify(`${dto.brand}-${dto.name}-${sku}`);

    const [existingSku, existingSlug, category] = await Promise.all([
      this.prisma.product.findUnique({ where: { sku } }),
      this.prisma.product.findUnique({ where: { slug } }),
      this.prisma.category.findUnique({ where: { id: dto.categoryId } }),
    ]);

    if (existingSku) {
      throw new ConflictException(`Product with SKU '${sku}' already exists`);
    }
    if (existingSlug) {
      throw new ConflictException(`Product with slug '${slug}' already exists`);
    }
    if (!category) {
      throw new NotFoundException('Selected category does not exist');
    }

    const initialStock = dto.initialStock ?? 0;

    const product = await this.prisma.product.create({
      data: {
        sku,
        slug,
        name: dto.name.trim(),
        brand: dto.brand.trim(),
        model: dto.model.trim(),
        shortSummary: dto.shortSummary,
        description: dto.description,
        condition: dto.condition ?? ProductCondition.NEW,
        costPrice: dto.costPrice,
        sellingPrice: dto.sellingPrice,
        mrpPrice: dto.mrpPrice,
        warrantyMonths: dto.warrantyMonths ?? 12,
        warrantySummary: dto.warrantySummary,
        featured: dto.featured ?? false,
        status: dto.status ?? ProductStatus.DRAFT,
        categoryId: dto.categoryId,
        images: dto.images?.length
          ? {
              create: dto.images.map((img, idx) => ({
                url: img.url,
                altText: img.altText ?? dto.name,
                sortOrder: img.sortOrder ?? idx,
                isPrimary: img.isPrimary ?? idx === 0,
              })),
            }
          : undefined,
        specifications: dto.specifications?.length
          ? {
              create: dto.specifications.map((spec, idx) => ({
                groupName: spec.groupName || 'Technical Specifications',
                key: spec.key,
                value: spec.value,
                sortOrder: spec.sortOrder ?? idx,
              })),
            }
          : undefined,
        inventory: {
          create: {
            quantity: initialStock,
            reservedQuantity: 0,
            lowStockThreshold: dto.lowStockThreshold ?? 3,
            transactions: {
              create: [
                {
                  changeQuantity: initialStock,
                  previousQty: 0,
                  resultingQty: initialStock,
                  reason: InventoryTransactionReason.INITIAL_STOCK,
                  notes: 'Initial stock on product creation',
                  actorId: actorId ?? null,
                },
              ],
            },
          },
        },
      },
      include: {
        category: true,
        images: true,
        specifications: true,
        inventory: true,
      },
    });

    await this.auditService.log({
      actorId,
      action: 'PRODUCT_CREATED',
      entityType: 'Product',
      entityId: product.id,
      metadata: { sku: product.sku, name: product.name, status: product.status },
    });

    return sanitizeAdminProduct(product);
  }

  async update(id: string, dto: UpdateProductDto, actorId?: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    if (dto.sku && dto.sku.trim().toUpperCase() !== existing.sku) {
      const conflict = await this.prisma.product.findUnique({
        where: { sku: dto.sku.trim().toUpperCase() },
      });
      if (conflict) {
        throw new ConflictException(`SKU '${dto.sku}' already exists`);
      }
    }

    if (dto.slug && slugify(dto.slug) !== existing.slug) {
      const conflict = await this.prisma.product.findUnique({
        where: { slug: slugify(dto.slug) },
      });
      if (conflict) {
        throw new ConflictException(`Slug '${dto.slug}' already exists`);
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
      }
      if (dto.specifications !== undefined) {
        await tx.productSpecification.deleteMany({ where: { productId: id } });
      }

      return tx.product.update({
        where: { id },
        data: {
          ...(dto.sku !== undefined ? { sku: dto.sku.trim().toUpperCase() } : {}),
          ...(dto.slug !== undefined ? { slug: slugify(dto.slug) } : {}),
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.brand !== undefined ? { brand: dto.brand.trim() } : {}),
          ...(dto.model !== undefined ? { model: dto.model.trim() } : {}),
          ...(dto.shortSummary !== undefined ? { shortSummary: dto.shortSummary } : {}),
          ...(dto.description !== undefined ? { description: dto.description } : {}),
          ...(dto.condition !== undefined ? { condition: dto.condition } : {}),
          ...(dto.costPrice !== undefined ? { costPrice: dto.costPrice } : {}),
          ...(dto.sellingPrice !== undefined ? { sellingPrice: dto.sellingPrice } : {}),
          ...(dto.mrpPrice !== undefined ? { mrpPrice: dto.mrpPrice } : {}),
          ...(dto.warrantyMonths !== undefined ? { warrantyMonths: dto.warrantyMonths } : {}),
          ...(dto.warrantySummary !== undefined ? { warrantySummary: dto.warrantySummary } : {}),
          ...(dto.featured !== undefined ? { featured: dto.featured } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
          ...(dto.images !== undefined
            ? {
                images: {
                  create: dto.images.map((img, idx) => ({
                    url: img.url,
                    altText: img.altText ?? existing.name,
                    sortOrder: img.sortOrder ?? idx,
                    isPrimary: img.isPrimary ?? idx === 0,
                  })),
                },
              }
            : {}),
          ...(dto.specifications !== undefined
            ? {
                specifications: {
                  create: dto.specifications.map((spec, idx) => ({
                    groupName: spec.groupName || 'Technical Specifications',
                    key: spec.key,
                    value: spec.value,
                    sortOrder: spec.sortOrder ?? idx,
                  })),
                },
              }
            : {}),
        },
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          specifications: { orderBy: { sortOrder: 'asc' } },
          inventory: true,
        },
      });
    });

    await this.auditService.log({
      actorId,
      action: 'PRODUCT_UPDATED',
      entityType: 'Product',
      entityId: id,
      metadata: {
        sku: updated.sku,
        status: updated.status,
        sellingPrice: Number(updated.sellingPrice),
      },
    });

    return sanitizeAdminProduct(updated);
  }

  async archive(id: string, actorId?: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.ARCHIVED },
      include: { category: true, inventory: true },
    });

    await this.auditService.log({
      actorId,
      action: 'PRODUCT_ARCHIVED',
      entityType: 'Product',
      entityId: id,
      metadata: { sku: updated.sku },
    });

    return sanitizeAdminProduct(updated);
  }
}
