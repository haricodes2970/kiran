# Kiran's Infotech — File & Image Storage Guide

## 1. Architecture (`StorageModule`)

`apps/api/src/modules/storage/` implements a provider-independent `StorageProvider` interface:
- **`SandboxStorageAdapter` (Default):** Active when `STORAGE_ENABLED !== 'true'` or Cloudinary credentials are unset. Zero local disk dependency in production.
- **`CloudinaryStorageAdapter`:** Signed REST uploads & deletions (`POST /image/upload`, `POST /image/destroy`) using `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` strictly on the server side.

---

## 2. Supported Media Folders & Validation Rules

- **Allowed Folders (`folder` query param):** `products`, `refurbished`, `inspections`, `repairs`, `branding`.
- **Authorization:** Admin-only (`JwtAuthGuard` + `RolesGuard` `@Roles(RoleName.ADMIN)`).
- **Size Limit:** `5 MB` maximum per image.
- **MIME Allowlist:** `image/jpeg`, `image/png`, `image/webp`. (SVG and executable payloads are rejected).
- **Magic-Byte Signature Check:** `detectImageMagicMime()` verifies the binary header (`FF D8 FF` for JPEG, `89 50 4E 47` for PNG, `RIFF....WEBP` for WebP) matches the declared MIME type.

---

## 3. Endpoints

- `GET /api/v1/admin/media/status` — Check active storage provider and limits.
- `POST /api/v1/admin/media/upload?folder=products` — Multipart `file` upload; returns `{ publicId, url, bytes, mimeType }`.
- `DELETE /api/v1/admin/media/:publicId` — Delete asset from cloud storage.
