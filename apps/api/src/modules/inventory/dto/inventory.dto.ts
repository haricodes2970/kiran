import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { InventoryTransactionReason } from '@prisma/client';

export class AdjustInventoryDto {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty({ description: 'Signed quantity delta (+5 to restock, -2 to deduct)' })
  @Type(() => Number)
  @IsInt()
  changeQuantity!: number;

  @ApiProperty({
    enum: InventoryTransactionReason,
    default: InventoryTransactionReason.MANUAL_ADJUSTMENT,
  })
  @IsEnum(InventoryTransactionReason)
  reason!: InventoryTransactionReason;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;
}
