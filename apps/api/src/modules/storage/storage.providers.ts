import * as crypto from 'crypto';
import {
  StorageProvider,
  UploadedMediaResult,
  UploadImageInput,
} from './storage.types';

export class SandboxStorageAdapter implements StorageProvider {
  readonly name = 'sandbox';
  public readonly storedAssets = new Map<string, UploadedMediaResult>();

  async uploadImage(input: UploadImageInput): Promise<UploadedMediaResult> {
    const id = `kirans/${input.folder}/${crypto.randomBytes(6).toString('hex')}`;
    const result: UploadedMediaResult = {
      publicId: id,
      url: `https://sandbox-media.kiransinfotech.local/${id}`,
      provider: this.name,
      folder: input.folder,
      bytes: input.buffer.length,
      mimeType: input.mimeType,
      sandboxed: true,
    };
    this.storedAssets.set(id, result);
    return result;
  }

  async deleteImage(
    publicId: string,
  ): Promise<{ deleted: boolean; provider: string }> {
    const existed = this.storedAssets.delete(publicId);
    return { deleted: existed, provider: this.name };
  }
}

export class CloudinaryStorageAdapter implements StorageProvider {
  readonly name = 'cloudinary';

  constructor(
    private readonly cloudName: string,
    private readonly apiKey: string,
    private readonly apiSecret: string,
  ) {}

  private signParams(params: Record<string, string | number>): string {
    const sorted = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('&');
    return crypto
      .createHash('sha1')
      .update(`${sorted}${this.apiSecret}`)
      .digest('hex');
  }

  async uploadImage(input: UploadImageInput): Promise<UploadedMediaResult> {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `kirans-infotech/${input.folder}`;
    const signature = this.signParams({ folder, timestamp });

    const dataUri = `data:${input.mimeType};base64,${input.buffer.toString('base64')}`;
    const form = new URLSearchParams({
      file: dataUri,
      api_key: this.apiKey,
      timestamp: String(timestamp),
      folder,
      signature,
    });

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      },
    );

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Cloudinary upload failed (${res.status}): ${text.slice(0, 150)}`);
    }

    const data = (await res.json()) as {
      public_id: string;
      secure_url: string;
      bytes: number;
    };

    return {
      publicId: data.public_id,
      url: data.secure_url,
      provider: this.name,
      folder: input.folder,
      bytes: data.bytes || input.buffer.length,
      mimeType: input.mimeType,
      sandboxed: false,
    };
  }

  async deleteImage(
    publicId: string,
  ): Promise<{ deleted: boolean; provider: string }> {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.signParams({ public_id: publicId, timestamp });
    const form = new URLSearchParams({
      public_id: publicId,
      api_key: this.apiKey,
      timestamp: String(timestamp),
      signature,
    });

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      },
    );

    if (!res.ok) {
      throw new Error(`Cloudinary delete failed (${res.status})`);
    }

    const body = (await res.json()) as { result?: string };
    return {
      deleted: body.result === 'ok',
      provider: this.name,
    };
  }
}
