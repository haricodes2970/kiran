import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnquiryStatus } from '@prisma/client';

export class CreateEnquiryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refurbishedDeviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiProperty({ example: 'Bulk quote for 5x Dell Latitude 3440' })
  @IsString()
  @MinLength(3)
  subject!: string;

  @ApiProperty({ example: 'Please share corporate GST pricing and availability.' })
  @IsString()
  @MinLength(5)
  message!: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  contactPhone?: string;
}

export class UpdateEnquiryDto {
  @ApiPropertyOptional({ enum: EnquiryStatus })
  @IsOptional()
  @IsEnum(EnquiryStatus)
  status?: EnquiryStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  followUpSummary?: string;
}
