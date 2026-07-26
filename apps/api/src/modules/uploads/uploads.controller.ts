import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import {
  ALLOWED_MIME,
  MAX_FILE_BYTES,
  UploadsService,
} from './uploads.service';

function imageFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(
      new BadRequestException('Only JPEG, PNG, WebP or GIF images are allowed.') as unknown as Error,
      false,
    );
  }
  cb(null, true);
}

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {
    this.uploads.ensureUploadDir();
  }

  /** Request an S3 presigned URL for direct client-to-S3 uploads. */
  @Post('presigned')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async uploadPresigned(
    @Body() body: { filename?: string; mimeType?: string },
    @Req() req: Request,
  ) {
    return this.uploads.createPresignedUpload(body?.filename, body?.mimeType, req);
  }

  /** Authenticated single-image upload (JWT via global guard). */
  @Post()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @UseInterceptors(
    FileInterceptor('file', {
      // Memory → service stores to S3 (prod) or local disk (dev)
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_BYTES, files: 1 },
      fileFilter: imageFileFilter,
    }),
  )
  async uploadOne(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (file && !file.filename) {
      file.filename = UploadsService.makeFilename(file.mimetype, file.originalname);
    }
    return this.uploads.storeImage(file, req);
  }

  /** Authenticated batch upload — up to 8 images. */
  @Post('batch')
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @UseInterceptors(
    FilesInterceptor('files', 8, {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_BYTES, files: 8 },
      fileFilter: imageFileFilter,
    }),
  )
  async uploadMany(@UploadedFiles() files: Express.Multer.File[], @Req() req: Request) {
    if (!files?.length) throw new BadRequestException('No files uploaded.');
    for (const f of files) {
      if (!f.filename) {
        f.filename = UploadsService.makeFilename(f.mimetype, f.originalname);
      }
    }
    const mapped = await Promise.all(files.map((f) => this.uploads.storeImage(f, req)));
    return {
      urls: mapped.map((m) => m.url),
      files: mapped,
    };
  }
}
