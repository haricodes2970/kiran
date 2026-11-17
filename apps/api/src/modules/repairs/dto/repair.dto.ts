import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { QuotationStatus, RepairBookingStatus } from '@prisma/client';

export class CreateRepairBookingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiProperty({ example: 'Laptop' })
  @IsString()
  deviceType!: string;

  @ApiProperty({ example: 'Dell' })
  @IsString()
  brand!: string;

  @ApiProperty({ example: 'Latitude 5420' })
  @IsString()
  model!: string;

  @ApiPropertyOptional({ example: '8H3M793' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiProperty({ example: 'Power / No Boot' })
  @IsString()
  issueCategory!: string;

  @ApiProperty({ example: 'Does not turn on when pressing power button; LED blinks.' })
  @IsString()
  @MinLength(5)
  issueDescription!: string;

  @ApiPropertyOptional({ example: '2026-11-20' })
  @IsOptional()
  @IsString()
  preferredDate?: string;

  @ApiPropertyOptional({ example: 'Rahul Sharma' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ example: 'rahul@example.com' })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @MinLength(10)
  customerPhone!: string;
}

export class UpdateRepairStatusDto {
  @ApiProperty({ enum: RepairBookingStatus })
  @IsEnum(RepairBookingStatus)
  status!: RepairBookingStatus;

  @ApiProperty({
    example: 'Diagnosis complete: power rail capacitor shorted. Quotation sent.',
  })
  @IsString()
  @MinLength(3)
  customerVisibleMessage!: string;

  @ApiPropertyOptional({
    example: 'Internal tech note: replace 2x 10uF MLCC on PQ301.',
  })
  @IsOptional()
  @IsString()
  internalNote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diagnosticSummary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internalNotes?: string;
}

export class CreateRepairQuotationDto {
  @ApiProperty({ example: '19V Power Rail Repair + Thermal Servicing' })
  @IsString()
  diagnosisDetails!: string;

  @ApiPropertyOptional({
    example: '[{"item":"SMD Power Kit","cost":650},{"item":"Thermal Paste","cost":250}]',
  })
  @IsOptional()
  @IsString()
  partsBreakdownJson?: string;

  @ApiProperty({ example: 900 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  partsCost!: number;

  @ApiProperty({ example: 1100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  labourCost!: number;

  @ApiPropertyOptional({ example: 360 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  taxAmount?: number;
}

export class RespondRepairQuotationDto {
  @ApiProperty({ enum: [QuotationStatus.APPROVED, QuotationStatus.REJECTED] })
  @IsEnum(QuotationStatus)
  decision!: QuotationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerResponseNote?: string;
}
