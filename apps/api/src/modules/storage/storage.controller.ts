import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { StorageService } from './storage.service';

@ApiTags('admin-media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
@Controller('admin/media')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('status')
  @ApiOperation({ summary: 'Admin: Check media storage provider status and upload limits' })
  getStatus() {
    return this.storageService.getStatus();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Admin: Validate and upload an image asset' })
  uploadImage(
    @UploadedFile() file: any,
    @Query('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Multipart form field "file" is required');
    }
    return this.storageService.uploadImage({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      folder,
    });
  }

  @Delete(':publicId')
  @ApiOperation({ summary: 'Admin: Delete a stored media asset by publicId' })
  deleteImage(@Param('publicId') publicId: string) {
    return this.storageService.deleteImage(publicId);
  }
}
