export type MediaAssetFolder =
  | 'products'
  | 'refurbished'
  | 'inspections'
  | 'repairs'
  | 'branding';

export interface UploadImageInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  folder: MediaAssetFolder;
}

export interface UploadedMediaResult {
  publicId: string;
  url: string;
  provider: string;
  folder: MediaAssetFolder;
  bytes: number;
  mimeType: string;
  sandboxed: boolean;
}

export interface StorageProvider {
  readonly name: string;
  uploadImage(input: UploadImageInput): Promise<UploadedMediaResult>;
  deleteImage(publicId: string): Promise<{ deleted: boolean; provider: string }>;
}
