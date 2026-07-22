import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { diskStorage } from 'multer';
import {
  ALLOWED_MIME,
  MAX_FILE_BYTES,
  UPLOAD_DIR,
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

  /** Authenticated single-image upload (JWT via global guard). */
  @Post()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
        filename: (_req, file, cb) => {
          cb(null, UploadsService.makeFilename(file.mimetype, file.originalname));
        },
      }),
      limits: { fileSize: MAX_FILE_BYTES, files: 1 },
      fileFilter: imageFileFilter,
    }),
  )
  uploadOne(@UploadedFile() file: Express.Multer.File) {
    this.uploads.assertImage(file);
    return {
      url: this.uploads.toPublicUrl(file.filename),
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  /** Authenticated batch upload — up to 8 images. */
  @Post('batch')
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @UseInterceptors(
    FilesInterceptor('files', 8, {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
        filename: (_req, file, cb) => {
          cb(null, UploadsService.makeFilename(file.mimetype, file.originalname));
        },
      }),
      limits: { fileSize: MAX_FILE_BYTES, files: 8 },
      fileFilter: imageFileFilter,
    }),
  )
  uploadMany(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('No files uploaded.');
    return {
      urls: files.map((f) => this.uploads.toPublicUrl(f.filename)),
      files: files.map((f) => ({
        url: this.uploads.toPublicUrl(f.filename),
        filename: f.filename,
        mimeType: f.mimetype,
        size: f.size,
      })),
    };
  }
}
