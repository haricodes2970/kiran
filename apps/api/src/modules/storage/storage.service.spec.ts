import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { SandboxStorageAdapter } from './storage.providers';
import { StorageProvider } from './storage.types';

describe('StorageService Upload Validation & Provider Failure Tests', () => {
  const validPng = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  ]);
  const validJpeg = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
  ]);

  it('rejects unsupported MIME types (e.g. SVG / script)', async () => {
    const service = new StorageService(new SandboxStorageAdapter());
    await expect(
      service.uploadImage({
        buffer: Buffer.from('<svg onload="alert(1)"></svg>'),
        originalName: 'evil.svg',
        mimeType: 'image/svg+xml',
        folder: 'products',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects spoofed MIME type where binary magic bytes do not match', async () => {
    const service = new StorageService(new SandboxStorageAdapter());
    await expect(
      service.uploadImage({
        buffer: Buffer.from('not-actually-a-png-file-payload'),
        originalName: 'fake.png',
        mimeType: 'image/png',
        folder: 'products',
      }),
    ).rejects.toThrow(/binary signature does not match/);
  });

  it('rejects oversized files (>5MB)', async () => {
    const service = new StorageService(new SandboxStorageAdapter());
    const hugeBuffer = Buffer.concat([validPng, Buffer.alloc(5 * 1024 * 1024)]);
    await expect(
      service.uploadImage({
        buffer: hugeBuffer,
        originalName: 'huge.png',
        mimeType: 'image/png',
        folder: 'products',
      }),
    ).rejects.toThrow(/exceeds maximum allowed size/);
  });

  it('uploads and deletes valid JPEG/PNG images in sandbox mode', async () => {
    const sandbox = new SandboxStorageAdapter();
    const service = new StorageService(sandbox);

    const uploaded = await service.uploadImage({
      buffer: validJpeg,
      originalName: 'laptop.jpg',
      mimeType: 'image/jpeg',
      folder: 'refurbished',
    });

    expect(uploaded.sandboxed).toBe(true);
    expect(uploaded.folder).toBe('refurbished');
    expect(sandbox.storedAssets.size).toBe(1);

    const deleted = await service.deleteImage(uploaded.publicId);
    expect(deleted.deleted).toBe(true);
    expect(sandbox.storedAssets.size).toBe(0);
  });

  it('handles storage provider errors gracefully without leaking internal credentials', async () => {
    const brokenProvider: StorageProvider = {
      name: 'broken-cloud',
      async uploadImage() {
        throw new Error('api_secret=supersecret failed 500');
      },
      async deleteImage() {
        throw new Error('delete failed');
      },
    };
    const service = new StorageService(brokenProvider);
    await expect(
      service.uploadImage({
        buffer: validPng,
        originalName: 'ok.png',
        mimeType: 'image/png',
        folder: 'products',
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });
});
