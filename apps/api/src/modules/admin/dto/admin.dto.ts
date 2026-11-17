import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertSiteContentDto {
  @ApiProperty({ example: 'Homepage Hero Configuration' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'JSON string or structured content payload' })
  @IsString()
  contentJson!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
