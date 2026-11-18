import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  Optional,
} from '@nestjs/common';
import {
  MediaAssetFolder,
  StorageProvider,
  UploadedMediaResult,
} from './storage.types';
import {
  CloudinaryStorageAdapter,
  SandboxStorageAdapter,
} from './storage.providers';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);
const ALLOWED_FOLDERS = new Set<MediaAssetFolder>([
  'products',
  'refurbished',
  'inspections',
  'repairs',
  'branding',
]);

export function detectImageMagicMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }
  // WebP: RIFF....WEBP
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly provider: StorageProvider;

  constructor(@Optional() customProvider?: StorageProvider) {
    if (customProvider) {
      this.provider = customProvider;
    } else {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;
      const enabled = process.env.STORAGE_ENABLED === 'true';

      if (enabled && cloudName && apiKey && apiSecret) {
        this.provider = new CloudinaryStorageAdapter(
          cloudName,
          apiKey,
          apiSecret,
        );
      } else {
        this.provider = new SandboxStorageAdapter();
      }
    }
  }

  getStatus() {
    return {
      provider: this.provider.name,
      configured: this.provider.name !== 'sandbox',
      maxFileSizeBytes: MAX_IMAGE_BYTES,
      allowedMimeTypes: Array.from(ALLOWED_MIME_TYPES),
    };
  }

  async uploadImage(params: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    folder?: string;
  }): Promise<UploadedMediaResult> {
    if (!params.buffer || params.buffer.length === 0) {
      throw new BadRequestException('Image file is empty or missing');
    }
    if (params.buffer.length > MAX_IMAGE_BYTES) {
      throw new BadRequestException(
        `Image exceeds maximum allowed size of ${MAX_IMAGE_BYTES / (1024 * 1024)}MB`,
      );
    }
    if (!ALLOWED_MIME_TYPES.has(params.mimeType)) {
      throw new BadRequestException(
        `Unsupported MIME type "${params.mimeType}". Allowed: JPEG, PNG, WebP.`,
      );
    }

    const detectedMime = detectImageMagicMime(params.buffer);
    if (!detectedMime || detectedMime !== params.mimeType) {
      throw new BadRequestException(
        'File binary signature does not match declared image MIME type',
      );
    }

    const folder = (params.folder || 'products') as MediaAssetFolder;
    if (!ALLOWED_FOLDERS.has(folder)) {
      throw new BadRequestException(`Invalid media folder "${folder}"`);
    }

    try {
      return await this.provider.uploadImage({
        buffer: params.buffer,
        originalName: params.originalName,
        mimeType: params.mimeType,
        folder,
      });
    } catch (err: any) {
      this.logger.error(`Media upload failed: ${err?.message || 'Unknown error'}`);
      throw new InternalServerErrorException(
        'Media upload failed due to storage provider error',
      );
    }
  }

  async deleteImage(publicId: string) {
    if (!publicId || !publicId.trim()) {
      throw new BadRequestException('publicId is required');
    }
    try {
      return await this.provider.deleteImage(publicId.trim());
    } catch (err: any) {
      this.logger.error(`Media delete failed: ${err?.message || 'Unknown error'}`);
      throw new InternalServerErrorException(
        'Media deletion failed due to storage provider error',
      );
    }
  }
}
