import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FulfilmentType, OrderStatus, PaymentStatus } from '@prisma/client';

export class OrderItemInputDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refurbishedDeviceId?: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items!: OrderItemInputDto[];

  @ApiPropertyOptional({ enum: FulfilmentType, default: FulfilmentType.STORE_PICKUP })
  @IsOptional()
  @IsEnum(FulfilmentType)
  fulfilmentType?: FulfilmentType;

  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  @MinLength(2)
  shippingRecipient!: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @MinLength(10)
  shippingPhone!: string;

  @ApiProperty({ example: 'Plot 10, Tech Park Road, Pune - 411038' })
  @IsString()
  @MinLength(5)
  shippingAddressText!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gstNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerNotes?: string;
}

export class UpdateOrderStatusDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
