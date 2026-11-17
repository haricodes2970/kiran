import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ServicePricingType } from '@prisma/client';

export class CreateServiceDto {
  @ApiProperty()
  @IsString()
  categoryId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'Laptop Motherboard Chip-Level Repair' })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty()
  @IsString()
  shortSummary!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiPropertyOptional({ default: 'Wrench' })
  @IsOptional()
  @IsString()
  iconName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    enum: ServicePricingType,
    default: ServicePricingType.STARTING_FROM,
  })
  @IsOptional()
  @IsEnum(ServicePricingType)
  pricingType?: ServicePricingType;

  @ApiPropertyOptional({ example: 1200 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({ default: '24–48 Hours' })
  @IsOptional()
  @IsString()
  estimatedTurnaround?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warrantyNote?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateServiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortSummary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  iconName?: string;

  @ApiPropertyOptional({ enum: ServicePricingType })
  @IsOptional()
  @IsEnum(ServicePricingType)
  pricingType?: ServicePricingType;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  estimatedTurnaround?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warrantyNote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
