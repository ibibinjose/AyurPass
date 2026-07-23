import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import type { Request } from 'express';

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

  /**
   * Absolute base for public file URLs.
   * Priority: PUBLIC_API_URL / API_PUBLIC_URL → request Host (ALB) → prod default → localhost.
   * Never return bare localhost in production — that breaks avatars on ayurpass.com.
   */
  publicBaseUrl(req?: Request): string {
    const fromEnv = (
      process.env.PUBLIC_API_URL ||
      process.env.API_PUBLIC_URL ||
      ''
    )
      .trim()
      .replace(/\/$/, '');
    if (fromEnv && !isLoopbackHost(fromEnv)) return fromEnv;

    if (req) {
      const fromReq = baseFromRequest(req);
      if (fromReq) return fromReq;
    }

    if (process.env.NODE_ENV === 'production' || process.env.AYURPASS_STRICT === '1') {
      // Deployed ECS / ALB default for this product
      return 'https://api.ayurpass.com';
    }

    if (fromEnv) return fromEnv;
    return `http://localhost:${process.env.PORT || 4000}`;
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

  /** Relative path always safe to store / rewrite on the client. */
  toPublicPath(filename: string): string {
    return `/files/${filename}`;
  }

  toPublicUrl(filename: string, req?: Request): string {
    return `${this.publicBaseUrl(req)}${this.toPublicPath(filename)}`;
  }

  toUploadResponse(file: Express.Multer.File, req?: Request) {
    return {
      url: this.toPublicUrl(file.filename, req),
      path: this.toPublicPath(file.filename),
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}

function isLoopbackHost(urlOrHost: string): boolean {
  try {
    const host = urlOrHost.includes('://')
      ? new URL(urlOrHost).hostname
      : urlOrHost.split(':')[0];
    return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
  } catch {
    return /localhost|127\.0\.0\.1/.test(urlOrHost);
  }
}

function baseFromRequest(req: Request): string | null {
  const xfProto = String(req.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    ?.trim();
  const xfHost = String(req.headers['x-forwarded-host'] || '')
    .split(',')[0]
    ?.trim();
  const host = xfHost || String(req.headers.host || '').trim();
  if (!host || isLoopbackHost(host)) return null;
  const proto = xfProto === 'http' || xfProto === 'https' ? xfProto : 'https';
  return `${proto}://${host}`.replace(/\/$/, '');
}
