import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';

export const UPLOAD_DIR = join(process.cwd(), 'uploads');
export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

@Injectable()
export class UploadsService {
  ensureUploadDir() {
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  publicBaseUrl(): string {
    const base =
      process.env.PUBLIC_API_URL?.replace(/\/$/, '') ||
      process.env.API_PUBLIC_URL?.replace(/\/$/, '') ||
      `http://localhost:${process.env.PORT || 4000}`;
    return base;
  }

  /** Static helper for multer filename callbacks (no DI required). */
  static makeFilename(mime: string, originalName?: string): string {
    const fromMime = EXT_BY_MIME[mime];
    const fromName = originalName ? extname(originalName).toLowerCase() : '';
    const ext =
      fromMime ||
      (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(fromName)
        ? fromName === '.jpeg'
          ? '.jpg'
          : fromName
        : '.jpg');
    return `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`;
  }

  filenameFor(mime: string, originalName?: string): string {
    return UploadsService.makeFilename(mime, originalName);
  }

  assertImage(file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded.');
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WebP or GIF images are allowed.');
    }
    if (file.size > MAX_FILE_BYTES) {
      throw new BadRequestException('Image must be 5 MB or smaller.');
    }
  }

  toPublicUrl(filename: string): string {
    return `${this.publicBaseUrl()}/files/${filename}`;
  }
}
