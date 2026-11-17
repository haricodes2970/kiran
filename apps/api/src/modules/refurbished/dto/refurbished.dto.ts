import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ConditionGrade,
  RefurbishedStatus,
  UsedDeviceSubmissionStatus,
} from '@prisma/client';

export class CreateRefurbishedDeviceDto {
  @ApiPropertyOptional({ example: 'REF-2026-099' })
  @IsOptional()
  @IsString()
  deviceCode?: string;

  @ApiProperty({ example: 'Lenovo ThinkPad T14 Gen 1 Certified Refurbished' })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({ example: 'Lenovo' })
  @IsString()
  brand!: string;

  @ApiProperty({ example: 'ThinkPad T14 Gen 1' })
  @IsString()
  model!: string;

  @ApiProperty({ example: 'PF3K9012' })
  @IsString()
  serialNumber!: string;

  @ApiProperty({ example: 'Intel Core i5-10310U' })
  @IsString()
  processor!: string;

  @ApiProperty({ example: '16GB DDR4' })
  @IsString()
  ram!: string;

  @ApiProperty({ example: '512GB NVMe SSD' })
  @IsString()
  storage!: string;

  @ApiProperty({ example: '14" FHD IPS' })
  @IsString()
  display!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  graphics?: string;

  @ApiPropertyOptional({ default: 'Windows 11 Pro' })
  @IsOptional()
  @IsString()
  osInstalled?: string;

  @ApiPropertyOptional({ example: 88 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  batteryHealthPct?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  batteryCycles?: number;

  @ApiPropertyOptional({
    enum: ConditionGrade,
    default: ConditionGrade.GRADE_A_EXCELLENT,
  })
  @IsOptional()
  @IsEnum(ConditionGrade)
  conditionGrade?: ConditionGrade;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cosmeticNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workPerformed?: string;

  @ApiPropertyOptional({ default: 6 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  warrantyMonths?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warrantyTerms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  acquisitionSource?: string;

  @ApiProperty({ example: 19000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  acquisitionCost!: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  refurbishmentCost?: number;

  @ApiProperty({ example: 28500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellingPrice!: number;

  @ApiPropertyOptional({
    enum: RefurbishedStatus,
    default: RefurbishedStatus.PURCHASED,
  })
  @IsOptional()
  @IsEnum(RefurbishedStatus)
  status?: RefurbishedStatus;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}

export class UpdateRefurbishedDeviceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  processor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ram?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  display?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  batteryHealthPct?: number;

  @ApiPropertyOptional({ enum: ConditionGrade })
  @IsOptional()
  @IsEnum(ConditionGrade)
  conditionGrade?: ConditionGrade;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cosmeticNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workPerformed?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  warrantyMonths?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warrantyTerms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  acquisitionCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  refurbishmentCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @ApiPropertyOptional({ enum: RefurbishedStatus })
  @IsOptional()
  @IsEnum(RefurbishedStatus)
  status?: RefurbishedStatus;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}

export class CreateDeviceInspectionDto {
  @ApiProperty({ example: 'Suresh K. (Lead Tech)' })
  @IsString()
  inspectorName!: string;

  @ApiProperty({ example: 'Pass — No dead pixels or pressure marks' })
  @IsString()
  screenCheck!: string;

  @ApiProperty({ example: 'Pass — All keys and touchpad verified' })
  @IsString()
  keyboardTrackpad!: string;

  @ApiProperty({ example: 'Pass — USB-C, HDMI, Wi-Fi tested' })
  @IsString()
  portsConnectivity!: string;

  @ApiProperty({ example: 'Pass — Max 72C under stress test' })
  @IsString()
  thermalsFan!: string;

  @ApiProperty({ example: '89% original capacity remaining' })
  @IsString()
  batteryHealthReport!: string;

  @ApiProperty({ example: '99% SMART health, 0 bad sectors' })
  @IsString()
  storageSmartHealth!: string;

  @ApiPropertyOptional({ default: 'Passed' })
  @IsOptional()
  @IsString()
  motherboardBios?: string;

  @ApiProperty({ example: 'Certified Grade-A Ready for Sale' })
  @IsString()
  overallVerdict!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  passed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateUsedDeviceSubmissionDto {
  @ApiProperty({ example: 'Dell' })
  @IsString()
  brand!: string;

  @ApiProperty({ example: 'Latitude 5410' })
  @IsString()
  model!: string;

  @ApiProperty({ example: 'Intel Core i5 10th Gen' })
  @IsString()
  processor!: string;

  @ApiProperty({ example: '8GB DDR4' })
  @IsString()
  ram!: string;

  @ApiProperty({ example: '256GB SSD' })
  @IsString()
  storage!: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  ageMonths?: number;

  @ApiProperty({ example: 'Working well, charger included, minor top cover scratches' })
  @IsString()
  @MinLength(5)
  conditionSummary!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  knownIssues?: string;

  @ApiPropertyOptional({ example: 16000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  expectedPrice?: number;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  contactPhone!: string;
}

export class UpdateUsedDeviceSubmissionDto {
  @ApiPropertyOptional({ enum: UsedDeviceSubmissionStatus })
  @IsOptional()
  @IsEnum(UsedDeviceSubmissionStatus)
  status?: UsedDeviceSubmissionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offeredPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adminNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerMessage?: string;
}
