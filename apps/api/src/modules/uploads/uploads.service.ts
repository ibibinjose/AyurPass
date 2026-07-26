import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomBytes } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
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
  private readonly logger = new Logger(UploadsService.name);
  private readonly s3: S3Client | null;
  private readonly bucket: string | null;
  private readonly s3PublicBase: string | null;
  private readonly region: string;

  constructor() {
    this.region =
      process.env.AWS_REGION?.trim() ||
      process.env.AWS_DEFAULT_REGION?.trim() ||
      'ap-southeast-2';
    this.bucket = process.env.S3_MEDIA_BUCKET?.trim() || null;
    this.s3PublicBase =
      process.env.S3_MEDIA_PUBLIC_BASE?.trim().replace(/\/$/, '') ||
      (this.bucket
        ? `https://${this.bucket}.s3.${this.region}.amazonaws.com`
        : null);
    this.s3 = this.bucket ? new S3Client({ region: this.region }) : null;

    if (this.bucket) {
      this.logger.log(`Media uploads → S3 s3://${this.bucket}/media/ (${this.region})`);
    } else {
      this.logger.warn(
        'S3_MEDIA_BUCKET not set — uploads use local disk (ephemeral on ECS).',
      );
    }
  }

  get usesS3(): boolean {
    return Boolean(this.s3 && this.bucket);
  }

  ensureUploadDir() {
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  /**
   * Absolute base for public *local* file URLs (disk fallback).
   * Priority: PUBLIC_API_URL / API_PUBLIC_URL → request Host → prod default → localhost.
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

  /** Relative path for disk-served files. */
  toPublicPath(filename: string): string {
    return `/files/${filename}`;
  }

  toPublicUrl(filename: string, req?: Request): string {
    return `${this.publicBaseUrl(req)}${this.toPublicPath(filename)}`;
  }

  /**
   * Persist an uploaded image to S3 (production) or local disk (dev).
   * Returns durable public URL + path.
   */
  async storeImage(file: Express.Multer.File, req?: Request) {
    this.assertImage(file);
    const filename = file.filename || this.filenameFor(file.mimetype, file.originalname);
    const buffer = file.buffer ?? (file.path ? undefined : undefined);

    if (this.usesS3) {
      const key = `media/${filename}`;
      // Prefer in-memory buffer; fall back to reading path if disk storage used
      let body: Buffer;
      if (file.buffer && file.buffer.length) {
        body = file.buffer;
      } else if (file.path) {
         
        body = require('fs').readFileSync(file.path) as Buffer;
      } else {
        throw new BadRequestException('Empty upload body.');
      }

      await this.s3!.send(
        new PutObjectCommand({
          Bucket: this.bucket!,
          Key: key,
          Body: body,
          ContentType: file.mimetype,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );

      const url = `${this.s3PublicBase}/${key}`;
      return {
        url,
        path: `/${key}`,
        filename,
        mimeType: file.mimetype,
        size: file.size || body.length,
        storage: 's3' as const,
      };
    }

    // Local disk fallback (dev / no bucket)
    this.ensureUploadDir();
    if (file.buffer && file.buffer.length && !file.path) {
      writeFileSync(join(UPLOAD_DIR, filename), file.buffer);
    }
    return {
      url: this.toPublicUrl(filename, req),
      path: this.toPublicPath(filename),
      filename,
      mimeType: file.mimetype,
      size: file.size,
      storage: 'disk' as const,
    };
  }

  /**
   * Generate an S3 presigned URL for direct client-to-S3 uploads.
   * Returns uploadUrl (for PUT), publicUrl (CloudFront/S3 CDN URL), and storage type.
   */
  async createPresignedUpload(
    filenameInput?: string,
    mimeType = 'image/jpeg',
    req?: Request,
  ) {
    if (!ALLOWED_MIME.has(mimeType)) {
      throw new BadRequestException('Only JPEG, PNG, WebP or GIF images are allowed.');
    }
    const filename = this.filenameFor(mimeType, filenameInput);

    if (this.usesS3) {
      const key = `media/${filename}`;
      const command = new PutObjectCommand({
        Bucket: this.bucket!,
        Key: key,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
      });

      const uploadUrl = await getSignedUrl(this.s3!, command, { expiresIn: 900 });
      const publicUrl = `${this.s3PublicBase}/${key}`;

      return {
        uploadUrl,
        publicUrl,
        key,
        filename,
        mimeType,
        storage: 's3' as const,
      };
    }

    // Local fallback when S3 is unconfigured
    const publicUrl = this.toPublicUrl(filename, req);
    const uploadUrl = `${this.publicBaseUrl(req)}/uploads`;
    return {
      uploadUrl,
      publicUrl,
      key: filename,
      filename,
      mimeType,
      storage: 'disk' as const,
    };
  }

  /** @deprecated use storeImage — kept for any legacy callers */
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
