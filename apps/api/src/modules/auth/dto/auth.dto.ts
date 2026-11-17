import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'rahul@example.com' })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ example: 'StrongPass@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'rahul.sharma@example.demo' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Customer@2026!' })
  @IsString()
  @MinLength(6)
  password!: string;
}

export class RequestOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone!: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(4)
  @MaxLength(8)
  otp!: string;

  @ApiPropertyOptional({ example: 'Customer Name' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Rahul Sharma' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'Sharma Tech Solutions' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  companyName?: string;

  @ApiPropertyOptional({ example: '27AABCU9603R1ZM' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  gstNumber?: string;

  @ApiPropertyOptional({ example: '+919811122233' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  alternatePhone?: string;
}

export class CreateAddressDto {
  @ApiPropertyOptional({ example: 'Home' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  @MinLength(2)
  recipient!: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @MinLength(10)
  phone!: string;

  @ApiProperty({ example: 'Flat 402, Sai Residency, Kothrud' })
  @IsString()
  @MinLength(5)
  addressLine1!: string;

  @ApiPropertyOptional({ example: 'Near Metro Station' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: 'Pune' })
  @IsString()
  city!: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsString()
  state!: string;

  @ApiProperty({ example: '411038' })
  @IsString()
  postalCode!: string;

  @ApiPropertyOptional({ example: 'India' })
  @IsOptional()
  @IsString()
  country?: string;
}
